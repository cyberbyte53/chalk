import type { Locale, Localized } from "@chalk/content";
import { ImageCase, MirrorKind } from "./mirror";

/** The prop's own words, in both languages: the textbook's table (NCERT Class 10, Table 9.1). */
export const WORDS = {
  concave: { en: "Concave", hi: "अवतल" },
  convex: { en: "Convex", hi: "उत्तल" },
  real: { en: "real", hi: "वास्तविक" },
  virtual: { en: "virtual", hi: "आभासी" },
  inverted: { en: "inverted", hi: "उल्टा" },
  erect: { en: "erect", hi: "सीधा" },
  diminished: { en: "diminished", hi: "छोटा" },
  sameSize: { en: "same size", hi: "समान साइज़" },
  enlarged: { en: "enlarged", hi: "बड़ा" },
  highlyEnlarged: { en: "highly enlarged", hi: "बहुत बड़ा" },
  infinity: { en: "∞", hi: "∞" },
  mirror: { en: "mirror", hi: "दर्पण" },
} satisfies Record<string, Localized>;

/** Where the object is, for each case. */
export const PLACE_WORDS: Record<ImageCase, Localized> = {
  [ImageCase.BeyondC]: { en: "Object beyond C", hi: "वस्तु C से परे" },
  [ImageCase.AtC]: { en: "Object at C", hi: "वस्तु C पर" },
  [ImageCase.BetweenCAndF]: { en: "Object between C and F", hi: "वस्तु C और F के बीच" },
  [ImageCase.AtF]: { en: "Object at F", hi: "वस्तु F पर" },
  [ImageCase.BetweenFAndP]: { en: "Object between F and P", hi: "वस्तु F और P के बीच" },
  [ImageCase.Convex]: { en: "Object in front of the mirror", hi: "वस्तु दर्पण के सामने" },
};

/** Where the image forms, for each case. */
export const WHERE_WORDS: Record<ImageCase, Localized> = {
  [ImageCase.BeyondC]: { en: "image between F and C", hi: "प्रतिबिंब F और C के बीच" },
  [ImageCase.AtC]: { en: "image at C", hi: "प्रतिबिंब C पर" },
  [ImageCase.BetweenCAndF]: { en: "image beyond C", hi: "प्रतिबिंब C से परे" },
  [ImageCase.AtF]: { en: "image at infinity", hi: "प्रतिबिंब अनंत पर" },
  [ImageCase.BetweenFAndP]: { en: "image behind the mirror", hi: "प्रतिबिंब दर्पण के पीछे" },
  [ImageCase.Convex]: {
    en: "image behind the mirror, between P and F",
    hi: "प्रतिबिंब दर्पण के पीछे, P और F के बीच",
  },
};

/** What the image is, for each case: real or virtual, inverted or erect, its size. */
export const NATURE: Record<ImageCase, readonly Localized[]> = {
  [ImageCase.BeyondC]: [WORDS.real, WORDS.inverted, WORDS.diminished],
  [ImageCase.AtC]: [WORDS.real, WORDS.inverted, WORDS.sameSize],
  [ImageCase.BetweenCAndF]: [WORDS.real, WORDS.inverted, WORDS.enlarged],
  [ImageCase.AtF]: [WORDS.real, WORDS.inverted, WORDS.highlyEnlarged],
  [ImageCase.BetweenFAndP]: [WORDS.virtual, WORDS.erect, WORDS.enlarged],
  [ImageCase.Convex]: [WORDS.virtual, WORDS.erect, WORDS.diminished],
};

export const KIND_WORDS: Record<MirrorKind, Localized> = {
  [MirrorKind.Concave]: WORDS.concave,
  [MirrorKind.Convex]: WORDS.convex,
};

export const word = (w: Localized, locale: Locale): string => w[locale];

/** The case in one line: "Object beyond C · image between F and C: real, inverted, diminished". */
export function caseLine(c: ImageCase, locale: Locale): string {
  const nature = NATURE[c].map((w) => word(w, locale)).join(", ");
  return `${word(PLACE_WORDS[c], locale)} · ${word(WHERE_WORDS[c], locale)}: ${nature}`;
}

/** A signed number of cm as the book writes it: "−35", "+7.5" (one decimal, a true minus). */
export function signed(v: number): string {
  const r = Math.round(v * 10) / 10;
  if (r === 0) return "0";
  return r < 0 ? `−${-r}` : `+${r}`;
}
