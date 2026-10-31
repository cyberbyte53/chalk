import { writeFile } from "node:fs/promises";
import type { TtsProvider } from "./provider";

const SAMPLE_RATE = 8000;

/** A WAV file with a soft tone, as long as the line would take to say. */
export function toneWav(text: string, voice: string): Uint8Array {
  const seconds = Math.min(6, Math.max(0.6, text.length * 0.06));
  const samples = Math.round(seconds * SAMPLE_RATE);
  const pitch = 220 + ([...voice].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 220);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const ascii = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  ascii(0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, "data");
  view.setUint32(40, samples * 2, true);
  for (let i = 0; i < samples; i++) {
    const fade = Math.min(1, i / 400, (samples - i) / 400);
    view.setInt16(
      44 + i * 2,
      Math.round(Math.sin((2 * Math.PI * pitch * i) / SAMPLE_RATE) * 3000 * fade),
      true,
    );
  }
  return new Uint8Array(buffer);
}

/** A stand-in that makes a tone per line instead of speech: for tests and machines without real voices. */
export const toneProvider: TtsProvider = {
  id: "tone",
  extension: "wav",
  missingVoices: async () => [],
  synthesize: async (text, voice, outFile) => {
    await writeFile(outFile, toneWav(text, voice));
  },
};
