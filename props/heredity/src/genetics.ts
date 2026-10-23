/**
 * Mendel's rules for pea plants, as plain functions: genotypes are written the textbook's way
 * ("Tt", "RrYy"), each trait a pair of letters, the capital (dominant) first. Every prop that
 * shows a cross reads these; nothing here knows about drawing.
 */

/** The pea characters Mendel used (NCERT 9.2.2). */
export const Trait = {
  Height: "height",
  SeedShape: "seedShape",
  SeedColour: "seedColour",
  FlowerColour: "flowerColour",
} as const;
export type Trait = (typeof Trait)[keyof typeof Trait];

/** Each trait's letter: the capital is the dominant version of the gene. */
export const LETTER: Readonly<Record<Trait, string>> = {
  [Trait.Height]: "T",
  [Trait.SeedShape]: "R",
  [Trait.SeedColour]: "Y",
  [Trait.FlowerColour]: "W",
};

/** What each version of a trait looks like: [dominant, recessive]. */
export const LOOKS: Readonly<Record<Trait, readonly [string, string]>> = {
  [Trait.Height]: ["tall", "short"],
  [Trait.SeedShape]: ["round", "wrinkled"],
  [Trait.SeedColour]: ["yellow", "green"],
  [Trait.FlowerColour]: ["violet", "white"],
};

/** The looks in Hindi, the same order. */
export const LOOKS_HI: Readonly<Record<string, string>> = {
  tall: "लंबा",
  short: "बौना",
  round: "गोल",
  wrinkled: "झुर्रीदार",
  yellow: "पीला",
  green: "हरा",
  violet: "बैंगनी",
  white: "सफ़ेद",
};

/** One plant's look, trait by trait (e.g. { height: "tall" }). */
export type Look = Readonly<Partial<Record<Trait, string>>>;

/** Whether a genotype is well formed for these traits: one pair of the right letter per trait. */
export function isGenotype(traits: readonly Trait[], g: string): boolean {
  if (g.length !== traits.length * 2) return false;
  return traits.every((t, i) => {
    const pair = g.slice(2 * i, 2 * i + 2);
    const up = LETTER[t];
    const low = up.toLowerCase();
    return (pair[0] === up || pair[0] === low) && (pair[1] === up || pair[1] === low);
  });
}

/** The pair for one trait, the capital first ("tT" → "Tt"). */
function tidyPair(pair: string): string {
  const [a = "", b = ""] = pair.split("");
  return a === a.toLowerCase() && b !== b.toLowerCase() ? b + a : a + b;
}

/** A genotype written the textbook's way: each pair with its capital first. */
export function tidy(g: string): string {
  let out = "";
  for (let i = 0; i < g.length; i += 2) out += tidyPair(g.slice(i, i + 2));
  return out;
}

/** The pair for each trait. */
export function pairsOf(g: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < g.length; i += 2) out.push(g.slice(i, i + 2));
  return out;
}

/** What a plant with this genotype looks like: one capital is enough to show the dominant look. */
export function lookOf(traits: readonly Trait[], g: string): Look {
  const look: Partial<Record<Trait, string>> = {};
  pairsOf(g).forEach((pair, i) => {
    const t = traits[i];
    if (t === undefined) return;
    const shows = pair !== pair.toLowerCase();
    look[t] = LOOKS[t][shows ? 0 : 1];
  });
  return look;
}

/** A look as one key, trait by trait in the traits' order ("tall", "round yellow"). */
export function lookKey(traits: readonly Trait[], look: Look): string {
  return traits.map((t) => look[t] ?? "").join(" ");
}

/** A look in Hindi ("लंबा", "गोल पीला"). */
export function lookKeyHi(key: string): string {
  return key
    .split(" ")
    .map((w) => LOOKS_HI[w] ?? w)
    .join(" ");
}

/** Whether a plant is pure-breeding: both copies the same for every trait. */
export function isPure(g: string): boolean {
  return pairsOf(g).every((p) => p[0] === p[1]);
}

/**
 * The germ cells a plant makes: one copy of each pair, every mix equally likely. Always 2ⁿ slots,
 * in the textbook's order (RY, Ry, rY, ry), so a pure plant repeats the same one.
 */
export function gametesOf(g: string): string[] {
  let out = [""];
  for (const pair of pairsOf(g)) {
    const next: string[] = [];
    for (const start of out) for (const copy of pair) next.push(start + copy);
    out = next;
  }
  return out;
}

/** Two germ cells joined: the new plant's genotype, tidied. */
export function fuse(egg: string, pollen: string): string {
  let g = "";
  for (let i = 0; i < egg.length; i++) g += (egg[i] ?? "") + (pollen[i] ?? "");
  return tidy(g);
}

