import { Camera, Trash2 } from "lucide-react";
import { downscaleAndStorePhoto, getPhoto, removePhoto } from "../lib/photo-store";
import { Button } from "./ui/button";

export function PhotoCapture({ photoIds, onChange, required = false }: { photoIds: string[]; onChange: (photoIds: string[]) => void; required?: boolean }) {
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const next = [...photoIds];
    for (const file of Array.from(fileList)) {
      const id = await downscaleAndStorePhoto(file);
      next.push(id);
    }
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50">
        <Camera className="h-4 w-4" />
        {required ? "Capture required photo" : "Add photo"}
        <input className="hidden" type="file" accept="image/*" capture="environment" multiple onChange={(e) => handleFiles(e.target.files)} />
      </label>
      {required && photoIds.length === 0 ? <div className="text-xs text-red-600">At least one photo is required for this row.</div> : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {photoIds.map((id) => {
          const src = getPhoto(id);
          if (!src) return null;
          return (
            <div key={id} className="relative overflow-hidden rounded-lg border bg-slate-50">
              <img src={src} alt="Attachment" className="h-28 w-full object-cover" />
              <Button type="button" size="icon" variant="destructive" className="absolute right-2 top-2 h-8 w-8" onClick={() => { removePhoto(id); onChange(photoIds.filter((p) => p !== id)); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
