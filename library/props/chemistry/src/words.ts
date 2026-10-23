/** Words a prop shows itself, in both languages. */
export type Words = { readonly en: string; readonly hi: string };

export const say = (locale: string, w: Words): string => (locale === "hi" ? w.hi : w.en);

/** Elements with a colour of their own in molecule pictures; the rest share one. */
export const ATOM_COLOURED: readonly string[] = [
  "H",
  "O",
  "C",
  "N",
  "S",
  "Cl",
  "Fe",
  "Cu",
  "Zn",
  "Mg",
  "Ca",
  "Na",
  "K",
  "Ba",
  "Pb",
  "Ag",
  "Al",
  "I",
  "Br",
  "Mn",
];

/** 0, 1, …, n − 1. */
export const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);
