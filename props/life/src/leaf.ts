import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * A leaf lab for photosynthesis (NCERT 6.2.1 and 6.3):
 * - Variegated (Activity 6.1): a leaf with green and cream parts goes through the starch test step
 *   by step; at the end iodine turns only the once-green parts blue-black, so starch is made only
 *   where there is chlorophyll.
 * - Stomata: a pore between two guard cells; water flowing in swells them and opens the pore, which
 *   lets carbon dioxide in and oxygen and water vapour out.
 * - BellJar (Activity 6.2): two plants under sealed bell-jars, one beside potassium hydroxide, which
 *   absorbs carbon dioxide; after sunlight, only the other plant's leaf has starch.
 * - DayNight: a plant's gas exchange by day (oxygen out) and by night (carbon dioxide out).
 */

export const LeafMode = {
  Variegated: "variegated",
  Stomata: "stomata",
  BellJar: "bellJar",
  DayNight: "dayNight",
} as const;
export type LeafMode = (typeof LeafMode)[keyof typeof LeafMode];

export const VARIEGATED_STEPS = 6;
export const BELL_JAR_STEPS = 3;

export const LeafAction = {
  Next: "next",
  Reset: "reset",
  SetOpen: "setOpen",
  SetDay: "setDay",
} as const;
export const LeafSignal = {
  Stepped: "stepped",
  Opened: "opened",
  DayChanged: "dayChanged",
} as const;
export const LeafDerived = {
  StepCount: "stepCount",
  IsDone: "isDone",
  StarchIn: "starchIn",
  GasesIn: "gasesIn",
  GasesOut: "gasesOut",
} as const;
export const LeafPart = { Picture: "picture", Next: "next", Toggle: "toggle" } as const;

const leafState = z
  .object({
    mode: z.nativeEnum(LeafMode),
    /** Variegated and BellJar modes: which step of the experiment is showing. */
    step: z
      .number()
      .int()
      .min(0)
      .max(VARIEGATED_STEPS - 1),
    /** Stomata mode: whether the pore is open. */
    isOpen: z.boolean(),
    /** DayNight mode: day or night. */
    isDay: z.boolean(),
    canStep: z.boolean(),
    canToggle: z.boolean(),
  })
  .strict();
export type LeafState = z.infer<typeof leafState>;

export const stepCountOf = (mode: LeafMode): number =>
  mode === LeafMode.Variegated ? VARIEGATED_STEPS : mode === LeafMode.BellJar ? BELL_JAR_STEPS : 1;

/** Where the starch test found starch, once it has been done; null before. */
export function starchOf(s: Pick<LeafState, "mode" | "step">): string | null {
  if (s.mode === LeafMode.Variegated && s.step === VARIEGATED_STEPS - 1) return "greenPartsOnly";
  if (s.mode === LeafMode.BellJar && s.step === BELL_JAR_STEPS - 1) return "plantWithoutKoh";
  return null;
}

export type Gas = "carbonDioxide" | "oxygen" | "waterVapour";

/** What passes into and out of the leaf, by mode. */
export function gasesOf(s: Pick<LeafState, "mode" | "isOpen" | "isDay">): {
  into: Gas[];
  out: Gas[];
} {
  if (s.mode === LeafMode.Stomata)
    return s.isOpen
      ? { into: ["carbonDioxide"], out: ["oxygen", "waterVapour"] }
      : { into: [], out: [] };
  if (s.mode === LeafMode.DayNight)
    return s.isDay
      ? { into: ["carbonDioxide"], out: ["oxygen"] }
      : { into: ["oxygen"], out: ["carbonDioxide"] };
  return { into: [], out: [] };
}

export const VARIEGATED_WORDS = [
  "A variegated leaf (money plant or croton): green parts with chlorophyll, cream parts without. Its green parts are traced on paper.",
  "The plant was kept in a dark room for three days, so all the starch in its leaves was used up.",
  "Then it was kept in sunlight for about six hours.",
  "The leaf is plucked and dipped in boiling water for a few minutes.",
  "Then it is heated in alcohol in a water-bath: the chlorophyll dissolves, so the leaf goes pale and the alcohol turns green.",
  "Finally it is dipped in dilute iodine and rinsed: only the parts that were green turn blue-black. Starch was made only where there was chlorophyll.",
] as const;

export const BELL_JAR_WORDS = [
  "Two plants kept in the dark for three days, each under an air-tight bell-jar sealed with vaseline. Beside plant A is a watch-glass of potassium hydroxide, which absorbs carbon dioxide; plant B has none.",
  "Both are kept in sunlight for about two hours.",
  "A leaf from each gets the starch test: A's leaf shows no starch (it had no carbon dioxide), B's leaf turns blue-black. Photosynthesis needs carbon dioxide.",
] as const;

