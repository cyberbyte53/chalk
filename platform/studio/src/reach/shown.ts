import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

/**
 * What a board showed, in every version: each version's screen (its picture at double resolution,
 * where each piece is) and what it read (each piece's state, its problems), as `show` drew it
 * without steps. This is the old side of a review: what a reviewer last saw of each board, kept as
 * the reviewer drew it, whether or not the lesson is passed then (passing only records that it is
 * approved). A review can't change a board, so what it saw of a board is the board at its end.
 * The new side is the board as built now: asked of the drawing engine when `changes` runs (its
 * cache, draw-cache.ts, answers when nothing it is made from changed), never kept here.
 *
 * Its plays are kept beside it: each `show` with steps a reviewer made on it, and what
 * each step answered. `changes` plays them again on a board whose make-up changed and says which
 * step now answers differently, or that it can't be done now: what the board does, on the paths
 * someone reviewed.
 */

export type ShownVersion = {
  /** "en · 360×640". */
  version: string;
  /** What it read: each piece's state, and its problems, as text. */
  read: string;
  /** Where each piece is, in CSS pixels; the picture is at `scale` device pixels to one. */
  boxes: { name: string; x: number; y: number; w: number; h: number }[];
  scale: number;
};

export type Shown = {
  /** The inputs it was drawn from (content/inputs.ts), for reading only. */
  inputs: string;
  versions: (ShownVersion & { png: Buffer })[];
  /** Versions that couldn't be drawn, and why (a drawing now: none is kept with one). */
  failed?: { version: string; why: string }[];
};

/**
 * What a reviewer last saw of each board, kept beside the repo (.chalk-seen/, ignored), not in
 * node_modules: a reinstall doesn't wipe a review. One file per board's drawing and one for its
 * plays, each written whole, then moved into place.
 */
const dirOf = (root: string, board: string) => join(root, ".chalk-seen", board);
/** Where it was kept before: read once, moved over. */
const legacyDirOf = (root: string, board: string) =>
  join(root, "node_modules", ".cache", "chalk-shown", "seen", board);

function writeWhole(file: string, text: string): void {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, text);
  renameSync(tmp, file);
}

/** Keeps what a reviewer saw of a board, in every version: it replaces the last. */
export function keepShown(root: string, board: string, shown: Shown): void {
  const versions = shown.versions.map((v) => ({ ...v, png: v.png.toString("base64") }));
  writeWhole(join(dirOf(root, board), SHOWN), JSON.stringify({ inputs: shown.inputs, versions }));
}

/** What a reviewer last saw of a board, or undefined if no reviewer has shown it on this machine. */
export function shownOf(root: string, board: string): Shown | undefined {
  const file = join(dirOf(root, board), SHOWN);
  if (existsSync(file)) {
    const kept = JSON.parse(readFileSync(file, "utf8")) as {
      inputs: string;
      versions: (ShownVersion & { png: string })[];
    };
    return {
      inputs: kept.inputs,
      versions: kept.versions.map((v) => ({ ...v, png: Buffer.from(v.png, "base64") })),
    };
  }
  // Kept the old way (a picture per file): read, and moved over.
  const legacy = legacyDirOf(root, board);
  const meta = join(legacy, SHOWN);
  if (!existsSync(meta)) return undefined;
  const was = JSON.parse(readFileSync(meta, "utf8")) as {
    inputs: string;
    versions: ShownVersion[];
  };
  const shown: Shown = {
    inputs: was.inputs,
    versions: was.versions.map((v, i) => ({ ...v, png: readFileSync(join(legacy, `${i}.png`)) })),
  };
  keepShown(root, board, shown);
  return shown;
}

/** A play: the steps as asked (one version), and what each step answered, from these inputs. */
export type Played = {
  steps: readonly unknown[];
  locale?: string;
  screen?: { width: number; height?: number };
  /** Each step's lines, as `show` answered them (its header and pictures left out). */
  answer: string;
  /**
   * What the play drew (look.ts's PlayDrawn: each step's result, the board at its end), without its
   * pictures: its lines are written from it by today's words, as the play now is, so a change in
   * how a step is worded is never a change in what it does. Older plays have only `answer`.
   */
  drawn?: unknown;
  inputs: string;
};

const SHOWN = "shown.json";
const PLAYS = "plays.json";
/** The same play: the same steps, on the same version. */
export const sameCall = (a: Played, b: Played) =>
  JSON.stringify([a.steps, a.locale, a.screen]) === JSON.stringify([b.steps, b.locale, b.screen]);

