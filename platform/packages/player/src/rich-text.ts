import katex from "katex";
// Registers \ce{…} (chemistry) and \pu{…} (physical units) with KaTeX.
import "katex/contrib/mhchem";
import { type OwnMarkup, ours } from "./own-markup";

/**
 * Rich text: what every learner-facing string may hold beyond plain words. Deliberately small:
 * `**bold**`, `*emphasis*`, `$inline maths$` and `$$display maths$$` (LaTeX, rendered by KaTeX).
 * Layout (headings, lists) belongs to the board, not to a sentence. `\$` is a literal dollar.
 */
export const SpanKind = {
  Text: "text",
  Bold: "bold",
  Emphasis: "emphasis",
  Math: "math",
  DisplayMath: "displayMath",
} as const;
export type SpanKind = (typeof SpanKind)[keyof typeof SpanKind];

export type Span = {
  kind: SpanKind;
  text: string;
  /** Inline maths only: punctuation right after it ("." "," "।"), kept on its line. */
  trailing?: string;
};

/** Punctuation that must not wrap away from the formula before it. */
const TRAILING = /^[.,;:!?।)\]’”]+/;

export type Parsed = { spans: Span[]; problems: string[] };

const DOLLAR = "$";
const STAR = "*";

/** Splits rich text into spans. Never throws: an unclosed marker is reported and kept as text. */
export function parseRich(source: string): Parsed {
  const spans: Span[] = [];
  const problems: string[] = [];
  let text = "";
  const flush = () => {
    if (text !== "") spans.push({ kind: SpanKind.Text, text });
    text = "";
  };
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch === "\\" && source[i + 1] === DOLLAR) {
      text += DOLLAR;
      i += 2;
      continue;
    }
    if (ch === DOLLAR) {
      const isDisplay = source[i + 1] === DOLLAR;
      const open = isDisplay ? "$$" : DOLLAR;
      const close = findClose(source, i + open.length, open);
      if (close === -1) {
        problems.push(`"${open}" at ${i} is never closed`);
        text += source.slice(i);
        break;
      }
      const math = source.slice(i + open.length, close).trim();
      if (math === "") problems.push(`empty maths at ${i}`);
      flush();
      spans.push({ kind: isDisplay ? SpanKind.DisplayMath : SpanKind.Math, text: math });
      i = close + open.length;
      continue;
    }
    if (ch === STAR) {
      const isBold = source[i + 1] === STAR;
      const open = isBold ? "**" : STAR;
      const close = findClose(source, i + open.length, open);
      if (close === -1 || close === i + open.length) {
        // A lone star (a multiplication, a footnote) is just a star.
        text += open;
        i += open.length;
        continue;
      }
      flush();
      // The words inside take the style; maths inside stays maths ("**If** $p$ **divides…**" and
      // "**If $p$ divides…**" read the same).
      const kind = isBold ? SpanKind.Bold : SpanKind.Emphasis;
      const inner = source.slice(i + open.length, close);
      if (inner.includes(DOLLAR)) {
        const nested = parseRich(inner);
        problems.push(...nested.problems);
        for (const span of nested.spans)
          spans.push(span.kind === SpanKind.Text ? { ...span, kind } : span);
      } else {
        spans.push({ kind, text: inner });
      }
      i = close + open.length;
      continue;
    }
    text += ch;
    i++;
  }
  flush();
  return { spans: glueTrailing(spans), problems };
}

/** Moves punctuation that follows inline maths onto the maths span, so a line never starts with it. */
function glueTrailing(spans: Span[]): Span[] {
  const out: Span[] = [];
  for (const span of spans) {
    const before = out.at(-1);
    const isWords =
      span.kind === SpanKind.Text || span.kind === SpanKind.Bold || span.kind === SpanKind.Emphasis;
    if (isWords && before?.kind === SpanKind.Math && before.trailing === undefined) {
      const trailing = TRAILING.exec(span.text)?.[0];
      if (trailing !== undefined) {
        before.trailing = trailing;
        const rest = span.text.slice(trailing.length);
        if (rest !== "") out.push({ ...span, text: rest });
        continue;
      }
    }
    out.push(span);
  }
  return out;
}

/** The next `marker` at or after `from` that isn't escaped (for `*`, not part of `**`). */
function findClose(source: string, from: number, marker: string): number {
  for (let j = from; j <= source.length - marker.length; j++) {
    if (source[j - 1] === "\\") continue;
    if (source.startsWith(marker, j)) {
      if (marker === STAR && source[j + 1] === STAR) {
        j++;
        continue;
      }
      return j;
    }
  }
  return -1;
}

/** Formulas kept rendered. A drag through many values would grow it forever, so the oldest go. */
const CACHE_SIZE = 500;
const cache = new Map<string, string>();

