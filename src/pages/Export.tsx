import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { generateAuditCsv } from "../lib/export-csv";
import { getPhoto } from "../lib/photo-store";
import type { Audit } from "../lib/audit-storage";

const status: Record<string, string> = { OK: "OK", VAR: "VAR", NA: "N/A", NR: "N/R", "": "" };
const signal: Record<string, string> = { Alarm: "A", Supervisory: "S", Trouble: "T", "": "" };

export function ExportPage({ audits }: { audits: Audit[] }) {
  const { auditId } = useParams();
  const audit = useMemo(() => audits.find((item) => item.id === auditId), [audits, auditId]);
  const navigate = useNavigate();

  if (!audit) return <div className="mx-auto max-w-3xl p-6">Audit not found.</div>;

  const downloadCsv = () => {
    const csv = generateAuditCsv(audit);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${audit.protectedProperty || audit.id}-audit-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">Export / Print</div>
          <h1 className="text-2xl font-bold">{audit.protectedProperty}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/audit/${audit.id}`)}>Back to Audit</Button>
          <Button variant="outline" onClick={downloadCsv}>Download CSV</Button>
          <Button variant="accent" onClick={() => window.print()}>Print PDF</Button>
        </div>
      </div>

      <Card className="print-card border-2 border-primary">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle>Field Note Audit Export</CardTitle>
          <div className="text-sm text-slate-600">Exported {new Date().toLocaleString()}</div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Audit Date" value={audit.auditDate} />
            <Field label="Auditor" value={audit.auditorName} />
            <Field label="ASC" value={audit.ascName} />
            <Field label="Certificate #" value={audit.certificateNumber} />
            <Field label="File/SCN" value={audit.fileScn} />
            <Field label="Protected Property" value={audit.protectedProperty} />
            <Field label="Code Edition" value={audit.codeEdition} />
            <Field label="Comments" value={audit.comments || "—"} />
          </section>

          <SectionTable title="Signal Processing Review" headers={["Type", "Date", "Time", "Description", "Notes"]} rows={audit.signalLog.map((row) => [signal[row.signalType], row.date, row.time, row.description, row.notes])} />
          <SectionTable title="Documentation Review" headers={["Element", "Status", "Notes", "Updated"]} rows={audit.documentation.map((row) => [row.element, status[row.status], row.notes, new Date(row.updatedAt).toLocaleString()])} />
          <SectionTable title="Installation Review" headers={["Element", "Status", "Notes", "Updated"]} rows={audit.installation.map((row) => [row.element, status[row.status], row.notes, new Date(row.updatedAt).toLocaleString()])} />
          <SectionTable title="Device Testing" headers={["Device", "Location", "ID", "Type", "Trip", "Received", "Result", "Notes"]} rows={audit.deviceTests.map((row) => [row.deviceType, row.location, row.deviceId, signal[row.signalType], row.tripTime, row.timeReceived, status[row.result], row.notes])} />

          <section>
            <h2 className="mb-3 text-lg font-semibold">Photos</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[...audit.documentation, ...audit.installation].flatMap((row) => row.photos.map((photo) => ({ photo, caption: row.element }))).concat(audit.deviceTests.flatMap((row) => row.photos.map((photo) => ({ photo, caption: `${row.deviceType || 'Device'} · ${row.location || 'Location pending'}` })))).map((item, index) => {
                const src = getPhoto(item.photo);
                if (!src) return null;
                return <div key={index} className="overflow-hidden rounded-lg border"><img src={src} alt={item.caption} className="h-64 w-full object-cover" /><div className="p-2 text-sm text-slate-700">{item.caption}</div></div>;
              })}
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border p-3"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div><div className="mt-1 text-sm text-slate-900">{value || "—"}</div></div>;
}

function SectionTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50"><tr>{headers.map((head) => <th key={head} className="border-b px-3 py-2 text-left font-semibold text-slate-700">{head}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => <tr key={index} className="align-top even:bg-slate-50/50">{row.map((cell, cellIndex) => <td key={cellIndex} className="border-b px-3 py-2">{cell || "—"}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
