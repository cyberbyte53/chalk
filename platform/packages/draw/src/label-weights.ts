/**
 * What a label's place costs: every weight the placing uses, in one place
 * (platform/docs/plans/label-placement.md). The numbers are not free knobs: what matters is their
 * order, and `weightRules` says it (a test holds the weights to it). Change one, then run the label
 * audit over a chapter before and after (platform/studio/src/mcp/label-compare.ts): a weight that
 * breaks an order once put Riya's name across an axis to keep it off a word it only came near.
 */
export const LABEL_WEIGHTS = {
  /** A label's words on another label's. */
  onLabel: 1,
  /** On a word or a dot: what is read, covered. */
  onMark: 1,
  /** Across a line (an axis, a dashed guide): still read, the line passing behind the words. */
  onLine: 0.1,
  /** Its middle nearer another label's thing than its own: it reads as that one's. */
  nearerAnother: 2,
  /** Any part of it outside the picture: cut off. */
  offPicture: 100,
  /**
   * Only near a thing (within the label's gap, not on it), as a share of being on it: a little
   * worse than clear, always better than on anything.
   */
  near: 0.05,
} as const;

export type LabelWeights = typeof LABEL_WEIGHTS;

/** The orders the weights must keep, each with why; a broken one is named. */
export function weightRules(w: { readonly [K in keyof LabelWeights]: number }): string[] {
  const broken: string[] = [];
  const rule = (holds: boolean, why: string) => {
    if (!holds) broken.push(why);
  };
  rule(w.near > 0 && w.near < 1, "near is a share of on: more than nothing, less than all");
  rule(
    w.near * Math.max(w.onLabel, w.onMark) < w.onLine,
    "near a word or label costs less than across a line (else a label crosses an axis to keep off a word it only comes near)",
  );
  rule(w.onLine < w.onMark, "across a line costs less than on a word or dot");
  rule(w.onMark <= w.onLabel, "on another label costs at least as much as on a word");
  rule(
    w.nearerAnother > w.onMark,
    "reading as another's costs more than covering a word (the pair names the wrong dot)",
  );
  rule(
    w.offPicture > 10 * (w.onLabel + w.onMark + w.nearerAnother),
    "off the picture costs more than any likely pile of clashes",
  );
  return broken;
}
