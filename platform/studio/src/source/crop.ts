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

/**
 * NCERT's watermark ("© NCERT not to be republished") is a light grey across the page: light,
 * colourless pixels are made white. A figure's own light greys go with it (none in the books so far).
 */
export function maskWatermark(png: PNG): void {
  const d = png.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] ?? 0;
    const g = d[i + 1] ?? 0;
    const b = d[i + 2] ?? 0;
    if (Math.min(r, g, b) >= 205 && Math.max(r, g, b) - Math.min(r, g, b) <= 8) {
      d[i] = 255;
      d[i + 1] = 255;
      d[i + 2] = 255;
    }
  }
}

/**
 * Crops a box from a PDF's page to a PNG: the watermark masked, and the words of other blocks that
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
    maskWatermark(png);
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
