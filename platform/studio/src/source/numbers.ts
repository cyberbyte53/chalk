import { Locale } from "@chalk/content";
import { ItemKind } from "./schema";

/**
 * The book's own numbers: what each language prints before the number of a figure, a table, an
 * example, an activity and an exercise. Languages are matched by a number's kind and digits
 * (`figure 3.11`), never its words. A question's number is written `Q1`; a section's is its digits.
 */
export const NUMBER_WORDS: Readonly<Record<Locale, Readonly<Partial<Record<ItemKind, string[]>>>>> =
  {
    [Locale.En]: {
      [ItemKind.Figure]: ["Fig.", "Figure"],
      [ItemKind.Table]: ["Table"],
      [ItemKind.Example]: ["Example"],
      [ItemKind.Activity]: ["Activity"],
      [ItemKind.Exercise]: ["Exercise"],
    },
    [Locale.Hi]: {
      [ItemKind.Figure]: ["आकृति"],
      [ItemKind.Table]: ["सारणी"],
      [ItemKind.Example]: ["उदाहरण"],
      [ItemKind.Activity]: ["क्रियाकलाप"],
      [ItemKind.Exercise]: ["प्रश्नावली"],
    },
  };

/** A number's kind and digits: `figure 3.11`. What languages are matched by. */
export type BookNumber = { kind: ItemKind; digits: string };

export const numberKey = (n: BookNumber): string => `${n.kind} ${n.digits}`;

/** Devanagari digits as ASCII ones (the Hindi book may print either). */
export const asciiDigits = (s: string): string =>
  s.replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966));

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** `Fig. 3.11` → figure 3.11; `Q1` → question 1; `3.2` → section 3.2; else undefined. */
export function parseNumber(lang: Locale, printed: string): BookNumber | undefined {
  const s = asciiDigits(printed.trim());
  const q = /^Q(\d+)$/.exec(s);
  if (q?.[1] !== undefined) return { kind: ItemKind.Question, digits: q[1] };
  if (/^\d+(\.\d+)*$/.test(s)) return { kind: ItemKind.Section, digits: s };
  for (const [kind, words] of Object.entries(NUMBER_WORDS[lang]) as [ItemKind, string[]][])
    for (const word of words) {
      const m = new RegExp(`^${escapeRegex(word)}\\s*(\\d+(?:\\.\\d+)*)$`, "iu").exec(s);
      if (m?.[1] !== undefined) return { kind, digits: m[1] };
    }
  return undefined;
}

/** Every number a page's text prints after the language's own words, in the order printed. */
export function scanNumbers(lang: Locale, text: string): BookNumber[] {
  const kindOf = new Map<string, ItemKind>();
  for (const [kind, words] of Object.entries(NUMBER_WORDS[lang]) as [ItemKind, string[]][])
    for (const word of words) kindOf.set(word.toLowerCase(), kind);
  const words = [...kindOf.keys()].sort((a, b) => b.length - a.length).map(escapeRegex);
  // Not inside a word ("Figures" isn't "Figure"); the number may follow with no space ("Fig.3.10").
  const scan = new RegExp(`(?<![\\p{L}\\p{M}])(${words.join("|")})\\s*(\\d+(?:\\.\\d+)*)`, "giu");
  return [...asciiDigits(text).matchAll(scan)].flatMap((m) => {
    const kind = kindOf.get((m[1] ?? "").toLowerCase());
    return kind === undefined || m[2] === undefined ? [] : [{ kind, digits: m[2] }];
  });
}
