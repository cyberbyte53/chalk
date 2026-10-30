import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { TtsProvider } from "./provider";
import { Worker } from "./python-worker";

const WORKER_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../voice-piper");
const SETUP = "Set up Piper first: see studio/voice-piper/README.md";

function pythonPath(): string {
  return process.env.CHALK_PIPER_PYTHON ?? join(WORKER_DIR, ".venv", "bin", "python");
}

let worker: Worker | undefined;

/**
 * Piper (rhasspy, MIT), on this machine: small neural voices that speak many times faster than real
 * time on a laptop's CPU. Each "voice" in voices.json is a voice file's name in voice-piper/voices/
 * ("hi_IN-priyamvada-medium").
 */
export const piperProvider: TtsProvider = {
  id: "piper",
  extension: "m4a",
  missingVoices: async (voices) => {
    if (!existsSync(pythonPath())) throw new Error(`${SETUP} (no Python at ${pythonPath()})`);
    return voices.filter((v) => !existsSync(join(WORKER_DIR, "voices", `${v}.onnx`)));
  },
  synthesize: async (text, voice, outFile) => {
    worker ??= new Worker(pythonPath(), join(WORKER_DIR, "worker.py"), "Piper");
    await worker.speak({ text, voice, out: outFile });
  },
  close: async () => {
    worker?.close();
    worker = undefined;
  },
};
