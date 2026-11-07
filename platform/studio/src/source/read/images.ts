import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { sha256 } from "../files";
import { poppler } from "./pages";

/** Page images are rendered at this many pixels per point (144 dpi): a box's points are pixels ÷ 2. */
export const PAGE_SCALE = 2;

/** Renders a PDF's pages into `cache`; which pages' images changed since the last run. */
export function renderPages(
  file: string,
  cache: string,
  prefix: string,
): { images: string[]; changed: number[] } {
  mkdirSync(cache, { recursive: true });
  const manifestFile = join(cache, `${prefix}.json`);
  const before = existsSync(manifestFile)
    ? (JSON.parse(readFileSync(manifestFile, "utf8")) as { sha256: string; pages: string[] })
    : undefined;
  const sha = sha256(readFileSync(file));
  const count = Number(/Pages:\s+(\d+)/.exec(poppler("pdfinfo", [file]))?.[1] ?? 0);
  const name = (n: number) => join(cache, `${prefix}-${String(n).padStart(2, "0")}.png`);
  const images = Array.from({ length: count }, (_, i) => name(i + 1));
  if (before?.sha256 === sha && images.every((f) => existsSync(f))) return { images, changed: [] };
  for (const f of readdirSync(cache).filter((f) => f.startsWith(`${prefix}-`)))
    rmSync(join(cache, f));
  poppler("pdftoppm", ["-r", String(72 * PAGE_SCALE), "-png", file, join(cache, prefix)]);
  // pdftoppm pads the page number to the count's width: name them all the same way.
  for (const f of readdirSync(cache).filter((f) => new RegExp(`^${prefix}-\\d+\\.png$`).test(f))) {
    const n = Number(/-(\d+)\.png$/.exec(f)?.[1]);
    if (join(cache, f) === name(n)) continue;
    copyFileSync(join(cache, f), name(n));
    rmSync(join(cache, f));
  }
  const hashes = images.map((f) => sha256(readFileSync(f)));
  const changed = hashes.flatMap((h, i) => (before?.pages[i] === h ? [] : [i + 1]));
  writeFileSync(manifestFile, JSON.stringify({ sha256: sha, pages: hashes }, null, 2));
  return { images, changed };
}
