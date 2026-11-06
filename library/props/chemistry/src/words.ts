import type { Localized } from "@chalk/content";

/** The prop's own words on its buttons and lines, in both languages. */
export const WORDS = {
  balanced: { en: "Balanced", hi: "संतुलित" },
  notBalanced: { en: "Not balanced", hi: "संतुलित नहीं" },
  reactants: { en: "Reactants", hi: "अभिकारक" },
  products: { en: "Products", hi: "उत्पाद" },
  regroup: { en: "Regroup the atoms", hi: "परमाणुओं को फिर से जोड़ो" },
  ungroup: { en: "Back again", hi: "फिर से वापस" },
  startAgain: { en: "Start again", hi: "फिर से शुरू" },
  more: { en: "one more", hi: "एक और" },
  fewer: { en: "one fewer", hi: "एक कम" },
  atoms: { en: "atoms", hi: "परमाणु" },
} satisfies Record<string, Localized>;
