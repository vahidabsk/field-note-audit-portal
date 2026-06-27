import { useEffect, useState } from "react";

export type ToastData = { id: string; title: string; description?: string; variant?: "default" | "destructive" };

export function toast(data: Omit<ToastData, "id">) {
  window.dispatchEvent(new CustomEvent("fap:toast", { detail: { ...data, id: crypto.randomUUID() } }));
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ToastData>).detail;
      setToasts((prev) => [...prev, detail]);
      window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== detail.id)), 4000);
    };
    window.addEventListener("fap:toast", handler);
    return () => window.removeEventListener("fap:toast", handler);
  }, []);
  return { toasts, dismiss: (id: string) => setToasts((prev) => prev.filter((x) => x.id !== id)) };
}
