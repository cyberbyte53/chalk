/** A text-to-speech provider. Publish uses one to turn every spoken line into an audio file. */
export type TtsProvider = {
  /** Short name used in the guides' voices setting and on the command line. */
  id: string;
  /** File extension of the audio it makes. */
  extension: string;
  /** Voices it needs that aren't available on this machine (empty when all are). */
  missingVoices: (voices: readonly string[]) => Promise<string[]>;
  /** Speaks `text` in `voice` into `outFile`. */
  synthesize: (text: string, voice: string, outFile: string) => Promise<void>;
  /** Frees anything it started (e.g. a model process). Called once publish is done with it. */
  close?: () => Promise<void>;
};
