// Edge Function: sondear-precios
// ---------------------------------------------------------------------------
// Sondea precios de insumos consultando:
//   1. Mercado Libre API (api.mercadolibre.com/items/{ml_item_id})  ← prioridad
//   2. Scraper genérico HTML para otros sitios (JSON-LD, meta tags, regex)
//
// Acepta POST con JSON: { proveedor_ids?: string[], dry_run?: boolean }
// - sin proveedor_ids → procesa TODOS los proveedores con sondeo_activo=true
// - dry_run=true → no actualiza la DB, sólo devuelve qué hubiera hecho
//
// Devuelve: {
//   total: n, ok: n, errores: n, sin_cambios: n,
//   cambios_significativos: [{ proveedor_id, anterior, nuevo, variacion_pct, insumo_id, insumo_nombre }]
// }
//
// Deploy: supabase functions deploy sondear-precios --no-verify-jwt
// Invocar: supabase functions invoke sondear-precios  (o cron, o desde el frontend)
// ---------------------------------------------------------------------------

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

type Proveedor = {
  id: string;
  insumo_id: string;
  proveedor: string;
  url: string;
  precio_listado: number | null;
  ml_item_id: string | null;
  umbral_alerta_pct: number;
  sondeo_activo: boolean;
};

type SondeoResultado = {
  proveedor_id: string;
  insumo_id: string;
  insumo_nombre: string;
  source: 'ml_api' | 'scraper' | 'manual';
  status: 'ok' | 'error' | 'no_change';
  precio_anterior: number | null;
  precio_detectado: number | null;
  variacion_pct: number | null;
  error_msg?: string;
  http_status?: number;
  duration_ms: number;
  is_alerta: boolean;
};

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const TIMEOUT_MS = 15_000;

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// ─── Extracción de precios ───────────────────────────────────────────────────

function parsePrecioStr(raw: string): number | null {
  // Acepta "$1.234,56", "1234.56", "1,234.56", "$ 1234", etc.
  const cleaned = raw
    .replace(/[^\d.,-]/g, '')
    .replace(/^\.+|\.+$/g, '');
  if (!cleaned) return null;

  // Heurística AR/ES: si hay coma Y punto, el último separador es decimal.
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  let normalized: string;
  if (lastComma === -1 && lastDot === -1) {
    normalized = cleaned;
  } else if (lastComma > lastDot) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    normalized = cleaned.replace(/,/g, '');
  }

  const n = Number.parseFloat(normalized);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function extractFromJsonLd(html: string): number | null {
  const matches = Array.from(
    html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  );
  for (const m of matches) {
    try {
      const data = JSON.parse(m[1].trim());
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const offers = item?.offers ?? item?.['@graph']?.find((g: { offers?: unknown }) => g?.offers)?.offers;
        if (!offers) continue;
        const offerArr = Array.isArray(offers) ? offers : [offers];
        for (const o of offerArr) {
          const p = o?.price ?? o?.lowPrice ?? o?.priceSpecification?.price;
          if (p != null) {
            const n = typeof p === 'number' ? p : parsePrecioStr(String(p));
            if (n && n > 0) return n;
          }
        }
      }
    } catch {
      // JSON inválido, sigo
    }
  }
  return null;
}

