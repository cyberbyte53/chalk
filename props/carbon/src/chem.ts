/**
 * The little chemistry every carbon prop shares: the elements NCERT Chapter 4 uses, their valence
 * electrons and valency, and atomic masses (C 12 u, H 1 u, as NCERT gives them).
 */

export const Element = {
  H: "H",
  C: "C",
  N: "N",
  O: "O",
  F: "F",
  S: "S",
  Cl: "Cl",
  Br: "Br",
} as const;
export type Element = (typeof Element)[keyof typeof Element];

type ElementFacts = {
  /** Electrons in the outermost shell. */
  valence: number;
  /** How many bonds it makes (its combining capacity). */
  valency: number;
  /** Atomic mass, u. */
  mass: number;
  /** Electrons in a full outer shell: 2 for hydrogen (like helium), 8 for the rest. */
  full: number;
  /** The shells, K L M …, for the electronic configuration. */
  shells: readonly number[];
};

export const ELEMENTS: Readonly<Record<Element, ElementFacts>> = {
  H: { valence: 1, valency: 1, mass: 1, full: 2, shells: [1] },
  C: { valence: 4, valency: 4, mass: 12, full: 8, shells: [2, 4] },
  N: { valence: 5, valency: 3, mass: 14, full: 8, shells: [2, 5] },
  O: { valence: 6, valency: 2, mass: 16, full: 8, shells: [2, 6] },
  F: { valence: 7, valency: 1, mass: 19, full: 8, shells: [2, 7] },
  S: { valence: 6, valency: 2, mass: 32, full: 8, shells: [2, 8, 6] },
  Cl: { valence: 7, valency: 1, mass: 35.5, full: 8, shells: [2, 8, 7] },
  Br: { valence: 7, valency: 1, mass: 80, full: 8, shells: [2, 8, 18, 7] },
};

/** Counts of each element in a molecule. */
export type Counts = Partial<Record<Element, number>>;

/** Molecular mass in u, from the atomic masses above. */
export function massOf(counts: Counts): number {
  let total = 0;
  for (const [el, n] of Object.entries(counts) as [Element, number][]) {
    total += ELEMENTS[el].mass * n;
  }
  return Math.round(total * 10) / 10;
}

/** Digits as subscripts: "C2H6" → "C₂H₆". */
export function subscript(formula: string): string {
  const map: Record<string, string> = {
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "₈",
    "9": "₉",
  };
  return formula.replace(/\d/g, (d) => map[d] ?? d);
}

/** "C" 1 → "C", "H" 6 → "H6", 0 → "". */
export const part = (el: string, n: number): string => (n === 0 ? "" : n === 1 ? el : `${el}${n}`);

/** The chain-length stems NCERT names compounds from (Table 4.2). */
export const STEMS = ["meth", "eth", "prop", "but", "pent", "hex"] as const;
export const HINDI_STEMS = ["मेथ", "एथ", "प्रोप", "ब्यूट", "पेंट", "हेक्स"] as const;
