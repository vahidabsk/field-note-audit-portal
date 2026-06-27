import { relativeTime, uid } from "./utils";

export type StatusCode = "OK" | "VAR" | "NA" | "NR";
export type SignalType = "Alarm" | "Supervisory" | "Trouble";

export interface ParsedCertificate {
  fileName: string;
  uploadedAt?: string;
  certificateNumber?: string;
  certificateType?: string;
  fileNo?: string;
  ccn?: string;
  issuedDate?: string;
  revisedDate?: string;
  propertyName?: string;
  propertyAddress?: string;
  ascName?: string;
  ascAddress?: string;
  areaCovered?: string;
  ahj?: string;
  respondingFD?: string;
  standardReferenced?: string;
  coverageType?: string;
  systemDeviations?: string;
  controlUnitMfr?: string;
  controlUnitModel?: string;
  signalTransmitterMfr?: string;
  signalTransmitterModel?: string;
  primaryTransmission?: string;
  retransmission?: string;
  centralStation?: string;
  centralStationAddress?: string;
  centralStationFile?: string;
  testingContractDate?: string;
  deviceCounts?: {
    smoke?: number; heat?: number; duct?: number; otherInitiating?: number;
    manualStations?: number; waterflowControlValve?: number;
    hornStrobe?: number; strobe?: number; notificationAppliances?: number;
  };
}

export interface AuditRow {
  id: string;
  element: string;
  status: StatusCode | "";
  notes: string;
  photos: string[];
  updatedAt: string;
  updatedBy: string;
}

export interface SignalLogRow {
  id: string;
  signalType: SignalType | "";
  date: string;
  time: string;
  description: string;
  notes: string;
  updatedAt: string;
}

export interface DeviceTestRow {
  id: string;
  deviceType: string;
  location: string;
  deviceId: string;
  signalType: SignalType | "";
  tripTime: string;
  timeReceived: string;
  signalReceived: boolean;
  restoralReceived: boolean;
  localIndication: boolean;
  result: StatusCode | "";
  notes: string;
  photos: string[];
  updatedAt: string;
}

export interface Audit {
  id: string;
  createdAt: string;
  updatedAt: string;
  auditorName: string;
  auditDate: string;
  ascName: string;
  certificateNumber: string;
  fileScn: string;
  protectedProperty: string;
  codeEdition: string;
  certificates: ParsedCertificate[];
  primaryCertificateIndex: number;
  matchesCertificate: boolean;
  certificateDisplayed: boolean;
  signalLog: SignalLogRow[];
  documentation: AuditRow[];
  installation: AuditRow[];
  deviceTests: DeviceTestRow[];
  comments: string;
  headerEdited?: Record<string, boolean>;
  sections?: Record<string, { startedAt?: string; completedAt?: string }>;
}

export interface AuditorProfile {
  name: string;
  since: string;
}

export const AUDITOR_KEY = "fap.auditor";
export const AUDITS_KEY = "fap.audits";

const DOCUMENTATION_ELEMENTS = [
  "As-built drawings",
  "Riser diagram",
  "Battery calculations",
  "Voltage drop calculations",
  "Sequence of operation",
  "Service records",
  "Inspection/test records",
  "AIT records",
  "Monitoring records",
  "Previous deficiencies",
  "Correction documentation",
];

const INSTALLATION_ELEMENTS = [
  "Compatible/Listed Equipment",
  "Control & Sub Control(s)",
  "Transmitter/Communicator",
  "Primary Power Requirements",
  "Secondary Power (battery condition, date code)",
  "Enclosure",
  "Wiring workmanship",
  "Conduit/cable protection",
  "Grounding/bonding",
  "Circuit identification",
  "Panel labeling",
  "Device labeling",
  "Notification appliance condition",
  "Initiating device condition",
  "Waterflow + Tamper",
  "Smoke/Heat/Duct detectors",
  "Manual stations",
  "Remote annunciator",
  "Communication equipment",
  "Central station connection",
  "Code compliance",
];

export function createBlankSignalRow(): SignalLogRow {
  return {
    id: uid("signal"),
    signalType: "",
    date: "",
    time: "",
    description: "",
    notes: "",
    updatedAt: new Date().toISOString(),
  };
}

