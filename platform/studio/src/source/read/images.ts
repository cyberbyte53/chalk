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
import { type PageText, poppler } from "./pages";

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

/** The book's page numbers: each page's running head's number, the missing ones from their neighbours. */
export function printedPages(pages: readonly PageText[]): number[] {
  const seen = pages.map((p) => {
    const n = p.head.find((w) => /^\d+$/.test(w.text));
    return n === undefined ? undefined : Number(n.text);
  });
  const known = seen.findIndex((n) => n !== undefined);
  return pages.map((_, i) => (known < 0 ? i + 1 : (seen[known] as number) - known + i));
}

/** The edition the pages print in their footers: the most common footer. */
export function editionOf(pages: readonly PageText[]): string {
  const counts = new Map<string, number>();
  for (const p of pages) {
    const foot = p.foot
      .map((w) => w.text)
      .join(" ")
      .trim();
    if (foot !== "") counts.set(foot, (counts.get(foot) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "unknown";
}
