import { uid } from "./utils";

export const photoKey = (id: string) => `fap.photos.${id}`;

export async function downscaleAndStorePhoto(file: File): Promise<string> {
  const imgUrl = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = imgUrl;
  });

  const max = 1600;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
  URL.revokeObjectURL(imgUrl);
  const id = uid("photo");
  localStorage.setItem(photoKey(id), dataUrl);
  return id;
}

export function getPhoto(id: string) {
  return localStorage.getItem(photoKey(id));
}

export function removePhoto(id: string) {
  localStorage.removeItem(photoKey(id));
}
