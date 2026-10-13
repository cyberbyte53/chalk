import { localizedSchema } from "@chalk/content";
import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/** The families of real numbers, smallest first. Each is inside the ones after it on its path to R. */
export const Family = {
  Natural: "natural",
  Whole: "whole",
  Integer: "integer",
  Rational: "rational",
  Irrational: "irrational",
  Real: "real",
} as const;
export type Family = (typeof Family)[keyof typeof Family];

/** Where a card can be: in a family's ring, or outside every ring that is shown. */
export const OUTSIDE = "outside";
export type Place = Family | typeof OUTSIDE;

/** The letter the book uses for each family (irrational numbers have none). */
export const FamilySymbol: Readonly<Record<Family, string>> = {
  natural: "N",
  whole: "W",
  integer: "Z",
  rational: "Q",
  irrational: "",
  real: "R",
};

/** The families each family is inside (itself included): N ⊂ W ⊂ Z ⊂ Q ⊂ R, and irrationals ⊂ R. */
const INSIDE: Readonly<Record<Family, readonly Family[]>> = {
  natural: ["natural", "whole", "integer", "rational", "real"],
  whole: ["whole", "integer", "rational", "real"],
  integer: ["integer", "rational", "real"],
  rational: ["rational", "real"],
  irrational: ["irrational", "real"],
  real: ["real"],
};

/** Innermost first: the order to look for a card's place in. */
const INNERMOST_FIRST: readonly Family[] = [
  "natural",
  "whole",
  "integer",
  "rational",
  "irrational",
  "real",
];

export const NumberSorterPart = {
  CardPrefix: "card:",
  RegionPrefix: "region:",
  Outside: "region:outside",
} as const;

export const NumberSorterSignal = { Placed: "placed", Picked: "picked" } as const;

export const MAX_CARDS = 12;

const familySchema = z.nativeEnum(Family);
const placeSchema = z.union([familySchema, z.literal(OUTSIDE)]);

const cardSchema = z
  .object({
    /** Name used in rules: `sorter.placedIn.<id>`. camelCase. */
    id: z.string().regex(/^[a-z][A-Za-z0-9]*$/),
    /** The number as written: maths only ("12/4", "−7", "√2", "0.1010010001…"). */
    label: z.string().min(1).max(24),
    /** The smallest family the number belongs to (12/4 = 3 is natural). */
    family: familySchema,
    /** Where the learner put it, or null while it waits in the tray. */
    placedIn: placeSchema.nullable(),
  })
  .strict();
export type Card = z.infer<typeof cardSchema>;

const numberSorterState = z
  .object({
    cards: z.array(cardSchema).max(MAX_CARDS),
    /** The rings drawn, any of the six families. A family not shown can't be dropped into. */
    families: z.array(familySchema),
    /** The card the learner has picked up (tap a card, then tap a ring), or null. */
    selected: z.string().nullable(),
    /** Whether each placed card shows if it is in the right ring. */
    isMarked: z.boolean(),
    /** Names written beside the rings, in the learner's language (the symbol is always shown). */
    names: z.record(familySchema, localizedSchema),
    /** Words for the area outside every ring, or null for none. */
    outsideName: localizedSchema.nullable(),
  })
  .strict();
export type NumberSorterState = z.infer<typeof numberSorterState>;

const act = actionsFor<NumberSorterState>();

/** Where a number of this family belongs among the rings shown: the innermost shown ring holding it. */
export function placeFor(family: Family, shown: readonly Family[]): Place {
  const inside = INSIDE[family];
  return INNERMOST_FIRST.find((f) => shown.includes(f) && inside.includes(f)) ?? OUTSIDE;
}

/** Whether every number of family `inner` is also in family `outer`. */
export function isInside(inner: Family, outer: Family): boolean {
  return INSIDE[inner].includes(outer);
}

function placedSignal(card: Card, place: Place, shown: readonly Family[]): Emit {
  return {
    signal: NumberSorterSignal.Placed,
    payload: { card: card.id, place, isRight: place === placeFor(card.family, shown) },
  };
}

function withPlace(s: NumberSorterState, id: string, place: Place | null): Card[] {
  return s.cards.map((c) => (c.id === id ? { ...c, placedIn: place } : c));
}

function isPlaceable(s: NumberSorterState, place: Place): boolean {
  return place === OUTSIDE || s.families.includes(place);
}

