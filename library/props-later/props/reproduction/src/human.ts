import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * The human reproductive systems (NCERT 8.3.3 a, b), as simple schematic labelled diagrams like
 * Figs 8.10 and 8.11: tap an organ for its name and job. Also the journey of the egg (released from
 * an ovary, fertilised in the oviduct, the embryo implanting in the uterus lining) and a close-up of
 * the placenta. Wording follows the textbook: factual and plain.
 */

export const HumanMode = {
  Male: "male",
  Female: "female",
  Journey: "journey",
  Placenta: "placenta",
} as const;
export type HumanMode = (typeof HumanMode)[keyof typeof HumanMode];

export const MaleOrgan = {
  Testis: "testis",
  Scrotum: "scrotum",
  VasDeferens: "vasDeferens",
  SeminalVesicle: "seminalVesicle",
  Prostate: "prostate",
  UrinaryBladder: "urinaryBladder",
  Urethra: "urethra",
  Penis: "penis",
} as const;
export const FemaleOrgan = {
  Ovary: "ovary",
  Oviduct: "oviduct",
  Uterus: "uterus",
  Cervix: "cervix",
  Vagina: "vagina",
} as const;
export const Organ = { ...MaleOrgan, ...FemaleOrgan } as const;
export type Organ = (typeof Organ)[keyof typeof Organ];

export const MALE_ORGANS: readonly Organ[] = Object.values(MaleOrgan);
export const FEMALE_ORGANS: readonly Organ[] = Object.values(FemaleOrgan);

export const ORGAN_JOBS: Readonly<Record<Organ, string>> = {
  testis:
    "Testes: where the male germ cells, sperms, are formed. They also secrete the hormone testosterone, which regulates sperm formation and brings the changes seen in boys at puberty.",
  scrotum:
    "Scrotum: holds the testes outside the abdominal cavity, because sperm formation needs a temperature lower than normal body temperature.",
  vasDeferens:
    "Vas deferens: the tube that carries sperms from the testis. It unites with a tube coming from the urinary bladder.",
  seminalVesicle:
    "Seminal vesicles: glands along the path of the vas deferens. Their secretion forms a fluid that makes the sperms' transport easier and gives them nutrition.",
  prostate:
    "Prostate gland: adds its secretion to the fluid that carries the sperms, easing their transport and providing nutrition.",
  urinaryBladder: "Urinary bladder: stores urine. The tube from it joins the vas deferens.",
  urethra: "Urethra: the common passage for both sperms and urine.",
  penis: "Penis: the organ through which the urethra passes; it delivers the sperms.",
  ovary:
    "Ovaries: make the female germ cells, eggs, and some hormones. From puberty, one egg is produced every month by one of the ovaries.",
  oviduct:
    "Oviduct (fallopian tube): carries the egg from the ovary towards the uterus. Fertilisation takes place here.",
  uterus:
    "Uterus: an elastic, bag-like organ formed where the two oviducts unite. The embryo is implanted in its lining and develops here.",
  cervix: "Cervix: the opening of the uterus into the vagina.",
  vagina:
    "Vagina: the passage from the cervix to the outside of the body. Sperms enter through it.",
};

export const JOURNEY_STEPS = 5;

export const HumanAction = { Tap: "tap", Next: "next", Reset: "reset" } as const;
export const HumanSignal = { Tapped: "tapped", Stepped: "stepped" } as const;
export const HumanDerived = {
  Job: "job",
  StepCount: "stepCount",
  IsDone: "isDone",
  System: "system",
} as const;
export const HumanPart = { Picture: "picture", Next: "next", ...Organ } as const;

const humanState = z
  .object({
    mode: z.nativeEnum(HumanMode),
    selected: z.nativeEnum(Organ).nullable(),
    step: z
      .number()
      .int()
      .min(0)
      .max(JOURNEY_STEPS - 1),
    showNames: z.boolean(),
    canTap: z.boolean(),
    canStep: z.boolean(),
  })
  .strict();
export type HumanState = z.infer<typeof humanState>;

/** Which system an organ belongs to. */
export const systemOf = (o: Organ): "male" | "female" =>
  MALE_ORGANS.includes(o) ? "male" : "female";

const JOURNEY_WORDS = [
  "One of the ovaries releases an egg.",
  "The egg is carried along the oviduct (fallopian tube). Sperms travel upwards and reach the oviduct.",
  "In the oviduct a sperm fuses with the egg: fertilisation. The fertilised egg is the zygote.",
  "The zygote starts dividing and forms a ball of cells, the embryo, which moves to the uterus.",
  "The embryo is implanted in the thick lining of the uterus, where it grows and develops organs to become a foetus. It gets nutrition from the mother's blood through the placenta.",
] as const;

