import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Contraceptive methods as NCERT 8.3.3 (d) groups them, as tappable cards: barrier (condoms and
 * similar coverings), hormonal (oral pills), devices in the uterus (loop, copper-T) and surgical
 * (blocking the vas deferens or the fallopian tube). Each card says how it prevents fertilisation,
 * its drawbacks as the textbook gives them, and whether it helps against sexually transmitted
 * diseases (only the condom, to some extent).
 */

export const ContraceptionMethod = {
  Condom: "condom",
  Pill: "pill",
  CopperT: "copperT",
  Surgical: "surgical",
} as const;
export type ContraceptiveMethod = (typeof ContraceptionMethod)[keyof typeof ContraceptionMethod];

export const Category = {
  Barrier: "barrier",
  Hormonal: "hormonal",
  Device: "device",
  Surgical: "surgical",
} as const;
export type Category = (typeof Category)[keyof typeof Category];

export const METHODS: Readonly<
  Record<
    ContraceptiveMethod,
    { category: Category; how: string; drawback: string; protectsStd: boolean }
  >
> = {
  condom: {
    category: Category.Barrier,
    how: "A mechanical barrier (a condom on the penis, or a similar covering worn in the vagina) so that sperm does not reach the egg.",
    drawback: "None given in the text.",
    protectsStd: true,
  },
  pill: {
    category: Category.Hormonal,
    how: "Oral pills change the hormonal balance of the body so that eggs are not released and fertilisation cannot occur.",
    drawback: "Because they change hormonal balances, they can cause side effects.",
    protectsStd: false,
  },
  copperT: {
    category: Category.Device,
    how: "A device such as the loop or the copper-T is placed in the uterus to prevent pregnancy.",
    drawback: "It can cause side effects due to irritation of the uterus.",
    protectsStd: false,
  },
  surgical: {
    category: Category.Surgical,
    how: "Surgery blocks the vas deferens in the male, so sperm transfer is prevented, or the fallopian tube in the female, so the egg cannot reach the uterus.",
    drawback:
      "Safe in the long run, but surgery itself can cause infections and other problems if not performed properly.",
    protectsStd: false,
  },
};

export const ContraceptionAction = { Tap: "tap" } as const;
export const ContraceptionSignal = { Tapped: "tapped" } as const;
export const ContraceptionDerived = {
  Category: "category",
  ProtectsStd: "protectsStd",
} as const;
export const ContraceptionPart = { Cards: "cards", Detail: "detail" } as const;

const contraceptionState = z
  .object({
    selected: z.nativeEnum(ContraceptionMethod).nullable(),
    canTap: z.boolean(),
    /** Show the "helps against sexually transmitted diseases?" line on each card. */
    showStd: z.boolean(),
  })
  .strict();
export type ContraceptionState = z.infer<typeof contraceptionState>;

export function describeContraception(s: ContraceptionState): string {
  if (s.selected === null)
    return "Four kinds of contraceptive method: barrier (condom), hormonal (oral pills), a device in the uterus (loop, copper-T) and surgical (blocking the vas deferens or fallopian tube). Tap one to read how it works.";
  const m = METHODS[s.selected];
  return `${m.how} ${m.drawback} ${m.protectsStd ? "It helps prevent the transmission of many sexually transmitted infections, to some extent." : "It does not protect against sexually transmitted diseases."}`;
}

const act = actionsFor<ContraceptionState>();

export const contraceptionChart = defineProp({
  type: "contraceptionChart",
  describe:
    "Contraceptive methods as NCERT groups them, as four tappable cards: condom (barrier), oral pills (hormonal), loop/copper-T (device in the uterus), surgical (blocking vas deferens or fallopian tube). The tapped card shows how it prevents fertilisation, its drawbacks, and whether it helps against STDs (only the condom, to some extent).",
  state: contraceptionState,
  defaults: { selected: null, canTap: true, showStd: true },
  inputs: ["canTap", "showStd"],
  derived: {
    [ContraceptionDerived.Category]: {
      describe: "The tapped method's category: barrier, hormonal, device or surgical; null if none",
      compute: (s) => (s.selected === null ? null : METHODS[s.selected].category),
    },
    [ContraceptionDerived.ProtectsStd]: {
      describe: "Whether the tapped method helps against STDs (only the condom); null if none",
      compute: (s) => (s.selected === null ? null : METHODS[s.selected].protectsStd),
    },
  },
  actions: {
    [ContraceptionAction.Tap]: act({
      describe: "Tap a method's card to read how it works",
      byLearner: true,
      args: z.object({ method: z.nativeEnum(ContraceptionMethod) }).strict(),
      run: (_s, a) =>
        set(
          { selected: a.method },
          {
            signal: ContraceptionSignal.Tapped,
            payload: { method: a.method, category: METHODS[a.method].category },
          },
        ),
    }),
  },
  signals: { [ContraceptionSignal.Tapped]: { describe: "The learner tapped `method`" } },
  observe: (s) => ({
    summary: describeContraception(s),
    elements: [{ id: ContraceptionPart.Detail, value: describeContraception(s) }],
  }),
  parts: () => [ContraceptionPart.Cards, ContraceptionPart.Detail],
});
