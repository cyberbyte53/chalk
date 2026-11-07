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
import { type PageText, type Word, poppler } from "../read";
import { type Box, CROPPED, type Item } from "../schema";
import { place } from "./boxes";

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
 * Crops a box from a PDF's page to a PNG: the watermark masked, and the page's running text that the
 * box takes in (`blank`: words' boxes) made white, so the picture is the figure alone.
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
 * Crops each figure and table whose page image, box or picture changed into `figures/<id>.png`, and
 * drops the pictures of items gone; the files it made, for the model to look at.
 */
export function cropFigures(
  pdf: string,
  items: readonly Item[],
  pages: readonly PageText[],
  figures: string,
  cache: string,
  changed: readonly number[],
): string[] {
  mkdirSync(figures, { recursive: true });
  const stateFile = join(cache, "crops.json");
  const before = existsSync(stateFile)
    ? (JSON.parse(readFileSync(stateFile, "utf8")) as Record<string, string>)
    : {};
  const after: Record<string, string> = {};
  const made: string[] = [];
  for (const item of items) {
    const page = pages[item.page - 1];
    if (!CROPPED.includes(item.kind) || page === undefined) continue;
    const placed = place(item, page, items);
    if (placed === undefined) continue;
    const { box, running: blank } = placed;
    const out = join(figures, `${item.id}.png`);
    const key = JSON.stringify({ page: item.page, box, blank: blank.length });
    after[item.id] = key;
    if (before[item.id] === key && existsSync(out) && !changed.includes(item.page)) continue;
    cropFigure(pdf, item.page, box, blank, out);
    made.push(out);
  }
  for (const f of readdirSync(figures))
    if (!(f.replace(/\.png$/, "") in after)) rmSync(join(figures, f));
  writeFileSync(stateFile, JSON.stringify(after, null, 2));
  return made;
}
