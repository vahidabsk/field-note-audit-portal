import { X } from "lucide-react";
import { Button } from "./button";
import type { ToastData } from "../../hooks/use-toast";

export function Toast({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  return (
    <div className={`w-80 rounded-lg border p-4 shadow-soft ${toast.variant === "destructive" ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">{toast.title}</div>
          {toast.description ? <div className="mt-1 text-sm text-slate-600">{toast.description}</div> : null}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
