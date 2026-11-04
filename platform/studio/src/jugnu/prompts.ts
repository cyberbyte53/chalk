import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { root } from "./sees";

/**
 * Prompts are files, chosen by name (platform/docs/plans/jugnu-sandbox.md): a folder per seat,
 * each version one file (`platform/studio/prompts/<seat>/<name>.md`), never edited once a run has
 * used it (a changed prompt is a new file). What varies per run is a slot, `{believes}`. Which
 * version a seat uses is configuration (`<P>_PROMPT`, "baseline" by default). The code holds none.
 */

export const Seat = {
  Tutor: "tutor",
  Student: "student",
  Judge: "judge",
  /** Writes the teacher's note once a conversation ends. */
  Notes: "notes",
} as const;
export type Seat = (typeof Seat)[keyof typeof Seat];

/** A prompt as a run used it: which file, the hash of its words, and its text with slots filled. */
export type Prompt = { seat: Seat; name: string; hash: string; text: string };

const folder = (seat: Seat) => join(root, "platform/studio/prompts", seat);

/** A seat's prompt by name, its slots filled (every `{slot}` it has must be given). */
export function promptOf(seat: Seat, name: string, slots: Record<string, string> = {}): Prompt {
  const file = join(folder(seat), `${name}.md`);
  if (!existsSync(file)) throw new Error(`No ${seat} prompt "${name}" (${file})`);
  const words = readFileSync(file, "utf8").trimEnd();
  const text = words.replace(/\{([a-z]+)\}/g, (whole, slot: string) => {
    const value = slots[slot];
    if (value === undefined) throw new Error(`The ${seat} prompt "${name}" needs {${slot}}`);
    return value;
  });
  const hash = createHash("sha256").update(words).digest("hex").slice(0, 8);
  return { seat, name, hash, text };
}

/** Every version a seat has, by name. */
export function promptNames(seat: Seat): string[] {
  return existsSync(folder(seat))
    ? readdirSync(folder(seat))
        .filter((f) => f.endsWith(".md"))
        .map((f) => f.slice(0, -3))
        .sort()
    : [];
}

/** The committed Jugnu (`prompts/jugnu.yaml`): which model, which tutor prompt, which notes prompt. */
export function committedJugnu(): {
  provider: string;
  model: string;
  prompt: string;
  notes: string;
} {
  const text = readFileSync(join(root, "platform/studio/prompts/jugnu.yaml"), "utf8");
  const get = (key: string) => {
    const v = new RegExp(`^${key}:\\s*(.+)$`, "m").exec(text)?.[1]?.trim();
    if (v === undefined || v === "") throw new Error(`prompts/jugnu.yaml has no ${key}`);
    return v;
  };
  return {
    provider: get("provider"),
    model: get("model"),
    prompt: get("prompt"),
    notes: get("notes"),
  };
}
