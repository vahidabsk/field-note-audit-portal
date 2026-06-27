import type { DeviceTestRow, SignalType, StatusCode } from "../lib/audit-storage";
import { DictationNotes } from "./DictationNotes";
import { PhotoCapture } from "./PhotoCapture";
import { StatusButtons } from "./StatusButtons";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";

const DEVICE_OPTIONS = ["Smoke", "Heat", "Manual pull", "Waterflow", "Tamper", "Duct", "Sprinkler supervisory", "Notification appliance", "Monitor module", "Control relay", "Communication path", "Other"];

function updateRow(rows: DeviceTestRow[], rowId: string, patch: Partial<DeviceTestRow>) {
  return rows.map((row) => row.id === rowId ? { ...row, ...patch, updatedAt: new Date().toISOString() } : row);
}

export function DeviceTestSection({ rows, onChange, onAddRow }: { rows: DeviceTestRow[]; onChange: (rows: DeviceTestRow[]) => void; onAddRow: () => void }) {
  return (
    <div className="space-y-4">
      {rows.map((row, idx) => (
        <Card key={row.id} className="print-card">
          <CardHeader><CardTitle>Device #{idx + 1}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div><Label>Device Type</Label><Select value={row.deviceType} onChange={(e) => onChange(updateRow(rows, row.id, { deviceType: e.target.value }))}><option value="">Select</option>{DEVICE_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}</Select></div>
            <div><Label>Location</Label><Input value={row.location} onChange={(e) => onChange(updateRow(rows, row.id, { location: e.target.value }))} /></div>
            <div><Label>Device ID / Zone</Label><Input value={row.deviceId} onChange={(e) => onChange(updateRow(rows, row.id, { deviceId: e.target.value }))} /></div>
            <div><Label>Signal Type</Label><Select value={row.signalType} onChange={(e) => onChange(updateRow(rows, row.id, { signalType: e.target.value as SignalType | "" }))}><option value="">Select</option><option value="Alarm">Alarm</option><option value="Supervisory">Supervisory</option><option value="Trouble">Trouble</option></Select></div>
            <div><Label>Trip Time</Label><Input type="time" value={row.tripTime} onChange={(e) => onChange(updateRow(rows, row.id, { tripTime: e.target.value }))} /></div>
            <div><Label>Time Received</Label><Input type="time" value={row.timeReceived} onChange={(e) => onChange(updateRow(rows, row.id, { timeReceived: e.target.value }))} /></div>
            <div className="lg:col-span-2 grid gap-3 md:grid-cols-3">
              <label className="flex items-center justify-between rounded-lg border p-3"><span>Signal Received?</span><input type="checkbox" checked={row.signalReceived} onChange={(e) => onChange(updateRow(rows, row.id, { signalReceived: e.target.checked }))} /></label>
              <label className="flex items-center justify-between rounded-lg border p-3"><span>Restoral Received?</span><input type="checkbox" checked={row.restoralReceived} onChange={(e) => onChange(updateRow(rows, row.id, { restoralReceived: e.target.checked }))} /></label>
              <label className="flex items-center justify-between rounded-lg border p-3"><span>Local Indication?</span><input type="checkbox" checked={row.localIndication} onChange={(e) => onChange(updateRow(rows, row.id, { localIndication: e.target.checked }))} /></label>
            </div>
            <div className="lg:col-span-2"><Label>Result</Label><StatusButtons value={row.result} onChange={(result: StatusCode) => onChange(updateRow(rows, row.id, { result }))} /></div>
            <div className="lg:col-span-2"><Label>Notes</Label><DictationNotes value={row.notes} onChange={(notes) => onChange(updateRow(rows, row.id, { notes }))} /></div>
            <div className="lg:col-span-2"><Label>Required photo</Label><PhotoCapture required photoIds={row.photos} onChange={(photos) => onChange(updateRow(rows, row.id, { photos }))} /></div>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={onAddRow}>Add Device Row</Button>
    </div>
  );
}
