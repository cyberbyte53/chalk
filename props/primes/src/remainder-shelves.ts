import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { SHOWN_PER_SHELF, button, option, shelfName, sup } from "./seen";

export const MAX_DIVISOR = 12;
export const MAX_PLACED = 60;
export const MAX_POWER = 3;

export const RemainderShelvesAction = {
  PlaceNext: "placeNext",
  PlaceMany: "placeMany",
  SetDivisor: "setDivisor",
  SetPower: "setPower",
  Clear: "clear",
} as const;

export const RemainderShelvesDerived = {
  Placements: "placements",
  LitShelves: "litShelves",
  Next: "next",
} as const;

export const RemainderShelvesSignal = { Placed: "placed" } as const;

const remainderShelvesState = z
  .object({
    /** b: there are b shelves, one for each remainder 0, 1, …, b − 1. */
    divisor: z.number().int().min(2).max(MAX_DIVISOR),
    /** Which power of n is placed: 1 for n itself, 2 for n², 3 for n³. */
    power: z.number().int().min(1).max(MAX_POWER),
    /** n = 1, 2, …, placed have been put in their shelves. */
    placed: z.number().int().min(0).max(MAX_PLACED),
  })
  .strict();
export type RemainderShelvesState = z.infer<typeof remainderShelvesState>;

/** One number on the shelves: n, the value placed (nᵖᵒʷᵉʳ) and its shelf, the remainder on dividing by b. */
export type Placement = { n: number; value: number; shelf: number };

export function placementOf(
  n: number,
  s: Pick<RemainderShelvesState, "divisor" | "power">,
): Placement {
  const value = n ** s.power;
  return { n, value, shelf: value % s.divisor };
}

const placementsOf = (s: RemainderShelvesState): Placement[] =>
  Array.from({ length: s.placed }, (_, i) => placementOf(i + 1, s));

const act = actionsFor<RemainderShelvesState>();
const none = z.object({}).strict();

/**
 * Whole numbers put on the shelf of their remainder on dividing by b: every number lands in one of
 * the b shelves 0, 1, …, b − 1 (it is bq + r for exactly one r). Placing squares or cubes instead
 * shows which shelves they can never reach.
 */
export const remainderShelves = defineProp({
  type: "remainderShelves",
  describe:
    "b shelves, one for each remainder 0 to b − 1. The numbers n = 1, 2, 3, … (or their squares n², or cubes n³) are put on the shelf of their remainder on dividing by b, so every number lands on exactly one shelf: it is bq + r. Squares and cubes leave some shelves empty for ever (squares on dividing by 3 only reach 0 and 1).",
  state: remainderShelvesState,
  defaults: { divisor: 3, power: 1, placed: 0 },
  derived: {
    [RemainderShelvesDerived.Placements]: {
      describe: "Every number placed: { n, value: nᵖᵒʷᵉʳ, shelf }",
      compute: placementsOf,
    },
    [RemainderShelvesDerived.LitShelves]: {
      describe: "The shelves with a number on them, smallest first",
      compute: (s) => [...new Set(placementsOf(s).map((p) => p.shelf))].sort((a, b) => a - b),
    },
    [RemainderShelvesDerived.Next]: {
      describe: "The next n to place, or null when the shelves are full",
      compute: (s) => (s.placed < MAX_PLACED ? s.placed + 1 : null),
    },
  },
  actions: {
    [RemainderShelvesAction.PlaceNext]: act({
      describe: "Put the next number on its shelf (the learner's +1 button)",
      byLearner: true,
      args: none,
      run: (s) => {
        if (s.placed >= MAX_PLACED) return set({});
        const p = placementOf(s.placed + 1, s);
        return set(
          { placed: s.placed + 1 },
          { signal: RemainderShelvesSignal.Placed, payload: { ...p } },
        );
      },
    }),
    [RemainderShelvesAction.PlaceMany]: act({
      describe: "Drop the next `count` numbers in at once",
      byLearner: true,
      args: z.object({ count: z.number().int().min(1).max(MAX_PLACED) }).strict(),
      run: (s, a) => set({ placed: Math.min(MAX_PLACED, s.placed + a.count) }),
    }),
    [RemainderShelvesAction.SetDivisor]: act({
      describe: "Another number of shelves (keeps the numbers placed)",
      byLearner: true,
      args: z.object({ divisor: z.number().int().min(2).max(MAX_DIVISOR) }).strict(),
      run: (_s, a) => set({ divisor: a.divisor }),
    }),
    [RemainderShelvesAction.SetPower]: act({
      describe: "Place n, n² or n³ (keeps how many are placed)",
      byLearner: true,
      args: z.object({ power: z.number().int().min(1).max(MAX_POWER) }).strict(),
      run: (_s, a) => set({ power: a.power }),
    }),
    [RemainderShelvesAction.Clear]: act({
      describe: "Take every number off the shelves",
      byLearner: true,
      args: none,
      run: () => set({ placed: 0 }),
    }),
  },
  signals: {
    [RemainderShelvesSignal.Placed]: { describe: "A number landed: { n, value, shelf }" },
  },
  observe: (s) => {
    const b = s.divisor;
    const placements = placementsOf(s);
    const chip = (p: Placement) =>
      s.power === 1 ? `${p.value}` : `${p.value} (${p.n}${sup(s.power)})`;
    const elements: Element[] = Array.from({ length: b }, (_, r) => {
      const here = placements.filter((p) => p.shelf === r);
      const shown = here.slice(-SHOWN_PER_SHELF);
      const more = here.length - shown.length;
      return {
        id: `shelf:${r}`,
        value: `${shelfName(b, r)}: ${here.length === 0 ? "empty" : `${more > 0 ? `+${more}, ` : ""}${shown.map(chip).join(", ")}`}`,
      };
    });
    const latest = placements.at(-1);
    if (latest !== undefined) {
      const head = s.power > 1 ? `${latest.n}${sup(s.power)} = ` : "";
      elements.push({
        id: "equation",
        value: `${head}${latest.value} = ${b} × ${Math.floor(latest.value / b)} + ${latest.shelf}`,
      });
    }
    elements.push(
      button("next", s.placed < MAX_PLACED),
      button("nextTen", s.placed < MAX_PLACED),
      button("clear", s.placed > 0),
      ...[1, 2, 3].map((k) => option(`power:${k}`, s.power === k)),
      { id: "b", value: b },
    );
    const what = s.power === 1 ? "n" : `n${sup(s.power)}`;
    return {
      summary:
        s.placed === 0
          ? `${b} empty shelves, ${shelfName(b, 0)} to ${shelfName(b, b - 1)}, for ${what} by its remainder on dividing by ${b}`
          : `${what} for n = 1 to ${s.placed} on ${b} shelves by remainder on dividing by ${b}`,
      elements,
    };
  },
});
