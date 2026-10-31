import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { createInterface } from "node:readline";

/**
 * A Python process that loads a voice model once and speaks line after line: one JSON request a
 * line on stdin, one JSON reply a line on stdout (`{"ready": true}` first, then `{"ok": true}` or
 * `{"ok": false, "error"}` per request). Piper runs one.
 */

type Reply = { ready?: boolean; device?: string; ok?: boolean; error?: string };

/** One Python process that loads the model once and speaks line after line. */
export class Worker {
  private readonly child: ChildProcessWithoutNullStreams;
  private readonly replies: Reply[] = [];
  private waiting: ((reply: Reply) => void) | undefined;
  private stderr = "";
  readonly ready: Promise<Reply>;

  constructor(
    python: string,
    script: string,
    /** Its name in messages ("Piper"). */
    private readonly name: string,
  ) {
    this.child = spawn(python, [script], { stdio: "pipe" });
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
        error: `the ${this.name} worker stopped (exit ${code}). Last output:\n${this.stderr}`,
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

  /** Sends one request (it says `text`) and waits for its answer. */
  async speak(request: { text: string; out: string } & Record<string, string>): Promise<void> {
    const ready = await this.ready;
    if (ready.ready !== true)
      throw new Error(ready.error ?? `the ${this.name} worker didn't start`);
    this.child.stdin.write(`${JSON.stringify(request)}\n`);
    const reply = await this.next();
    if (reply.ok !== true)
      throw new Error(`${this.name} couldn't speak "${request.text}": ${reply.error}`);
  }

  close(): void {
    this.child.stdin.end();
  }
}