export function describeLeaf(s: LeafState): string {
  if (s.mode === LeafMode.Variegated) return VARIEGATED_WORDS[s.step] ?? VARIEGATED_WORDS[0];
  if (s.mode === LeafMode.BellJar) return BELL_JAR_WORDS[s.step] ?? BELL_JAR_WORDS[0];
  if (s.mode === LeafMode.Stomata)
    return s.isOpen
      ? "A stomatal pore on a leaf, open: its two guard cells have swollen with water. Carbon dioxide goes in; oxygen and water vapour come out."
      : "A stomatal pore on a leaf, closed: its two guard cells have shrunk. Little gas passes and little water is lost.";
  return s.isDay
    ? "A plant by day: photosynthesis uses the carbon dioxide from respiration and more, so the plant takes carbon dioxide in and gives oxygen out."
    : "A plant at night: no photosynthesis, only respiration, so the plant takes oxygen in and gives carbon dioxide out.";
}

const act = actionsFor<LeafState>();

export const leafLab = defineProp({
  type: "leafLab",
  describe:
    "A leaf lab for photosynthesis. Variegated mode: the starch test on a variegated leaf, step by step (dark, sunlight, boiling water, alcohol, iodine); only the green parts turn blue-black. Stomata mode: a pore between two guard cells that open when they swell with water, letting carbon dioxide in and oxygen and water vapour out. Bell-jar mode: two sealed plants, one beside potassium hydroxide (absorbs carbon dioxide); only the other makes starch. Day/night mode: oxygen out by day, carbon dioxide out at night.",
  state: leafState,
  defaults: {
    mode: LeafMode.Variegated,
    step: 0,
    isOpen: true,
    isDay: true,
    canStep: true,
    canToggle: true,
  },
  inputs: ["mode", "canStep", "canToggle"],
  invariant: (s) =>
    s.step < stepCountOf(s.mode) ? undefined : "step is past the last step of this mode",
  derived: {
    [LeafDerived.StepCount]: {
      describe: "How many steps this mode's experiment has (1 for stomata and day/night)",
      compute: (s) => stepCountOf(s.mode),
    },
    [LeafDerived.IsDone]: {
      describe: "The experiment has reached its last step (its result is showing)",
      compute: (s) => s.step === stepCountOf(s.mode) - 1,
    },
    [LeafDerived.StarchIn]: {
      describe:
        "Where the starch test found starch: 'greenPartsOnly' (variegated), 'plantWithoutKoh' (bell-jars), or null before the test",
      compute: (s) => starchOf(s),
    },
    [LeafDerived.GasesIn]: {
      describe: "Gases going into the leaf (stomata and day/night modes)",
      compute: (s) => gasesOf(s).into,
    },
    [LeafDerived.GasesOut]: {
      describe: "Gases coming out of the leaf (stomata and day/night modes)",
      compute: (s) => gasesOf(s).out,
    },
  },
  actions: {
    [LeafAction.Next]: act({
      describe: "Do the next step of the experiment (stays on the last step)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, stepCountOf(s.mode) - 1);
        return set(
          { step },
          { signal: LeafSignal.Stepped, payload: { step, starch: starchOf({ ...s, step }) } },
        );
      },
    }),
    [LeafAction.Reset]: act({
      describe: "Start the experiment again",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
    [LeafAction.SetOpen]: act({
      describe: "Stomata mode: water flows into the guard cells (open) or out of them (closed)",
      byLearner: true,
      args: z.object({ open: z.boolean() }).strict(),
      run: (_s, a) =>
        set({ isOpen: a.open }, { signal: LeafSignal.Opened, payload: { open: a.open } }),
    }),
    [LeafAction.SetDay]: act({
      describe: "Day/night mode: switch between day and night",
      byLearner: true,
      args: z.object({ day: z.boolean() }).strict(),
      run: (_s, a) =>
        set({ isDay: a.day }, { signal: LeafSignal.DayChanged, payload: { day: a.day } }),
    }),
  },
  signals: {
    [LeafSignal.Stepped]: {
      describe: "The experiment moved to `step`; `starch` is the result once shown",
    },
    [LeafSignal.Opened]: { describe: "The stoma opened or closed" },
    [LeafSignal.DayChanged]: { describe: "Day/night was switched" },
  },
  observe: (s) => ({
    summary: describeLeaf(s),
    elements: [{ id: LeafPart.Picture, value: describeLeaf(s) }],
  }),
  parts: () => [LeafPart.Picture, LeafPart.Next, LeafPart.Toggle],
});
