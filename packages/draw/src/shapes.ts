import type { SymbolType } from "d3-shape";

/**
 * Our own shapes, written as d3-shape extensions so they draw through the same `context` as d3's:
 * an SVG path string or a canvas, with the same code.
 */

/** An arrowhead pointing right (+x), its tip at the origin. `size` is its area, as for d3's symbols. */
export const arrowhead: SymbolType = {
  draw(context, size) {
    const s = Math.sqrt(size);
    context.moveTo(0, 0);
    context.lineTo(-s, -s * 0.62);
    context.lineTo(-s * 0.72, 0);
    context.lineTo(-s, s * 0.62);
    context.closePath();
  },
};

/** An open chevron pointing right (+x), its tip at the origin: the ends of a number line. */
export const chevron: SymbolType = {
  draw(context, size) {
    const s = Math.sqrt(size);
    context.moveTo(-s * 0.7, -s);
    context.lineTo(0, 0);
    context.lineTo(-s * 0.7, s);
  },
};
