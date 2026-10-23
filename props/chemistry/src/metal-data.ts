import type { Words } from "./words";

/**
 * The elements of the metals and non-metals chapter (NCERT Class 10, Ch 3): their names in both
 * languages, which are metals, and the reactivity series (Table 3.2).
 */

export const MetalElement = {
  Potassium: "K",
  Sodium: "Na",
  Calcium: "Ca",
  Magnesium: "Mg",
  Aluminium: "Al",
  Zinc: "Zn",
  Iron: "Fe",
  Lead: "Pb",
  Copper: "Cu",
  Mercury: "Hg",
  Silver: "Ag",
  Gold: "Au",
} as const;
export type MetalElement = (typeof MetalElement)[keyof typeof MetalElement];

/** Table 3.2, most reactive first; hydrogen sits between lead and copper. */
export const REACTIVITY_SERIES: readonly MetalElement[] = [
  MetalElement.Potassium,
  MetalElement.Sodium,
  MetalElement.Calcium,
  MetalElement.Magnesium,
  MetalElement.Aluminium,
  MetalElement.Zinc,
  MetalElement.Iron,
  MetalElement.Lead,
  MetalElement.Copper,
  MetalElement.Mercury,
  MetalElement.Silver,
  MetalElement.Gold,
];

/** The index of hydrogen's slot in the series: metals before it displace hydrogen from dilute acids. */
export const HYDROGEN_SLOT = REACTIVITY_SERIES.indexOf(MetalElement.Copper);

/** Higher is more reactive. */
export const reactivityOf = (m: MetalElement): number =>
  REACTIVITY_SERIES.length - REACTIVITY_SERIES.indexOf(m);

/** Whether metal a is more reactive than metal b. */
export const isMoreReactive = (a: MetalElement, b: MetalElement): boolean =>
  reactivityOf(a) > reactivityOf(b);

/** Whether a metal is above hydrogen in the series (so it gives hydrogen with dilute acids). */
export const isAboveHydrogen = (m: MetalElement): boolean =>
  REACTIVITY_SERIES.indexOf(m) < HYDROGEN_SLOT;

export const METAL_NAMES: Record<MetalElement, Words> = {
  K: { en: "potassium", hi: "पोटैशियम" },
  Na: { en: "sodium", hi: "सोडियम" },
  Ca: { en: "calcium", hi: "कैल्शियम" },
  Mg: { en: "magnesium", hi: "मैग्नीशियम" },
  Al: { en: "aluminium", hi: "ऐलुमिनियम" },
  Zn: { en: "zinc", hi: "जस्ता" },
  Fe: { en: "iron", hi: "लोहा" },
  Pb: { en: "lead", hi: "सीसा" },
  Cu: { en: "copper", hi: "ताँबा" },
  Hg: { en: "mercury", hi: "पारा" },
  Ag: { en: "silver", hi: "चाँदी" },
  Au: { en: "gold", hi: "सोना" },
};

export const HYDROGEN_NAME: Words = { en: "hydrogen", hi: "हाइड्रोजन" };

/** A CSS class for the colour each metal is drawn in (defined in metal-styles.css). */
export const metalColourClass = (m: MetalElement): string => `mn-metal-${m}`;
