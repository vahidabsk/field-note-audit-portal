import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CertificateSummary } from "../components/CertificateSummary";
import { CertificatesPanel } from "../components/CertificatesPanel";
import { DeviceTestSection } from "../components/DeviceTestSection";
import { DocumentationSection } from "../components/DocumentationSection";
import { InstallationSection } from "../components/InstallationSection";
import { SignalLogSection } from "../components/SignalLogSection";
import { UploadDialog } from "../components/UploadDialog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { createBlankAuditRow, createBlankDeviceRow, createBlankSignalRow, type Audit, type ParsedCertificate } from "../lib/audit-storage";

export function AuditPage({ audits, auditorName, onUpdateAudit, onAddCertificates, onUsePrimary }: { audits: Audit[]; auditorName: string; onUpdateAudit: (auditId: string, updater: (audit: Audit) => Audit) => void; onAddCertificates: (auditId: string, certificates: ParsedCertificate[]) => void; onUsePrimary: (auditId: string, index: number) => void; }) {
  const { auditId } = useParams();
  const audit = useMemo(() => audits.find((item) => item.id === auditId), [audits, auditId]);
  const [tab, setTab] = useState("signal");
  const [uploadOpen, setUploadOpen] = useState(false);
  const navigate = useNavigate();

  if (!audit) {
    return <div className="mx-auto max-w-3xl p-6">Audit not found.</div>;
  }

  const primaryCert = audit.certificates[audit.primaryCertificateIndex];

  const updateHeader = (field: keyof Audit, value: string | boolean) => onUpdateAudit(audit.id, (prev) => ({ ...prev, [field]: value, headerEdited: { ...(prev.headerEdited ?? {}), [field]: true } }));

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">Audit Workspace</div>
          <h1 className="text-2xl font-bold">{audit.protectedProperty || "New Audit"}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/")}>Back to Dashboard</Button>
          <Button variant="accent" onClick={() => navigate(`/audit/${audit.id}/export`)}>Export / Print</Button>
        </div>
      </div>

      <Card className="sticky top-[88px] z-30 print-card">
        <CardContent className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
          <div><Label>Date</Label><Input type="date" value={audit.auditDate} onChange={(e) => updateHeader("auditDate", e.target.value)} /></div>
          <div><Label>ASC</Label><Input value={audit.ascName} onChange={(e) => updateHeader("ascName", e.target.value)} /></div>
          <div><Label>File / SCN</Label><Input value={audit.fileScn} onChange={(e) => updateHeader("fileScn", e.target.value)} /></div>
          <div><Label>Auditor</Label><Input readOnly value={auditorName} /></div>
          <div><Label>Certificate #</Label><Input value={audit.certificateNumber} onChange={(e) => updateHeader("certificateNumber", e.target.value)} /></div>
          <div><Label>Protected Property</Label><Input value={audit.protectedProperty} onChange={(e) => updateHeader("protectedProperty", e.target.value)} /></div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CertificatesPanel certificates={audit.certificates} primaryIndex={audit.primaryCertificateIndex} onPrimaryChange={(index) => onUsePrimary(audit.id, index)} onUpload={() => setUploadOpen(true)} />
        <CertificateSummary cert={primaryCert} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="signal">Signal Processing</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="installation">Installation</TabsTrigger>
          <TabsTrigger value="device">Device Testing</TabsTrigger>
        </TabsList>
        <TabsContent value="signal">
          <SignalLogSection rows={audit.signalLog} onChange={(rows) => onUpdateAudit(audit.id, (prev) => ({ ...prev, signalLog: rows }))} onAddRow={() => onUpdateAudit(audit.id, (prev) => ({ ...prev, signalLog: [...prev.signalLog, createBlankSignalRow()] }))} />
        </TabsContent>
        <TabsContent value="documentation">
          <DocumentationSection rows={audit.documentation} codeEdition={audit.codeEdition} onCodeEditionChange={(value) => updateHeader("codeEdition", value)} onChange={(rows) => onUpdateAudit(audit.id, (prev) => ({ ...prev, documentation: rows }))} onAddCustomRow={() => onUpdateAudit(audit.id, (prev) => ({ ...prev, documentation: [...prev.documentation, createBlankAuditRow("Custom Documentation Element", auditorName)] }))} />
        </TabsContent>
        <TabsContent value="installation">
          <InstallationSection rows={audit.installation} matchesCertificate={audit.matchesCertificate} certificateDisplayed={audit.certificateDisplayed} onToggleMatches={(value) => onUpdateAudit(audit.id, (prev) => ({ ...prev, matchesCertificate: value }))} onToggleDisplayed={(value) => onUpdateAudit(audit.id, (prev) => ({ ...prev, certificateDisplayed: value }))} onChange={(rows) => onUpdateAudit(audit.id, (prev) => ({ ...prev, installation: rows }))} onAddCustomRow={() => onUpdateAudit(audit.id, (prev) => ({ ...prev, installation: [...prev.installation, createBlankAuditRow("Custom Installation Element", auditorName)] }))} />
        </TabsContent>
        <TabsContent value="device">
          <DeviceTestSection rows={audit.deviceTests} onChange={(rows) => onUpdateAudit(audit.id, (prev) => ({ ...prev, deviceTests: rows }))} onAddRow={() => onUpdateAudit(audit.id, (prev) => ({ ...prev, deviceTests: [...prev.deviceTests, createBlankDeviceRow()] }))} />
        </TabsContent>
      </Tabs>
      <div className="flex flex-wrap gap-2 text-sm text-slate-600"><Badge>Primary cert: {primaryCert?.fileName ?? "None"}</Badge><Badge>Comments seeded from deviations: {audit.comments ? "Yes" : "No deviations"}</Badge></div>
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} title="Attach additional certificate" onConfirm={(certs) => onAddCertificates(audit.id, certs)} />
    </div>
  );
}