/** The Punnett square: rows are one parent's germ cells, columns the other's. */
export function punnett(
  a: string,
  b: string,
): { rows: string[]; columns: string[]; cells: string[][] } {
  const rows = gametesOf(a);
  const columns = gametesOf(b);
  return { rows, columns, cells: rows.map((r) => columns.map((c) => fuse(r, c))) };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Counts as the smallest whole-number ratio, largest first ("3:1", "9:3:3:1"). */
export function ratioOf(counts: readonly number[]): string {
  const kept = counts.filter((n) => n > 0);
  if (kept.length === 0) return "";
  const g = kept.reduce((x, y) => gcd(x, y));
  return kept.map((n) => n / g).join(":");
}

/** How a list of keys splits up, in the order each first appears (largest first on ties). */
function tally(
  keys: readonly string[],
  order: readonly string[],
): { key: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const k of keys) counts.set(k, (counts.get(k) ?? 0) + 1);
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((x, y) => y.count - x.count || order.indexOf(x.key) - order.indexOf(y.key));
}

/** Every possible look, dominant ones first ("tall round", "tall wrinkled", …). */
export function allLooks(traits: readonly Trait[]): string[] {
  let out = [""];
  for (const t of traits) {
    const next: string[] = [];
    for (const start of out) for (const v of LOOKS[t]) next.push(start ? `${start} ${v}` : v);
    out = next;
  }
  return out;
}

/** Every genotype, from all-dominant to all-recessive ("TT", "Tt", "tt"). */
export function allGenotypes(traits: readonly Trait[]): string[] {
  let out = [""];
  for (const t of traits) {
    const up = LETTER[t];
    const low = up.toLowerCase();
    const next: string[] = [];
    for (const start of out) for (const p of [up + up, up + low, low + low]) next.push(start + p);
    out = next;
  }
  return out;
}

export type Share = { key: string; count: number; fraction: number };

/** What a cross gives, by look: each look's share of the Punnett square. */
export function looksOfCross(traits: readonly Trait[], a: string, b: string): Share[] {
  const cells = punnett(a, b).cells.flat();
  const keys = cells.map((g) => lookKey(traits, lookOf(traits, g)));
  return tally(keys, allLooks(traits)).map((x) => ({ ...x, fraction: x.count / cells.length }));
}

/** What a cross gives, by genotype: each genotype's share of the Punnett square. */
export function genotypesOfCross(a: string, b: string, traits: readonly Trait[]): Share[] {
  const cells = punnett(a, b).cells.flat();
  const order = allGenotypes(traits);
  return tally(cells, order)
    .sort((x, y) => order.indexOf(x.key) - order.indexOf(y.key))
    .map((x) => ({ ...x, fraction: x.count / cells.length }));
}

/** A tiny seeded random number generator (mulberry32): the same seed gives the same plants. */
export function nextRandom(seed: number): { value: number; seed: number } {
  const next = (seed + 0x6d2b79f5) >>> 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: next };
}

/** A whole number from 0 to n − 1, and the seed after it. */
export function pick(seed: number, n: number): { index: number; seed: number } {
  const r = nextRandom(seed);
  return { index: Math.min(n - 1, Math.floor(r.value * n)), seed: r.seed };
}

/**
 * Grow `n` plants from a cross: each gets one germ cell from each parent, chosen by chance.
 * Returns how many of each look came up, and the seed after.
 */
export function growPlants(
  traits: readonly Trait[],
  a: string,
  b: string,
  n: number,
  seed: number,
): { counts: Record<string, number>; seed: number } {
  const ga = gametesOf(a);
  const gb = gametesOf(b);
  const counts: Record<string, number> = {};
  for (const key of allLooks(traits)) counts[key] = 0;
  let s = seed;
  for (let i = 0; i < n; i++) {
    const x = pick(s, ga.length);
    const y = pick(x.seed, gb.length);
    s = y.seed;
    const key = lookKey(traits, lookOf(traits, fuse(ga[x.index] ?? "", gb[y.index] ?? "")));
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return { counts, seed: s };
}

/** What `n` plants give on average: each look's expected count, rounded to keep the total. */
export function expectedPlants(
  traits: readonly Trait[],
  a: string,
  b: string,
  n: number,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const key of allLooks(traits)) counts[key] = 0;
  const shares = looksOfCross(traits, a, b);
  let left = n;
  shares.forEach((x, i) => {
    const c = i === shares.length - 1 ? left : Math.round(x.fraction * n);
    counts[x.key] = c;
    left -= c;
  });
  return counts;
}
