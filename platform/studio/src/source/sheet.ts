import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { expand } from "./build";
import type { DrawnObject } from "./objects";
import { type NumberedPage, type Word, boundsOf } from "./read";
import { type Box, ItemKind, type PageBlock, type PageFile } from "./schema";
import { tableCells } from "./snap";
import type { WordSuggestion } from "./suggest";

/**
 * The side-by-side sheet (platform/docs/plans/sources.md, "The side-by-side sheet"): one picture per
 * page, the page as printed on the left with each block outlined and numbered, and on the right our
 * version of it, block by block with the same numbers. Every suggestion is shown the same; the one
 * thing set apart is a fact: a place where a tool made no suggestion, shown empty and marked. Drawn as
 * HTML and photographed by headless Chrome (only a browser shapes Hindi); opened as a page, it is the
 * person's view, a block lit on both sides when hovered.
 */

export const SheetMode = {
  /** Before deciding: what the tools suggest, nothing coloured. */
  Suggestions: "suggestions",
  /** After the build: each piece coloured by who made it. */
  Decisions: "decisions",
} as const;
export type SheetMode = (typeof SheetMode)[keyof typeof SheetMode];

/** Who made a piece: the PDF as it is, a tool, or the agent. */
export const Maker = {
  Pdf: "pdf",
  Tool: "tool",
  Agent: "agent",
} as const;
export type Maker = (typeof Maker)[keyof typeof Maker];

/** What the build made of a figure or a table, for the sheet of decisions. */
export type BuiltBlock = {
  /** Its box, snapped or the agent's, and who made it. */
  box?: Box;
  boxBy?: Maker;
  /** Its cells, row by row, and who made them. */
  rows?: readonly (readonly string[])[];
  rowsBy?: Maker;
};

export type SheetPage = {
  mode: SheetMode;
  page: NumberedPage;
  /** The page file: the structure draft, or what was decided. */
  file: PageFile;
  /** The page's image, rendered from the PDF (`renderPages`). */
  image: string;
  /** The word tools' suggestions for the page (`wordSuggestions`). */
  suggestions?: readonly WordSuggestion[];
  /** The page's drawn objects: a table's grid is read from their rules. */
  objects?: readonly DrawnObject[];
  /** Decisions: what the build made of each block, by its place in the file. */
  built?: ReadonlyMap<number, BuiltBlock>;
  /** The lines' numbers on both sides, which the agent cites; off for the person's view. */
  ids?: boolean;
};

/** A place on the sheet where a tool made no suggestion. */
const NONE = {
  word: "no reading",
  figure: "no drawing found",
  table: "no grid",
  box: "no box",
} as const;

const SCALE = 1.25;

const escaped = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A piece of a block's text: words of the PDF in one line, a reading, or an empty place. */
type Token = { html: string; maker?: Maker; open?: boolean };

/** For each word of a page, what a reading puts there: the reading on its first word, nothing on the rest. */
type Placed = { text?: string; empty?: boolean; maker: Maker };

/** What the tools suggest at each word: a reading, or nothing where a tool left the span. */
function suggested(list: readonly WordSuggestion[]): Map<string, Placed> {
  const at = new Map<string, Placed>();
  for (const s of list) {
    const [first, ...rest] = s.ids;
    if (first === undefined) continue;
    at.set(
      first,
      s.reading === undefined
        ? { empty: true, maker: Maker.Tool }
        : { text: s.reading, maker: Maker.Tool },
    );
    for (const id of rest) at.set(id, { maker: Maker.Tool });
  }
  return at;
}

/** What the agent read in a block (`read`, by range): over whatever a tool suggested there. */
function readIn(block: PageBlock, page: NumberedPage): Map<string, Placed> {
  const at = new Map<string, Placed>();
  for (const [range, value] of Object.entries(block.read ?? {})) {
    const [first, ...rest] = ids(range, page);
    if (first === undefined) continue;
    at.set(first, { text: typeof value === "string" ? value : value.text, maker: Maker.Agent });
    for (const id of rest) at.set(id, { maker: Maker.Agent });
  }
  return at;
}

const ids = (range: string, page: NumberedPage): string[] => {
  try {
    return expand(range, page.words);
  } catch {
    return [];
  }
};

