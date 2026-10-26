import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./words";

/**
 * The properties of ionic compounds (NCERT 3.3.1, Activity 3.13): a salt as a solid, dissolved in
 * water, stirred into kerosene, or melted, with two electrodes in it wired to a battery and a bulb.
 * The bulb glows only when the ions are free to move: dissolved in water or molten, not in the
 * solid (a rigid lattice) and not in kerosene (the salt doesn't dissolve).
 */

export const IonicSalt = {
  SodiumChloride: "NaCl",
  CalciumChloride: "CaCl2",
  MagnesiumChloride: "MgCl2",
} as const;
export type IonicSalt = (typeof IonicSalt)[keyof typeof IonicSalt];

/** Table 3.4: melting and boiling points, kelvin. */
export const SALT_POINTS: Record<
  IonicSalt,
  {
    formula: string;
    name: Words;
    meltingK: number;
    boilingK: number;
    cation: string;
    anion: string;
  }
> = {
  NaCl: {
    formula: "NaCl",
    name: { en: "sodium chloride", hi: "सोडियम क्लोराइड" },
    meltingK: 1074,
    boilingK: 1686,
    cation: "Na⁺",
    anion: "Cl⁻",
  },
  CaCl2: {
    formula: "CaCl₂",
    name: { en: "calcium chloride", hi: "कैल्शियम क्लोराइड" },
    meltingK: 1045,
    boilingK: 1900,
    cation: "Ca²⁺",
    anion: "Cl⁻",
  },
  MgCl2: {
    formula: "MgCl₂",
    name: { en: "magnesium chloride", hi: "मैग्नीशियम क्लोराइड" },
    meltingK: 981,
    boilingK: 1685,
    cation: "Mg²⁺",
    anion: "Cl⁻",
  },
};

export const SaltForm = {
  Solid: "solid",
  Water: "water",
  Kerosene: "kerosene",
  Molten: "molten",
} as const;
export type SaltForm = (typeof SaltForm)[keyof typeof SaltForm];
export const SALT_FORMS: readonly SaltForm[] = Object.values(SaltForm);

export const FORM_WORDS: Record<SaltForm, Words> = {
  solid: { en: "solid", hi: "ठोस" },
  water: { en: "in water", hi: "पानी में" },
  kerosene: { en: "in kerosene", hi: "केरोसिन में" },
  molten: { en: "molten", hi: "पिघला हुआ" },
};

/** The ions are free to move: dissolved in water, or molten. */
export const ionsFree = (form: SaltForm): boolean =>
  form === SaltForm.Water || form === SaltForm.Molten;
/** Ionic compounds dissolve in water, not in kerosene or petrol. */
export const dissolves = (form: SaltForm): boolean | null =>
  form === SaltForm.Water ? true : form === SaltForm.Kerosene ? false : null;

export const TesterAction = { SetForm: "setForm", Switch: "switch", Choose: "choose" } as const;
export const TesterSignal = { Switched: "switched" } as const;
export const TesterDerived = {
  Conducts: "conducts",
  IonsFree: "ionsFree",
  Dissolves: "dissolves",
  MeltingK: "meltingK",
} as const;
export const TesterPart = {
  Container: "container",
  Ions: "ions",
  Bulb: "bulb",
  Switch: "switch",
  Forms: "forms",
  Salts: "salts",
} as const;

const testerState = z
  .object({
    salt: z.nativeEnum(IonicSalt),
    form: z.nativeEnum(SaltForm),
    isOn: z.boolean(),
    /** The forms the learner may switch between. */
    forms: z.array(z.nativeEnum(SaltForm)).min(1),
    /** The salts the learner may switch between (none: no switching). */
    salts: z.array(z.nativeEnum(IonicSalt)),
    /** Draw the ions (+ and −) inside the container. */
    showIons: z.boolean(),
  })
  .strict();
export type TesterState = z.infer<typeof testerState>;

