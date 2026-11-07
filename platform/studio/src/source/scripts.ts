import type { NumberedPage, Word } from "./read";

/**
 * Subscripts and superscripts (platform/docs/plans/tool-fixes.md, fix 5): H₂O, Fe₃O₄(s), Na⁺, 10⁻¹⁹.
 * The PDF prints a script as its own smaller piece, lowered or raised, often numbered as a line of its
 * own; pdf.js gives each piece's size and baseline, so which piece is a script is read, not guessed.
 * A run of pieces that touch, holding a script, is suggested as one reading, the script written in
 * Unicode. A script with anything but digits, + and −, or two stacked over each other (SO₄²⁻), is left
 * to the agent.
 */

/** A piece of the page's text as pdf.js gives it, in the page's top-down points. */
export type TextPiece = {
  str: string;
  x0: number;
  x1: number;
  top: number;
  baseline: number;
  size: number;
};

/** A script is at most this share of its base's size. */
const SMALLER = 0.8;
/** A script's baseline is this share of its base's size off the base's. */
const SHIFTED = 0.12;
/** A formula never holds Hindi: a run ends at it. */
const DEVANAGARI = /[\u0900-\u097F]/u;
/** Pieces this near (points) touch. */
const TOUCH = 1.2;
/** After a script the printer leaves a little more (Na⁺ then (aq): 1.6), still less than a space. */
const TOUCH_AFTER_SCRIPT = 2;

const SUB: Record<string, string> = {
  ...Object.fromEntries([..."0123456789"].map((d, i) => [d, String.fromCodePoint(0x2080 + i)])),
  "+": "₊",
  "-": "₋",
  "–": "₋",
  "−": "₋",
};
const SUPER: Record<string, string> = {
  ...Object.fromEntries([..."0123456789"].map((d, i) => [d, "⁰¹²³⁴⁵⁶⁷⁸⁹"[i] ?? d])),
  "+": "⁺",
  "-": "⁻",
  "–": "⁻",
  "−": "⁻",
};