/** Keeps a reviewer's play of a board: the same steps again replace the last. */
export function keepPlayed(root: string, board: string, played: Played): void {
  const plays = playsOf(root, board).filter((p) => !sameCall(p, played));
  writeWhole(join(dirOf(root, board), PLAYS), JSON.stringify([...plays, played]));
}

/** A board's plays, as given (a pass letting go of those that can't be done now). */
export function keepPlays(root: string, board: string, plays: readonly Played[]): void {
  writeWhole(join(dirOf(root, board), PLAYS), JSON.stringify(plays));
}

/** The plays a reviewer last made on a board. */
export function playsOf(root: string, board: string): Played[] {
  const file = join(dirOf(root, board), PLAYS);
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8")) as Played[];
  const legacy = join(legacyDirOf(root, board), PLAYS);
  if (!existsSync(legacy)) return [];
  const plays = JSON.parse(readFileSync(legacy, "utf8")) as Played[];
  writeWhole(file, JSON.stringify(plays));
  return plays;
}

/** A play's answer as kept and compared: each step's lines, without its header or pictures. */
export function playAnswer(text: string): string {
  return text
    .split("\n")
    .slice(1)
    .filter((l) => !/^pictures?:/.test(l))
    .join("\n");
}

/**
 * The first step that answers differently now: the step, and only what differs in it (what it
 * set off and changed, what was said), as then and now; undefined when every step answers the same.
 */
export function playDiff(was: string, now: string): string | undefined {
  const steps = (text: string) => {
    const out: string[] = [];
    for (const line of text.split("\n"))
      if (/^\d+\. /.test(line) || out.length === 0) out.push(line);
      else out[out.length - 1] += `\n${line}`;
    return out;
  };
  // A step's items: what follows its arrow, one by one, and each line under it.
  const items = (step: string | undefined) => {
    if (step === undefined) return [];
    const [first = "", ...under] = step.split("\n");
    const at = first.indexOf(" → ");
    return [
      ...(at === -1 ? [first] : first.slice(at + 3).split(" · ")),
      ...under.map((l) => l.trim()),
    ];
  };
  const [a, b] = [steps(was), steps(now)];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] === b[i]) continue;
    const head = (b[i] ?? a[i] ?? "").split("\n")[0] ?? "";
    const step = head.includes(" → ") ? head.slice(0, head.indexOf(" → ")) : head;
    const [then, nowItems] = [items(a[i]), items(b[i])];
    const gone = then.filter((x) => !nowItems.includes(x));
    const added = nowItems.filter((x) => !then.includes(x));
    return [
      a[i] === undefined
        ? `${step}: not done then`
        : b[i] === undefined
          ? `${step}: not done now`
          : step,
      ...gone.map((x) => `then: ${x}`),
      ...added.map((x) => `now: ${x}`),
    ].join("\n");
  }
  return undefined;
}

/** How one version differs from what it showed when passed. */
export type VersionDiff = {
  version: string;
  /** Drawn on one side only: not seen in the review, or not drawn now (why, if it failed). */
  missing?: { side: "then" | "now"; why?: string };
  /** The pieces whose state or problems read differently. */
  read: string[];
  /**
   * Fields a prop has gained since, read only now, each at whatever it is (piece.path): a prop's
   * new field is in every board's state, so it is said apart from what reads differently.
   */
  newFields?: string[];
  /** The share of its pixels that differ, 0 to 1, and the pieces they fall in. */
  share: number;
  pieces: string[];
  /** As passed, and now with each differing pixel marked red: two pictures, with their pieces. */
  pictures?: {
    passed: Buffer;
    now: Buffer;
    width: number;
    passedBoxes: ShownVersion["boxes"];
    boxes: ShownVersion["boxes"];
  };
};

/** Each piece's line in a version's read text: "town: …". */
const linesOf = (read: string) =>
  new Map(
    read
      .split("\n")
      .filter((l) => l !== "")
      .map((l) => [l.slice(0, l.indexOf(":")), l] as const),
  );

/** A piece's state as read: the JSON after "piece: ", or undefined. */
function stateOf(line: string | undefined): unknown {
  if (line === undefined) return undefined;
  try {
    return JSON.parse(line.slice(line.indexOf(":") + 1));
  } catch {
    return undefined;
  }
}

/**
 * The fields `now` has that `then` didn't, when that is all that differs (each by its path,
 * "setup.plane.shift"); undefined when anything that was there reads differently.
 */
