import katex from "katex";
// Registers \ce{…} (chemistry) and \pu{…} (physical units) with KaTeX.
import "katex/contrib/mhchem";

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
      spans.push({
        kind: isBold ? SpanKind.Bold : SpanKind.Emphasis,
        text: source.slice(i + open.length, close),
      });
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
    if (span.kind === SpanKind.Text && before?.kind === SpanKind.Math) {
      const trailing = TRAILING.exec(span.text)?.[0];
      if (trailing !== undefined) {
        before.trailing = trailing;
        const rest = span.text.slice(trailing.length);
        if (rest !== "") out.push({ kind: SpanKind.Text, text: rest });
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
export function mathHtml(math: string, isDisplay: boolean): string {
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
  return html;
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
