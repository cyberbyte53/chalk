import { type Locale, saidOf } from "@chalk/content";
import { SpanKind, parseRich } from "./rich-text";

/**
 * Rich text, said aloud: the same pieces the screen draws (rich-text.ts), each as words. Beside the
 * screen's reading and the plain one (`plainText`), so one parser decides what every piece is, and
 * a new kind of piece doesn't compile until it is said here too.
 *
 * - Words, bold and emphasis: their words, as written (the style is how the screen stresses them).
 * - Maths: never turned into words here. A maths reader (given by whoever reads: the build has one,
 *   the phone doesn't) may draft its words; a draft is a suggestion for the line's spoken words,
 *   which a person writes.
 */

/** Drafts maths (LaTeX) as words in a language, or undefined when it can't. */
export type MathsReader = (latex: string, locale: Locale) => string | undefined;

/** A piece of a line as said. */
export type SaidPiece =
  | { kind: "words"; text: string }
  | { kind: "maths"; latex: string; draft: string | undefined };

export type RichSpeech = {
  pieces: SaidPiece[];
  /** The rich text didn't read cleanly (an unclosed marker): its words can't be trusted. */
  problems: string[];
};

export function richSpeech(source: string, locale: Locale, readMaths?: MathsReader): RichSpeech {
  const { spans, problems } = parseRich(saidOf(source));
  const pieces: SaidPiece[] = [];
  for (const span of spans) {
    switch (span.kind) {
      case SpanKind.Text:
      case SpanKind.Bold:
      case SpanKind.Emphasis:
        pieces.push({ kind: "words", text: span.text });
        break;
      case SpanKind.Math:
      case SpanKind.DisplayMath:
        pieces.push({ kind: "maths", latex: span.text, draft: readMaths?.(span.text, locale) });
        if (span.trailing !== undefined) pieces.push({ kind: "words", text: span.trailing });
        break;
      default: {
        // A new kind of piece: say here how it is said, or it can't be heard.
        const unsaid: never = span.kind;
        throw new Error(`rich text: no way to say a "${String(unsaid)}" piece`);
      }
    }
  }
  return { pieces, problems };
}
