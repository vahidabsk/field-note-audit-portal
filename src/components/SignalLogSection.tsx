import type { SignalLogRow, SignalType } from "../lib/audit-storage";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { DictationNotes } from "./DictationNotes";

const badgeStyle: Record<string, string> = {
  Alarm: "bg-emerald-100 text-emerald-700",
  Supervisory: "bg-amber-100 text-amber-700",
  Trouble: "bg-red-100 text-red-700",
};

export function SignalLogSection({ rows, onChange, onAddRow }: { rows: SignalLogRow[]; onChange: (rows: SignalLogRow[]) => void; onAddRow: () => void }) {
  const counts = rows.reduce<Record<SignalType, number>>((acc, row) => {
    if (row.signalType) acc[row.signalType] += 1;
    return acc;
  }, { Alarm: 0, Supervisory: 0, Trouble: 0 });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {(["Alarm", "Supervisory", "Trouble"] as SignalType[]).map((type) => (
          <div key={type} className={`rounded-full px-4 py-2 text-sm font-semibold ${badgeStyle[type]}`}>{type}s: {counts[type]}</div>
        ))}
      </div>
      {rows.map((row) => (
        <Card key={row.id} className="print-card">
          <CardHeader><CardTitle>Signal Row</CardTitle></CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div>
              <Label>Signal Type</Label>
              <Select value={row.signalType} onChange={(e) => onChange(rows.map((x) => x.id === row.id ? { ...x, signalType: e.target.value as SignalType | "", updatedAt: new Date().toISOString() } : x))}>
                <option value="">Select</option>
                <option value="Alarm">Alarm</option>
                <option value="Supervisory">Supervisory</option>
                <option value="Trouble">Trouble</option>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Date</Label><Input type="date" value={row.date} onChange={(e) => onChange(rows.map((x) => x.id === row.id ? { ...x, date: e.target.value, updatedAt: new Date().toISOString() } : x))} /></div>
              <div><Label>Time</Label><Input type="time" value={row.time} onChange={(e) => onChange(rows.map((x) => x.id === row.id ? { ...x, time: e.target.value, updatedAt: new Date().toISOString() } : x))} /></div>
            </div>
            <div className="lg:col-span-2"><Label>Description</Label><Input value={row.description} onChange={(e) => onChange(rows.map((x) => x.id === row.id ? { ...x, description: e.target.value, updatedAt: new Date().toISOString() } : x))} /></div>
            <div className="lg:col-span-2"><Label>Notes</Label><DictationNotes value={row.notes} onChange={(notes) => onChange(rows.map((x) => x.id === row.id ? { ...x, notes, updatedAt: new Date().toISOString() } : x))} /></div>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={onAddRow}>Add Signal Row</Button>
    </div>
  );
}
