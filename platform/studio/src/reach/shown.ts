import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

/**
 * What a board showed, in every version: each version's screen (its picture at double resolution,
 * where each piece is) and what it read (each piece's state, its problems), as `show` drew it
 * without steps. Kept on this machine only (node_modules/.cache/chalk-shown), as what ran is
 * (ran.ts): `open/` holds the last drawing of each board since it was passed, with the inputs it
 * was drawn from (every file a build or a board could read: content/inputs.ts), and passing moves
 * it to `passed/`. `changes` draws a board whose make-up changed again and holds it to what it
 * showed when passed: the same every time, since a board is drawn the same every time.
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
  /** The inputs it was drawn from (content/inputs.ts): a drawing of other inputs isn't this one. */
  inputs: string;
  versions: (ShownVersion & { png: Buffer })[];
};

type Kind = "open" | "passed";
const dirOf = (root: string, kind: Kind, board: string) =>
  join(root, "node_modules", ".cache", "chalk-shown", kind, board);

/** Keeps a board's drawing: the last since it was passed (open), or as passed. */
export function keepShown(root: string, kind: Kind, board: string, shown: Shown): void {
  const dir = dirOf(root, kind, board);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  shown.versions.forEach((v, i) => writeFileSync(join(dir, `${i}.png`), v.png));
  const meta = { inputs: shown.inputs, versions: shown.versions.map(({ png: _, ...v }) => v) };
  writeFileSync(join(dir, "shown.json"), JSON.stringify(meta));
}

/** A board's drawing, or undefined if this machine has none. */
export function shownOf(root: string, kind: Kind, board: string): Shown | undefined {
  const dir = dirOf(root, kind, board);
  const file = join(dir, "shown.json");
  if (!existsSync(file)) return undefined;
  const meta = JSON.parse(readFileSync(file, "utf8")) as {
    inputs: string;
    versions: ShownVersion[];
  };
  return {
    inputs: meta.inputs,
    versions: meta.versions.map((v, i) => ({ ...v, png: readFileSync(join(dir, `${i}.png`)) })),
  };
}

/** Passing a board: its last drawing becomes what it showed when passed. */
export function passShown(root: string, board: string): void {
  const open = dirOf(root, "open", board);
  const passed = dirOf(root, "passed", board);
  rmSync(passed, { recursive: true, force: true });
  if (!existsSync(open)) return;
  mkdirSync(dirname(passed), { recursive: true });
  renameSync(open, passed);
}

/** How one version differs from what it showed when passed. */
export type VersionDiff = {
  version: string;
  /** The pieces whose state or problems read differently. */
  read: string[];
  /** The share of its pixels that differ, 0 to 1, and the pieces they fall in. */
  share: number;
  pieces: string[];
  /** As passed, and now with each differing pixel marked red: two pictures, with their pieces. */
  pictures: {
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

/** The versions of a board now that differ from what it showed when passed. */
export function shownDiffs(passed: Shown, now: Shown): VersionDiff[] {
  const out: VersionDiff[] = [];
  for (const v of now.versions) {
    const was = passed.versions.find((p) => p.version === v.version);
    if (was === undefined) continue;
    const [a, b] = [linesOf(was.read), linesOf(v.read)];
    const read = [...new Set([...a.keys(), ...b.keys()])].filter((k) => a.get(k) !== b.get(k));
    const picture = comparePngs(was.png, v.png, v.boxes, v.scale);
    if (read.length === 0 && picture === undefined) continue;
    out.push({
      version: v.version,
      read,
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