export function createBlankAuditRow(element: string, auditorName: string): AuditRow {
  return {
    id: uid("row"),
    element,
    status: "",
    notes: "",
    photos: [],
    updatedAt: new Date().toISOString(),
    updatedBy: auditorName,
  };
}

export function createBlankDeviceRow(): DeviceTestRow {
  return {
    id: uid("device"),
    deviceType: "",
    location: "",
    deviceId: "",
    signalType: "",
    tripTime: "",
    timeReceived: "",
    signalReceived: false,
    restoralReceived: false,
    localIndication: false,
    result: "",
    notes: "",
    photos: [],
    updatedAt: new Date().toISOString(),
  };
}

export function loadAuditor(): AuditorProfile | null {
  const raw = localStorage.getItem(AUDITOR_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveAuditor(profile: AuditorProfile) {
  localStorage.setItem(AUDITOR_KEY, JSON.stringify(profile));
}

export function loadAudits(): Audit[] {
  const raw = localStorage.getItem(AUDITS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveAudits(audits: Audit[]) {
  localStorage.setItem(AUDITS_KEY, JSON.stringify(audits));
}

export function createAudit(auditorName: string, certificates: ParsedCertificate[]): Audit {
  const now = new Date().toISOString();
  const primary = certificates[0] ?? { fileName: "" };
  return {
    id: uid("audit"),
    createdAt: now,
    updatedAt: now,
    auditorName,
    auditDate: now.slice(0, 10),
    ascName: primary.ascName ?? "",
    certificateNumber: primary.certificateNumber ?? "",
    fileScn: primary.fileNo ?? "",
    protectedProperty: primary.propertyName ?? "",
    codeEdition: primary.standardReferenced ?? "",
    certificates: certificates.map((c) => ({ ...c, uploadedAt: c.uploadedAt ?? now })),
    primaryCertificateIndex: 0,
    matchesCertificate: false,
    certificateDisplayed: false,
    signalLog: [createBlankSignalRow()],
    documentation: DOCUMENTATION_ELEMENTS.map((x) => createBlankAuditRow(x, auditorName)),
    installation: INSTALLATION_ELEMENTS.map((x) => createBlankAuditRow(x, auditorName)),
    deviceTests: [createBlankDeviceRow()],
    comments: primary.systemDeviations ?? "",
    headerEdited: {},
    sections: {
      signalLog: { startedAt: now },
      documentation: { startedAt: now },
      installation: { startedAt: now },
      deviceTests: { startedAt: now },
    },
  };
}

export function mapCertToHeader(primary: ParsedCertificate) {
  return {
    ascName: primary.ascName ?? "",
    certificateNumber: primary.certificateNumber ?? "",
    fileScn: primary.fileNo ?? "",
    protectedProperty: primary.propertyName ?? "",
    codeEdition: primary.standardReferenced ?? "",
    comments: primary.systemDeviations ?? "",
  };
}

export function reseedFromPrimary(audit: Audit, nextPrimaryIndex: number): Audit {
  const primary = audit.certificates[nextPrimaryIndex];
  if (!primary) return audit;
  const header = mapCertToHeader(primary);
  const edited = audit.headerEdited ?? {};
  return {
    ...audit,
    updatedAt: new Date().toISOString(),
    primaryCertificateIndex: nextPrimaryIndex,
    ascName: edited.ascName ? audit.ascName : header.ascName,
    certificateNumber: edited.certificateNumber ? audit.certificateNumber : header.certificateNumber,
    fileScn: edited.fileScn ? audit.fileScn : header.fileScn,
    protectedProperty: edited.protectedProperty ? audit.protectedProperty : header.protectedProperty,
    codeEdition: edited.codeEdition ? audit.codeEdition : header.codeEdition,
    comments: edited.comments ? audit.comments : header.comments,
  };
}

export function computeProgress(audit: Audit) {
  const total = audit.documentation.length + audit.installation.length + audit.deviceTests.length;
  const done = [
    ...audit.documentation.map((r) => !!r.status),
    ...audit.installation.map((r) => !!r.status),
    ...audit.deviceTests.map((r) => !!r.result),
  ].filter(Boolean).length;
  return total ? Math.round((done / total) * 100) : 0;
}

export function auditLastSavedLabel(audit: Audit) {
  return `Updated ${relativeTime(audit.updatedAt)}`;
}