/** KaTeX's HTML for one formula, cached. Broken maths renders as KaTeX's red error text. */
export function mathHtml(math: string, isDisplay: boolean): OwnMarkup {
  const key = `${isDisplay ? "D" : "I"}${math}`;
  let html = cache.get(key);
  if (html === undefined) {
    html = katex.renderToString(math, {
      displayMode: isDisplay,
      throwOnError: false,
      output: "htmlAndMathml",
    });
    const oldest = cache.keys().next();
    if (cache.size >= CACHE_SIZE && oldest.done !== true) cache.delete(oldest.value);
  } else cache.delete(key); // re-inserted below: a Map keeps insertion order, so this marks it recent
  cache.set(key, html);
  // KaTeX made it, from a formula that passed the build's maths check.
  return ours(html);
}

/** Everything wrong with a rich string: unclosed markers, and maths KaTeX can't typeset. For the validator. */
export function richProblems(source: string): string[] {
  const { spans, problems } = parseRich(source);
  for (const span of spans) {
    if (span.kind !== SpanKind.Math && span.kind !== SpanKind.DisplayMath) continue;
    try {
      katex.renderToString(span.text, {
        displayMode: span.kind === SpanKind.DisplayMath,
        throwOnError: true,
      });
    } catch (error) {
      problems.push(
        `$${span.text}$: ${error instanceof Error ? error.message.replace(/^KaTeX parse error: /, "") : String(error)}`,
      );
    }
  }
  return problems;
}

/** LaTeX commands read as one symbol. */
const SYMBOL: Readonly<Record<string, string>> = {
  times: "×",
  div: "÷",
  cdot: "·",
  pm: "±",
  ne: "≠",
  neq: "≠",
  le: "≤",
  leq: "≤",
  ge: "≥",
  geq: "≥",
  approx: "≈",
  pi: "π",
  infty: "∞",
  dots: "…",
  ldots: "…",
  cdots: "…",
  Rightarrow: "⇒",
  rightarrow: "→",
  to: "→",
  in: "∈",
  mid: "|",
  degree: "°",
  circ: "°",
};
/** Commands that only space or size things: read as a space, or nothing. */
const SPACING = new Set(["quad", "qquad", ",", ";", ":", "!", " "]);
const SILENT = new Set(["left", "right", "displaystyle", "big", "Big", "bigg", "Bigg"]);
const SUPERSCRIPT: Readonly<Record<string, string>> = {
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
  n: "ⁿ",
  "+": "⁺",
  "-": "⁻",
};

/** Maths written as a line of plain text a screen reader can read: `\frac{3}{8}` → "3/8", `\sqrt{2}` → "√2". */
export function mathText(latex: string): string {
  let i = 0;
  /** A group in braces, or one token. */
  const group = (): string => {
    while (latex[i] === " ") i++;
    if (latex[i] === "{") {
      i++;
      let out = "";
      while (i < latex.length && latex[i] !== "}") out += token();
      i++;
      return out;
    }
    return token();
  };
  /** Wraps anything longer than a single number or letter in brackets, so "a/b" stays unambiguous. */
  const bracket = (s: string) => (/^[\w.√]+$/.test(s.trim()) ? s.trim() : `(${s.trim()})`);
  const token = (): string => {
    const ch = latex[i];
    if (ch === undefined) return "";
    if (ch === "\\") {
      const name = /^[A-Za-z]+/.exec(latex.slice(i + 1))?.[0] ?? latex[i + 1] ?? "";
      i += 1 + name.length;
      if (name === "frac" || name === "dfrac" || name === "tfrac") {
        const top = group();
        return `${bracket(top)}/${bracket(group())}`;
      }
      if (name === "sqrt") return `√${bracket(group())}`;
      if (name === "text" || name === "mathrm" || name === "textbf" || name === "mathbf")
        return group();
      if (name === "overline") return `${group()} repeating`;
      if (SPACING.has(name)) return " ";
      if (SILENT.has(name)) return "";
      return SYMBOL[name] ?? name;
    }
    i++;
    if (ch === "^") {
      const power = group();
      const raised = [...power].map((c) => SUPERSCRIPT[c]);
      return raised.every((c) => c !== undefined) ? raised.join("") : `^(${power})`;
    }
    if (ch === "_") return group();
    if (ch === "{") {
      i--;
      return group();
    }
    if (ch === "}") return "";
    if (ch === "~") return " ";
    return ch;
  };
  let out = "";
  while (i < latex.length) out += token();
  return out.replace(/\s+/g, " ").trim();
}

/** Rich text as plain text: markers dropped, maths written out (for an `aria-label`). */
export function plainText(source: string): string {
  return parseRich(source)
    .spans.map((span) =>
      span.kind === SpanKind.Math || span.kind === SpanKind.DisplayMath
        ? `${mathText(span.text)}${span.trailing ?? ""}`
        : span.text,
    )
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}
