/**
 * Where a line of text may not break, on screen (a typesetter's rule, not the words'): a number
 * stays with a short word after it ("5 cm"), a word with the number after it ("Street 4", "पंक्ति 3"),
 * a pair's two numbers together ("(2, 5)"), and "…" with what is before it. The words stay as written; only these spaces become no-break
 * spaces, as text is drawn. (A voice is given plain spaces whatever the screen does.)
 */

const NO_BREAK = " ";

/** A number, then a space, then a word of up to three letters (a unit: cm, kg, km, ml). */
const NUMBER_UNIT = /(\d) (?=[\p{L}\p{M}]{1,3}(?![\p{L}\p{M}]))/gu;
/** A word, then a space, then a number. */
const WORD_NUMBER = /([\p{L}\p{M}]) (?=[−-]?\d)/gu;
/** A number, a comma, a space, a number: a pair's ("(2, 5)"). */
const PAIR = /(\d,) (?=[−-]?\d)/g;
/** A space before "…". */
const BEFORE_ELLIPSIS = / (?=…)/g;

export function keepTogether(text: string): string {
  return text
    .replace(NUMBER_UNIT, `$1${NO_BREAK}`)
    .replace(WORD_NUMBER, `$1${NO_BREAK}`)
    .replace(PAIR, `$1${NO_BREAK}`)
    .replace(BEFORE_ELLIPSIS, NO_BREAK);
}

/**
 * The same across pieces drawn apart (plain, then **bold**): a piece ending in a space before a piece
 * that starts with a number ("at **0**") keeps them together too.
 */
export function joinsNext(text: string, next: string | undefined): string {
  return next !== undefined && /[\p{L}\p{M}] $/u.test(text) && /^[−-]?\d/.test(next)
    ? `${text.slice(0, -1)}${NO_BREAK}`
    : text;
}