function onlyAdded(then: unknown, now: unknown, at = ""): string[] | undefined {
  const isObject = (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === "object" && !Array.isArray(v);
  if (!isObject(then) || !isObject(now))
    return JSON.stringify(then) === JSON.stringify(now) ? [] : undefined;
  const out: string[] = [];
  for (const k of Object.keys(then)) {
    if (!(k in now)) return undefined;
    const inner = onlyAdded(then[k], now[k], `${at}${k}.`);
    if (inner === undefined) return undefined;
    out.push(...inner);
  }
  for (const k of Object.keys(now)) if (!(k in then)) out.push(`${at}${k}`);
  return out;
}

/** The versions of a board now that differ from what it showed when passed. */
export function shownDiffs(passed: Shown, now: Shown): VersionDiff[] {
  const out: VersionDiff[] = [];
  // A version on one side only is a difference, never "the same".
  const side = (version: string, missing: "then" | "now", why?: string): VersionDiff => ({
    version,
    missing: { side: missing, ...(why === undefined ? {} : { why }) },
    read: [],
    share: 0,
    pieces: [],
  });
  for (const v of passed.versions)
    if (!now.versions.some((n) => n.version === v.version))
      out.push(side(v.version, "now", now.failed?.find((f) => f.version === v.version)?.why));
  for (const v of now.versions) {
    const was = passed.versions.find((p) => p.version === v.version);
    if (was === undefined) {
      out.push(side(v.version, "then"));
      continue;
    }
    const [a, b] = [linesOf(was.read), linesOf(v.read)];
    const differing = [...new Set([...a.keys(), ...b.keys()])].filter((k) => a.get(k) !== b.get(k));
    // A piece whose state differs only by fields it didn't have then: those are new fields, not a
    // change in what it reads.
    const newFields: string[] = [];
    const read = differing.filter((k) => {
      // A piece there on one side only, or a state that isn't fields, reads differently.
      const [then, now] = [stateOf(a.get(k)), stateOf(b.get(k))];
      if (then === undefined || now === undefined) return true;
      const added = onlyAdded(then, now);
      if (added === undefined) return true;
      newFields.push(...added.map((f) => `${k}.${f}`));
      return false;
    });
    // The same bytes are the same picture: nothing to compare pixel by pixel.
    const picture = was.png.equals(v.png)
      ? undefined
      : comparePngs(was.png, v.png, v.boxes, v.scale);
    if (read.length === 0 && picture === undefined) continue;
    out.push({
      version: v.version,
      read,
      ...(newFields.length === 0 ? {} : { newFields }),
      share: picture?.share ?? 0,
      pieces: picture?.pieces ?? [],
      pictures: {
        passed: was.png,
        now: picture?.marked ?? v.png,
        width: Math.round(PNG.sync.read(v.png).width / v.scale),
        passedBoxes: was.boxes,
        boxes: v.boxes,
      },
    });
  }
  return out;
}

/** Two drawings of a board compared pixel by pixel (pixelmatch tells changes from anti-aliasing). */
function comparePngs(
  passed: Buffer,
  now: Buffer,
  boxes: ShownVersion["boxes"],
  scale: number,
): { share: number; pieces: string[]; marked: Buffer } | undefined {
  const a = PNG.sync.read(passed);
  const b = PNG.sync.read(now);
  const width = Math.max(a.width, b.width);
  const height = Math.max(a.height, b.height);
  const at = (p: PNG) => {
    const out = new Uint8Array(width * height * 4).fill(255);
    for (let y = 0; y < p.height; y++)
      out.set(p.data.subarray(y * p.width * 4, (y + 1) * p.width * 4), y * width * 4);
    return out;
  };
  const [before, after] = [at(a), at(b)];
  const marks = new Uint8Array(width * height * 4);
  const differ = pixelmatch(before, after, marks, width, height, {
    threshold: 0.1,
    diffMask: true,
  });
  if (differ === 0 && a.width === b.width && a.height === b.height) return undefined;
  const hit = new Set<string>();
  const marked = new PNG({ width, height });
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const isMarked = (marks[i + 3] as number) > 0;
      for (let c = 0; c < 3; c++) {
        const v = after[i + c] as number;
        marked.data[i + c] = isMarked ? (c === 0 ? 255 : Math.round(v * 0.35)) : v;
      }
      marked.data[i + 3] = 255;
      if (!isMarked) continue;
      for (const box of boxes)
        if (
          x >= box.x * scale &&
          x < (box.x + box.w) * scale &&
          y >= box.y * scale &&
          y < (box.y + box.h) * scale
        )
          hit.add(box.name);
    }
  return {
    share: differ / (width * height),
    pieces: [...new Set(boxes.filter((box) => hit.has(box.name)).map((box) => box.name))],
    marked: PNG.sync.write(marked),
  };
}