const PLACENTA_WORDS =
  "The placenta: a disc embedded in the uterine wall. On the embryo's side it has villi; on the mother's side, blood spaces surround them. This large surface lets glucose and oxygen pass from the mother to the embryo, and the embryo's wastes pass into the mother's blood to be removed.";

export function describeHuman(s: HumanState): string {
  switch (s.mode) {
    case HumanMode.Male:
      return s.selected === null || systemOf(s.selected) !== "male"
        ? "A simple labelled diagram of the human male reproductive system: testes in the scrotum, vas deferens, seminal vesicles, prostate gland, urinary bladder, urethra and penis."
        : ORGAN_JOBS[s.selected];
    case HumanMode.Female:
      return s.selected === null || systemOf(s.selected) !== "female"
        ? "A simple labelled diagram of the human female reproductive system: two ovaries, two oviducts (fallopian tubes), the uterus, the cervix and the vagina."
        : ORGAN_JOBS[s.selected];
    case HumanMode.Journey:
      return JOURNEY_WORDS[s.step] ?? JOURNEY_WORDS[0];
    case HumanMode.Placenta:
      return PLACENTA_WORDS;
  }
}

const act = actionsFor<HumanState>();

export const humanSystems = defineProp({
  type: "humanSystems",
  describe:
    "Simple schematic labelled diagrams of the human reproductive systems, at NCERT's level. Male mode: testes, scrotum, vas deferens, seminal vesicles, prostate, urinary bladder, urethra, penis. Female mode: ovaries, oviducts, uterus, cervix, vagina. Tap an organ for its job. Journey mode (5 steps): egg released, along the oviduct, fertilisation there, embryo, implantation in the uterus lining. Placenta mode: villi and blood spaces; glucose and oxygen to the embryo, wastes to the mother.",
  state: humanState,
  defaults: {
    mode: HumanMode.Female,
    selected: null,
    step: 0,
    showNames: true,
    canTap: true,
    canStep: true,
  },
  inputs: ["mode", "showNames", "canTap", "canStep"],
  derived: {
    [HumanDerived.Job]: {
      describe: "The tapped organ's job, or null",
      compute: (s) => (s.selected === null ? null : ORGAN_JOBS[s.selected]),
    },
    [HumanDerived.System]: {
      describe: "The tapped organ's system: 'male' or 'female', or null",
      compute: (s) => (s.selected === null ? null : systemOf(s.selected)),
    },
    [HumanDerived.StepCount]: {
      describe: "Journey mode: how many steps (5); 1 otherwise",
      compute: (s) => (s.mode === HumanMode.Journey ? JOURNEY_STEPS : 1),
    },
    [HumanDerived.IsDone]: {
      describe: "Journey mode: the last step is showing",
      compute: (s) => s.mode !== HumanMode.Journey || s.step === JOURNEY_STEPS - 1,
    },
  },
  actions: {
    [HumanAction.Tap]: act({
      describe: "Tap an organ in the diagram to see its name and job",
      byLearner: true,
      args: z.object({ organ: z.nativeEnum(Organ) }).strict(),
      run: (_s, a) =>
        set(
          { selected: a.organ },
          { signal: HumanSignal.Tapped, payload: { organ: a.organ, system: systemOf(a.organ) } },
        ),
    }),
    [HumanAction.Next]: act({
      describe: "Journey mode: show the next step (stays on the last)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, JOURNEY_STEPS - 1);
        return set({ step }, { signal: HumanSignal.Stepped, payload: { step } });
      },
    }),
    [HumanAction.Reset]: act({
      describe: "Journey mode: back to the first step",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
  },
  signals: {
    [HumanSignal.Tapped]: { describe: "The learner tapped `organ` (its `system`)" },
    [HumanSignal.Stepped]: { describe: "Journey mode moved to `step`" },
  },
  observe: (s) => ({
    summary: describeHuman(s),
    elements: [{ id: HumanPart.Picture, value: describeHuman(s) }],
  }),
  parts: (s) => {
    if (s.mode === HumanMode.Male) return [HumanPart.Picture, ...MALE_ORGANS];
    if (s.mode === HumanMode.Female) return [HumanPart.Picture, ...FEMALE_ORGANS];
    if (s.mode === HumanMode.Journey) return [HumanPart.Picture, HumanPart.Next];
    return [HumanPart.Picture];
  },
});
