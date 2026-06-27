import type { AuditRow, StatusCode } from "../lib/audit-storage";
import { DictationNotes } from "./DictationNotes";
import { PhotoCapture } from "./PhotoCapture";
import { StatusButtons } from "./StatusButtons";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function updateRow(rows: AuditRow[], rowId: string, patch: Partial<AuditRow>) {
  return rows.map((row) => row.id === rowId ? { ...row, ...patch, updatedAt: new Date().toISOString() } : row);
}

export function DocumentationSection({ rows, codeEdition, onCodeEditionChange, onChange, onAddCustomRow }: { rows: AuditRow[]; codeEdition: string; onCodeEditionChange: (v: string) => void; onChange: (rows: AuditRow[]) => void; onAddCustomRow: () => void }) {
  return (
    <div className="space-y-4">
      <Card className="print-card"><CardContent className="pt-4"><div className="max-w-sm"><Label>NFPA Code Edition</Label><Input value={codeEdition} onChange={(e) => onCodeEditionChange(e.target.value)} /></div></CardContent></Card>
      {rows.map((row) => (
        <Card key={row.id} className="print-card">
          <CardHeader>
            <CardTitle>{row.element}</CardTitle>
            <div className="text-xs text-slate-500">Updated {new Date(row.updatedAt).toLocaleString()} · {row.updatedBy}</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusButtons value={row.status} onChange={(status: StatusCode) => onChange(updateRow(rows, row.id, { status }))} />
            <div><Label>Notes</Label><DictationNotes value={row.notes} onChange={(notes) => onChange(updateRow(rows, row.id, { notes }))} /></div>
            <div><Label>Optional photo</Label><PhotoCapture photoIds={row.photos} onChange={(photos) => onChange(updateRow(rows, row.id, { photos }))} /></div>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={onAddCustomRow}>Add custom element</Button>
    </div>
  );
}
