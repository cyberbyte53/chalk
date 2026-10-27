import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Newlands' Law of Octaves (NCERT 5.1.2, Table 5.3): elements in order of increasing atomic mass,
 * seven to a row under the notes sa re ga ma pa da ni, so every eighth element falls under the same
 * note as the first. It works up to calcium. After that, unlike elements share a note and two
 * elements are squeezed into one slot (cobalt and nickel, cerium and lanthanum), and iron sits far
 * from cobalt and nickel, which it resembles.
 */

/** Table 5.3 as the book prints it: rows of seven slots, "Co and Ni" sharing a slot, two blanks. */
export const OCTAVE_ROWS: readonly (readonly string[])[] = [
  ["H", "Li", "Be", "B", "C", "N", "O"],
  ["F", "Na", "Mg", "Al", "Si", "P", "S"],
  ["Cl", "K", "Ca", "Cr", "Ti", "Mn", "Fe"],
  ["Co/Ni", "Cu", "Zn", "Y", "In", "As", "Se"],
  ["Br", "Rb", "Sr", "Ce/La", "Zr", "", ""],
];

/** Slots holding two elements at once. */
export const DOUBLE_SLOTS = ["Co/Ni", "Ce/La"] as const;

/** The law holds up to calcium: row 2, note 3 (ga). Every slot after it is where it breaks. */
export function isPastCalcium(row: number, note: number): boolean {
  return row > 2 || (row === 2 && note > 2);
}

/** The pairs NCERT names as alike: every eighth element resembles the first. */
export const GOOD_PAIRS: readonly [string, string][] = [
  ["Li", "Na"],
  ["Be", "Mg"],
  ["Na", "K"],
  ["Mg", "Ca"],
  ["F", "Cl"],
];

/** The elements under one note, top to bottom, skipping blanks. */
export function columnOf(note: number): string[] {
  return OCTAVE_ROWS.map((r) => r[note] ?? "").filter((x) => x !== "");
}

export const OctaveAction = { PickNote: "pickNote", ShowBreaks: "showBreaks" } as const;
export const OctaveSignal = { Picked: "picked", Broke: "broke" } as const;
export const OctaveDerived = { Column: "column", BreakCount: "breakCount" } as const;
export const OctavePart = {
  Notes: "notes",
  Table: "table",
  Breaks: "breaks",
  Toggle: "toggle",
} as const;

const octaveState = z
  .object({
    /** The lit note's column (0 = sa … 6 = ni), or null. */
    note: z.number().int().min(0).max(6).nullable(),
    /** Mark where the law breaks: after calcium, the double slots, iron far from cobalt. */
    showBreaks: z.boolean(),
    canPick: z.boolean(),
    canShowBreaks: z.boolean(),
  })
  .strict();
export type OctaveState = z.infer<typeof octaveState>;

/** Slots marked as breaking the law when breaks are shown: past calcium, plus the double slots. */
export function breakCount(): number {
  let n = 0;
  OCTAVE_ROWS.forEach((row, r) =>
    row.forEach((x, c) => {
      if (x !== "" && (isPastCalcium(r, c) || (DOUBLE_SLOTS as readonly string[]).includes(x))) n++;
    }),
  );
  return n;
}

export function describeOctaves(s: OctaveState): string {
  const base =
    "Newlands' octaves: elements in order of mass, seven to a row under sa re ga ma pa da ni, so every eighth element is under the same note as the first.";
  const lit =
    s.note === null
      ? ""
      : ` Note ${s.note + 1} holds ${columnOf(s.note).join(", ").replace(/\//g, " and ")}.`;
  const breaks = s.showBreaks
    ? " Marked: every slot after calcium, cobalt and nickel squeezed into one slot under the halogens, cerium and lanthanum sharing a slot, and iron far from cobalt and nickel."
    : "";
  return base + lit + breaks;
}

const act = actionsFor<OctaveState>();

export const octaveTable = defineProp({
  type: "octaveTable",
  describe:
    "Newlands' Law of Octaves (NCERT Table 5.3): the elements in rows of seven under the musical notes sa re ga ma pa da ni. Tap a note to light its column (Li, Na, K are alike; Be, Mg, Ca are alike). 'Where it breaks' marks every slot after calcium, the double slots (Co and Ni, Ce and La) and iron sitting far from cobalt and nickel.",
  state: octaveState,
  defaults: { note: null, showBreaks: false, canPick: true, canShowBreaks: true },
  inputs: ["showBreaks", "canPick", "canShowBreaks"],
  derived: {
    [OctaveDerived.Column]: {
      describe: "The elements under the lit note, top to bottom (empty when none is lit)",
      compute: (s) => (s.note === null ? [] : columnOf(s.note)),
    },
    [OctaveDerived.BreakCount]: {
      describe: "How many slots are marked as breaking the law when breaks are shown",
      compute: (s) => (s.showBreaks ? breakCount() : 0),
    },
  },
  actions: {
    [OctaveAction.PickNote]: act({
      describe: "Light the column under one note (0 = sa … 6 = ni)",
      byLearner: true,
      args: z.object({ note: z.number().int().min(0).max(6) }).strict(),
      run: (_s, a) =>
        set(
          { note: a.note },
          { signal: OctaveSignal.Picked, payload: { note: a.note, column: columnOf(a.note) } },
        ),
    }),
    [OctaveAction.ShowBreaks]: act({
      describe: "Show or hide where the law breaks",
      byLearner: true,
      args: z.object({ isOn: z.boolean() }).strict(),
      run: (_s, a) =>
        a.isOn
          ? set(
              { showBreaks: true },
              { signal: OctaveSignal.Broke, payload: { count: breakCount() } },
            )
          : set({ showBreaks: false }),
    }),
  },
  signals: {
    [OctaveSignal.Picked]: { describe: "A note was lit; `column` lists its elements" },
    [OctaveSignal.Broke]: { describe: "The breaks are shown" },
  },
  observe: (s) => ({
    summary: describeOctaves(s),
    elements: [
      ...(s.note === null ? [] : [{ id: OctavePart.Table, value: columnOf(s.note).join(", ") }]),
      ...(s.showBreaks ? [{ id: OctavePart.Breaks, value: `${breakCount()} slots` }] : []),
    ],
  }),
  parts: (s) => [
    OctavePart.Table,
    ...(s.canPick ? [OctavePart.Notes] : []),
    ...(s.showBreaks ? [OctavePart.Breaks] : []),
    ...(s.canShowBreaks ? [OctavePart.Toggle] : []),
  ],
});
