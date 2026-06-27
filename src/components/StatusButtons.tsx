import type { StatusCode } from "../lib/audit-storage";
import { cn } from "../lib/utils";

const OPTIONS: { value: StatusCode; label: string }[] = [
  { value: "OK", label: "In Conformance" },
  { value: "VAR", label: "Variations Noted" },
  { value: "NA", label: "Not Applicable" },
  { value: "NR", label: "Not Reviewed" },
];

export function StatusButtons({ value, onChange }: { value: StatusCode | ""; onChange: (value: StatusCode) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "rounded-md border px-3 py-2 text-sm font-medium",
            value === option.value ? "border-primary bg-primary text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
