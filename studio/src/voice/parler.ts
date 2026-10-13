import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import type { TtsProvider } from "./provider";

const WORKER_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../voice-parler");
const SETUP = "Set up Indic Parler-TTS first: see studio/voice-parler/README.md";

function pythonPath(): string {
  return process.env.CHALK_PARLER_PYTHON ?? join(WORKER_DIR, ".venv", "bin", "python");
}

type Reply = { ready?: boolean; device?: string; ok?: boolean; error?: string };

/** One Python process that loads the model once and speaks line after line. */
class Worker {
  private readonly child: ChildProcessWithoutNullStreams;
  private readonly replies: Reply[] = [];
  private waiting: ((reply: Reply) => void) | undefined;
  private stderr = "";
  readonly ready: Promise<Reply>;

  constructor() {
    this.child = spawn(pythonPath(), [join(WORKER_DIR, "worker.py")], { stdio: "pipe" });
    this.child.stderr.on("data", (chunk: Buffer) => {
      this.stderr = (this.stderr + chunk.toString()).slice(-4000);
    });
    createInterface({ input: this.child.stdout }).on("line", (line) => {
      let reply: Reply;
      try {
        reply = JSON.parse(line) as Reply;
      } catch {
        return; // the libraries sometimes print plain text; only JSON lines are replies
      }
      const waiting = this.waiting;
      this.waiting = undefined;
      if (waiting === undefined) this.replies.push(reply);
      else waiting(reply);
    });
    this.child.on("exit", (code) => {
      const waiting = this.waiting;
      this.waiting = undefined;
      waiting?.({
        ok: false,
        error: `the Parler worker stopped (exit ${code}). Last output:\n${this.stderr}`,
      });
    });
    this.ready = this.next();
  }

  private next(): Promise<Reply> {
    const queued = this.replies.shift();
    if (queued !== undefined) return Promise.resolve(queued);
    return new Promise((resolve) => {
      this.waiting = resolve;
    });
  }

  async speak(text: string, description: string, out: string): Promise<void> {
    const ready = await this.ready;
    if (ready.ready !== true) throw new Error(ready.error ?? "the Parler worker didn't start");
    this.child.stdin.write(`${JSON.stringify({ text, description, out })}\n`);
    const reply = await this.next();
    if (reply.ok !== true) throw new Error(`Parler couldn't speak "${text}": ${reply.error}`);
  }

  close(): void {
    this.child.stdin.end();
  }
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
    worker ??= new Worker();
    await worker.speak(text, voice, outFile);
  },
  close: async () => {
    worker?.close();
    worker = undefined;
  },
};
