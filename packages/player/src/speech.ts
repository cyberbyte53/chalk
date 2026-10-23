import type { Locale } from "@chalk/content";
import { useEffect, useRef, useState } from "preact/hooks";

/** The browser's speech recognition, as much of it as we use (not in TypeScript's DOM types). */
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionClass = new () => Recognition;

function recognitionClass(): RecognitionClass | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionClass;
    webkitSpeechRecognition?: RecognitionClass;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const LANG: Record<Locale, string> = { en: "en-IN", hi: "hi-IN" };

export type Speech = {
  /** The browser can listen (Chrome on Android, Safari, Edge). */
  isAvailable: boolean;
  isListening: boolean;
  start: () => void;
  stop: () => void;
};

/** Speaking instead of typing: what is heard is handed to `onHeard` once they stop. */
export function useSpeech(locale: Locale, onHeard: (text: string) => void): Speech {
  const Class = recognitionClass();
  const [isListening, setIsListening] = useState(false);
  const current = useRef<Recognition | undefined>(undefined);
  const heard = useRef(onHeard);
  heard.current = onHeard;

  useEffect(() => () => current.current?.abort(), []);

  const start = () => {
    if (Class === undefined || current.current !== undefined) return;
    const recognition = new Class();
    recognition.lang = LANG[locale];
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (text !== "") heard.current(text);
    };
    recognition.onerror = (event) => console.warn("Speech:", event.error);
    recognition.onend = () => {
      current.current = undefined;
      setIsListening(false);
    };
    current.current = recognition;
    setIsListening(true);
    try {
      recognition.start();
    } catch (error) {
      console.warn("Speech:", error);
      current.current = undefined;
      setIsListening(false);
    }
  };

  return {
    isAvailable: Class !== undefined,
    isListening,
    start,
    stop: () => current.current?.stop(),
  };
}

/** Says the line aloud in the locale's voice; resolves when it ends (at once if it can't speak). */
export function speak(text: string, locale: Locale): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve();
  return new Promise((resolve) => {
    const line = new SpeechSynthesisUtterance(text.replace(/\*\*?|__?/g, ""));
    line.lang = LANG[locale];
    line.rate = 0.95;
    line.onend = () => resolve();
    line.onerror = () => resolve();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(line);
  });
}

/** Stops anything being said. */
export function hush(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

/** Whether the browser can speak at all. */
export const canSpeak = (): boolean => typeof window !== "undefined" && "speechSynthesis" in window;
