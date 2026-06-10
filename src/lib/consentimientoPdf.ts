import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { es as esLocale } from 'date-fns/locale';
import { CONSENTIMIENTO_CLAUSULAS, type ConsentimientoRow } from '@/lib/consentimiento';
import { brand } from '../config/brand';

export type ConsentimientoClienteInfo = {
  full_name: string;
  phone?: string | null;
};

type RGB = [number, number, number];
const NAVY: RGB = [0, 61, 91];
const ROSE: RGB = [242, 215, 213];
const SAGE: RGB = [191, 201, 162];
const CREAM: RGB = [253, 248, 245];
const MUTED: RGB = [122, 116, 110];
const WHITE: RGB = [255, 255, 255];

async function loadLogo(): Promise<{ dataUrl: string; w: number; h: number } | null> {
  try {
    const res = await fetch('/logo-generic.svg');
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
    const dims: { w: number; h: number } = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
      img.onerror = () => resolve({ w: 1, h: 1 });
      img.src = dataUrl;
    });
    return { dataUrl, w: dims.w, h: dims.h };
  } catch {
    return null;
  }
}

function fechaNacTexto(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return format(d, "d 'de' MMMM yyyy", { locale: esLocale });
}

export async function buildConsentimientoPdf(
  row: ConsentimientoClienteInfo,
  c: ConsentimientoRow
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 16;
  const contentW = W - M * 2;

  const logo = await loadLogo();

  const paintBackground = () => {
    doc.setFillColor(...CREAM);
    doc.rect(0, 0, W, H, 'F');
    doc.setFillColor(...SAGE);
    doc.rect(0, 0, W, 4, 'F');
    doc.setFillColor(...ROSE);
    doc.rect(0, H - 4, W, 4, 'F');
  };

  const footer = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(
      `Constancia generada electrónicamente · ${brand.businessName} · Ley 25.326`,
      W / 2,
      H - 8,
      { align: 'center' }
    );
  };

  paintBackground();
  let y = 18;

  if (logo) {
    const logoW = 32;
    const logoH = (logo.h / logo.w) * logoW;
    doc.addImage(logo.dataUrl, 'PNG', (W - logoW) / 2, y, logoW, logoH);
    y += logoH + 5;
  } else {
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(brand.shortName.toUpperCase(), W / 2, y + 8, { align: 'center' });
    y += 16;
  }

  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Consentimiento informado', W / 2, y, { align: 'center' });
  y += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(brand.businessName, W / 2, y, { align: 'center' });
  y += 6;

  doc.setDrawColor(...ROSE);
  doc.setLineWidth(0.6);
  doc.line(M, y, W - M, y);
  y += 8;

  const fechaFirma = c.firmado_at
    ? format(new Date(c.firmado_at), "d 'de' MMMM yyyy · HH:mm 'hs'", { locale: esLocale })
    : '—';

  const datos: [string, string][] = [
    ['Cliente', row.full_name || '—'],
    ['Teléfono', row.phone || '—'],
    ['Firmado por', c.nombre_firma || '—'],
    ['DNI', c.dni || '—'],
    ['Fmiento', fechaNacTexto(c.fecha_nacimiento)],
    ['Fecha y hora de firma', fechaFirma],
    ['Versión del texto', c.version || 'v1'],
    ['Origen', c.firmado_por_admin ? 'Registrado por recepción' : 'Firmado por cliente'],
  ];

  const rowH = 14;
  const rows = Math.ceil(datos.length / 2);
  const boxH = rows * rowH + 8;
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...ROSE);
  doc.setLineWidth(0.5);
  doc.roundedRect(M, y, contentW, boxH, 3, 3, 'FD');

  const colW = contentW / 2;
  datos.forEach(([label, value], i) => {
    const col = i % 2;
    const rowIdx = Math.floor(i / 2);
    const x = M + 6 + col * colW;
    const yRow = y + 7 + rowIdx * rowH;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), x, yRow);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    const val = doc.splitTextToSize(value, colW - 10)[0] as string;
    doc.text(val, x, yRow + 4.6);
  });
  y += boxH + 9;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text('Declaraciones aceptadas', M, y);
  y += 6;

  const checkValues: Record<string, boolean> = {
    declara_salud: c.declara_salud,
    acepta_tratamiento: c.acepta_tratamiento,
    acepta_datos: c.acepta_datos,
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > H - 18) {
      footer();
      doc.addPage();
      paintBackground();
      y = 18;
    }
  };

  CONSENTIMIENTO_CLAUSULAS.forEach((cl) => {
    const ok = !!checkValues[cl.key];
    const lines = doc.splitTextToSize(cl.texto, contentW - 8) as string[];
    const blockH = 7 + lines.length * 4 + 4;
    ensureSpace(blockH);

    doc.setFillColor(...(ok ? SAGE : ROSE));
    doc.circle(M + 2.4, y - 1, 2.4, 'F');
    if (ok) {
      doc.setDrawColor(...WHITE);
      doc.setLineWidth(0.7);
      doc.line(M + 1.3, y - 1, M + 2.1, y - 0.2);
      doc.line(M + 2.1, y - 0.2, M + 3.6, y - 2.1);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...NAVY);
    doc.text(cl.titulo, M + 7, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(lines, M + 7, y);
    y += lines.length * 4 + 4;
  });

  const condTexto = c.contraindicaciones?.trim() || 'Sin condiciones de salud declaradas.';
  const condLines = doc.splitTextToSize(condTexto, contentW - 12) as string[];
  const condBoxH = condLines.length * 4 + 12;
  ensureSpace(condBoxH + 6);
  y += 2;
  doc.setFillColor(255, 250, 240);
  doc.setDrawColor(...ROSE);
  doc.setLineWidth(0.5);
  doc.roundedRect(M, y, contentW, condBoxH, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text('Condiciones de salud declaradas', M + 5, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text(condLines, M + 5, y + 11);
  y += condBoxH + 12;

  ensureSpace(26);
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.4);
  doc.line(M, y + 10, M + 70, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(c.nombre_firma || row.full_name || '', M, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(
    c.dni ? `DNI ${c.dni}` : 'Firma del cliente / responsable',
    M,
    y + 19
  );

  footer();
  return doc;
}

function safeFileName(name: string): string {
  return (
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .slice(0, 40) || 'cliente'
  );
}

export async function descargarConsentimientoPdf(
  row: ConsentimientoClienteInfo,
  c: ConsentimientoRow
): Promise<void> {
  const doc = await buildConsentimientoPdf(row, c);
  doc.save(`consentimiento-${safeFileName(row.full_name)}.pdf`);
}

export async function imprimirConsentimientoPdf(
  row: ConsentimientoClienteInfo,
  c: ConsentimientoRow
): Promise<void> {
  const doc = await buildConsentimientoPdf(row, c);
  doc.autoPrint();
  const url = doc.output('bloburl') as unknown as string;
  const win = window.open(url, '_blank');
  if (win) return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = url;
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      /* no-op */
    }
  };
  document.body.appendChild(iframe);
}
