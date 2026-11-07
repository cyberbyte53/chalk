import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PNG } from "pngjs";
import type { Crop } from "./build";
import { sha256 } from "./files";
import { type Word, poppler } from "./read";
import type { Box } from "./schema";

/** A cropped figure's pixels per point (216 dpi). */
export const CROP_SCALE = 3;

/** A pixel clearly drawn: dark in some channel, or coloured (not a photo's near-white noise). */
const isInk = (d: Buffer, i: number): boolean => {
  const r = d[i] ?? 0;
  const g = d[i + 1] ?? 0;
  const b = d[i + 2] ?? 0;
  return Math.min(r, g, b) < 190 || Math.max(r, g, b) - Math.min(r, g, b) > 40;
};

/**
 * Whether a part of a page (points) shows anything on its image (`scale` pixels a point): a few
 * pixels clearly drawn, apart from those under the words of other blocks (`blank`: a neighbouring
 * paragraph reaching into a photo's white margin). What `snap` asks of an object's part outside a
 * rough box.
 */
export const showsOn =
  (png: PNG, scale: number, blank: readonly Word[] = []) =>
  ([x0, y0, x1, y1]: Box): boolean => {
    let ink = 0;
    // A line's box has no width: the pixel or two it is drawn on.
    const span = (a: number, z: number, most: number): [number, number] => {
      const [from, to] = [Math.round(a * scale), Math.round(z * scale)];
      return to - from < 2
        ? [Math.max(0, from - 1), Math.min(most, to + 1)]
        : [Math.max(0, from), Math.min(most, to)];
    };
    const [l, r] = span(x0, x1, png.width);
    const [t, b] = span(y0, y1, png.height);
    const near = blank.filter(
      (w) => w.x1 + 1 >= x0 && w.x0 - 1 <= x1 && w.y1 + 1 >= y0 && w.y0 - 1 <= y1,
    );
    const under = (x: number, y: number) =>
      near.some(
        (w) =>
          x >= (w.x0 - 1) * scale &&
          x <= (w.x1 + 1) * scale &&
          y >= (w.y0 - 1) * scale &&
          y <= (w.y1 + 1) * scale,
      );
    for (let y = t; y < b; y += 1)
      for (let x = l; x < r; x += 1)
        if (isInk(png.data, (y * png.width + x) * 4) && !under(x, y)) ink += 1;
    return ink >= 2;
  };

/**
 * Crops a box from a PDF's page to a PNG, as printed (a faint watermark stays: whitening it also
 * whitened figures' own light greys): the words of other blocks that
 * the box takes in (`blank`) made white, so the picture is the figure alone.
 */
export function cropFigure(
  pdf: string,
  page: number,
  box: Box,
  blank: readonly Word[],
  out: string,
): void {
  const dir = mkdtempSync(join(tmpdir(), "chalk-crop-"));
  try {
    const [x0, y0, x1, y1] = box.map((v) => Math.round(v * CROP_SCALE)) as Box;
    const base = join(dir, "crop");
    poppler("pdftoppm", [
      ...["-r", String(72 * CROP_SCALE), "-f", String(page), "-l", String(page)],
      ...["-x", String(x0), "-y", String(y0), "-W", String(x1 - x0), "-H", String(y1 - y0)],
      ...["-png", "-singlefile", pdf, base],
    ]);
    const png = PNG.sync.read(readFileSync(`${base}.png`));
    for (const w of blank) {
      const [l, t, r, b] = [
        w.x0 - 1 - box[0],
        w.y0 - 1 - box[1],
        w.x1 + 1 - box[0],
        w.y1 + 1 - box[1],
      ].map((v) => Math.round(v * CROP_SCALE)) as Box;
      for (let y = Math.max(0, t); y < Math.min(png.height, b); y += 1)
        png.data.fill(
          255,
          (y * png.width + Math.max(0, l)) * 4,
          (y * png.width + Math.min(png.width, r)) * 4,
        );
    }
    writeFileSync(out, PNG.sync.write(png));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Crops each figure and table into `figures/<id>.png`, those whose PDF, page, box or blanked words
 * changed since the last run, and drops the pictures of items gone; the files it made, to look at.
 */
export function cropFigures(
  pdf: string,
  crops: readonly Crop[],
  figures: string,
  cache: string,
): string[] {
  mkdirSync(figures, { recursive: true });
  mkdirSync(cache, { recursive: true });
  const stateFile = join(cache, "crops.json");
  const before = existsSync(stateFile)
    ? (JSON.parse(readFileSync(stateFile, "utf8")) as Record<string, string>)
    : {};
  const sha = sha256(readFileSync(pdf));
  const after: Record<string, string> = {};
  const made: string[] = [];
  for (const c of crops) {
    const out = join(figures, `${c.id}.png`);
    const key = JSON.stringify({ sha, page: c.page, box: c.box, blank: c.blank });
    after[c.id] = key;
    if (before[c.id] === key && existsSync(out)) continue;
    cropFigure(pdf, c.page, c.box, c.blank, out);
    made.push(out);
  }
  for (const f of readdirSync(figures))
    if (!(f.replace(/\.png$/, "") in after)) rmSync(join(figures, f));
  writeFileSync(stateFile, JSON.stringify(after, null, 2));
  return made;
}
