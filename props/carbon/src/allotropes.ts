import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Allotropes of carbon (NCERT 4.1, More to Know): the same element, carbon atoms bonded in
 * different ways. Diamond: each carbon bonded to four others in a rigid three-dimensional
 * network, the hardest substance known, no conduction. Graphite: each carbon bonded to three
 * others in a flat hexagonal sheet (one of the bonds a double bond), sheets stacked in layers:
 * smooth, slippery, a very good conductor. Fullerene C-60: sixty carbons in the shape of a
 * football.
 */

export const Allotrope = {
  Diamond: "diamond",
  Graphite: "graphite",
  Fullerene: "fullerene",
} as const;
export type Allotrope = (typeof Allotrope)[keyof typeof Allotrope];

export type Facts = {
  bondsPerCarbon: number;
  shape: { en: string; hi: string };
  feel: { en: string; hi: string };
  conducts: boolean | null;
};

export const FACTS: Readonly<Record<Allotrope, Facts>> = {
  diamond: {
    bondsPerCarbon: 4,
    shape: { en: "a rigid 3-D network", hi: "एक कठोर त्रि-आयामी जाल" },
    feel: { en: "the hardest substance known", hi: "सबसे कठोर ज्ञात पदार्थ" },
    conducts: false,
  },
  graphite: {
    bondsPerCarbon: 3,
    shape: { en: "flat hexagonal sheets in layers", hi: "परतों में सपाट षट्भुजीय चादरें" },
    feel: { en: "smooth and slippery", hi: "चिकना और फिसलन भरा" },
    conducts: true,
  },
  fullerene: {
    bondsPerCarbon: 3,
    shape: { en: "60 carbons shaped like a football", hi: "फ़ुटबॉल के आकार में 60 कार्बन" },
    feel: {
      en: "named after the architect Buckminster Fuller",
      hi: "वास्तुकार बकमिंस्टर फ़ुलर के नाम पर",
    },
    conducts: null,
  },
};

export const AllotropeAction = { Pick: "pick" } as const;
export const AllotropeSignal = { Picked: "picked" } as const;
export const AllotropeDerived = { BondsPerCarbon: "bondsPerCarbon", Conducts: "conducts" } as const;
export const AllotropePart = { Structure: "structure", Pick: "pick", Facts: "facts" } as const;

const allotropeState = z
  .object({
    kind: z.nativeEnum(Allotrope),
    showFacts: z.boolean(),
    canPick: z.boolean(),
    /** Which have been looked at (the learner's tour). */
    seen: z.array(z.nativeEnum(Allotrope)),
  })
  .strict();
export type AllotropeState = z.infer<typeof allotropeState>;

export function describeAllotrope(s: AllotropeState): string {
  const f = FACTS[s.kind];
  return `${s.kind}: carbon atoms in ${f.shape.en}, each bonded to ${f.bondsPerCarbon} others; ${f.feel.en}${f.conducts === null ? "" : f.conducts ? "; conducts electricity" : "; does not conduct electricity"}.`;
}

const act = actionsFor<AllotropeState>();