/** Sorting numbers into the families of real numbers, drawn as rings inside rings. */
export const numberSorter = defineProp<NumberSorterState>({
  type: "numberSorter",
  describe:
    "Number cards to sort into the families of real numbers drawn as rings inside rings: natural (N) inside whole (W) inside integers (Z) inside rationals (Q) inside reals (R), with irrationals beside Q inside R. A card belongs in the innermost ring shown that holds it, or outside if none does.",
  state: numberSorterState,
  defaults: {
    cards: [],
    families: ["natural", "whole", "integer", "rational", "irrational", "real"],
    selected: null,
    isMarked: false,
    names: {},
    outsideName: null,
  },
  derived: {
    placedIn: {
      describe: 'Where each card is, by card id (a family, "outside", or null if not placed yet)',
      compute: (s) => Object.fromEntries(s.cards.map((c) => [c.id, c.placedIn])),
    },
    rightPlace: {
      describe: "Where each card belongs among the rings shown, by card id",
      compute: (s) =>
        Object.fromEntries(s.cards.map((c) => [c.id, placeFor(c.family, s.families)])),
    },
    placedCount: {
      describe: "How many cards have been placed",
      compute: (s) => s.cards.filter((c) => c.placedIn !== null).length,
    },
    isAllPlaced: {
      describe: "Every card has been placed",
      compute: (s) => s.cards.every((c) => c.placedIn !== null),
    },
    wrongCount: {
      describe: "How many placed cards are not where they belong",
      compute: (s) =>
        s.cards.filter((c) => c.placedIn !== null && c.placedIn !== placeFor(c.family, s.families))
          .length,
    },
    isAllRight: {
      describe: "Every card is placed where it belongs",
      compute: (s) => s.cards.every((c) => c.placedIn === placeFor(c.family, s.families)),
    },
  },
  offScreen: ["rightPlace", "wrongCount", "isAllRight"],
  actions: {
    pick: act({
      describe:
        "Pick up a card to place it (the learner's tap on a card); tap it again to put it down",
      byLearner: true,
      args: z.object({ card: z.string() }).strict(),
      run: (s, a) => {
        if (!s.cards.some((c) => c.id === a.card)) return set({});
        if (s.selected === a.card) return set({ selected: null });
        return set(
          { selected: a.card },
          { signal: NumberSorterSignal.Picked, payload: { card: a.card } },
        );
      },
    }),
    drop: act({
      describe:
        "Put the picked-up card in a ring, or outside every ring (the learner's tap on a ring)",
      byLearner: true,
      args: z.object({ place: placeSchema }).strict(),
      run: (s, a) => {
        const card = s.cards.find((c) => c.id === s.selected);
        if (card === undefined || !isPlaceable(s, a.place)) return set({});
        return set(
          { cards: withPlace(s, card.id, a.place), selected: null },
          placedSignal(card, a.place, s.families),
        );
      },
    }),
    place: act({
      describe: "Put a card in a ring, or outside every ring",
      args: z.object({ card: z.string(), place: placeSchema }).strict(),
      run: (s, a) => {
        const card = s.cards.find((c) => c.id === a.card);
        if (card === undefined || !isPlaceable(s, a.place)) return set({});
        return set(
          { cards: withPlace(s, card.id, a.place), selected: null },
          placedSignal(card, a.place, s.families),
        );
      },
    }),
    takeBack: act({
      describe: "Return a card to the tray",
      args: z.object({ card: z.string() }).strict(),
      run: (s, a) => set({ cards: withPlace(s, a.card, null) }),
    }),
    putEachRight: act({
      describe: "Put every card where it belongs",
      reveals: true,
      args: z.object({}).strict(),
      run: (s) =>
        set({
          cards: s.cards.map((c) => ({ ...c, placedIn: placeFor(c.family, s.families) })),
          selected: null,
        }),
    }),
    showFamily: act({
      describe:
        "Draw one more family's ring. Cards already placed stay where they are (some may now belong further in).",
      args: z.object({ family: familySchema }).strict(),
      run: (s, a) =>
        s.families.includes(a.family) ? set({}) : set({ families: [...s.families, a.family] }),
    }),
    setCards: act({
      describe: "Replace the cards (all in the tray)",
      args: z
        .object({ cards: z.array(cardSchema.omit({ placedIn: true })).max(MAX_CARDS) })
        .strict(),
      run: (_s, a) =>
        set({
          cards: a.cards.map((c) => ({ ...c, placedIn: null })),
          selected: null,
          isMarked: false,
        }),
    }),
    addCard: act({
      describe: "Add a card to the tray",
      args: cardSchema.omit({ placedIn: true }),
      run: (s, a) =>
        s.cards.some((c) => c.id === a.id) || s.cards.length >= MAX_CARDS
          ? set({})
          : set({ cards: [...s.cards, { ...a, placedIn: null }] }),
    }),
    mark: act({
      describe: "Show (or hide) whether each placed card is in the right ring",
      reveals: true,
      args: z.object({ isMarked: z.boolean() }).strict(),
      run: (_s, a) => set({ isMarked: a.isMarked }),
    }),
  },
  signals: {
    [NumberSorterSignal.Picked]: { describe: "The learner picked up a card: `card`" },
    [NumberSorterSignal.Placed]: {
      describe:
        "A card was put somewhere: `card`, `place`, and `isRight` (is that where it belongs)",
    },
  },
  parts: (s) => [
    ...s.cards.map((c) => `${NumberSorterPart.CardPrefix}${c.id}`),
    ...s.families.map((f) => `${NumberSorterPart.RegionPrefix}${f}`),
    NumberSorterPart.Outside,
  ],
  invariant: (s) => {
    const ids = new Set<string>();
    for (const c of s.cards) {
      if (ids.has(c.id)) return `two cards have the id "${c.id}"`;
      ids.add(c.id);
      if (c.placedIn !== null && !isPlaceable(s, c.placedIn)) {
        return `card "${c.id}" is in the ${c.placedIn} ring, which isn't shown`;
      }
    }
    if (s.selected !== null && !ids.has(s.selected)) return `no card "${s.selected}" to pick up`;
    if (new Set(s.families).size !== s.families.length) return "a family is listed twice";
    return undefined;
  },
});
