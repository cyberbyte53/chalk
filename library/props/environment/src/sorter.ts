import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { WasteItem, isBiodegradable, nameOfWaste } from "./waste";

/**
 * Sorting a day's household waste (Activity 15.7) into two bins: biodegradable (broken down by
 * bacteria and fungi) and non-biodegradable. One thing at a time; each placing is marked right or
 * wrong if `showFeedback`.
 */

export const Bin = { Bio: "bio", NonBio: "nonBio" } as const;
export type Bin = (typeof Bin)[keyof typeof Bin];

export const binOf = (item: WasteItem): Bin => (isBiodegradable(item) ? Bin.Bio : Bin.NonBio);

export const SortAction = { Put: "put", Reset: "reset" } as const;
export const SortSignal = { Put: "put", Sorted: "sorted" } as const;
export const SortDerived = {
  Next: "next",
  Right: "right",
  Wrong: "wrong",
  IsDone: "isDone",
  AllRight: "allRight",
} as const;
export const SortPart = { Queue: "queue", Bins: "bins", Buttons: "buttons" } as const;

const placing = z.object({ item: z.nativeEnum(WasteItem), bin: z.nativeEnum(Bin) }).strict();

const sortState = z
  .object({
    /** The things to sort, in the order they come. */
    items: z.array(z.nativeEnum(WasteItem)).min(2).max(8),
    /** What has been put where so far, in order. */
    placed: z.array(placing),
    showFeedback: z.boolean(),
    canSort: z.boolean(),
  })
  .strict();
export type SortState = z.infer<typeof sortState>;

export const nextOf = (s: Pick<SortState, "items" | "placed">): WasteItem | null =>
  s.items.find((i) => !s.placed.some((p) => p.item === i)) ?? null;
export const rightOf = (s: Pick<SortState, "placed">): number =>
  s.placed.filter((p) => binOf(p.item) === p.bin).length;

export function describeSorter(s: SortState): string {
  const next = nextOf(s);
  const done = s.placed
    .map(
      (p) =>
        `${nameOfWaste(p.item)} → ${p.bin === Bin.Bio ? "biodegradable" : "non-biodegradable"}${s.showFeedback ? (binOf(p.item) === p.bin ? " (right)" : " (wrong)") : ""}`,
    )
    .join("; ");
  return `Sorting household waste into a biodegradable bin and a non-biodegradable bin. ${done === "" ? "Nothing sorted yet." : `So far: ${done}.`} ${next === null ? `All sorted: ${rightOf(s)} of ${s.items.length} right.` : `Next: ${nameOfWaste(next)}.`}`;
}

const act = actionsFor<SortState>();

export const wasteSorter = defineProp({
  type: "wasteSorter",
  describe:
    "Sorting household waste into a biodegradable bin (peels, tea leaves, food, leaves, paper, cotton) and a non-biodegradable bin (plastic packets, wrappers, medicine strips, glass, rubber, batteries), one thing at a time, with each placing marked right or wrong.",
  state: sortState,
  defaults: {
    items: [
      WasteItem.Peels,
      WasteItem.MilkPacket,
      WasteItem.Paper,
      WasteItem.Wrapper,
      WasteItem.TeaLeaves,
      WasteItem.GlassBottle,
      WasteItem.Cloth,
      WasteItem.Battery,
    ],
    placed: [],
    showFeedback: true,
    canSort: true,
  },
  inputs: ["items", "showFeedback", "canSort"],
  invariant: (s) => {
    if (new Set(s.items).size !== s.items.length) return "each thing comes once";
    if (s.placed.some((p) => !s.items.includes(p.item)))
      return "placed a thing that isn't in the list";
    if (new Set(s.placed.map((p) => p.item)).size !== s.placed.length)
      return "a thing was placed twice";
    return undefined;
  },
  derived: {
    [SortDerived.Next]: {
      describe: "The next thing to sort, or null when all are sorted",
      compute: (s) => nextOf(s),
    },
    [SortDerived.Right]: {
      describe: "How many things are in the right bin",
      compute: (s) => rightOf(s),
    },
    [SortDerived.Wrong]: {
      describe: "How many things are in the wrong bin",
      compute: (s) => s.placed.length - rightOf(s),
    },
    [SortDerived.IsDone]: {
      describe: "Whether everything has been sorted",
      compute: (s) => s.placed.length === s.items.length,
    },
    [SortDerived.AllRight]: {
      describe: "Whether everything has been sorted, all into the right bins",
      compute: (s) => s.placed.length === s.items.length && rightOf(s) === s.items.length,
    },
  },
  actions: {
    [SortAction.Put]: act({
      describe: "Put the next thing in the biodegradable or the non-biodegradable bin",
      byLearner: true,
      args: z.object({ bin: z.nativeEnum(Bin) }).strict(),
      run: (s, a) => {
        const item = nextOf(s);
        if (item === null) return set({});
        const placed = [...s.placed, { item, bin: a.bin }];
        const emit: Emit[] = [
          { signal: SortSignal.Put, payload: { item, bin: a.bin, isRight: binOf(item) === a.bin } },
        ];
        if (placed.length === s.items.length) {
          const right = rightOf({ placed });
          emit.push({
            signal: SortSignal.Sorted,
            payload: { right, allRight: right === s.items.length },
          });
        }
        return set({ placed }, ...emit);
      },
    }),
    [SortAction.Reset]: act({
      describe: "Take everything out and start again",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ placed: [] }),
    }),
  },
  signals: {
    [SortSignal.Put]: {
      describe: "A thing went into a bin; the payload says whether it was the right one",
    },
    [SortSignal.Sorted]: {
      describe: "Everything is sorted; the payload has how many were right",
      isCommit: true,
    },
  },
  observe: (s) => ({
    summary: describeSorter(s),
    elements: [{ id: SortPart.Bins, value: describeSorter(s) }],
  }),
  parts: () => [SortPart.Queue, SortPart.Bins, SortPart.Buttons],
});