export function describeTester(s: TesterState): string {
  const salt = SALT_POINTS[s.salt];
  const form =
    s.form === SaltForm.Solid
      ? "a solid lump, its ions locked in a rigid lattice"
      : s.form === SaltForm.Water
        ? "dissolved in water, its ions free to move"
        : s.form === SaltForm.Kerosene
          ? "stirred into kerosene: it does not dissolve and sits at the bottom"
          : `melted (above ${salt.meltingK} K), its ions free to move`;
  const bulb = s.isOn
    ? ionsFree(s.form)
      ? "the circuit is on and the bulb glows: ions carry the current"
      : "the circuit is on but the bulb stays off"
    : "the circuit is off";
  return `${salt.formula} ${form}; ${bulb}.`;
}

const act = actionsFor<TesterState>();

export const ionicTester = defineProp({
  type: "ionicTester",
  describe:
    "Testing an ionic compound (NCERT Activity 3.13, Table 3.4): NaCl, CaCl₂ or MgCl₂ as a solid, dissolved in water, stirred into kerosene, or molten, with two electrodes wired to a battery and a bulb. The bulb glows only when the ions are free to move (in water, or molten), not in the solid (a rigid lattice) or in kerosene (it doesn't dissolve). Ionic compounds have high melting points (NaCl 1074 K).",
  state: testerState,
  defaults: {
    salt: IonicSalt.SodiumChloride,
    form: SaltForm.Solid,
    isOn: false,
    forms: [...SALT_FORMS],
    salts: [],
    showIons: true,
  },
  inputs: ["forms", "salts", "showIons"],
  invariant: (s) =>
    s.forms.includes(s.form) ? undefined : "the form must be one of those offered",
  derived: {
    [TesterDerived.Conducts]: {
      describe: "The circuit is on and the bulb glows",
      compute: (s) => s.isOn && ionsFree(s.form),
    },
    [TesterDerived.IonsFree]: {
      describe: "The ions are free to move (dissolved in water, or molten)",
      compute: (s) => ionsFree(s.form),
    },
    [TesterDerived.Dissolves]: {
      describe: "Whether it dissolves: true in water, false in kerosene, null when not in a liquid",
      compute: (s) => dissolves(s.form),
    },
    [TesterDerived.MeltingK]: {
      describe: "Its melting point, kelvin (Table 3.4)",
      compute: (s) => SALT_POINTS[s.salt].meltingK,
    },
  },
  actions: {
    [TesterAction.SetForm]: act({
      describe: "Use the salt as a solid, dissolved in water, in kerosene, or molten",
      byLearner: true,
      args: z.object({ form: z.nativeEnum(SaltForm) }).strict(),
      run: (s, a) => set({ form: s.forms.includes(a.form) ? a.form : s.form }),
    }),
    [TesterAction.Switch]: act({
      describe: "Switch the circuit on or off",
      byLearner: true,
      args: z.object({ on: z.boolean() }).strict(),
      run: (s, a) =>
        set(
          { isOn: a.on },
          {
            signal: TesterSignal.Switched,
            payload: { on: a.on, form: s.form, glows: a.on && ionsFree(s.form) },
          },
        ),
    }),
    [TesterAction.Choose]: act({
      describe: "Switch to another salt",
      byLearner: true,
      args: z.object({ salt: z.nativeEnum(IonicSalt) }).strict(),
      run: (s, a) => set({ salt: s.salts.includes(a.salt) ? a.salt : s.salt }),
    }),
  },
  signals: {
    [TesterSignal.Switched]: {
      describe:
        "The circuit was switched on or off; the payload has on, the form, and whether the bulb glows",
    },
  },
  observe: (s) => {
    const elements: Element[] = [
      {
        id: TesterPart.Container,
        value: `${SALT_POINTS[s.salt].formula}, ${FORM_WORDS[s.form].en}`,
      },
      { id: TesterPart.Bulb, value: s.isOn && ionsFree(s.form) ? "glowing" : "off" },
      { id: TesterPart.Switch, value: s.isOn ? "on" : "off" },
    ];
    if (s.showIons)
      elements.push({
        id: TesterPart.Ions,
        value: ionsFree(s.form) ? "ions moving freely" : "ions locked in place",
      });
    return { summary: describeTester(s), elements };
  },
  parts: (s) => [
    TesterPart.Container,
    ...(s.showIons ? [TesterPart.Ions] : []),
    TesterPart.Bulb,
    TesterPart.Switch,
    ...(s.forms.length > 1 ? [TesterPart.Forms] : []),
    ...(s.salts.length > 1 ? [TesterPart.Salts] : []),
  ],
});
