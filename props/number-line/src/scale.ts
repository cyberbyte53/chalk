/** Pure geometry for the number line: value ↔ x, readable ticks, and zooming. */

export const HEIGHT = 132;
export const PAD = 26;
/** Where the axis sits: room above it for up to three rows of labels. */
export const AXIS_GAP = 82;
/** Vertical step between stacked mark labels. */
export const LABEL_ROW = 22;

export type View = { from: number; to: number; width: number };
export type Window = { from: number; to: number };

export function valueToX(view: View, value: number): number {
  return PAD + ((value - view.from) / (view.to - view.from)) * (view.width - 2 * PAD);
}

export function xToValue(view: View, x: number): number {
  return view.from + ((x - PAD) / (view.width - 2 * PAD)) * (view.to - view.from);
}

/** A 1-2-5 step giving roughly 5–10 ticks across the span; exactly tenths for a power-of-ten span. */
export function tickStep(span: number): number {
  const decade = 10 ** Math.round(Math.log10(span));
  if (Math.abs(span / decade - 1) < 1e-6) return decade / 10;
  const raw = span / 8;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 5, 10]) {
    if (m * magnitude >= raw * (1 - 1e-9)) return m * magnitude;
  }
  return 10 * magnitude;
}

export function decimalsFor(step: number): number {
  return Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
}

export function ticks(view: View): number[] {
  const step = tickStep(view.to - view.from);
  const digits = decimalsFor(step) + 1;
  const out: number[] = [];
  const first = Math.ceil(view.from / step - 1e-6);
  for (let i = first; i * step <= view.to + step * 1e-6; i++) {
    out.push(Number((i * step).toFixed(digits)));
  }
  return out;
}

/** Precision the learner can place the marker at, at this zoom (one digit finer than the ticks). */
export function markerPrecision(view: View): number {
  return decimalsFor(tickStep(view.to - view.from)) + 1;
}

export function formatValue(value: number, digits: number): string {
  const text = value.toFixed(digits);
  return text === `-${(0).toFixed(digits)}` ? (0).toFixed(digits) : text;
}

/**
 * The tenth of the window that holds `value`: the stretch successive magnification zooms into.
 * A value on a tenth's boundary goes into the tenth to its right (2.6 is in 2.6–2.7), except at
 * the window's right end.
 */
export function magnifyTarget(window: Window, value: number): Window {
  const step = (window.to - window.from) / 10;
  const index = Math.min(9, Math.max(0, Math.floor((value - window.from) / step + 1e-9)));
  const digits = decimalsFor(step) + 3;
  const from = Number((window.from + index * step).toFixed(digits));
  return { from, to: Number((from + step).toFixed(digits)) };
}

/**
 * The window part way (t from 0 to 1) through a zoom from `start` to `target`: it scales evenly in
 * log (each tenth of the time is the same factor) about the one point both windows put at the same
 * place on screen, so what is being zoomed into stays still under the eye.
 */
export function zoomFrame(start: Window, target: Window, t: number): Window {
  if (t <= 0) return start;
  if (t >= 1) return target;
  const a = start.from;
  const b = start.to;
  const c = target.from;
  const d = target.to;
  const spanStart = b - a;
  const spanTarget = d - c;
  if (Math.abs(spanStart - spanTarget) < 1e-12 * Math.max(1, spanStart)) {
    return { from: a + (c - a) * t, to: b + (d - b) * t };
  }
  const fixed = (a * spanTarget - c * spanStart) / (spanTarget - spanStart);
  const k = (spanTarget / spanStart) ** t;
  return { from: fixed - (fixed - a) * k, to: fixed + (b - fixed) * k };
}
