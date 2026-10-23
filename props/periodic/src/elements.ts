import type { Words } from "./draw";

/**
 * The 118 elements, in order of atomic number: symbol, name in both languages and atomic mass (u,
 * rounded as NCERT rounds them where the chapter gives a value). Groups and periods are worked out
 * from the atomic number, the way the modern table is built: each period opens a new shell.
 */
type Row = readonly [symbol: string, en: string, hi: string, mass: number];

const ROWS: readonly Row[] = [
  ["H", "Hydrogen", "हाइड्रोजन", 1.0],
  ["He", "Helium", "हीलियम", 4.0],
  ["Li", "Lithium", "लीथियम", 6.9],
  ["Be", "Beryllium", "बेरिलियम", 9.0],
  ["B", "Boron", "बोरॉन", 10.8],
  ["C", "Carbon", "कार्बन", 12.0],
  ["N", "Nitrogen", "नाइट्रोजन", 14.0],
  ["O", "Oxygen", "ऑक्सीजन", 16.0],
  ["F", "Fluorine", "फ़्लुओरीन", 19.0],
  ["Ne", "Neon", "नियॉन", 20.2],
  ["Na", "Sodium", "सोडियम", 23.0],
  ["Mg", "Magnesium", "मैग्नीशियम", 24.3],
  ["Al", "Aluminium", "ऐलुमिनियम", 27.0],
  ["Si", "Silicon", "सिलिकॉन", 28.1],
  ["P", "Phosphorus", "फ़ॉस्फ़ोरस", 31.0],
  ["S", "Sulphur", "सल्फ़र", 32.1],
  ["Cl", "Chlorine", "क्लोरीन", 35.5],
  ["Ar", "Argon", "आर्गन", 39.9],
  ["K", "Potassium", "पोटैशियम", 39.0],
  ["Ca", "Calcium", "कैल्शियम", 40.1],
  ["Sc", "Scandium", "स्कैंडियम", 45.0],
  ["Ti", "Titanium", "टाइटेनियम", 47.9],
  ["V", "Vanadium", "वैनेडियम", 50.9],
  ["Cr", "Chromium", "क्रोमियम", 52.0],
  ["Mn", "Manganese", "मैंगनीज़", 54.9],
  ["Fe", "Iron", "लोहा", 55.8],
  ["Co", "Cobalt", "कोबाल्ट", 58.9],
  ["Ni", "Nickel", "निकेल", 58.7],
  ["Cu", "Copper", "ताँबा", 63.5],
  ["Zn", "Zinc", "जस्ता", 65.4],
  ["Ga", "Gallium", "गैलियम", 69.7],
  ["Ge", "Germanium", "जर्मेनियम", 72.6],
  ["As", "Arsenic", "आर्सेनिक", 74.9],
  ["Se", "Selenium", "सेलेनियम", 79.0],
  ["Br", "Bromine", "ब्रोमीन", 79.9],
  ["Kr", "Krypton", "क्रिप्टॉन", 83.8],
  ["Rb", "Rubidium", "रुबिडियम", 85.5],
  ["Sr", "Strontium", "स्ट्रॉन्शियम", 87.6],
  ["Y", "Yttrium", "इट्रियम", 88.9],
  ["Zr", "Zirconium", "ज़र्कोनियम", 91.2],
  ["Nb", "Niobium", "नायोबियम", 92.9],
  ["Mo", "Molybdenum", "मॉलिब्डेनम", 96.0],
  ["Tc", "Technetium", "टेक्नीशियम", 98.0],
  ["Ru", "Ruthenium", "रुथेनियम", 101.1],
  ["Rh", "Rhodium", "रोडियम", 102.9],
  ["Pd", "Palladium", "पैलेडियम", 106.4],
  ["Ag", "Silver", "चाँदी", 107.9],
  ["Cd", "Cadmium", "कैडमियम", 112.4],
  ["In", "Indium", "इंडियम", 114.8],
  ["Sn", "Tin", "टिन", 118.7],
  ["Sb", "Antimony", "ऐंटिमनी", 121.8],
  ["Te", "Tellurium", "टेल्यूरियम", 127.6],
  ["I", "Iodine", "आयोडीन", 126.9],
  ["Xe", "Xenon", "ज़ेनॉन", 131.3],
  ["Cs", "Caesium", "सीज़ियम", 132.9],
  ["Ba", "Barium", "बेरियम", 137.3],
  ["La", "Lanthanum", "लैंथेनम", 138.9],
  ["Ce", "Cerium", "सीरियम", 140.1],
  ["Pr", "Praseodymium", "प्रेसियोडिमियम", 140.9],
  ["Nd", "Neodymium", "नियोडिमियम", 144.2],
  ["Pm", "Promethium", "प्रोमेथियम", 145.0],
  ["Sm", "Samarium", "समेरियम", 150.4],
  ["Eu", "Europium", "यूरोपियम", 152.0],
  ["Gd", "Gadolinium", "गैडोलिनियम", 157.3],
  ["Tb", "Terbium", "टर्बियम", 158.9],
  ["Dy", "Dysprosium", "डिस्प्रोसियम", 162.5],
  ["Ho", "Holmium", "होल्मियम", 164.9],
  ["Er", "Erbium", "अर्बियम", 167.3],
  ["Tm", "Thulium", "थूलियम", 168.9],
  ["Yb", "Ytterbium", "इटरबियम", 173.0],
  ["Lu", "Lutetium", "ल्यूटेशियम", 175.0],
  ["Hf", "Hafnium", "हैफ़्नियम", 178.5],
  ["Ta", "Tantalum", "टैंटलम", 180.9],
  ["W", "Tungsten", "टंगस्टन", 183.8],
  ["Re", "Rhenium", "रीनियम", 186.2],
  ["Os", "Osmium", "ऑस्मियम", 190.2],
  ["Ir", "Iridium", "इरिडियम", 192.2],
  ["Pt", "Platinum", "प्लैटिनम", 195.1],
  ["Au", "Gold", "सोना", 197.0],
  ["Hg", "Mercury", "पारा", 200.6],
  ["Tl", "Thallium", "थैलियम", 204.4],
  ["Pb", "Lead", "सीसा", 207.2],
  ["Bi", "Bismuth", "बिस्मथ", 209.0],
  ["Po", "Polonium", "पोलोनियम", 209.0],
  ["At", "Astatine", "ऐस्टाटीन", 210.0],
  ["Rn", "Radon", "रेडॉन", 222.0],
  ["Fr", "Francium", "फ़्रांसियम", 223.0],
  ["Ra", "Radium", "रेडियम", 226.0],
  ["Ac", "Actinium", "ऐक्टिनियम", 227.0],
  ["Th", "Thorium", "थोरियम", 232.0],
  ["Pa", "Protactinium", "प्रोटैक्टिनियम", 231.0],
  ["U", "Uranium", "यूरेनियम", 238.0],
  ["Np", "Neptunium", "नेप्च्यूनियम", 237.0],
  ["Pu", "Plutonium", "प्लूटोनियम", 244.0],
  ["Am", "Americium", "अमेरिशियम", 243.0],
  ["Cm", "Curium", "क्यूरियम", 247.0],
  ["Bk", "Berkelium", "बर्कीलियम", 247.0],
  ["Cf", "Californium", "कैलिफ़ोर्नियम", 251.0],
  ["Es", "Einsteinium", "आइंस्टीनियम", 252.0],
  ["Fm", "Fermium", "फ़र्मियम", 257.0],
  ["Md", "Mendelevium", "मेंडेलीवियम", 258.0],
  ["No", "Nobelium", "नोबेलियम", 259.0],
  ["Lr", "Lawrencium", "लॉरेन्सियम", 262.0],
  ["Rf", "Rutherfordium", "रदरफ़ोर्डियम", 267.0],
  ["Db", "Dubnium", "डुब्नियम", 268.0],
  ["Sg", "Seaborgium", "सीबोर्गियम", 269.0],
  ["Bh", "Bohrium", "बोहरियम", 270.0],
  ["Hs", "Hassium", "हैसियम", 277.0],
  ["Mt", "Meitnerium", "माइटनेरियम", 278.0],
  ["Ds", "Darmstadtium", "डार्मस्टैटियम", 281.0],
  ["Rg", "Roentgenium", "रॉन्टजेनियम", 282.0],
  ["Cn", "Copernicium", "कोपरनिसियम", 285.0],
  ["Nh", "Nihonium", "निहोनियम", 286.0],
  ["Fl", "Flerovium", "फ़्लेरोवियम", 289.0],
  ["Mc", "Moscovium", "मॉस्कोवियम", 290.0],
  ["Lv", "Livermorium", "लिवरमोरियम", 293.0],
  ["Ts", "Tennessine", "टेनेसीन", 294.0],
  ["Og", "Oganesson", "ओगानेसॉन", 294.0],
];

