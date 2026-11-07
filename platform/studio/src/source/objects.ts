import { readFileSync } from "node:fs";
import { OPS, getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { poppler } from "./read";
import type { Box } from "./schema";

/**
 * A PDF's drawn objects (platform/docs/plans/sources.md, round 2: "each figure's box snapped to the
 * PDF's own image and vector objects"): every image and every painted vector path on a page, each with
 * its box, read with pdf.js. Boxes are in the words files' frame: points from the top left of the page
 * as poppler reads and renders it, its media box (pdf.js measures from the crop box, which can sit
 * inside it: 21 points in on NCERT's 2026 science PDFs). What is drawn at the same place on most pages (a watermark, the page's
 * background, a logo) is left out by `withoutRepeats`.
 */

export const ObjectKind = {
  Image: "image",
  /** A painted vector path (stroked or filled), a gradient's painted area among them. */
  Path: "path",
} as const;
export type ObjectKind = (typeof ObjectKind)[keyof typeof ObjectKind];

/** A straight horizontal or vertical stroke: `[x0, y0, x1, y1]` with x0 ≤ x1, y0 ≤ y1. */
export type Rule = Box;

export type DrawnObject = {
  kind: ObjectKind;
  /** What shows of it: its extent, cut to the clip it was drawn in. */
  box: Box;
  /** A path's straight horizontal and vertical strokes (a thin filled bar counts as one): a table's rules. */
  rules: Rule[];
};

export type PageObjects = { page: number; width: number; height: number; objects: DrawnObject[] };

type Matrix = [number, number, number, number, number, number];

const multiply = (m: Matrix, n: Matrix): Matrix => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];
const apply = (m: Matrix, x: number, y: number): [number, number] => [
  m[0] * x + m[2] * y + m[4],
  m[1] * x + m[3] * y + m[5],
];

