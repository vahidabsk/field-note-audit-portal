import { useToast } from "../../hooks/use-toast";
import { Toast } from "./toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <Toast toast={item} onClose={() => dismiss(item.id)} />
        </div>
      ))}
    </div>
  );
}
