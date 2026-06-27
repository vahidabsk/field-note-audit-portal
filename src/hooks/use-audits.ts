import { useEffect, useMemo, useRef, useState } from "react";
import { createAudit, loadAudits, reseedFromPrimary, saveAudits, type Audit, type ParsedCertificate } from "../lib/audit-storage";

export function useAudits() {
  const [audits, setAudits] = useState<Audit[]>(() => loadAudits());
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => saveAudits(audits), 500);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [audits]);

  const actions = useMemo(() => ({
    createFromCertificates(auditorName: string, certificates: ParsedCertificate[]) {
      const next = createAudit(auditorName, certificates);
      setAudits((prev) => [next, ...prev]);
      return next;
    },
    updateAudit(auditId: string, updater: (audit: Audit) => Audit) {
      setAudits((prev) => prev.map((audit) => audit.id === auditId ? { ...updater(audit), updatedAt: new Date().toISOString() } : audit));
    },
    deleteAudit(auditId: string) {
      setAudits((prev) => prev.filter((x) => x.id !== auditId));
    },
    addCertificates(auditId: string, certificates: ParsedCertificate[]) {
      setAudits((prev) => prev.map((audit) => audit.id === auditId ? {
        ...audit,
        certificates: [...audit.certificates, ...certificates.map((c) => ({ ...c, uploadedAt: c.uploadedAt ?? new Date().toISOString() }))],
        updatedAt: new Date().toISOString(),
      } : audit));
    },
    usePrimary(auditId: string, index: number) {
      setAudits((prev) => prev.map((audit) => audit.id === auditId ? reseedFromPrimary(audit, index) : audit));
    },
  }), []);

  return { audits, setAudits, ...actions };
}
