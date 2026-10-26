/**
 * How a prop is sized on screens wider or shorter than a phone. The player applies it; a prop
 * type sets its own default (`defineProp({ size })`), and a board can override it where it places
 * the prop (`b.prop(def, name, given, { size })`). Neither prop nor board code ever sees the device.
 */
export const SizeFit = {
  /** Drawn for a phone, scaled as one picture with the column (SVG and HTML alike). */
  Scale: "scale",
  /** Given the column's whole width and left to use it (a number line shows more axis). */
  Fill: "fill",
} as const;
export type SizeFit = (typeof SizeFit)[keyof typeof SizeFit];

export type Size = {
  fit?: SizeFit;
  /** The most a scaled prop grows on a wide column (1.2: in step with the text, 17 → 20px). */
  maxZoom?: number;
  /**
   * The most of the screen's height it may take (0.6), so it and its question can be seen
   * together; a taller prop scales down to fit, but never below `minZoom`.
   */
  maxHeight?: number;
  minZoom?: number;
};

/** The phone width props are drawn for: a scaled prop is 1× here. */
export const PHONE_COLUMN = 390;

export const DEFAULT_SIZE: Required<Size> = {
  fit: SizeFit.Scale,
  maxZoom: 1.2,
  maxHeight: 0.6,
  minZoom: 0.75,
};

/** The rule in force: the default, then the prop type's, then the board's. */
export function sizeOf(...rules: (Size | undefined)[]): Required<Size> {
  return Object.assign({}, DEFAULT_SIZE, ...rules.filter((r) => r !== undefined));
}

/**
 * The zoom for a prop: by the column's width (1× on a phone, up to `maxZoom`), then down to fit
 * `maxHeight` of the screen if its drawing at that zoom would be taller, never below `minZoom`.
 * `naturalHeight` is its height at 1×.
 */
export function zoomFor(
  rule: Required<Size>,
  column: number,
  screenHeight: number,
  naturalHeight: number,
): number {
  if (rule.fit === SizeFit.Fill) return 1;
  const byWidth = Math.min(rule.maxZoom, Math.max(1, column / PHONE_COLUMN));
  const room = rule.maxHeight * screenHeight;
  const byHeight = naturalHeight > 0 ? room / naturalHeight : byWidth;
  return Math.max(rule.minZoom, Math.min(byWidth, byHeight));
}
