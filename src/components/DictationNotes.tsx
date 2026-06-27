import { Mic, MicOff } from "lucide-react";
import { useCallback } from "react";
import { useDictation } from "../hooks/use-dictation";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

export function DictationNotes({ value, onChange, placeholder = "Enter notes" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  const append = useCallback((text: string) => {
    if (!text) return;
    onChange(`${value}${value && !value.endsWith(" ") ? " " : ""}${text}`.trim());
  }, [onChange, value]);
  const dictation = useDictation(append);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          size="sm"
          variant="outline"
          title={dictation.supported ? (dictation.listening ? "Stop voice dictation" : "Start voice dictation") : "Voice dictation not supported in this browser. Typing works as normal."}
          disabled={!dictation.supported}
          onClick={() => dictation.listening ? dictation.stop() : dictation.start()}
        >
          {dictation.listening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
          {dictation.supported ? (dictation.listening ? "Listening…" : "Dictate") : "Dictation unavailable"}
        </Button>
      </div>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
