import { macosProvider } from "./providers/macos";
import { parlerProvider } from "./providers/parler";
import { piperProvider } from "./providers/piper";
import type { TtsProvider } from "./providers/provider";
import { toneProvider } from "./providers/tone";

export { type Cast, castSchema, type VoiceOf, voiceFor } from "./cast";
export { type GenerateResult, type Line, speakLines } from "./clips";
export {
  type BoardLines,
  type ChapterScript,
  type ScriptEntry,
  SOUND_LIST,
  voiceChapter,
} from "./make";
export { mathsReader } from "./maths";
export { type Said, said, unspeakable } from "./said";
export { parseSayVoices } from "./providers/macos";
export { parlerProvider } from "./providers/parler";
export { piperProvider } from "./providers/piper";
export type { TtsProvider } from "./providers/provider";
export { toneWav } from "./providers/tone";

/** Every provider, by the name a voice in the cast starts with ("piper:…"). A new one: a file in providers/ and a line here. */
export const providers: Readonly<Record<string, TtsProvider>> = {
  [macosProvider.id]: macosProvider,
  [parlerProvider.id]: parlerProvider,
  [piperProvider.id]: piperProvider,
  [toneProvider.id]: toneProvider,
};
