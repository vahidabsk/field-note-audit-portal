import type { ParsedCertificate } from "../lib/audit-storage";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function CertificatesPanel({ certificates, primaryIndex, onPrimaryChange, onUpload }: { certificates: ParsedCertificate[]; primaryIndex: number; onPrimaryChange: (index: number) => void; onUpload: () => void }) {
  return (
    <Card className="print-card">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Certificates</CardTitle>
          <div className="mt-1 text-sm text-slate-600">Attach multiple certificates and choose which certificate seeds the header.</div>
        </div>
        <Button variant="accent" onClick={onUpload}>Upload Certificate</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {certificates.map((cert, index) => (
          <label key={`${cert.fileName}-${index}`} className="flex cursor-pointer flex-col gap-2 rounded-lg border p-3 hover:bg-slate-50 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <input type="radio" checked={primaryIndex === index} onChange={() => onPrimaryChange(index)} className="mt-1" />
              <div>
                <div className="font-medium text-slate-900">{cert.fileName}</div>
                <div className="text-sm text-slate-600">{cert.certificateNumber || "No certificate # detected"} · {cert.fileNo || "No file #"}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{cert.propertyName || "Manual entry"}</Badge>
              <Badge>{cert.ascName || "ASC pending"}</Badge>
            </div>
          </label>
        ))}
      </CardContent>
    </Card>
  );
}
