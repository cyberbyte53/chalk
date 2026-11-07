import { spanForms } from "./candidates";
import { isKnownWord } from "./list";

/**
 * Repairing a Hindi span (platform/docs/plans/sources.md, "Hindi repaired"): when exactly one of its
 * candidates has every word in the word list, that is the reading; otherwise the span is left for
 * the agent, with why.
 */

/** Why a span is left unrepaired. */
export const Left = {
  /** More than one candidate is all real words: the agent picks, from the page's image. */
  Several: "several",
  /** No candidate is: a word the list lacks, or letters the PDF lost. */
  None: "none",
} as const;
export type Left = (typeof Left)[keyof typeof Left];

export type Repair =
  | { reading: string }
  | {
      left: typeof Left.Several;
      /** A few of the real readings. */
      readings: string[];
    }
  | {
      left: typeof Left.None;
      /**
       * The candidate with the fewest words the list lacks (the shortest of those), and those
       * words; no candidate at all
       * when no reading of the PDF's letters is well-formed (letters lost, or not Unicode).
       */
      nearest?: string;
      unknown: string[];
    };

/** The runs of Devanagari letters in a word, the parts judged: `(कोशिका-भित्ति)` → कोशिका, भित्ति. */
const parts = (word: string): string[] => word.match(/[\u0900-\u0963\u0971-\u097F]+/gu) ?? [];

/** The words of a form the list lacks (none: every part is a real word, or it has no Hindi). */
const unknownIn = (form: string, isWord: (w: string) => boolean) =>
  parts(form).filter((p) => !isWord(p));

/**
 * Repairs a span (the PDF's words, as its text layer gives them), read as one word: its pieces all
 * joined. A space between two of its pieces may be the PDF's stray one or the book's own, and the
 * list can't tell which (it lacks names and compounds: कै मिलो for कैमिलो would be two real words), so
 * a reading that keeps one is the agent's. `isWord` is the word list: by default the Hindi list and the words
 * agents answered as real in any book.
 */
export function repair(
  span: readonly string[],
  isWord: (w: string) => boolean = isKnownWord,
): Repair {
  const s = spanForms(span);
  const forms = s.forms(0, s.pieces.length);
  const real = forms.filter((f) => unknownIn(f, isWord).length === 0);
  if (real.length === 1) return { reading: real[0] ?? "" };
  if (real.length > 1) return { left: Left.Several, readings: real.slice(0, 5) };
  const scored = forms.map((f) => ({ f, unknown: unknownIn(f, isWord) }));
  const near = scored.reduce<(typeof scored)[number] | undefined>(
    (best, x) =>
      best === undefined ||
      x.unknown.length < best.unknown.length ||
      (x.unknown.length === best.unknown.length && x.f.length < best.f.length)
        ? x
        : best,
    undefined,
  );
  if (near === undefined) return { left: Left.None, unknown: [] };
  return { left: Left.None, nearest: near.f, unknown: near.unknown };
}
