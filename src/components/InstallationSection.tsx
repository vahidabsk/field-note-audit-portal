import type { AuditRow, StatusCode } from "../lib/audit-storage";
import { DictationNotes } from "./DictationNotes";
import { PhotoCapture } from "./PhotoCapture";
import { StatusButtons } from "./StatusButtons";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";

function updateRow(rows: AuditRow[], rowId: string, patch: Partial<AuditRow>) {
  return rows.map((row) => row.id === rowId ? { ...row, ...patch, updatedAt: new Date().toISOString() } : row);
}

export function InstallationSection({ rows, matchesCertificate, certificateDisplayed, onToggleMatches, onToggleDisplayed, onChange, onAddCustomRow }: { rows: AuditRow[]; matchesCertificate: boolean; certificateDisplayed: boolean; onToggleMatches: (value: boolean) => void; onToggleDisplayed: (value: boolean) => void; onChange: (rows: AuditRow[]) => void; onAddCustomRow: () => void }) {
  return (
    <div className="space-y-4">
      <Card className="print-card">
        <CardContent className="grid gap-4 pt-4 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-lg border p-4"><div><div className="font-medium">Matches certificate</div><div className="text-sm text-slate-600">Observed installation matches certificate scope</div></div><input type="checkbox" checked={matchesCertificate} onChange={(e) => onToggleMatches(e.target.checked)} /></label>
          <label className="flex items-center justify-between rounded-lg border p-4"><div><div className="font-medium">Certificate displayed</div><div className="text-sm text-slate-600">Certificate is visibly posted</div></div><input type="checkbox" checked={certificateDisplayed} onChange={(e) => onToggleDisplayed(e.target.checked)} /></label>
        </CardContent>
      </Card>
      {rows.map((row) => (
        <Card key={row.id} className="print-card">
          <CardHeader><CardTitle>{row.element}</CardTitle><div className="text-xs text-slate-500">Updated {new Date(row.updatedAt).toLocaleString()} · {row.updatedBy}</div></CardHeader>
          <CardContent className="space-y-4">
            <StatusButtons value={row.status} onChange={(status: StatusCode) => onChange(updateRow(rows, row.id, { status }))} />
            <div><Label>Notes</Label><DictationNotes value={row.notes} onChange={(notes) => onChange(updateRow(rows, row.id, { notes }))} /></div>
            <div><Label>Required photo</Label><PhotoCapture required photoIds={row.photos} onChange={(photos) => onChange(updateRow(rows, row.id, { photos }))} /></div>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={onAddCustomRow}>Add custom element</Button>
    </div>
  );
}