function extractFromMeta(html: string): number | null {
  const patterns = [
    /<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+itemprop=["']price["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']price["']/i,
    /<meta[^>]+property=["']og:price:amount["'][^>]+content=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      const n = parsePrecioStr(m[1]);
      if (n) return n;
    }
  }
  // Microdata: <span itemprop="price" content="1234.5">
  const microMatch = html.match(/itemprop=["']price["'][^>]*content=["']([^"']+)["']/i);
  if (microMatch?.[1]) {
    const n = parsePrecioStr(microMatch[1]);
    if (n) return n;
  }
  return null;
}

function extractFromHeuristics(html: string): number | null {
  // Busca primer bloque con class/id que contenga "price" o "precio"
  // y dentro un patrón $XXXX. Fallback de último recurso.
  const blockRe =
    /<[^>]*(?:class|id)=["'][^"']*(?:price|precio|amount)[^"']*["'][^>]*>([\s\S]{0,400}?)<\/[^>]+>/gi;
  for (const m of html.matchAll(blockRe)) {
    const text = m[1].replace(/<[^>]+>/g, ' ');
    const priceMatch = text.match(/\$\s?([\d.,]+)/);
    if (priceMatch?.[1]) {
      const n = parsePrecioStr(priceMatch[1]);
      if (n && n >= 1) return n;
    }
  }
  return null;
}

function extractPrice(html: string): number | null {
  return extractFromJsonLd(html) ?? extractFromMeta(html) ?? extractFromHeuristics(html);
}

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function sondearMlApi(itemId: string): Promise<{ precio: number; httpStatus: number }> {
  const r = await fetchWithTimeout(`https://api.mercadolibre.com/items/${itemId}?attributes=price,base_price,status`, {
    headers: { Accept: 'application/json' },
  });
  if (!r.ok) {
    throw new Error(`ML API HTTP ${r.status}`);
  }
  const json = await r.json();
  const precio = Number(json?.price ?? json?.base_price);
  if (!Number.isFinite(precio) || precio <= 0) {
    throw new Error('ML API: precio no disponible');
  }
  return { precio, httpStatus: r.status };
}

async function sondearScraper(url: string): Promise<{ precio: number; httpStatus: number }> {
  const r = await fetchWithTimeout(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
    },
    redirect: 'follow',
  });
  const httpStatus = r.status;
  if (!r.ok) throw new Error(`HTTP ${httpStatus}`);
  const html = await r.text();
  const precio = extractPrice(html);
  if (precio === null) throw new Error('No se pudo extraer precio del HTML');
  return { precio, httpStatus };
}

// ─── Main ────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRole) {
    return new Response(JSON.stringify({ error: 'Missing env: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  let body: { proveedor_ids?: string[]; dry_run?: boolean } = {};
  try {
    if (req.headers.get('content-length') !== '0') {
      body = (await req.json()) as typeof body;
    }
  } catch {
    body = {};
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let q = supabase
    .from('insumo_proveedores')
    .select('id, insumo_id, proveedor, url, precio_listado, ml_item_id, umbral_alerta_pct, sondeo_activo')
    .eq('sondeo_activo', true);

  if (body.proveedor_ids?.length) q = q.in('id', body.proveedor_ids);

  const { data: provs, error: provErr } = await q.returns<Proveedor[]>();
  if (provErr) {
    return new Response(JSON.stringify({ error: provErr.message }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const insumoIds = Array.from(new Set((provs ?? []).map((p) => p.insumo_id)));
  const { data: insumos } = insumoIds.length
    ? await supabase.from('insumos').select('id, nombre').in('id', insumoIds)
    : { data: [] as { id: string; nombre: string }[] };
  const nombreByInsumo = new Map((insumos ?? []).map((i) => [i.id, i.nombre]));

  const resultados: SondeoResultado[] = [];

  for (const p of provs ?? []) {
    const t0 = Date.now();
    const source: 'ml_api' | 'scraper' = p.ml_item_id ? 'ml_api' : 'scraper';
    const precioAnterior = p.precio_listado;
    const insumoNombre = nombreByInsumo.get(p.insumo_id) ?? '';

    try {
      const out = p.ml_item_id
        ? await sondearMlApi(p.ml_item_id)
        : await sondearScraper(p.url);

      const variacion =
        precioAnterior && precioAnterior > 0
          ? ((out.precio - precioAnterior) / precioAnterior) * 100
          : null;

      const sinCambio = precioAnterior !== null && Math.abs(out.precio - precioAnterior) < 0.5;

      const status: SondeoResultado['status'] = sinCambio ? 'no_change' : 'ok';
      const isAlerta =
        !sinCambio && variacion !== null && Math.abs(variacion) >= (p.umbral_alerta_pct ?? 10);

      resultados.push({
        proveedor_id: p.id,
        insumo_id: p.insumo_id,
        insumo_nombre: insumoNombre,
        source,
        status,
        precio_anterior: precioAnterior,
        precio_detectado: Math.round(out.precio * 100) / 100,
        variacion_pct: variacion === null ? null : Math.round(variacion * 100) / 100,
        http_status: out.httpStatus,
        duration_ms: Date.now() - t0,
        is_alerta: isAlerta,
      });

      if (!body.dry_run) {
        await supabase
          .from('insumo_proveedores')
          .update({
            precio_listado: out.precio,
            fecha_verificacion: new Date().toISOString().slice(0, 10),
            ultimo_sondeo_at: new Date().toISOString(),
            ultimo_sondeo_ok: true,
            ultimo_sondeo_error: null,
          })
          .eq('id', p.id);

        await supabase.from('insumo_proveedor_sondeo_log').insert({
          proveedor_id: p.id,
          source,
          status,
          precio_anterior: precioAnterior,
          precio_detectado: out.precio,
          http_status: out.httpStatus,
          duration_ms: Date.now() - t0,
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      resultados.push({
        proveedor_id: p.id,
        insumo_id: p.insumo_id,
        insumo_nombre: insumoNombre,
        source,
        status: 'error',
        precio_anterior: precioAnterior,
        precio_detectado: null,
        variacion_pct: null,
        error_msg: msg,
        duration_ms: Date.now() - t0,
        is_alerta: false,
      });

      if (!body.dry_run) {
        await supabase
          .from('insumo_proveedores')
          .update({
            ultimo_sondeo_at: new Date().toISOString(),
            ultimo_sondeo_ok: false,
            ultimo_sondeo_error: msg.slice(0, 200),
          })
          .eq('id', p.id);

        await supabase.from('insumo_proveedor_sondeo_log').insert({
          proveedor_id: p.id,
          source,
          status: 'error',
          precio_anterior: precioAnterior,
          error_msg: msg.slice(0, 500),
          duration_ms: Date.now() - t0,
        });
      }
    }
  }

  const ok = resultados.filter((r) => r.status === 'ok').length;
  const errores = resultados.filter((r) => r.status === 'error').length;
  const sin_cambios = resultados.filter((r) => r.status === 'no_change').length;
  const cambios_significativos = resultados.filter((r) => r.is_alerta);

  return new Response(
    JSON.stringify({
      total: resultados.length,
      ok,
      errores,
      sin_cambios,
      cambios_significativos,
      detalle: resultados,
      dry_run: body.dry_run === true,
    }),
    { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
  );
});
