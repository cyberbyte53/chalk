import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

/**
 * What a board looked like when it was passed, next to what it looks like now. A change can pass
 * every check and still look wrong (a gap gone, buttons off their row): the pictures show it.
 *
 * The board as reviewed is drawn whole (every piece, nothing earned hidden) on one screen, a phone
 * in English, and kept on this machine only (node_modules/.cache/chalk-pictures), as what ran in
 * the review is (ran.ts). `changes` draws a changed board the same way and compares the two pixel
 * by pixel (pixelmatch, which tells real changes from anti-aliasing), naming the pieces where they
 * differ. A board passed elsewhere has no picture here: that is said, not guessed.
 */

/** The screen the review's picture is drawn on. */
export const REVIEW_SCREEN = { locale: "en", width: 390 } as const;

const fileOf = (root: string, board: string) =>
  join(root, "node_modules", ".cache", "chalk-pictures", "passed", `${board}.png`);

/** Keeps a board's picture as it was passed. */
export function keepPassedPicture(root: string, board: string, png: Buffer): void {
  const file = fileOf(root, board);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, png);
}

/** Drops a board's kept picture (passed again with no picture: an old one would mislead). */
export function dropPassedPicture(root: string, board: string): void {
  rmSync(fileOf(root, board), { force: true });
}

/** A board's picture as it was passed, or undefined if this machine didn't keep one. */
export function passedPicture(root: string, board: string): Buffer | undefined {
  const file = fileOf(root, board);
  return existsSync(file) ? readFileSync(file) : undefined;
}

/** Where a piece is on a picture, in CSS pixels. */
export type PieceBox = { name: string; x: number; y: number; w: number; h: number };

export type PictureDiff =
  | { isSame: true }
  | {
      isSame: false;
      /** The share of the picture's pixels that differ, 0 to 1. */
      share: number;
      /** The pieces now drawn where pixels differ (or the picture's size changed), in order down it. */
      pieces: string[];
      /** As passed | now, each pixel that differs marked on the one now. */
      image: Buffer;
    };

/** The two at one size: the larger of each, the rest of either filled white. */
function onCanvas(png: PNG, width: number, height: number): Uint8Array {
  const out = new Uint8Array(width * height * 4).fill(255);
  for (let y = 0; y < png.height; y++)
    out.set(png.data.subarray(y * png.width * 4, (y + 1) * png.width * 4), y * width * 4);
  return out;
}

/**
 * The board as passed against the board now. `boxes`: where each piece is drawn now (CSS pixels;
 * the pictures are at `scale` device pixels to one).
 */
export function comparePictures(
  passed: Buffer,
  now: Buffer,
  boxes: readonly PieceBox[],
  scale: number,
): PictureDiff {
  const a = PNG.sync.read(passed);
  const b = PNG.sync.read(now);
  const width = Math.max(a.width, b.width);
  const height = Math.max(a.height, b.height);
  const before = onCanvas(a, width, height);
  const after = onCanvas(b, width, height);
  const marks = new Uint8Array(width * height * 4);
  // Marks only (diffMask): every pixel that differs, red, on a clear canvas.
  const differ = pixelmatch(before, after, marks, width, height, {
    threshold: 0.1,
    diffMask: true,
  });
  if (differ === 0 && a.width === b.width && a.height === b.height) return { isSame: true };

  // Which pieces the differing pixels fall in, by the rows and columns they cover now.
  const hit = new Set<string>();
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      if (marks[(y * width + x) * 4 + 3] === 0) continue;
      for (const box of boxes)
        if (
          x >= box.x * scale &&
          x < (box.x + box.w) * scale &&
          y >= box.y * scale &&
          y < (box.y + box.h) * scale
        )
          hit.add(box.name);
    }
  const pieces = boxes.filter((box) => hit.has(box.name)).map((box) => box.name);

  // As passed | now, with a gap between; on the one now, each differing pixel tinted red.
  const gap = 24;
  const out = new PNG({ width: width * 2 + gap, height });
  out.data.fill(255);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const left = (y * out.width + x) * 4;
      const right = (y * out.width + width + gap + x) * 4;
      for (let c = 0; c < 4; c++) out.data[left + c] = before[i + c] as number;
      const isMarked = (marks[i + 3] as number) > 0;
      for (let c = 0; c < 3; c++) {
        const v = after[i + c] as number;
        out.data[right + c] = isMarked ? (c === 0 ? 255 : Math.round(v * 0.35)) : v;
      }
      out.data[right + 3] = 255;
    }
  return {
    isSame: false,
    share: differ / (width * height),
    pieces,
    image: PNG.sync.write(out),
  };
}
