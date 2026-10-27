/**
 * Where the diamond is drawn at a given width: the expression at the top, the two routes down the
 * sides, the meeting node at the bottom. Shared by the view and `locate`, so a part is found where
 * it is drawn. Text widths are estimated from the display font's digit width.
 */

import type { Box } from "@chalk/prop";

export type Point = { x: number; y: number };

/** An arrow is a quadratic curve; its operation sits in a pill at the curve's midpoint. */
export type Arrow = { from: Point; control: Point; to: Point; label: Box };

export type RouteLayout = { arrows: Arrow[]; nodes: Box[] };

export type ExpressionLayout = {
  box: Box;
  base: { x: number; baseline: number; size: number; box: Box };
  /** The m on top (or alone when n = 1). */
  power: { x: number; baseline: number; size: number; box: Box };
  /** The n underneath, with the fraction line over it, when n > 1. */
  root?: { x: number; baseline: number; size: number; box: Box; lineY: number; lineFrom: number };
  exponent: Box;
};

export type Layout = {
  width: number;
  height: number;
  expression: ExpressionLayout;
  rootFirst: RouteLayout;
  powerFirst: RouteLayout;
  end: Box;
};

/** A bold display digit is about this wide, as a fraction of the font size. */
export const DIGIT_WIDTH = 0.62;
/** Wider, with room to spare, for fitting a number into a node. */
const FIT_WIDTH = 0.7;
export const BASE_SIZE = 46;
export const EXPONENT_SIZE = 20;
const EXPRESSION_BOTTOM = 76;
const ROW = 116;
export const NODE_HEIGHT = 44;
export const END_HEIGHT = 56;
export const PILL_HEIGHT = 28;
const MARGIN = 6;

/** Roughly how wide a text is at a font size. */
export function textWidth(text: string, size: number): number {
  return [...text].length * DIGIT_WIDTH * size;
}

/** The font size that fits `text` in `width`, at most `largest`. */
export function fitSize(text: string, width: number, largest: number): number {
  return Math.max(9, Math.min(largest, width / Math.max(1, [...text].length * FIT_WIDTH)));
}

/**
 * What a pill shows: the operation acting on x, so every step reads as "do this to the number":
 * ∛x, x², 1/x.
 */
export function pillLabel(operation: string): { before: string; after: string } {
  const at = operation.indexOf("x");
  if (at >= 0) return { before: operation.slice(0, at), after: operation.slice(at + 1) };
  return operation.includes("√") || operation === "∛" || operation === "∜"
    ? { before: operation, after: "" }
    : { before: "", after: operation };
}

export function pillWidth(operation: string): number {
  const extra = operation.includes("x") ? 0 : 1;
  return Math.max(40, ([...operation].length + extra) * 11 + 20);
}

function minusAware(n: number): string {
  return n < 0 ? `−${-n}` : `${n}`;
}

function expressionLayout(width: number, base: number, power: number, root: number) {
  const baseText = String(base);
  const baseWidth = textWidth(baseText, BASE_SIZE);
  const powerText = minusAware(power);
  const rootText = String(root);
  const isFraction = root > 1;
  const size = isFraction ? EXPONENT_SIZE : EXPONENT_SIZE + 4;
  const fractionWidth =
    Math.max(textWidth(powerText, size), isFraction ? textWidth(rootText, size) : 0) +
    (isFraction ? 6 : 0);
  const gap = 3;
  const total = baseWidth + gap + fractionWidth;
  const left = width / 2 - total / 2;
  const baseBaseline = 66;
  const baseBox = {
    x: left,
    y: baseBaseline - 0.74 * BASE_SIZE,
    width: baseWidth,
    height: 0.74 * BASE_SIZE,
  };
  const fractionLeft = left + baseWidth + gap;
  const centre = fractionLeft + fractionWidth / 2;
  const powerWidth = textWidth(powerText, size);
  const powerBaseline = isFraction ? 26 : 36;
  const powerBox = {
    x: centre - powerWidth / 2,
    y: powerBaseline - 0.74 * size,
    width: powerWidth,
    height: 0.74 * size,
  };
  const expression: ExpressionLayout = {
    box: { x: left - 8, y: 4, width: total + 16, height: EXPRESSION_BOTTOM - 8 },
    base: { x: left + baseWidth / 2, baseline: baseBaseline, size: BASE_SIZE, box: baseBox },
    power: { x: centre, baseline: powerBaseline, size, box: powerBox },
    exponent: powerBox,
  };
  if (isFraction) {
    const rootWidth = textWidth(rootText, size);
    const lineY = 32;
    const rootBaseline = 52;
    const rootBox = {
      x: centre - rootWidth / 2,
      y: rootBaseline - 0.74 * size,
      width: rootWidth,
      height: 0.74 * size,
    };
    expression.root = {
      x: centre,
      baseline: rootBaseline,
      size,
      box: rootBox,
      lineY,
      lineFrom: fractionLeft,
    };
    expression.exponent = {
      x: fractionLeft,
      y: powerBox.y,
      width: fractionWidth,
      height: rootBaseline - powerBox.y,
    };
  }
  return expression;
}

