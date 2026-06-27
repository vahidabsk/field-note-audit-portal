import { useEffect, useMemo, useRef, useState } from "react";

type SpeechResult = { 0: { transcript: string } };
type SpeechResultListLike = ArrayLike<SpeechResult>;

type SimpleSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: SpeechResultListLike }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SimpleSpeechRecognition;
    SpeechRecognition?: new () => SimpleSpeechRecognition;
  }
}

export function useDictation(onAppend: (text: string) => void) {
  const RecognitionCtor = useMemo(() => window.SpeechRecognition || window.webkitSpeechRecognition, []);
  const [listening, setListening] = useState(false);
  const supported = !!RecognitionCtor;
  const recognition = useRef<SimpleSpeechRecognition | null>(null);

  useEffect(() => {
    if (!RecognitionCtor) return;
    const rec = new RecognitionCtor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (event) => {
      const transcript = Array.from(event.results).map((r) => r[0].transcript).join(" ");
      onAppend(transcript.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognition.current = rec;
    return () => rec.stop();
  }, [RecognitionCtor, onAppend]);

  return {
    supported,
    listening,
    start() {
      if (!recognition.current) return;
      setListening(true);
      recognition.current.start();
    },
    stop() {
      recognition.current?.stop();
      setListening(false);
    },
  };
}
