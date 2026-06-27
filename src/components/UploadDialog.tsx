import { FileText, Loader2, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { hasUsefulCertificateData, parseCertificateText } from "../lib/certificate-parser";
import { extractDocxText } from "../lib/docx-extract";
import type { ParsedCertificate } from "../lib/audit-storage";
import { toast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

type EditableField = Exclude<keyof ParsedCertificate, "fileName" | "uploadedAt" | "deviceCounts">;

const EDITABLE_FIELDS: EditableField[] = [
  "certificateNumber",
  "certificateType",
  "fileNo",
  "ccn",
  "issuedDate",
  "revisedDate",
  "propertyName",
  "propertyAddress",
  "ascName",
  "ascAddress",
  "areaCovered",
  "ahj",
  "respondingFD",
  "standardReferenced",
  "coverageType",
  "systemDeviations",
  "controlUnitMfr",
  "controlUnitModel",
  "signalTransmitterMfr",
  "signalTransmitterModel",
  "primaryTransmission",
  "retransmission",
  "centralStation",
  "centralStationAddress",
  "centralStationFile",
  "testingContractDate",
];

export function UploadDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Upload Certificate",
  initialFiles,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (certs: ParsedCertificate[]) => void;
  title?: string;
  initialFiles?: File[] | null;
}) {
  const [processing, setProcessing] = useState(false);
  const [certs, setCerts] = useState<ParsedCertificate[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const processFiles = async (files: FileList | File[]) => {
    setProcessing(true);

    try {
      const next: ParsedCertificate[] = [];

      for (const file of Array.from(files)) {
        const lower = file.name.toLowerCase();
        if (!lower.endsWith(".docx")) {
          continue;
        }

        const text = await extractDocxText(file);
        const parsed = parseCertificateText(text, file.name);
        parsed.uploadedAt = new Date().toISOString();
        next.push(parsed);
      }

      setCerts(next);

      if (!next.length) {
        toast({
          title: "Unsupported files",
          description: "Upload .docx files only.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Extraction failed",
        description:
          "The DOCX file could not be parsed in-browser. You can still continue with manual entry.",
        variant: "destructive",
      });
      setCerts([{ fileName: "Manual entry" }]);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (open && initialFiles?.length) {
      processFiles(initialFiles);
    }
  }, [open, initialFiles]);

  const hasDetectedData = certs.some(hasUsefulCertificateData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div
            className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              processFiles(e.dataTransfer.files);
            }}
          >
            <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
            <div className="mt-3 text-base font-semibold text-slate-800">Drag & drop .docx</div>
            <div className="mt-1 text-sm text-slate-600">
              DOCX is the reliable upload path for the certificate parser.
            </div>

            <Button
              className="mt-4"
              variant="outline"
              type="button"
              onClick={() => inputRef.current?.click()}
            >
              Browse files
            </Button>

            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".docx"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  processFiles(e.target.files);
                }
              }}
            />
          </div>

          {processing ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting certificate text…
            </div>
          ) : null}

          {certs.length > 0 ? (
            <div className="space-y-4">
              {!hasDetectedData ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  No fields automatically detected. Fill the review form manually before creating
                  the audit.
                </div>
              ) : null}

              {certs.map((cert, index) => (
                <div key={index} className="rounded-xl border p-4">
                  <div className="mb-4 flex items-center gap-2 font-medium text-slate-900">
                    <FileText className="h-4 w-4" />
                    {cert.fileName}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {EDITABLE_FIELDS.map((field) => (
                      <div key={field}>
                        <Label>{field}</Label>
                        <Input
                          value={cert[field] ?? ""}
                          onChange={(e) =>
                            setCerts((prev) =>
                              prev.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      [field]: e.target.value,
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="grid gap-3 md:grid-cols-4">
                    {Object.entries(cert.deviceCounts ?? {}).map(([k, v]) => (
                      <div key={k}>
                        <Label>{k}</Label>
                        <Input
                          type="number"
                          value={v ?? ""}
                          onChange={(e) =>
                            setCerts((prev) =>
                              prev.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      deviceCounts: {
                                        ...(item.deviceCounts ?? {}),
                                        [k]: e.target.value ? Number(e.target.value) : undefined,
                                      },
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </DialogBody>

        <DialogFooter>
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              setCerts([]);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="accent"
            type="button"
            disabled={processing || certs.length === 0}
            onClick={() => {
              onConfirm(certs);
              setCerts([]);
              onOpenChange(false);
            }}
          >
            Confirm review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
