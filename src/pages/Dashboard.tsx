import { useNavigate } from "react-router-dom";
import { FilePlus2, Trash2 } from "lucide-react";
import { useState } from "react";
import { UploadDialog } from "../components/UploadDialog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { auditLastSavedLabel, computeProgress, type Audit, type ParsedCertificate } from "../lib/audit-storage";

export function Dashboard({ auditorName, audits, onCreateAudit, onDeleteAudit }: { auditorName: string; audits: Audit[]; onCreateAudit: (certificates: ParsedCertificate[]) => Audit; onDeleteAudit: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
      <Card className="overflow-hidden bg-gradient-to-br from-primary to-slate-800 text-white">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Dashboard</div>
            <h1 className="mt-2 text-3xl font-bold text-white">Upload certificate and start an audit.</h1>
            <p className="mt-2 max-w-2xl text-white/80">Drag, drop, review extracted header fields, then capture notes, dictation, and photos — all saved locally in the browser for {auditorName}.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="accent" size="lg" onClick={() => { setPendingFiles(null); setOpen(true); }}><FilePlus2 className="mr-2 h-5 w-5" />Upload Certificate</Button>
              <div className="rounded-md border border-white/20 px-4 py-3 text-sm text-white/80">Supports .docx and .pdf</div>
            </div>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 p-6 text-center">
            <div className="text-sm text-white/70">Auditor</div>
            <div className="mt-2 text-2xl font-semibold">{auditorName}</div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 text-center text-slate-600 no-print"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); setPendingFiles(Array.from(e.dataTransfer.files)); setOpen(true); }}>
        Drag and drop files anywhere here to open the certificate review dialog.
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Audits</h2>
          <div className="text-sm text-slate-600">{audits.length} total audit(s)</div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {audits.length === 0 ? (
            <Card className="lg:col-span-2 xl:col-span-3">
              <CardContent className="p-10 text-center text-slate-600">No audits yet. Upload a certificate to create your first field note package.</CardContent>
            </Card>
          ) : audits.map((audit) => (
            <Card key={audit.id} className="print-card">
              <CardHeader>
                <CardTitle>{audit.protectedProperty || "Untitled Property"}</CardTitle>
                <div className="text-sm text-slate-600">{audit.ascName || "ASC pending"} · {audit.certificateNumber || "Cert # pending"}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">{audit.certificates.map((cert, index) => <Badge key={`${audit.id}-${index}`}>{cert.fileName}</Badge>)}</div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm"><span>Progress</span><span>{computeProgress(audit)}%</span></div>
                  <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-accent" style={{ width: `${computeProgress(audit)}%` }} /></div>
                </div>
                <div className="text-sm text-slate-600">{auditLastSavedLabel(audit)}</div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" onClick={() => navigate(`/audit/${audit.id}`)}>Open</Button>
                  <Button variant="outline" onClick={() => navigate(`/audit/${audit.id}/export`)}>Export</Button>
                  <Button variant="destructive" onClick={() => onDeleteAudit(audit.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <UploadDialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setPendingFiles(null); }} initialFiles={pendingFiles} onConfirm={(certs) => {
        const created = onCreateAudit(certs);
        navigate(`/audit/${created.id}`);
      }} />
    </div>
  );
}
