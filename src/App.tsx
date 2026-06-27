import { Route, Routes } from "react-router-dom";
import { AuditorGate } from "./components/AuditorGate";
import { UlHeader } from "./components/UlHeader";
import { Toaster } from "./components/ui/toaster";
import { useAuditor } from "./hooks/use-auditor";
import { useAudits } from "./hooks/use-audits";
import { Dashboard } from "./pages/Dashboard";
import { AuditPage } from "./pages/Audit";
import { ExportPage } from "./pages/Export";

export default function App() {
  const { auditor, setAuditor } = useAuditor();
  const { audits, createFromCertificates, updateAudit, deleteAudit, addCertificates, usePrimary } = useAudits();

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <UlHeader auditorName={auditor?.name} onChangeAuditor={() => setAuditor(null)} />
      <AuditorGate name={auditor?.name} onSave={(name) => setAuditor({ name, since: auditor?.since ?? new Date().toISOString() })} />
      <Routes>
        <Route path="/" element={<Dashboard auditorName={auditor?.name ?? ""} audits={audits} onCreateAudit={(certificates) => createFromCertificates(auditor?.name ?? "", certificates)} onDeleteAudit={deleteAudit} />} />
        <Route path="/audit/:auditId" element={<AuditPage audits={audits} auditorName={auditor?.name ?? ""} onUpdateAudit={updateAudit} onAddCertificates={addCertificates} onUsePrimary={usePrimary} />} />
        <Route path="/audit/:auditId/export" element={<ExportPage audits={audits} />} />
      </Routes>
      <Toaster />
    </div>
  );
}