/** Metal, metalloid (the zig-zag line's borderline elements, as NCERT lists them) or non-metal. */
export const Kind = { Metal: "metal", Metalloid: "metalloid", NonMetal: "nonMetal" } as const;
export type Kind = (typeof Kind)[keyof typeof Kind];

const METALLOIDS = new Set(["B", "Si", "Ge", "As", "Sb", "Te", "Po"]);
const NON_METALS = new Set([
  "H",
  "He",
  "C",
  "N",
  "O",
  "F",
  "Ne",
  "P",
  "S",
  "Cl",
  "Ar",
  "Se",
  "Br",
  "Kr",
  "I",
  "Xe",
  "At",
  "Rn",
  "Ts",
  "Og",
]);

export type Element = {
  z: number;
  symbol: string;
  name: Words;
  mass: number;
  period: number;
  /** 1–18, or null for the lanthanoids and actinoids (drawn in their own rows). */
  group: number | null;
  kind: Kind;
};

/** The first atomic number of each period. */
const PERIOD_STARTS = [1, 3, 11, 19, 37, 55, 87] as const;

export function periodOf(z: number): number {
  let p = 1;
  for (let i = 0; i < PERIOD_STARTS.length; i++) if (z >= (PERIOD_STARTS[i] as number)) p = i + 1;
  return p;
}