export const allotropes = defineProp({
  type: "allotropes",
  describe:
    "The allotropes of carbon side by side: diamond (each C bonded to 4, rigid 3-D network, hardest, no conduction), graphite (each C bonded to 3 in flat hexagonal layers, slippery, conducts), fullerene C-60 (football shape). The learner taps to compare.",
  state: allotropeState,
  defaults: { kind: Allotrope.Diamond, showFacts: true, canPick: true, seen: [Allotrope.Diamond] },
  inputs: ["showFacts", "canPick"],
  derived: {
    [AllotropeDerived.BondsPerCarbon]: {
      describe: "How many other carbons each carbon is bonded to",
      compute: (s) => FACTS[s.kind].bondsPerCarbon,
    },
    [AllotropeDerived.Conducts]: {
      describe: "Conducts electricity (null: the chapter doesn't say)",
      compute: (s) => FACTS[s.kind].conducts,
    },
  },
  actions: {
    [AllotropeAction.Pick]: act({
      describe: "Look at another allotrope",
      byLearner: true,
      args: z.object({ kind: z.nativeEnum(Allotrope) }).strict(),
      run: (s, a) =>
        set(
          { kind: a.kind, seen: s.seen.includes(a.kind) ? s.seen : [...s.seen, a.kind] },
          { signal: AllotropeSignal.Picked, payload: { kind: a.kind, seen: s.seen.length + 1 } },
        ),
    }),
  },
  signals: { [AllotropeSignal.Picked]: { describe: "Now showing `kind`" } },
  observe: (s) => ({
    summary: describeAllotrope(s),
    elements: [
      { id: AllotropePart.Structure, value: FACTS[s.kind].shape.en },
      ...(s.showFacts ? [{ id: AllotropePart.Facts, value: FACTS[s.kind].feel.en }] : []),
    ],
  }),
  parts: (s) => [
    AllotropePart.Structure,
    ...(s.showFacts ? [AllotropePart.Facts] : []),
    ...(s.canPick ? [AllotropePart.Pick] : []),
  ],
});

/** The 60 corners of a truncated icosahedron (C-60), edge length 2. */
export function fullereneAtoms(): [number, number, number][] {
  const phi = (1 + Math.sqrt(5)) / 2;
  const seeds: [number, number, number][] = [
    [0, 1, 3 * phi],
    [1, 2 + phi, 2 * phi],
    [phi, 2, phi ** 3],
  ];
  const out: [number, number, number][] = [];
  const key = (p: number[]) => p.map((v) => v.toFixed(4)).join(",");
  const seen = new Set<string>();
  for (const [a, b, c] of seeds) {
    // even permutations (cyclic shifts) with every sign
    for (const [x, y, z] of [
      [a, b, c],
      [b, c, a],
      [c, a, b],
    ] as const) {
      for (const sx of [1, -1])
        for (const sy of [1, -1])
          for (const sz of [1, -1]) {
            const p: [number, number, number] = [x * sx, y * sy, z * sz];
            const k = key(p);
            if (!seen.has(k)) {
              seen.add(k);
              out.push(p);
            }
          }
    }
  }
  return out;
}

/** Pairs of C-60 corners joined by a bond (distance 2). */
export function fullereneBonds(atoms: readonly [number, number, number][]): [number, number][] {
  const bonds: [number, number][] = [];
  for (let i = 0; i < atoms.length; i++)
    for (let j = i + 1; j < atoms.length; j++) {
      const a = atoms[i] as [number, number, number];
      const b = atoms[j] as [number, number, number];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      if (Math.abs(d - 2) < 1e-6) bonds.push([i, j]);
    }
  return bonds;
}

/**
 * A block of the diamond lattice: the diamond-cubic positions in a 5 × 5 × 5 box (the cubic cell
 * is 4 across, bonds are √3 long). Inner atoms each have exactly four neighbours.
 */
export function diamondLattice(): { atoms: [number, number, number][]; bonds: [number, number][] } {
  const atoms: [number, number, number][] = [];
  const face: [number, number, number][] = [
    [0, 0, 0],
    [0, 2, 2],
    [2, 0, 2],
    [2, 2, 0],
  ];
  for (let i = -1; i <= 2; i++)
    for (let j = -1; j <= 2; j++)
      for (let k = -1; k <= 2; k++)
        for (const [a, b, c] of face)
          for (const d of [0, 1]) {
            const p: [number, number, number] = [4 * i + a + d, 4 * j + b + d, 4 * k + c + d];
            if (p.every((v) => v >= 0 && v <= 5)) atoms.push(p);
          }
  const bonds: [number, number][] = [];
  for (let i = 0; i < atoms.length; i++)
    for (let j = i + 1; j < atoms.length; j++) {
      const a = atoms[i] as [number, number, number];
      const b = atoms[j] as [number, number, number];
      if (Math.abs(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) - Math.sqrt(3)) < 1e-6)
        bonds.push([i, j]);
    }
  return { atoms, bonds };
}