/** Some words as the sheet shows them: runs of the PDF's words, readings, empty places. */
function tokens(
  list: readonly string[],
  page: NumberedPage,
  tools: ReadonlyMap<string, Placed>,
  agent: ReadonlyMap<string, Placed>,
  showIds: boolean,
): Token[] {
  const out: Token[] = [];
  let line = "";
  for (const id of list) {
    const lineOf = id.split(".")[0] ?? "";
    if (showIds && lineOf !== line) out.push({ html: `<i class="ln">${lineOf}</i>` });
    line = lineOf;
    const placed = agent.get(id) ?? tools.get(id);
    if (placed === undefined) {
      out.push({ html: escaped(page.words.get(id)?.text ?? ""), maker: Maker.Pdf });
      continue;
    }
    if (placed.empty === true) {
      out.push({
        html: `<span class="none" title="${NONE.word}">${showIds ? id : ""}<em>${NONE.word}</em></span>`,
        open: true,
      });
      continue;
    }
    if (placed.text !== undefined) out.push({ html: escaped(placed.text), maker: placed.maker });
  }
  return out;
}

/** Tokens as HTML; in decisions, each coloured by its maker. */
function tokensHtml(list: readonly Token[], mode: SheetMode): string {
  return list
    .map((t) =>
      mode === SheetMode.Decisions && t.maker !== undefined && t.maker !== Maker.Pdf
        ? `<span class="by-${t.maker}">${t.html}</span>`
        : t.html,
    )
    .join(" ");
}

/** A block's `number` or `title`: words of the page when it cites them, else as typed. */
function labelText(
  label: string | undefined,
  page: NumberedPage,
  tools: ReadonlyMap<string, Placed>,
  agent: ReadonlyMap<string, Placed>,
): string {
  if (label === undefined) return "";
  const cited = /^L\d+(?:[.\-,\s]|$)/.test(label) ? ids(label, page) : [];
  if (cited.length === 0) return label;
  return tokens(cited, page, tools, agent, false)
    .map((t) => t.html)
    .join(" ");
}

/** A block's words as boxes on the page: its lines, those under one another taken together. */
function outlines(list: readonly string[], page: NumberedPage): Box[] {
  const byLine = new Map<string, Word[]>();
  for (const id of list) {
    const w = page.words.get(id);
    if (w === undefined) continue;
    const line = id.split(".")[0] ?? "";
    byLine.set(line, [...(byLine.get(line) ?? []), w]);
  }
  const boxes = [...byLine.values()]
    .map((words): Box => boundsOf(words))
    .sort((a, b) => a[1] - b[1]);
  const out: Box[] = [];
  for (const b of boxes) {
    const near = out.find(
      (o) =>
        b[1] - o[3] < 14 && o[1] - b[3] < 14 && Math.min(o[2], b[2]) - Math.max(o[0], b[0]) > 0,
    );
    if (near === undefined) out.push([...b]);
    else {
      near[0] = Math.min(near[0], b[0]);
      near[1] = Math.min(near[1], b[1]);
      near[2] = Math.max(near[2], b[2]);
      near[3] = Math.max(near[3], b[3]);
    }
  }
  return out;
}

const place = (b: Box): string =>
  `left:${b[0] * SCALE}px;top:${b[1] * SCALE}px;width:${(b[2] - b[0]) * SCALE}px;height:${(b[3] - b[1]) * SCALE}px`;

/** The largest a crop is shown, in pixels. */
const CROP = { width: 420, height: 220 };

/** A figure's or table's picture, cut from the page's image. */
function cropHtml(b: Box, page: NumberedPage): string {
  const [w, h] = [b[2] - b[0], b[3] - b[1]];
  const scale = Math.min(CROP.width / w, CROP.height / h, SCALE);
  return `<div class="crop" style="width:${w * scale}px;height:${h * scale}px;background-size:${page.width * scale}px ${page.height * scale}px;background-position:${-b[0] * scale}px ${-b[1] * scale}px"></div>`;
}

/** A table's rows: the agent's cells, the build's, or from the rules drawn; empty when it has none. */
function tableRows(block: PageBlock, built: BuiltBlock | undefined, sheet: SheetPage) {
  const { page } = sheet;
  const words = (range: string) =>
    ids(range, page)
      .map((id) => page.words.get(id)?.text ?? "")
      .join(" ");
  if (block.cells !== undefined) return block.cells.rows.map((row) => row.map(words));
  if (built?.rows !== undefined) return built.rows;
  const box = built?.box ?? block.box;
  if (box === undefined) return [];
  const grid = tableCells(box, sheet.objects ?? [], [...page.words.values()]);
  return Array.from({ length: grid.rows }, (_, r) =>
    grid.cells.filter((c) => c.row === r).map((c) => c.text),
  );
}

