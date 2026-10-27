import { z } from "zod";
import { type Fraction, type Words, simplify } from "./numbers";

/**
 * Probability, NCERT Ch15: the outcomes of the textbook's experiments (a coin, two coins, a die,
 * two dice, a deck of 52 cards, a bag of marbles, a spinner), each with an id, so an event is just
 * the list of its favourable outcomes; and a seeded random generator for running them.
 */

/** A tiny seeded random generator (mulberry32): same seed, same run. */
export function nextRandom(seed: number): { value: number; seed: number } {
  const next = (seed + 0x6d2b79f5) >>> 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: next };
}

export const Experiment = {
  Coin: "coin",
  TwoCoins: "twoCoins",
  Die: "die",
  TwoDice: "twoDice",
  Cards: "cards",
  Bag: "bag",
  Spinner: "spinner",
} as const;
export type Experiment = (typeof Experiment)[keyof typeof Experiment];

/** Marble colours: the content's own, so a red marble is red in every theme. */
export const Colour = {
  Red: "red",
  Blue: "blue",
  White: "white",
  Green: "green",
  Yellow: "yellow",
  Black: "black",
} as const;
export type Colour = (typeof Colour)[keyof typeof Colour];

export const COLOUR_WORDS: Record<Colour, Words> = {
  red: { en: "red", hi: "लाल" },
  blue: { en: "blue", hi: "नीली" },
  white: { en: "white", hi: "सफ़ेद" },
  green: { en: "green", hi: "हरी" },
  yellow: { en: "yellow", hi: "पीली" },
  black: { en: "black", hi: "काली" },
};

export const marbleSchema = z
  .object({ colour: z.nativeEnum(Colour), count: z.number().int().min(0).max(60) })
  .strict();
export type Marbles = z.infer<typeof marbleSchema>;

export const wordsSchema = z.object({ en: z.string().max(60), hi: z.string().max(60) }).strict();

/** What an experiment is made of (only the fields its kind uses matter). */
export type Setup = {
  kind: Experiment;
  /** The numbers on the die's six faces (1–6 for a normal die). */
  faces: readonly number[];
  marbles: readonly Marbles[];
  /** The spinner's equal sectors, by label. */
  sectors: readonly Words[];
};

/** One equally likely outcome (a bag outcome stands for `weight` marbles of a colour). */
export type Outcome = { id: string; label: string; weight: number };

export const SUITS = ["S", "H", "D", "C"] as const;
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;
export const SUIT_SYMBOL: Record<(typeof SUITS)[number], string> = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣",
};
export const isRedSuit = (suit: string) => suit === "H" || suit === "D";
export const isFaceCard = (rank: string) => rank === "J" || rank === "Q" || rank === "K";

/** All 52 card ids: rank + suit, e.g. "AS", "10H", "KD". */
export const CARD_IDS: readonly string[] = SUITS.flatMap((s) => RANKS.map((r) => `${r}${s}`));
export const cardParts = (id: string) => ({ rank: id.slice(0, -1), suit: id.slice(-1) });

/** The outcomes of an experiment, each equally likely (weights count marbles). */
export function outcomesOf(s: Setup): Outcome[] {
  switch (s.kind) {
    case Experiment.Coin:
      return [
        { id: "H", label: "H", weight: 1 },
        { id: "T", label: "T", weight: 1 },
      ];
    case Experiment.TwoCoins:
      return ["HH", "HT", "TH", "TT"].map((id) => ({
        id,
        label: `(${id[0]}, ${id[1]})`,
        weight: 1,
      }));
    case Experiment.Die:
      return s.faces.map((v, i) => ({ id: String(i + 1), label: String(v), weight: 1 }));
    case Experiment.TwoDice:
      return s.faces.flatMap((a, i) =>
        s.faces.map((b, j) => ({ id: `${i + 1}-${j + 1}`, label: `(${a}, ${b})`, weight: 1 })),
      );
    case Experiment.Cards:
      return CARD_IDS.map((id) => {
        const { rank, suit } = cardParts(id);
        return { id, label: `${rank}${SUIT_SYMBOL[suit as (typeof SUITS)[number]]}`, weight: 1 };
      });
    case Experiment.Bag:
      return s.marbles
        .filter((m) => m.count > 0)
        .map((m) => ({ id: m.colour, label: m.colour, weight: m.count }));
    case Experiment.Spinner:
      return s.sectors.map((w, i) => ({ id: String(i), label: w.en, weight: 1 }));
  }
}

/** How many equally likely outcomes in all (a bag counts its marbles). */
export const totalOutcomes = (s: Setup): number => outcomesOf(s).reduce((t, o) => t + o.weight, 0);

/** How many are favourable to the event (its outcome ids). */
export function favourableCount(s: Setup, favourable: readonly string[]): number {
  const set = new Set(favourable);
  return outcomesOf(s)
    .filter((o) => set.has(o.id))
    .reduce((t, o) => t + o.weight, 0);
}

/** P(E) = favourable / all, in lowest terms. */
export function probabilityOf(s: Setup, favourable: readonly string[]): Fraction {
  return simplify(favourableCount(s, favourable), totalOutcomes(s));
}

/** The outcome ids NOT in the event: the complement, "not E". */
export function complementOf(s: Setup, favourable: readonly string[]): string[] {
  const set = new Set(favourable);
  return outcomesOf(s)
    .map((o) => o.id)
    .filter((id) => !set.has(id));
}

/** Picks one outcome at random, by weight. */
export function draw(s: Setup, seed: number): { id: string; seed: number } {
  const outcomes = outcomesOf(s);
  const total = outcomes.reduce((t, o) => t + o.weight, 0);
  const r = nextRandom(seed);
  let pick = r.value * total;
  for (const o of outcomes) {
    pick -= o.weight;
    if (pick < 0) return { id: o.id, seed: r.seed };
  }
  return { id: outcomes[outcomes.length - 1]?.id ?? "", seed: r.seed };
}

/** Helpers for lessons: the ids of an event, described by a rule. */
export const twoDiceIds = (
  rule: (a: number, b: number) => boolean,
  faces: readonly number[] = [1, 2, 3, 4, 5, 6],
): string[] =>
  faces.flatMap((a, i) => faces.flatMap((b, j) => (rule(a, b) ? [`${i + 1}-${j + 1}`] : [])));

export const dieIds = (
  rule: (v: number) => boolean,
  faces: readonly number[] = [1, 2, 3, 4, 5, 6],
): string[] => faces.flatMap((v, i) => (rule(v) ? [String(i + 1)] : []));

export const cardIds = (rule: (rank: string, suit: string) => boolean): string[] =>
  CARD_IDS.filter((id) => {
    const { rank, suit } = cardParts(id);
    return rule(rank, suit);
  });

export const DEFAULT_FACES = [1, 2, 3, 4, 5, 6] as const;