/** True for La–Lu and Ac–Lr: the two rows NCERT's table prints below the rest. */
export function isInnerRow(z: number): boolean {
  return (z >= 57 && z <= 71) || (z >= 89 && z <= 103);
}

export function groupOf(z: number): number | null {
  if (z === 1) return 1;
  if (z === 2) return 18;
  const period = periodOf(z);
  const start = PERIOD_STARTS[period - 1] as number;
  const k = z - start; // 0-based place in the period
  if (period === 2 || period === 3) return k < 2 ? k + 1 : k + 11;
  if (period === 4 || period === 5) return k + 1;
  if (isInnerRow(z)) return null;
  if (k < 2) return k + 1;
  return k - 13; // after the 15 inner-row elements: 72 → group 4
}

export const ELEMENTS: readonly Element[] = ROWS.map(([symbol, en, hi, mass], i) => {
  const z = i + 1;
  return {
    z,
    symbol,
    name: { en, hi },
    mass,
    period: periodOf(z),
    group: groupOf(z),
    kind: METALLOIDS.has(symbol)
      ? Kind.Metalloid
      : NON_METALS.has(symbol)
        ? Kind.NonMetal
        : Kind.Metal,
  };
});

export const BY_SYMBOL: ReadonlyMap<string, Element> = new Map(ELEMENTS.map((e) => [e.symbol, e]));

export function element(z: number): Element {
  const e = ELEMENTS[z - 1];
  if (e === undefined) throw new Error(`no element ${z}`);
  return e;
}

export function bySymbol(symbol: string): Element {
  const e = BY_SYMBOL.get(symbol);
  if (e === undefined) throw new Error(`no element ${symbol}`);
  return e;
}

/**
 * Electrons in the K, L, M, N shells for the first 20 elements, filled the way Class IX does it
 * (2, 8, 8, then the fourth shell). Beyond 20 the chapter doesn't fill shells: null.
 */
export function shellsOf(z: number): number[] | null {
  if (z < 1 || z > 20) return null;
  const caps = [2, 8, 8, 2];
  const out: number[] = [];
  let left = z;
  for (const cap of caps) {
    if (left <= 0) break;
    const n = Math.min(cap, left);
    out.push(n);
    left -= n;
  }
  return out;
}

/** "2, 8, 2", the way NCERT writes an electronic configuration. */
export function configOf(z: number): string | null {
  const shells = shellsOf(z);
  return shells === null ? null : shells.join(", ");
}

/** Electrons in the outermost shell (first 20 only). */
export function valenceOf(z: number): number | null {
  const shells = shellsOf(z);
  return shells === null ? null : (shells[shells.length - 1] as number);
}

/**
 * Valency, from the outer electrons: 1–4 → that many; 5–7 → 8 minus them; a full shell (He 2,
 * or 8) → 0. First 20 only.
 */
export function valencyOf(z: number): number | null {
  const v = valenceOf(z);
  if (v === null) return null;
  if (z === 2 || v === 8) return 0;
  if (z === 1) return 1;
  return v <= 4 ? v : 8 - v;
}

/** The maximum electrons a shell can hold: 2n². */
export function shellCapacity(n: number): number {
  return 2 * n * n;
}

/** How many elements each of the seven periods holds (NCERT 5.3.1). */
export const PERIOD_LENGTHS = [2, 8, 8, 18, 18, 32, 32] as const;

/** The atomic radii NCERT gives (pm): hydrogen, the second period, group 1. */
export const RADII: Readonly<Record<string, number>> = {
  H: 37,
  Li: 152,
  Be: 111,
  B: 88,
  C: 77,
  N: 74,
  O: 66,
  Na: 186,
  K: 231,
  Rb: 244,
  Cs: 262,
};

/**
 * Where an element sits on a trend, 0 (least) to 1 (most), from its place in the table: the
 * chapter's trends are directions, not data. Metallic character and atomic size grow down a group
 * and shrink across a period; electronegativity does the opposite. Noble gases sit outside these
 * trends (null), and so do the inner rows.
 */
export function trendOf(
  z: number,
  trend: "metallic" | "size" | "electronegativity",
): number | null {
  const e = element(z);
  if (e.group === null || e.group === 18) return null;
  const across = (e.group - 1) / 16; // 0 at group 1, 1 at group 17
  const down = (e.period - 1) / 6;
  const metallic = 0.55 * (1 - across) + 0.45 * down;
  if (trend === "electronegativity") return 1 - metallic;
  return metallic;
}

/** The note names of Newlands' octaves: sa re ga ma pa da ni (do re mi fa so la ti). */
export const NOTES: readonly Words[] = [
  { en: "sa (do)", hi: "सा" },
  { en: "re (re)", hi: "रे" },
  { en: "ga (mi)", hi: "ग" },
  { en: "ma (fa)", hi: "म" },
  { en: "pa (so)", hi: "प" },
  { en: "da (la)", hi: "ध" },
  { en: "ni (ti)", hi: "नि" },
];
