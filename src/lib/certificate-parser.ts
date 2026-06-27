import type { ParsedCertificate } from "./audit-storage";

const HEADING_PATTERNS: RegExp[] = [
  /^Protected Property:?$/i,
  /^Alarm Service Company:?$/i,
  /^Area Covered:/i,
  /^Authority Having Jurisdiction:/i,
  /^Responding Fire Department:/i,
  /^Coverage is /i,
  /^Retransmission To Fire Department:/i,
  /^Primary Transmission Method:/i,
  /^Control Unit Manufacturer:/i,
  /^Control Unit Model:/i,
  /^Monitoring Location:/i,
  /^SN:/i,
  /^File No:/i,
  /^Issued:/i,
  /^SYSTEM DEVIATIONS FROM REFERENCED NFPA STANDARDS$/i,
];

function firstMatch(text: string, regex: RegExp): string | undefined {
  const match = text.match(regex);
  return match?.[1]?.trim() || undefined;
}

function normalizeDate(input?: string): string | undefined {
  if (!input) return undefined;

  const match = input.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!match) return undefined;

  const [, mm, dd, yyyy] = match;
  const year = yyyy.length === 2 ? `20${yyyy}` : yyyy;

  return `${year}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function cleanup(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripDisclaimer(input: string): string {
  // RULE 1 — remove everything from THIS CERTIFIES through ALARM SYSTEM DESCRIPTION:
  return input.replace(/THIS CERTIFIES[\s\S]*?ALARM SYSTEM DESCRIPTION:\s*/i, "");
}

function lineValueBlock(lines: string[], headingRegex: RegExp): string[] {
  const idx = lines.findIndex((line) => headingRegex.test(line.trim()));
  if (idx === -1) return [];

  const out: string[] = [];
  for (let i = idx + 1; i < lines.length && out.length < 4; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (HEADING_PATTERNS.some((re) => re.test(line))) break;
    out.push(line);
  }

  return out;
}

function splitAtDigits(line: string): { before: string; after: string } {
  const match = line.match(/^(.*?)(\d.*)$/);
  if (!match) {
    return { before: line.trim(), after: "" };
  }

  return {
    before: match[1].trim(),
    after: match[2].trim(),
  };
}

function extractDeviceCount(text: string, regex: RegExp): number | undefined {
  const match = text.match(regex);
  if (!match) return undefined;

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : undefined;
}

function firstLineStarting(lines: string[], prefix: string): string | undefined {
  return lines.find((line) => line.toLowerCase().startsWith(prefix.toLowerCase()));
}

export function parseCertificateText(rawText: string, fileName: string): ParsedCertificate {
  const stripped = stripDisclaimer(rawText);
  const text = cleanup(stripped);
  const lines = text.split(/\n/).map((line) => line.trim());

  // RULE 2 + RULE 3 — Protected Property as standalone heading, then split name/address at first digit run
  const propertyBlock = lineValueBlock(lines, /^Protected Property:?$/i);
  const propertyFirstLine = propertyBlock[0] ?? "";
  const propertySplit = splitAtDigits(propertyFirstLine);
  const propertyName = propertySplit.before || undefined;
  const propertyAddressParts = [propertySplit.after, ...propertyBlock.slice(1)].filter(Boolean);
  const propertyAddress = propertyAddressParts.join(", ") || undefined;

  // RULE 2 + RULE 4 — ASC heading, preserve digits in company name
  const ascBlock = lineValueBlock(lines, /^Alarm Service Company:?$/i);
  const ascName = ascBlock[0] || undefined;
  const ascAddress = ascBlock.slice(1).join(", ") || undefined;

  // RULE 5 — Monitoring Location block
  let centralStation: string | undefined;
  let centralStationAddress: string | undefined;
  let centralStationFile: string | undefined;

  const monitoringIndex = lines.findIndex((line) => /^Monitoring Location:/i.test(line));
  if (monitoringIndex !== -1) {
    const monitorLine = lines[monitoringIndex];
    const fileMatch = monitorLine.match(/File:\s*([A-Z]\d+)/i);
    centralStationFile = fileMatch?.[1];

    const nextLine = lines
      .slice(monitoringIndex + 1)
      .find((line) => !!line && !HEADING_PATTERNS.some((re) => re.test(line)));

    if (nextLine) {
      const split = splitAtDigits(nextLine);
      centralStation = split.before || nextLine;
      centralStationAddress = split.after || undefined;
    }

    const maybeAddressLine2 = lines[monitoringIndex + 2];
    if (
      maybeAddressLine2 &&
      maybeAddressLine2.trim() &&
      !HEADING_PATTERNS.some((re) => re.test(maybeAddressLine2.trim()))
    ) {
      centralStationAddress = [centralStationAddress, maybeAddressLine2.trim()]
        .filter(Boolean)
        .join(", ");
    }
  }

  // RULE 8 — System deviations
  let systemDeviations: string | undefined;
  const deviationsIndex = lines.findIndex((line) =>
    /^SYSTEM DEVIATIONS FROM REFERENCED NFPA STANDARDS$/i.test(line),
  );

  if (deviationsIndex !== -1) {
    const values: string[] = [];

    for (let i = deviationsIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (HEADING_PATTERNS.some((re) => re.test(line))) break;

      values.push(line);
      if (values.length >= 3) break;
    }

    const joined = values.join(" ").trim();
    systemDeviations = /^none$/i.test(joined) ? "" : joined || undefined;
  }

  const certificateType =
    lines.find((line) => /FIRE ALARM SYSTEM CERTIFICATE/i.test(line)) || undefined;

  const fileNoLine = firstLineStarting(lines, "File No:") || "";
  const issuedLine = firstLineStarting(lines, "Issued:") || "";

  // RULE 7 + RULE 9 — take first match only
  return {
    fileName,
    certificateNumber: firstMatch(text, /SN:\s*([^\n]+)/i),
    certificateType,
    fileNo: firstMatch(fileNoLine, /File No:\s*([^\s]+)/i),
    ccn: firstMatch(fileNoLine, /CCN:\s*([^\s]+)/i),
    issuedDate: normalizeDate(firstMatch(issuedLine, /Issued:\s*([^R\n]+)/i)),
    revisedDate: normalizeDate(firstMatch(issuedLine, /Revised:\s*([^\n]+)/i)),
    propertyName,
    propertyAddress,
    ascName,
    ascAddress,
    areaCovered: firstMatch(text, /Area Covered:\s*([^\n]+)/i),
    ahj: firstMatch(text, /Authority Having Jurisdiction:\s*([^\n]+)/i),
    respondingFD: firstMatch(text, /Responding Fire Department:\s*([^\n]+)/i),
    standardReferenced: firstMatch(text, /accordance with standard\s+(NFPA\s*72-\d{4})/i),
    coverageType: firstMatch(text, /Coverage is\s+([^\n]+)/i),
    systemDeviations,
    controlUnitMfr: firstMatch(text, /Control Unit Manufacturer:\s*([^\n]+)/i),
    controlUnitModel: firstMatch(text, /Control Unit Model:\s*([^\n]+)/i),
    primaryTransmission: firstMatch(text, /Primary Transmission Method:\s*([^\n]+)/i),
    retransmission: firstMatch(text, /Retransmission To Fire Department:\s*([^\n]+)/i),
    centralStation,
    centralStationAddress,
    centralStationFile,
    deviceCounts: {
      smoke: extractDeviceCount(text, /Smoke Detector[\s\S]*?_Total:\s*(\d+)_/i),
      heat: extractDeviceCount(text, /Heat Detector[\s\S]*?_Total:\s*(\d+)_/i),
      duct: extractDeviceCount(text, /Duct Detector[\s\S]*?_Total:\s*(\d+)_/i),
      waterflowControlValve: extractDeviceCount(
        text,
        /Waterflow[\s\S]*?Control Valve[\s\S]*?_Total:\s*(\d+)_/i,
      ),
      manualStations: extractDeviceCount(
        text,
        /Manual[\s\S]*?Station[\s\S]*?_Total:\s*(\d+)_/i,
      ),
      hornStrobe: extractDeviceCount(
        text,
        /Horn\s*\/\s*Strobe[\s\S]*?_Total:\s*(\d+)_/i,
      ),
      strobe: extractDeviceCount(
        text,
        /(?:^|\n)Strobe[\s\S]*?_Total:\s*(\d+)_/i,
      ),
    },
  };
}

export function hasUsefulCertificateData(cert: ParsedCertificate): boolean {
  const fields = [
    cert.certificateNumber,
    cert.fileNo,
    cert.propertyName,
    cert.ascName,
    cert.standardReferenced,
  ];

  return fields.filter(Boolean).length > 0;
}