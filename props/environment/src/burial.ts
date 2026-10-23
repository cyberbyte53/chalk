import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { WASTE_ITEMS, WasteItem, isBiodegradable, leftAfter, nameOfWaste } from "./waste";

/**
 * Activity 15.5: household waste buried under 15 cm of moist soil and checked every 15 days.
 * Biodegradable things (broken down by bacteria and fungi) change and disappear, peels and food
 * fastest; plastics, foil, glass and rubber stay just as they were.
 */

export const CHECK_EVERY = 15;
export const MAX_DAYS = 60;

export const BurialAction = { Wait: "wait", Reset: "reset" } as const;
export const BurialSignal = { Checked: "checked", Finished: "finished" } as const;
export const BurialDerived = {
  Changed: "changed",
  Unchanged: "unchanged",
  Gone: "gone",
  Fastest: "fastest",
  Biodegradable: "biodegradable",
} as const;
export const BurialPart = { Pit: "pit", Wait: "wait" } as const;

const burialState = z
  .object({
    /** What was buried (2 to 8 things), left to right. */
    items: z.array(z.nativeEnum(WasteItem)).min(2).max(8),
    /** Days since burying: 0, 15, 30, 45 or 60. */
    days: z.number().int().min(0).max(MAX_DAYS).multipleOf(CHECK_EVERY),
    /** Writes "biodegradable" / "non-biodegradable" under each thing. */
    showKinds: z.boolean(),
    canWait: z.boolean(),
  })
  .strict();
export type BurialState = z.infer<typeof burialState>;

export const changedAt = (items: readonly WasteItem[], days: number): WasteItem[] =>
  items.filter((i) => days > 0 && leftAfter(i, days) < 1);
export const goneAt = (items: readonly WasteItem[], days: number): WasteItem[] =>
  items.filter((i) => leftAfter(i, days) === 0);
/** The things gone by the first check. */
export const fastestOf = (items: readonly WasteItem[]): WasteItem[] => goneAt(items, CHECK_EVERY);

export function describeBurial(s: BurialState): string {
  const what = s.items.map(nameOfWaste).join(", ");
  if (s.days === 0)
    return `Freshly buried under 15 cm of moist soil: ${what}. Nothing has had time to change yet.`;
  const gone = goneAt(s.items, s.days);
  const changing = changedAt(s.items, s.days).filter((i) => !gone.includes(i));
  const same = s.items.filter((i) => !isBiodegradable(i));
  return `Dug up after ${s.days} days. ${gone.length > 0 ? `Gone: ${gone.map(nameOfWaste).join(", ")}. ` : ""}${changing.length > 0 ? `Breaking down: ${changing.map(nameOfWaste).join(", ")}. ` : ""}${same.length > 0 ? `Unchanged: ${same.map(nameOfWaste).join(", ")}.` : ""}`;
}

const act = actionsFor<BurialState>();

export const wasteBurial = defineProp({
  type: "wasteBurial",
  describe:
    "Activity 15.5's burial pit: household waste buried under 15 cm of moist soil and checked every 15 days, up to 60. Biodegradable things (peels, tea leaves, food, leaves, paper, cotton) are broken down by bacteria and fungi and disappear, the food scraps fastest; plastic packets, medicine strips, glass, rubber, wrappers and batteries stay unchanged.",
  state: burialState,
  defaults: {
    items: [
      WasteItem.Peels,
      WasteItem.TeaLeaves,
      WasteItem.Paper,
      WasteItem.Cloth,
      WasteItem.MilkPacket,
      WasteItem.MedicineStrip,
      WasteItem.GlassBottle,
      WasteItem.Slipper,
    ],
    days: 0,
    showKinds: false,
    canWait: true,
  },
  inputs: ["items", "showKinds", "canWait"],
  invariant: (s) =>
    new Set(s.items).size === s.items.length ? undefined : "each thing is buried once",
  derived: {
    [BurialDerived.Changed]: {
      describe: "The buried things that have changed (begun to break down or gone)",
      compute: (s) => changedAt(s.items, s.days),
    },
    [BurialDerived.Unchanged]: {
      describe: "The buried things still exactly as they were",
      compute: (s) => s.items.filter((i) => !changedAt(s.items, s.days).includes(i)),
    },
    [BurialDerived.Gone]: {
      describe: "The buried things completely broken down",
      compute: (s) => goneAt(s.items, s.days),
    },
    [BurialDerived.Fastest]: {
      describe: "The things gone by the first 15-day check",
      compute: (s) => fastestOf(s.items),
    },
    [BurialDerived.Biodegradable]: {
      describe: "Which buried things are biodegradable",
      compute: (s) => s.items.filter(isBiodegradable),
    },
  },
  actions: {
    [BurialAction.Wait]: act({
      describe: "Wait 15 days, then dig up and look",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const days = Math.min(s.days + CHECK_EVERY, MAX_DAYS);
        const emit: Emit[] = [
          {
            signal: BurialSignal.Checked,
            payload: { days, gone: goneAt(s.items, days), changed: changedAt(s.items, days) },
          },
        ];
        if (days === MAX_DAYS && s.days < MAX_DAYS)
          emit.push({ signal: BurialSignal.Finished, payload: { days } });
        return set({ days }, ...emit);
      },
    }),
    [BurialAction.Reset]: act({
      describe: "Bury everything again, fresh",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ days: 0 }),
    }),
  },
  signals: {
    [BurialSignal.Checked]: { describe: "The pit was dug up after `days` days" },
    [BurialSignal.Finished]: { describe: "The 60-day check is done", isCommit: true },
  },
  observe: (s) => ({
    summary: describeBurial(s),
    elements: [{ id: BurialPart.Pit, value: describeBurial(s) }],
  }),
  parts: () => [BurialPart.Pit, BurialPart.Wait],
});
