import type { Locale, Localized } from "@chalk/content";

/** The prop's own words on its buttons and lines, in both languages. */
export const WORDS = {
  cross: { en: "Cross", hi: "संकरण करो" },
  crossChosen: { en: "Cross these two", hi: "इन दोनों का संकरण" },
  pickTwo: { en: "Tap two plants to cross", hi: "संकरण के लिए दो पौधे चुनो" },
  startAgain: { en: "Start again", hi: "फिर से" },
  tall: { en: "tall", hi: "लंबा" },
  short: { en: "short", hi: "बौना" },
  /** In a count: "3 tall : 1 short". */
  talls: { en: "tall", hi: "लंबे" },
  shorts: { en: "short", hi: "बौने" },
  allTall: { en: "all tall", hi: "सभी लंबे" },
  allShort: { en: "all short", hi: "सभी बौने" },
  crossOf: { en: "Mendel's pea plants: a cross", hi: "मेंडल के मटर के पौधे: एक संकरण" },
} satisfies Record<string, Localized>;

export const word = (w: Localized, locale: Locale): string => w[locale];

/** A generation's name, as the book writes it: P, then F1, F2, … */
export const generationName = (n: number): string => (n === 0 ? "P" : `F${n}`);

/** The children counted, as the book writes it: "3 tall : 1 short", or "all tall". */
export function ratioWords(tall: number, short: number, locale: Locale): string {
  if (short === 0) return word(WORDS.allTall, locale);
  if (tall === 0) return word(WORDS.allShort, locale);
  return `${tall} ${word(WORDS.talls, locale)} : ${short} ${word(WORDS.shorts, locale)}`;
}
