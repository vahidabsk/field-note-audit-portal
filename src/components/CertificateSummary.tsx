import type { ParsedCertificate } from "../lib/audit-storage";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="whitespace-normal break-words text-sm text-slate-800">{value || "—"}</div>
    </div>
  );
}

export function CertificateSummary({ cert }: { cert?: ParsedCertificate }) {
  if (!cert) return null;
  return (
    <Card className="print-card">
      <CardHeader><CardTitle>Primary certificate summary</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryRow label="Property" value={[cert.propertyName, cert.propertyAddress].filter(Boolean).join(", ")} />
        <SummaryRow label="ASC" value={[cert.ascName, cert.ascAddress].filter(Boolean).join(", ")} />
        <SummaryRow label="Central station" value={[cert.centralStation, cert.centralStationAddress].filter(Boolean).join(", ")} />
        <SummaryRow label="System" value={cert.certificateType} />
        <SummaryRow label="Coverage" value={cert.coverageType} />
        <SummaryRow label="Standard" value={cert.standardReferenced} />
        <SummaryRow label="Issued / revised" value={[cert.issuedDate, cert.revisedDate].filter(Boolean).join(" / ")} />
        <SummaryRow label="Transmission" value={[cert.primaryTransmission, cert.retransmission].filter(Boolean).join(" / ")} />
        <SummaryRow label="Control unit" value={[cert.controlUnitMfr, cert.controlUnitModel].filter(Boolean).join(" / ")} />
      </CardContent>
    </Card>
  );
}
