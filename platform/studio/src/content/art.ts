import { ART_SIZE, ArtFrame, type BuiltArt, MAX_ART_BYTES } from "@chalk/content";
import type { VNode } from "preact";
import { renderToString } from "preact-render-to-string";

/** Elements art may contain: what @chalk/draw's pieces and a stage write, and plain SVG shapes. */
const ALLOWED_TAGS = new Set([
  "div",
  "svg",
  "g",
  "line",
  "path",
  "circle",
  "ellipse",
  "rect",
  "polygon",
  "polyline",
  "text",
  "tspan",
]);

/** A colour the content gave a piece (`--shape-color:#…`) is allowed; any other raw colour isn't. */
const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b/g;

/** What's wrong with art's markup; empty when it can be inlined in the app as it is. */
export function artProblems(svg: string): string[] {
  const problems: string[] = [];
  if (svg.length > MAX_ART_BYTES)
    problems.push(`is ${svg.length} bytes; art stays under ${MAX_ART_BYTES}`);
  if (!svg.includes("viewBox=")) problems.push("has no viewBox: draw it on a <Stage>");
  for (const [, tag] of svg.matchAll(/<([a-zA-Z][\w-]*)/g)) {
    if (tag !== undefined && !ALLOWED_TAGS.has(tag))
      problems.push(`uses <${tag}>, which art may not`);
  }
  if (/\son\w+=/i.test(svg)) problems.push("has an event handler");
  if (/\s(?:xlink:)?href=|\ssrc=/i.test(svg)) problems.push("links to something outside itself");
  for (const match of svg.matchAll(RAW_COLOR)) {
    const before = svg.slice(Math.max(0, (match.index ?? 0) - 14), match.index);
    if (!before.endsWith("--shape-color:"))
      problems.push(
        `has a raw colour ${match[0]}: use a look role (Color.Primary) or give it to a piece`,
      );
  }
  return [...new Set(problems)];
}

type ArtModule = { frame: unknown; draw: unknown };

function isArt(value: unknown): value is ArtModule & {
  frame: ArtFrame;
  draw: (size: { width: number; height: number }) => VNode;
} {
  if (typeof value !== "object" || value === null) return false;
  const art = value as ArtModule;
  return typeof art.draw === "function" && Object.values(ArtFrame).includes(art.frame as ArtFrame);
}

/**
 * Renders the `art` an art.tsx exports to SVG markup and checks it. Returns the art, or the
 * problems that keep it out of the build.
 */
export function renderArt(exported: unknown): { art: BuiltArt } | { problems: string[] } {
  if (!isArt(exported))
    return { problems: ["must export `art`, made with defineArt(ArtFrame.…, (size) => …)"] };
  let svg: string;
  try {
    svg = renderToString(exported.draw(ART_SIZE[exported.frame]));
  } catch (error) {
    return {
      problems: [`failed to draw: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
  const problems = artProblems(svg);
  return problems.length > 0 ? { problems } : { art: { frame: exported.frame, svg } };
}

/** The stylesheets art is drawn with, from the repo root: the look's tokens and the pieces'. */
export const ARTS_CSS = [
  "platform/packages/look/src/tokens.gen.css",
  "platform/packages/draw/src/styles.css",
];

type GalleryItem = { path: string; title: string; art: BuiltArt };

/** Every built book, chapter and concept that has art, from the build's files. */
export function collectArt(files: ReadonlyMap<string, unknown>): GalleryItem[] {
  const items: GalleryItem[] = [];
  for (const [path, json] of files) {
    if (typeof json !== "object" || json === null) continue;
    const item = json as { art?: BuiltArt | null; title?: { en?: string } };
    if (item.art !== undefined && item.art !== null)
      items.push({ path, title: item.title?.en ?? path, art: item.art });
  }
  return items.sort((a, b) => a.path.localeCompare(b.path));
}

const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** One page with every piece of art on its card, as the app will show it, to review by eye. */
export function artGallery(items: readonly GalleryItem[], css: string): string {
  const cards = items
    .map(
      (item) => `<figure class="card is-${item.art.frame}">
  <div class="art">${item.art.svg}</div>
  <figcaption><b>${escapeHtml(item.title)}</b><span>${escapeHtml(item.path)} · ${item.art.frame}</span></figcaption>
</figure>`,
    )
    .join("\n");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Chalk art</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap">
<style>
${css}
body { margin: 0; padding: 24px; background: var(--color-surface); color: var(--color-on-surface); font-family: var(--font-body); }
h1 { font-family: var(--font-display); font-weight: 800; margin: 0 0 18px; }
.grid { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
.card { margin: 0; display: flex; flex-direction: column; gap: 8px; }
.card.is-card .art { width: 320px; }
.card.is-tile .art { width: 160px; }
.art { background: var(--color-surface-container); border-radius: var(--shape-radius-l); box-shadow: 0 var(--shape-press) 0 var(--color-surface-press); padding: 0; overflow: hidden; }
figcaption { display: flex; flex-direction: column; font-size: 13px; color: var(--color-on-surface-variant); }
figcaption b { font-size: 16px; color: var(--color-on-surface); }
</style></head>
<body><h1>Art (${items.length})</h1><div class="grid">
${cards}
</div></body></html>
`;
}