/** A table as a grid, or an empty place when it has none. */
function tableHtml(rows: readonly (readonly string[])[], by: Maker | undefined, mode: SheetMode) {
  if (rows.length === 0) return emptyPlace(NONE.table);
  const cls = mode === SheetMode.Decisions && by !== undefined ? ` by-${by}` : "";
  const body = rows
    .map((row) => `<tr>${row.map((c) => `<td>${escaped(c)}</td>`).join("")}</tr>`)
    .join("");
  return `<table class="grid${cls}">${body}</table>`;
}

const emptyPlace = (what: string): string => `<div class="none block-none"><em>${what}</em></div>`;

/** Who made a piece, as a word beside it (decisions only). */
function byNote(what: string, by: Maker, mode: SheetMode): string {
  if (mode !== SheetMode.Decisions) return "";
  const name = { [Maker.Pdf]: "the PDF", [Maker.Tool]: "a tool", [Maker.Agent]: "the agent" }[by];
  return `<div class="note by-${by}">${what}: ${name}</div>`;
}

const STYLE = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff; color: #1a1a1a;
    font: 13.5px/1.45 "Noto Serif", "Kohinoor Devanagari", "Noto Serif Devanagari", "Devanagari Sangam MN", Georgia, serif; }
  .sheet { display: flex; gap: 12px; padding: 8px; align-items: flex-start; }
  .left { position: relative; flex: none; border: 1px solid #bbb;
    background-repeat: no-repeat; background-size: 100% 100%; }
  .right { flex: none; }
  .out { position: absolute; border: 1.5px solid #1565c0; background: rgba(21,101,192,.04); }
  .out.drawn { border: 2px dashed #1565c0; background: none; }
  .out.furniture { border: 1px dotted #888; background: none; }
  .tag { position: absolute; left: -1px; top: -13px; padding: 0 3px; font: bold 10px/13px Helvetica, sans-serif;
    background: #1565c0; color: #fff; }
  .num { position: absolute; font: 8px/10px Helvetica, sans-serif; color: #1565c0; background: rgba(255,255,255,.85); }
  .block { margin: 0 0 5px; padding: 2px 6px 3px; border-left: 3px solid #1565c0; }
  .head { font: bold 10.5px/15px Helvetica, sans-serif; color: #1565c0; }
  .head b { color: #fff; background: #1565c0; padding: 0 4px; margin-right: 5px; }
  .head .label { color: #1a1a1a; font-weight: normal; margin-left: 5px; }
  .furn { color: #666; border-left-color: #888; }
  .lit { outline: 2px solid #e65100; background: rgba(230,81,0,.1) !important; }
  .ln { font: 8px Helvetica, sans-serif; color: #1565c0; vertical-align: 1px; font-style: normal; }
  .none { display: inline-block; min-width: 54px; padding: 0 4px; border: 1px dashed #666; background: #f3f3f3;
    font: 9px/15px Helvetica, sans-serif; color: #444; vertical-align: baseline; }
  .none em { font-style: normal; margin-left: 3px; }
  .block-none { display: block; margin: 3px 0; padding: 6px; text-align: center; }
  .crop { background-repeat: no-repeat; border: 1px solid #ccc; margin: 3px 0; }
  .grid { border-collapse: collapse; margin: 3px 0; font-size: 12px; }
  .grid td { border: 1px solid #777; padding: 1px 5px; vertical-align: top; }
  .by-tool { color: #0b6e4f; background: #e3f4ee; }
  .by-agent { color: #a13c00; background: #fdeee2; }
  .note { font: 10px Helvetica, sans-serif; display: inline-block; padding: 0 3px; }
  .legend { font: 11px Helvetica, sans-serif; margin: 0 0 6px; padding: 3px 6px; border: 1px solid #ddd; }
  .legend span { padding: 0 4px; margin-right: 6px; }
`;

const SCRIPT = `
  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest && e.target.closest('[data-b]');
    document.querySelectorAll('.lit').forEach((x) => x.classList.remove('lit'));
    if (el) document.querySelectorAll('[data-b="' + el.dataset.b + '"]').forEach((x) => x.classList.add('lit'));
  });
`;

/**
 * The page's image behind the page and every crop, written once. Not a custom property: Chrome drops
 * one whose value is over 2 MiB, and a full page 1 photo is more (base64 of a 1.7 MB PNG).
 */
const pageImage = (base64: string): string =>
  `.left, .crop { background-image: url("data:image/png;base64,${base64}"); }`;

/** A page's sheet, as a page of its own: its image is in the page, so the file can go anywhere. */
export function sheetHtml(sheet: SheetPage): string {
  const { page, file, mode } = sheet;
  const showIds = sheet.ids ?? true;
  const tools = suggested(sheet.suggestions ?? []);
  const png = readFileSync(sheet.image).toString("base64");
  const [width, height] = [page.width * SCALE, page.height * SCALE];

  const left: string[] = [];
  const right: string[] = [];
  file.blocks.forEach((block, i) => {
    const n = i + 1;
    const list = ids(block.words, page);
    const agent = readIn(block, page);
    const built = sheet.built?.get(i);
    const drawn = block.crop?.box ?? built?.box ?? block.box;
    const boxes = drawn !== undefined ? [drawn] : outlines(list, page);
    boxes.forEach((b, k) => {
      const cls = drawn !== undefined ? "out drawn" : "out";
      const tag = k === 0 ? `<span class="tag">${n}</span>` : "";
      left.push(`<div class="${cls}" data-b="${n}" style="${place(b)}">${tag}</div>`);
    });
    const number = labelText(block.number, page, tools, agent);
    const title = labelText(block.title, page, tools, agent);
    const label = [number, title].filter((s) => s !== "").join(" · ");
    const head = `<div class="head"><b>${n}</b>${block.kind}${label === "" ? "" : `<span class="label">${label}</span>`}${block.continued === true ? " ← continued" : ""}${block.continues === true ? " continues →" : ""}</div>`;
    const boxBy = block.crop !== undefined ? Maker.Agent : (built?.boxBy ?? Maker.Agent);
    const crop = (b: Box) => cropHtml(b, page) + byNote("box", boxBy, mode);
    let picture = "";
    if (block.kind === ItemKind.Figure)
      picture = drawn === undefined ? emptyPlace(NONE.figure) : crop(drawn);
    if (block.kind === ItemKind.Table) {
      const rowsBy = block.cells !== undefined ? Maker.Agent : built?.rowsBy;
      picture =
        (drawn === undefined ? emptyPlace(NONE.box) : crop(drawn)) +
        tableHtml(tableRows(block, built, sheet), rowsBy, mode);
    }
    const text = tokensHtml(tokens(list, page, tools, agent, showIds), mode);
    right.push(
      `<div class="block" data-b="${n}">${head}${picture}<div class="text">${text}</div></div>`,
    );
  });

  const furniture = file.furniture === undefined ? [] : ids(file.furniture, page);
  for (const b of outlines(furniture, page))
    left.push(`<div class="out furniture" style="${place(b)}"></div>`);
  if (furniture.length > 0)
    right.push(
      `<div class="block furn"><div class="head">furniture</div><div class="text">${tokensHtml(tokens(furniture, page, tools, new Map(), false), mode)}</div></div>`,
    );

  if (showIds)
    page.lines.forEach((line, l) => {
      const first = line[0];
      if (first === undefined) return;
      const [x, y] = [Math.max(0, first.x0 * SCALE - 12), first.y0 * SCALE];
      left.push(`<span class="num" style="left:${x}px;top:${y}px">${l + 1}</span>`);
    });

  const legend =
    mode === SheetMode.Decisions
      ? `<div class="legend"><span>the PDF</span><span class="by-tool">a tool</span><span class="by-agent">the agent</span><span class="none"><em>nothing yet</em></span></div>`
      : "";
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Page ${page.page}</title>
<style>${pageImage(png)}${STYLE}
.right { width: ${width}px; }
</style></head>
<body><div class="sheet">
<div class="left" style="width:${width}px;height:${height}px">${left.join("")}</div>
<div class="right">${legend}${right.join("")}</div>
</div><script>${SCRIPT}</script></body></html>`;
}

/** Headless Chrome, as the app driver finds it: CHALK_CHROMIUM, else the installed Chrome, else Playwright's. */
async function launch() {
  const { chromium } = await import("playwright-core");
  const path = process.env.CHALK_CHROMIUM;
  if (path !== undefined && existsSync(path)) return chromium.launch({ executablePath: path });
  try {
    return await chromium.launch({ channel: "chrome" });
  } catch {
    return chromium.launch();
  }
}

/** Sheets photographed with one browser: each `html` to its `out`, a PNG. */
export async function renderSheets(list: readonly { html: string; out: string }[]): Promise<void> {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1800, height: 1000 } });
    for (const { html, out } of list) {
      mkdirSync(dirname(out), { recursive: true });
      await page.setContent(html, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.locator(".sheet").screenshot({ path: out });
    }
  } finally {
    await browser.close();
  }
}

/** A sheet photographed to `out`, a PNG. */
export const renderSheet = (html: string, out: string): Promise<void> =>
  renderSheets([{ html, out }]);
