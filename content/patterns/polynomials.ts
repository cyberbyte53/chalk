import { t } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { niceNumber } from "@chalk/prop-polynomials";
import nerdamer from "nerdamer";
import type { Option } from "./choice-question";

/** Coefficients written in a params row, highest power first: "1 -3 -4" → [1, −3, −4]. */
export function parsePoly(written: string): number[] {
  const out = written.trim().split(/\s+/).map(Number);
  if (out.some((c) => !Number.isFinite(c)))
    throw new Error(`parsePoly: "${written}" is not a list of numbers`);
  return out;
}

/** Zeroes in maths, smallest first: "$-1$ and $4$", "$-\sqrt{2}$, $1$ and $\sqrt{2}$". */
export function zeroesLabel(zeroes: readonly number[]): Localized {
  // Smallest first, so the same zeroes always read the same: "−√3 and √3", never also "√3 and −√3".
  const tex = [...zeroes].sort((a, b) => a - b).map((z) => `$${niceNumber(z).tex}$`);
  if (tex.length <= 1) return t(tex[0] ?? "", tex[0] ?? "");
  const head = tex.slice(0, -1).join(", ");
  const last = tex.at(-1) ?? "";
  return t(`${head} and ${last}`, `${head} और ${last}`);
}

/**
 * The right option first, then wrong ones whose label differs from every label before it (a wrong
 * rule can land on the right answer for some rows), at most `max` in all.
 */
export function distinctOptions(right: Option, wrong: readonly Option[], max = 3): Option[] {
  const out: Option[] = [right];
  for (const o of wrong) {
    if (out.length >= max) break;
    if (out.some((x) => x.label.en === o.label.en)) continue;
    out.push(o);
  }
  if (out.length < 2)
    throw new Error(`distinctOptions: only one distinct option for ${right.label.en}`);
  return out;
}

/** A nerdamer expression's value as a number: "sqrt(2)" → 1.414…, "1/4" → 0.25. */
export function numberOf(expression: string): number {
  const text = nerdamer(expression).evaluate().text();
  const [top, bottom] = text.split("/");
  const value = bottom === undefined ? Number(top) : Number(top) / Number(bottom);
  if (!Number.isFinite(value)) throw new Error(`numberOf: "${expression}" is not a number`);
  return value;
}

/** A nerdamer expression written the book's way: "sqrt(5/3)" → \frac{\sqrt{15}}{3}. */
export function exprTex(expression: string): string {
  return niceNumber(numberOf(expression)).tex;
}