function midpoint(a: Point, c: Point, b: Point): Point {
  return { x: 0.25 * a.x + 0.5 * c.x + 0.25 * b.x, y: 0.25 * a.y + 0.5 * c.y + 0.25 * b.y };
}

function arrow(from: Point, to: Point, operation: string, control?: Point): Arrow {
  const c = control ?? { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const mid = midpoint(from, c, to);
  const w = pillWidth(operation);
  return {
    from,
    control: c,
    to,
    label: { x: mid.x - w / 2, y: mid.y - PILL_HEIGHT / 2, width: w, height: PILL_HEIGHT },
  };
}

/** The node width at this prop width (two side by side, with room between). */
export function nodeWidth(width: number): number {
  return Math.min(128, width / 2 - 26);
}

/** The diamond at `width`, for routes whose steps carry these operations (same count on both). */
export function layoutOf(
  width: number,
  base: number,
  power: number,
  root: number,
  rootFirstOperations: readonly string[],
  powerFirstOperations: readonly string[],
): Layout {
  const centre = width / 2;
  const side = Math.min(width * 0.27, 110);
  const w = nodeWidth(width);
  const count = rootFirstOperations.length;
  const rows = Math.max(count, 1);
  const rowY = (i: number) => EXPRESSION_BOTTOM + i * ROW - NODE_HEIGHT / 2 - 18;
  // One step: a little more room, so the two curves read as two routes.
  const endY = EXPRESSION_BOTTOM + rows * ROW - END_HEIGHT / 2 - 14 + (count <= 1 ? 28 : 0);
  const endWidth = Math.min(w + 16, width - 2 * MARGIN);
  const end: Box = {
    x: centre - endWidth / 2,
    y: endY - END_HEIGHT / 2,
    width: endWidth,
    height: END_HEIGHT,
  };

  const route = (operations: readonly string[], sign: number): RouteLayout => {
    const x = centre + sign * side;
    const nodes: Box[] = [];
    for (let i = 1; i < count; i++) {
      nodes.push({ x: x - w / 2, y: rowY(i) - NODE_HEIGHT / 2, width: w, height: NODE_HEIGHT });
    }
    const top: Point = { x: centre + sign * 22, y: EXPRESSION_BOTTOM - 2 };
    const arrows = operations.map((operation, i) => {
      const isFirst = i === 0;
      const isLast = i === count - 1;
      const from = isFirst ? top : { x, y: rowY(i) + NODE_HEIGHT / 2 + 2 };
      const to = isLast
        ? { x: centre + sign * Math.min(endWidth / 2 - 18, 34), y: end.y - 3 }
        : { x, y: rowY(i + 1) - NODE_HEIGHT / 2 - 3 };
      // One step on each route: two curves bowing out, so the routes don't lie on one line.
      const control =
        isFirst && isLast ? { x: centre + sign * side * 1.15, y: (from.y + to.y) / 2 } : undefined;
      return arrow(from, to, operation, control);
    });
    return { arrows, nodes };
  };

  return {
    width,
    height: end.y + END_HEIGHT + MARGIN,
    expression: expressionLayout(width, base, power, root),
    rootFirst: route(rootFirstOperations, -1),
    powerFirst: route(powerFirstOperations, 1),
    end,
  };
}

/** The smallest box holding all of these. */
export function unionOf(boxes: readonly Box[]): Box | undefined {
  if (boxes.length === 0) return undefined;
  const left = Math.min(...boxes.map((b) => b.x));
  const top = Math.min(...boxes.map((b) => b.y));
  const right = Math.max(...boxes.map((b) => b.x + b.width));
  const bottom = Math.max(...boxes.map((b) => b.y + b.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}