/** The box of a local box's four corners under a matrix. */
function boxUnder(m: Matrix, [x0, y0, x1, y1]: Box): Box {
  const pts = [apply(m, x0, y0), apply(m, x1, y0), apply(m, x0, y1), apply(m, x1, y1)];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

export const area = (b: Box): number => Math.max(0, b[2] - b[0]) * Math.max(0, b[3] - b[1]);
export const intersect = (a: Box, b: Box): Box => [
  Math.max(a[0], b[0]),
  Math.max(a[1], b[1]),
  Math.min(a[2], b[2]),
  Math.min(a[3], b[3]),
];
export const union = (a: Box, b: Box): Box => [
  Math.min(a[0], b[0]),
  Math.min(a[1], b[1]),
  Math.max(a[2], b[2]),
  Math.max(a[3], b[3]),
];
const empty = (b: Box) => b[2] < b[0] || b[3] < b[1];

/** A bar thinner than this (points) is a rule, not a shape. */
const RULE_WIDTH = 2;

const DRAW = { moveTo: 0, lineTo: 1, curveTo: 2, quadraticCurveTo: 3, closePath: 4 } as const;

/** The straight axis-aligned strokes of a path's data, in page points. */
function strokes(data: ArrayLike<number>, m: Matrix): Rule[] {
  const out: Rule[] = [];
  let start: [number, number] | undefined;
  let at: [number, number] | undefined;
  const seg = (a: [number, number], b: [number, number]) => {
    const [p, q] = [apply(m, ...a), apply(m, ...b)];
    const r: Rule = [
      Math.min(p[0], q[0]),
      Math.min(p[1], q[1]),
      Math.max(p[0], q[0]),
      Math.max(p[1], q[1]),
    ];
    const [w, h] = [r[2] - r[0], r[3] - r[1]];
    if ((h < 0.5 && w > 1) || (w < 0.5 && h > 1)) out.push(r);
  };
  for (let i = 0; i < data.length; ) {
    const op = data[i++];
    const next = (): [number, number] => [data[i++] ?? 0, data[i++] ?? 0];
    if (op === DRAW.moveTo) {
      at = next();
      start = at;
    } else if (op === DRAW.lineTo) {
      const p = next();
      if (at !== undefined) seg(at, p);
      at = p;
    } else if (op === DRAW.curveTo) {
      i += 4;
      at = next();
    } else if (op === DRAW.quadraticCurveTo) {
      i += 2;
      at = next();
    } else if (op === DRAW.closePath) {
      if (at !== undefined && start !== undefined) seg(at, start);
      at = start;
    } else break;
  }
  return out;
}

/** A filled thin bar as the one rule along its middle. */
function bar(b: Box): Rule[] {
  const [w, h] = [b[2] - b[0], b[3] - b[1]];
  if (h < RULE_WIDTH && w > RULE_WIDTH * 2)
    return [[b[0], (b[1] + b[3]) / 2, b[2], (b[1] + b[3]) / 2]];
  if (w < RULE_WIDTH && h > RULE_WIDTH * 2)
    return [[(b[0] + b[2]) / 2, b[1], (b[0] + b[2]) / 2, b[3]]];
  return [];
}

const STROKE = new Set<number>([OPS.stroke, OPS.closeStroke]);
const FILL = new Set<number>([OPS.fill, OPS.eoFill]);
const BOTH = new Set<number>([
  OPS.fillStroke,
  OPS.eoFillStroke,
  OPS.closeFillStroke,
  OPS.closeEOFillStroke,
]);
const IMAGE = new Set<number>([
  OPS.paintImageXObject,
  OPS.paintInlineImageXObject,
  OPS.paintImageMaskXObject,
  OPS.paintImageXObjectRepeat,
  OPS.paintImageMaskXObjectRepeat,
  OPS.paintSolidColorImageMask,
]);

/** White on white shows nothing: a fill or stroke in white (or near it) is not drawn. */
const isWhite = (hex: string | undefined) =>
  hex !== undefined && /^#(f[a-f0-9]){3}$/i.test(hex) && hex.toLowerCase() >= "#f8f8f8";

type State = {
  ctm: Matrix;
  clip: Box | undefined;
  fill: string | undefined;
  stroke: string | undefined;
};

/** Each page's media box `[x0, y0, x1, y1]` (PDF points, y up), as poppler reads it. */
function mediaBoxes(pdf: string): Box[] {
  const info = poppler("pdfinfo", ["-box", "-f", "1", "-l", "100000", pdf]);
  const boxes: Box[] = [];
  for (const m of info.matchAll(
    /^Page\s+(\d+)\s+MediaBox:\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/gm,
  ))
    boxes[Number(m[1]) - 1] = [Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5])];
  for (const m of info.matchAll(/^Page\s+(\d+)\s+rot:\s+(\d+)/gm))
    if (Number(m[2]) % 360 !== 0)
      throw new Error(`${pdf}: page ${m[1]} is rotated; objects.ts reads only upright pages`);
  return boxes;
}

/** Every page's drawn objects, in the order drawn. */
export async function readObjects(pdf: string): Promise<PageObjects[]> {
  const media = mediaBoxes(pdf);
  const task = getDocument({
    data: new Uint8Array(readFileSync(pdf)),
    verbosity: 0,
    disableFontFace: true,
  });
  const doc = await task.promise;
  try {
    const pages: PageObjects[] = [];
    for (let n = 1; n <= doc.numPages; n += 1) {
      const page = await doc.getPage(n);
      const [x0, y0, x1, y1] = media[n - 1] ?? (page.view as Box);
      const list = await page.getOperatorList();
      pages.push({
        page: n,
        width: x1 - x0,
        height: y1 - y0,
        objects: objectsOf(list.fnArray, list.argsArray, [1, 0, 0, -1, -x0, y1]),
      });
      page.cleanup();
    }
    return pages;
  } finally {
    await task.destroy();
  }
}

