import { type BoardKit, column, space, t } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";

/** One fixed question: a prompt, the right label, and wrong labels each with what it missed. */
export type Item = {
  prompt: Localized;
  right: Localized;
  wrong: readonly { label: Localized; feedback: Localized }[];
};

/** Builds a fixed question's board: the options shuffled the same way every build. */
export function itemBoard(b: BoardKit, item: Item, seed: number) {
  const options: Option[] = [
    { id: "right", label: item.right },
    ...item.wrong.map((w, i) => ({ id: `wrong${i + 1}`, label: w.label, feedback: w.feedback })),
  ];
  const ask = choiceQuestion(b, {
    prompt: item.prompt,
    options: settle(options, seed),
    answer: "right",
  });
  return column([ask, space()]);
}

/**
 * A calculation question: the right number and the numbers common slips give, each with what it
 * missed. A slip that lands on the right answer (or on another slip) is dropped.
 */
export function numericBoard(
  b: BoardKit,
  spec: {
    prompt: Localized;
    unit: string;
    right: number;
    wrong: readonly { value: number; feedback: Localized }[];
  },
  seed: number,
) {
  const seen = new Set([fmt(spec.right)]);
  const wrong = spec.wrong.filter((w) => {
    const label = fmt(w.value);
    if (seen.has(label) || !Number.isFinite(w.value)) return false;
    seen.add(label);
    return true;
  });
  return itemBoard(
    b,
    {
      prompt: spec.prompt,
      right: withUnit(spec.right, spec.unit),
      wrong: wrong.map((w) => ({ label: withUnit(w.value, spec.unit), feedback: w.feedback })),
    },
    seed,
  );
}

/** A number written the way the lessons write it: at most 3 significant figures, no trailing zeros. */
export function fmt(n: number): string {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e5 || abs < 1e-3) {
    const exp = Math.floor(Math.log10(abs));
    const mant = Number((n / 10 ** exp).toPrecision(3));
    return `${mant} × 10${superscript(exp)}`;
  }
  return String(Number(n.toPrecision(3)));
}

const SUPERSCRIPT: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};
function superscript(n: number): string {
  return String(n)
    .split("")
    .map((c) => SUPERSCRIPT[c] ?? c)
    .join("");
}

/** A number with its unit, the same in both languages. */
export const withUnit = (n: number, unit: string): Localized => {
  const text = unit === "" ? fmt(n) : `${fmt(n)} ${unit}`;
  return t(text, text);
};

/** A seed from a word, so each question shuffles its own way. */
export const seedOf = (word: string) =>
  [...word].reduce((total, c, i) => total + c.charCodeAt(0) * (i + 1), 0);
