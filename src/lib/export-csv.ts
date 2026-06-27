import type { Audit } from "./audit-storage";

const statusExport: Record<string, string> = {
  OK: "OK",
  VAR: "VAR",
  NA: "N/A",
  NR: "N/R",
  "": "",
};

const signalExport: Record<string, string> = {
  Alarm: "A",
  Supervisory: "S",
  Trouble: "T",
  "": "",
};

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export function generateAuditCsv(audit: Audit) {
  const lines: string[] = [];

  lines.push(
    ["Audit Header", "Audit ID", audit.id, "Exported At", new Date().toISOString()]
      .map(csvCell)
      .join(","),
  );

  lines.push(
    [
      "Audit Date",
      audit.auditDate,
      "ASC",
      audit.ascName,
      "Certificate #",
      audit.certificateNumber,
      "Protected Property",
      audit.protectedProperty,
      "Code Edition",
      audit.codeEdition,
    ]
      .map(csvCell)
      .join(","),
  );

  lines.push("");

  lines.push(csvCell("Signal Processing"));
  lines.push(["Signal Type", "Date", "Time", "Description", "Notes"].map(csvCell).join(","));
  audit.signalLog.forEach((row) => {
    lines.push(
      [
        signalExport[row.signalType],
        row.date,
        row.time,
        row.description,
        row.notes,
      ]
        .map(csvCell)
        .join(","),
    );
  });

  lines.push("");

  lines.push(csvCell("Documentation Review"));
  lines.push(["Element", "Status", "Notes", "Updated At", "Updated By", "Photos"].map(csvCell).join(","));
  audit.documentation.forEach((row) => {
    lines.push(
      [
        row.element,
        statusExport[row.status],
        row.notes,
        row.updatedAt,
        row.updatedBy,
        row.photos.join("|"),
      ]
        .map(csvCell)
        .join(","),
    );
  });

  lines.push("");

  lines.push(csvCell("Installation Review"));
  lines.push(["Element", "Status", "Notes", "Updated At", "Updated By", "Photos"].map(csvCell).join(","));
  audit.installation.forEach((row) => {
    lines.push(
      [
        row.element,
        statusExport[row.status],
        row.notes,
        row.updatedAt,
        row.updatedBy,
        row.photos.join("|"),
      ]
        .map(csvCell)
        .join(","),
    );
  });

  lines.push("");

  lines.push(csvCell("Device Testing"));
  lines.push(
    [
      "Device Type",
      "Location",
      "Device ID",
      "Signal Type",
      "Trip Time",
      "Time Received",
      "Signal Received",
      "Restoral Received",
      "Local Indication",
      "Result",
      "Notes",
      "Photos",
    ]
      .map(csvCell)
      .join(","),
  );

  audit.deviceTests.forEach((row) => {
    lines.push(
      [
        row.deviceType,
        row.location,
        row.deviceId,
        signalExport[row.signalType],
        row.tripTime,
        row.timeReceived,
        row.signalReceived ? "Yes" : "No",
        row.restoralReceived ? "Yes" : "No",
        row.localIndication ? "Yes" : "No",
        statusExport[row.result],
        row.notes,
        row.photos.join("|"),
      ]
        .map(csvCell)
        .join(","),
    );
  });

  return lines.join("\n");
}