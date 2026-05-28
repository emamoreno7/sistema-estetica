import { PortalCitasTab } from '@/components/portal/PortalCitasTab';
import { usePortalCliente } from '@/context/PortalClienteContext';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { PortalTreatmentEmptyPlaceholder } from '../components/PortalTreatmentEmptyPlaceholder';

export function CitasView() {
  const ctx = usePortalCliente();
  return (
    <PortalCitasTab
      activeTreatment={ctx.activeTreatment}
      sessions={ctx.sessions}
      PortalTreatmentEmptyPlaceholder={PortalTreatmentEmptyPlaceholder}
      buildWhatsAppHref={buildWhatsAppHref}
    />
  );
}