/** A word's size and baseline: of the text pieces under its middle, the one it sits in most nearly. */
function measured(w: Word, pieces: readonly TextPiece[]): TextPiece | undefined {
  const [x, y] = [(w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2];
  const under = pieces.filter(
    (p) => x >= p.x0 - 0.5 && x <= p.x1 + 0.5 && y >= p.top - 1 && y <= p.baseline + p.size * 0.3,
  );
  const off = (p: TextPiece) =>
    Math.abs((p.top + p.baseline) / 2 - y) + Math.abs(p.size - (w.y1 - w.y0));
  return under.sort((a, b) => off(a) - off(b))[0];
}

/** A piece that only joins terms (+, =, →): it ends a run, unless it is a script (Na⁺). */
const OPERATOR = /^[+=→⟶−–-]+$/u;

/** A script's text in Unicode, or undefined when it holds anything Unicode can't raise or lower. */
function scripted(text: string, table: Record<string, string>): string | undefined {
  const out = [...text].map((c) => table[c]);
  return out.every((c) => c !== undefined) ? out.join("") : undefined;
}

/**
 * A script word in Unicode: each of the PDF's text pieces inside it by its own baseline, so "3–" in
 * NO₃⁻ (a lowered 3 and a raised minus, one word) comes out right; undefined when its pieces don't
 * spell the word, or one is neither lowered nor raised.
 */
function scriptOf(w: Word, base: TextPiece, pieces: readonly TextPiece[]): string | undefined {
  const inside = pieces
    .filter(
      (p) =>
        p.size <= base.size * SMALLER &&
        p.x0 < w.x1 - 0.2 &&
        p.x1 > w.x0 + 0.2 &&
        p.baseline > w.y0 - 1 &&
        p.top < w.y1 + 1,
    )
    .sort((a, b) => a.x0 - b.x0);
  if (inside.map((p) => p.str.replace(/\s+/g, "")).join("") !== w.text.replace(/\s+/g, ""))
    return undefined;
  const out = inside.map((p) => {
    const shift = p.baseline - base.baseline;
    if (Math.abs(shift) < base.size * SHIFTED) return undefined;
    return scripted(p.str.replace(/\s+/g, ""), shift > 0 ? SUB : SUPER);
  });
  return out.every((t) => t !== undefined) ? out.join("") : undefined;
}

/** One reading suggested for a run of touching pieces that holds a script. */
export type ScriptRun = { ids: string[]; pdf: string[]; reading: string };

/** Every run of a page that holds a script, its reading. */
export function scriptRuns(page: NumberedPage, pieces: readonly TextPiece[]): ScriptRun[] {
  type Piece = { id: string; word: Word; m?: TextPiece };
  const all: Piece[] = page.lines.flatMap((line, l) =>
    line.map((word, j) => {
      const m = measured(word, pieces);
      return { id: `L${l + 1}.${j + 1}`, word, ...(m === undefined ? {} : { m }) };
    }),
  );
  const byX = [...all].sort((a, b) => a.word.x0 - b.word.x0);
  const used = new Set<string>();
  const runs: ScriptRun[] = [];
  for (const start of all) {
    if (used.has(start.id) || start.m === undefined || DEVANAGARI.test(start.word.text)) continue;
    const base = start.m;
    // A run: pieces to the right, each touching the run's right edge, within the base's height.
    const run: Piece[] = [start];
    let right = start.word.x1;
    let afterScript = false;
    for (;;) {
      const reach: number = afterScript ? TOUCH_AFTER_SCRIPT : TOUCH;
      const next: Piece | undefined = byX.find(
        (p) =>
          !run.includes(p) &&
          !used.has(p.id) &&
          p.word.x0 >= right - TOUCH &&
          p.word.x0 <= right + reach &&
          (p.word.y0 + p.word.y1) / 2 >= base.top - base.size * 0.4 &&
          (p.word.y0 + p.word.y1) / 2 <= base.baseline + base.size * 0.4,
      );
      if (next === undefined || DEVANAGARI.test(next.word.text)) break;
      const small: boolean = next.m !== undefined && next.m.size <= base.size * SMALLER;
      if (OPERATOR.test(next.word.text) && !small) break;
      run.push(next);
      afterScript = small && next.word.x1 >= right;
      right = Math.max(right, next.word.x1);
    }
    const isScript = (p: Piece) => p.m !== undefined && p.m.size <= base.size * SMALLER;
    if (run.length < 2 || !run.some(isScript)) continue;
    // A script with another over or under it (SO₄²⁻, in the run or not): the agent's.
    const scripts = run.filter(isScript);
    const overlaps = (a: Piece, b: Piece) =>
      a.word.x0 < b.word.x1 - 0.5 && b.word.x0 < a.word.x1 - 0.5;
    const stacked = scripts.some((a) =>
      all.some(
        (b) =>
          b !== a &&
          b.m !== undefined &&
          b.m.size <= base.size * SMALLER &&
          overlaps(a, b) &&
          Math.abs((b.word.y0 + b.word.y1) / 2 - (a.word.y0 + a.word.y1) / 2) < base.size,
      ),
    );
    // A script over the middle of a word (CHCOONa with its 3 inside): no reading of whole words
    // can place it, so the agent's.
    const inside = scripts.some((a) =>
      all.some(
        (b) =>
          b.m !== undefined &&
          b.m.size > base.size * SMALLER &&
          a.word.x0 > b.word.x0 + 0.5 &&
          a.word.x1 < b.word.x1 - 0.5 &&
          Math.abs((b.word.y0 + b.word.y1) / 2 - (a.word.y0 + a.word.y1) / 2) < base.size,
      ),
    );
    if (stacked || inside) continue;
    const parts = run.map((p) => (isScript(p) ? scriptOf(p.word, base, pieces) : p.word.text));
    if (parts.some((t) => t === undefined)) continue;
    for (const p of run) used.add(p.id);
    runs.push({
      ids: run.map((p) => p.id),
      pdf: run.map((p) => p.word.text),
      reading: parts.join(""),
    });
  }
  return runs;
}
