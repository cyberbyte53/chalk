import { macosProvider } from "./macos";
import { parlerProvider } from "./parler";
import type { TtsProvider } from "./provider";
import { toneProvider } from "./tone";

export { generateAudio, type GenerateResult, type Voices, voicesSchema } from "./generate";
export { parseSayVoices } from "./macos";
export { parlerProvider } from "./parler";
export type { TtsProvider } from "./provider";
export { toneWav } from "./tone";

/** Every provider, by the name used with `--voice`. Adding a cloud voice = one file + one line here. */
export const providers: Readonly<Record<string, TtsProvider>> = {
  [macosProvider.id]: macosProvider,
  [parlerProvider.id]: parlerProvider,
  [toneProvider.id]: toneProvider,
};