/** A page's operators walked with their graphics state: what each paints, and where. */
function objectsOf(fns: readonly number[], args: readonly unknown[], base: Matrix): DrawnObject[] {
  const out: DrawnObject[] = [];
  let s: State = { ctm: base, clip: undefined, fill: undefined, stroke: undefined };
  const stack: State[] = [];
  let pendingClip = false;
  const push = (kind: ObjectKind, extent: Box, rules: Rule[]) => {
    const box = s.clip === undefined ? extent : intersect(extent, s.clip);
    if (empty(box)) return;
    const clip = s.clip;
    const kept = clip === undefined ? rules : rules.filter((r) => !empty(intersect(r, clip)));
    out.push({ kind, box, rules: kept });
  };
  fns.forEach((fn, i) => {
    const a = (args[i] ?? []) as unknown[];
    switch (fn) {
      case OPS.save:
        stack.push({ ...s });
        break;
      case OPS.restore:
        s = stack.pop() ?? s;
        break;
      case OPS.transform:
        s.ctm = multiply(s.ctm, a as Matrix);
        break;
      case OPS.paintFormXObjectBegin: {
        stack.push({ ...s });
        const [matrix, bbox] = a as [Matrix | null, Box | null];
        if (matrix) s.ctm = multiply(s.ctm, matrix);
        if (bbox) {
          const b = boxUnder(s.ctm, bbox);
          s.clip = s.clip === undefined ? b : intersect(s.clip, b);
        }
        break;
      }
      case OPS.paintFormXObjectEnd:
        s = stack.pop() ?? s;
        break;
      case OPS.setFillRGBColor:
        s.fill = typeof a[0] === "string" ? a[0] : undefined;
        break;
      case OPS.setStrokeRGBColor:
        s.stroke = typeof a[0] === "string" ? a[0] : undefined;
        break;
      case OPS.clip:
      case OPS.eoClip:
        pendingClip = true;
        break;
      case OPS.constructPath: {
        const [op, data, minMax] = a as [
          number,
          ArrayLike<number>[] | null,
          ArrayLike<number> | null,
        ];
        if (minMax === null || minMax === undefined) break;
        const local: Box = [minMax[0] ?? 0, minMax[1] ?? 0, minMax[2] ?? 0, minMax[3] ?? 0];
        const extent = boxUnder(s.ctm, local);
        if (pendingClip) {
          s.clip = s.clip === undefined ? extent : intersect(s.clip, extent);
          pendingClip = false;
        }
        const path = data?.[0] ?? [];
        const stroked = STROKE.has(op) || BOTH.has(op);
        const filled = FILL.has(op) || BOTH.has(op);
        const strokeShows = stroked && !isWhite(s.stroke);
        const fillShows = filled && !isWhite(s.fill);
        if (!strokeShows && !fillShows) break;
        const rules = [
          ...(strokeShows ? strokes(path, s.ctm) : []),
          ...(fillShows && !strokeShows ? bar(extent) : []),
        ];
        push(ObjectKind.Path, extent, rules);
        break;
      }
      case OPS.shadingFill:
        if (s.clip !== undefined) push(ObjectKind.Path, s.clip, []);
        break;
      default:
        if (IMAGE.has(fn)) push(ObjectKind.Image, boxUnder(s.ctm, [0, 0, 1, 1]), []);
    }
  });
  return out;
}

/** How near two boxes' edges must be (points) to count as the same place. */
const SAME_PLACE = 2;
const samePlace = (a: Box, b: Box) => a.every((v, i) => Math.abs(v - (b[i] ?? 0)) <= SAME_PLACE);

/**
 * The pages without what is drawn at the same place on many of them (a third or more, and at least
 * three: books set left and right pages apart, so a running head's rule is on every other page): a
 * watermark, the page's background, a running head's rule, a logo.
 */
export function withoutRepeats(pages: readonly PageObjects[]): PageObjects[] {
  const enough = Math.max(3, pages.length / 3);
  if (pages.length < enough) return [...pages];
  const counts = (o: DrawnObject) =>
    pages.filter((p) => p.objects.some((q) => q.kind === o.kind && samePlace(q.box, o.box))).length;
  const repeated: DrawnObject[] = [];
  const isRepeated = (o: DrawnObject) =>
    repeated.some((r) => r.kind === o.kind && samePlace(r.box, o.box));
  for (const p of pages)
    for (const o of p.objects) if (!isRepeated(o) && counts(o) >= enough) repeated.push(o);
  return pages.map((p) => ({ ...p, objects: p.objects.filter((o) => !isRepeated(o)) }));
}
