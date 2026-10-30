import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { TtsProvider } from "./provider";
import { Worker } from "./python-worker";

const WORKER_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../../voice-parler");
const SETUP = "Set up Indic Parler-TTS first: see studio/voice-parler/README.md";

function pythonPath(): string {
  return process.env.CHALK_PARLER_PYTHON ?? join(WORKER_DIR, ".venv", "bin", "python");
}

let worker: Worker | undefined;

/**
 * Indic Parler-TTS (AI4Bharat, Apache 2.0), self-hosted. Each "voice" in voices.json is a
 * description that names one of the model's speakers, e.g. "Divya speaks … Very clear audio."
 */
export const parlerProvider: TtsProvider = {
  id: "parler",
  extension: "wav",
  missingVoices: async () => {
    if (!existsSync(pythonPath())) throw new Error(`${SETUP} (no Python at ${pythonPath()})`);
    return []; // voices are descriptions, not installed voices
  },
  synthesize: async (text, voice, outFile) => {
    worker ??= new Worker(pythonPath(), join(WORKER_DIR, "worker.py"), "Parler");
    await worker.speak({ text, description: voice, out: outFile });
  },
  close: async () => {
    worker?.close();
    worker = undefined;
  },
};
