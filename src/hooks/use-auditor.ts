import { useEffect, useState } from "react";
import { loadAuditor, saveAuditor, type AuditorProfile } from "../lib/audit-storage";

export function useAuditor() {
  const [auditor, setAuditor] = useState<AuditorProfile | null>(() => loadAuditor());

  useEffect(() => {
    if (auditor) saveAuditor(auditor);
  }, [auditor]);

  return { auditor, setAuditor };
}
