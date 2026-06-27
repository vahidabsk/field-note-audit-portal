import { UserRound } from "lucide-react";
import { Button } from "./ui/button";

export function UlHeader({ auditorName, onChangeAuditor }: { auditorName?: string; onChangeAuditor: () => void }) {
  return (
    <header className="sticky top-0 z-40 shadow">
      <div className="h-2 bg-accent" />
      <div className="bg-primary text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-md bg-white text-lg font-black text-primary">FAP</div>
            <div>
              <div className="text-lg font-semibold">Field Note Audit Portal</div>
              <div className="text-sm text-white/80">Tablet-first field notes for fire alarm audits</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-white/10 px-3 py-2 text-sm">
            <UserRound className="h-4 w-4" />
            <span>{auditorName || "Auditor"}</span>
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={onChangeAuditor}>Change</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
