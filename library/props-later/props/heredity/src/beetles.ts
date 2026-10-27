import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { nextRandom } from "./genetics";

/**
 * NCERT's beetles (9.3.1): a population in green bushes, generation by generation. Colour is
 * inherited; crows eat the beetles they can see (red, blue), not green ones on green leaves; an
 * elephant can trample the bush and leave a few survivors by pure chance; a food shortage makes
 * beetles small, but that is not inherited. Speciation mode: two hills, a river can split them.
 */

export const BeetleColour = { Red: "red", Green: "green", Blue: "blue" } as const;
export type BeetleColour = (typeof BeetleColour)[keyof typeof BeetleColour];
export const BeetleMode = { Selection: "selection", Speciation: "speciation" } as const;
export type BeetleMode = (typeof BeetleMode)[keyof typeof BeetleMode];
export const Food = { Plenty: "plenty", Scarce: "scarce" } as const;
export type Food = (typeof Food)[keyof typeof Food];
export const BeetleEvent = {
  Mutation: "mutation",
  Elephant: "elephant",
  Scarcity: "scarcity",
  Plenty: "plenty",
  River: "river",
  Crows: "crows",
  NoCrows: "noCrows",
} as const;
export type BeetleEvent = (typeof BeetleEvent)[keyof typeof BeetleEvent];

export const BeetleAction = {
  NextGeneration: "nextGeneration",
  Elephant: "elephant",
  SetFood: "setFood",
  Mutate: "mutate",
  SetCrows: "setCrows",
  SetRiver: "setRiver",
  Reset: "reset",
} as const;
export const BeetleSignal = { Bred: "bred", Trampled: "trampled", Changed: "changed" } as const;
export const BeetleDerived = {
  Fractions: "fractions",
  Total: "total",
  Size: "size",
  CanInterbreed: "canInterbreed",
  GreenLeft: "greenLeft",
  GreenRight: "greenRight",
} as const;
export const BeetlePart = {
  Bush: "bush",
  Bars: "bars",
  Left: "left",
  Right: "right",
  River: "river",
  Controls: "controls",
} as const;

/** How many beetles a bush feeds: the population is held to this. */
export const CAPACITY = 36;
/** How many beetles an elephant leaves alive. */
export const SURVIVORS = 4;
/** How many generations apart (split by the river) until the two groups can no longer interbreed. */
export const APART = 5;

const countsSchema = z
  .object({
    red: z.number().int().min(0),
    green: z.number().int().min(0),
    blue: z.number().int().min(0),
  })
  .strict();
export type Counts = z.infer<typeof countsSchema>;

const beetleState = z
  .object({
    mode: z.nativeEnum(BeetleMode),
    /** Selection mode: the one population, by colour. Speciation mode: the left hill's. */
    beetles: countsSchema,
    /** Speciation mode: the right hill's population. */
    right: countsSchema,
    /** Whether crows hunt the bush (speciation: always on the right; eagles keep the left clear). */
    hasCrows: z.boolean(),
    food: z.nativeEnum(Food),
    generation: z.number().int().min(0),
    /** Speciation mode: whether a river now separates the hills. */
    isSplit: z.boolean(),
    /** Speciation mode: generations since the river split them. */
    generationsApart: z.number().int().min(0),
    events: z
      .array(
        z
          .object({ generation: z.number().int().min(0), event: z.nativeEnum(BeetleEvent) })
          .strict(),
      )
      .max(30),
    canBreed: z.boolean(),
    canElephant: z.boolean(),
    canFood: z.boolean(),
    canMutate: z.boolean(),
    canCrows: z.boolean(),
    canRiver: z.boolean(),
    seed: z.number().int().min(0),
  })
  .strict();
export type BeetleState = z.infer<typeof beetleState>;

export const COLOURS = [BeetleColour.Red, BeetleColour.Green, BeetleColour.Blue] as const;

export function totalOf(c: Counts): number {
  return c.red + c.green + c.blue;
}

export function fractionsOf(c: Counts): Counts {
  const t = totalOf(c);
  return t === 0
    ? { red: 0, green: 0, blue: 0 }
    : { red: c.red / t, green: c.green / t, blue: c.blue / t };
}

/** Scale counts down to the bush's capacity, keeping the shares (largest remainders). */
export function capped(c: Counts, cap = CAPACITY): Counts {
  const t = totalOf(c);
  if (t <= cap) return c;
  const raw = COLOURS.map((k) => (c[k] * cap) / t);
  const whole = raw.map(Math.floor);
  let left = cap - whole.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, frac: r - Math.floor(r) })).sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (left <= 0) break;
    whole[i] = (whole[i] ?? 0) + 1;
    left--;
  }
  return { red: whole[0] ?? 0, green: whole[1] ?? 0, blue: whole[2] ?? 0 };
}

/** One generation in a bush: every beetle has two young like itself; crows eat half of the seen ones. */
export function breed(c: Counts, hasCrows: boolean): Counts {
  const young = { red: c.red * 2, green: c.green * 2, blue: c.blue * 2 };
  const eaten = hasCrows
    ? { red: Math.floor(young.red / 2), green: 0, blue: Math.floor(young.blue / 2) }
    : { red: 0, green: 0, blue: 0 };
  return capped({ red: young.red - eaten.red, green: young.green, blue: young.blue - eaten.blue });
}

/** A generation by pure chance (no one is picked out): the bush's beetles are drawn afresh. */
export function drift(c: Counts, seed: number, n = CAPACITY): { counts: Counts; seed: number } {
  const t = totalOf(c);
  if (t === 0) return { counts: c, seed };
  const out = { red: 0, green: 0, blue: 0 };
  let s = seed;
  for (let i = 0; i < Math.min(n, Math.max(t * 2, 1)); i++) {
    const r = nextRandom(s);
    s = r.seed;
    const x = r.value * t;
    if (x < c.red) out.red++;
    else if (x < c.red + c.green) out.green++;
    else out.blue++;
  }
  return { counts: capped(out), seed: s };
}

/** An elephant tramples the bush: `SURVIVORS` beetles, picked by chance, live. */
export function trample(c: Counts, seed: number): { counts: Counts; seed: number } {
  const pool: BeetleColour[] = [];
  for (const k of COLOURS) for (let i = 0; i < c[k]; i++) pool.push(k);
  const out = { red: 0, green: 0, blue: 0 };
  let s = seed;
  for (let i = 0; i < SURVIVORS && pool.length > 0; i++) {
    const r = nextRandom(s);
    s = r.seed;
    const [k] = pool.splice(Math.floor(r.value * pool.length), 1);
    if (k !== undefined) out[k]++;
  }
  return { counts: out, seed: s };
}

/** Gene flow: a few beetles cross between the hills, pulling each towards the other. */
export function mix(a: Counts, b: Counts): { a: Counts; b: Counts } {
  const share = 0.25;
  const fa = fractionsOf(a);
  const fb = fractionsOf(b);
  const toward = (x: Counts, fx: Counts, fy: Counts): Counts => {
    const t = totalOf(x);
    return capped({
      red: Math.round(t * (fx.red * (1 - share) + fy.red * share)),
      green: Math.round(t * (fx.green * (1 - share) + fy.green * share)),
      blue: Math.round(t * (fx.blue * (1 - share) + fy.blue * share)),
    });
  };
  return { a: toward(a, fa, fb), b: toward(b, fb, fa) };
}

/** The beetles' size: small while food is short. Not in the genes, so not passed on. */
export function sizeOf(s: Pick<BeetleState, "food">): string {
  return s.food === Food.Scarce ? "small" : "normal";
}

export function canInterbreed(s: Pick<BeetleState, "generationsApart">): boolean {
  return s.generationsApart < APART;
}

const log = (s: BeetleState, event: BeetleEvent) =>
  [...s.events, { generation: s.generation, event }].slice(-30);

const WORDS_OF: Readonly<Record<BeetleColour, string>> = {
  red: "red",
  green: "green",
  blue: "blue",
};

function describeCounts(c: Counts): string {
  return COLOURS.filter((k) => c[k] > 0)
    .map((k) => `${c[k]} ${WORDS_OF[k]}`)
    .join(", ");
}

export function describeBeetles(s: BeetleState): string {
  if (s.mode === BeetleMode.Speciation)
    return `Generation ${s.generation}. Two hills of bushes${s.isSplit ? `, split by a river for ${s.generationsApart} generations` : ", beetles crossing between them"}. Left hill (eagles keep crows away): ${describeCounts(s.beetles)}. Right hill (crows): ${describeCounts(s.right)}.${canInterbreed(s) ? "" : " The two groups have become so different they can no longer interbreed: two species."}`;
  return `Generation ${s.generation} of beetles in a green bush${s.hasCrows ? ", with crows hunting" : ""}: ${describeCounts(s.beetles) || "none left"}${s.food === Food.Scarce ? "; food is short, so the beetles are small" : ""}.`;
}

const act = actionsFor<BeetleState>();

export const beetlePopulation = defineProp({
  type: "beetlePopulation",
  describe:
    "NCERT's beetles in green bushes, generation by generation: colour (red, green, blue) is inherited; crows eat the red and blue beetles they can see but not green ones on green leaves (natural selection); an elephant can trample the bush leaving a few survivors by chance (genetic drift); a food shortage makes beetles small but that is not inherited (an acquired trait); a new colour can appear. Speciation mode: two hills, crows only on one; a river can split them, and after some generations apart they can no longer interbreed.",
  state: beetleState,
  defaults: {
    mode: BeetleMode.Selection,
    beetles: { red: 12, green: 0, blue: 0 },
    right: { red: 18, green: 2, blue: 0 },
    hasCrows: true,
    food: Food.Plenty,
    generation: 0,
    isSplit: false,
    generationsApart: 0,
    events: [],
    canBreed: true,
    canElephant: false,
    canFood: false,
    canMutate: true,
    canCrows: false,
    canRiver: true,
    seed: 11,
  },
  inputs: [
    "mode",
    "beetles",
    "right",
    "hasCrows",
    "canBreed",
    "canElephant",
    "canFood",
    "canMutate",
    "canCrows",
    "canRiver",
  ],
  derived: {
    [BeetleDerived.Fractions]: {
      describe: "Each colour's share of the (left) population",
      compute: (s) => fractionsOf(s.beetles),
    },
    [BeetleDerived.Total]: {
      describe: "How many beetles there are (left hill in speciation mode)",
      compute: (s) => totalOf(s.beetles),
    },
    [BeetleDerived.Size]: {
      describe: "The beetles' size: small while food is short, normal otherwise (never inherited)",
      compute: (s) => sizeOf(s),
    },
    [BeetleDerived.CanInterbreed]: {
      describe: "Speciation mode: whether the two hills' beetles can still interbreed",
      compute: (s) => canInterbreed(s),
    },
    [BeetleDerived.GreenLeft]: {
      describe: "Speciation mode: the share of green beetles on the left hill",
      compute: (s) => fractionsOf(s.beetles).green,
    },
    [BeetleDerived.GreenRight]: {
      describe: "Speciation mode: the share of green beetles on the right hill",
      compute: (s) => fractionsOf(s.right).green,
    },
  },
  actions: {
    [BeetleAction.NextGeneration]: act({
      describe:
        "One generation: beetles breed (young the colour of their parents), crows eat the beetles they can see; in speciation mode each hill on its own, with beetles crossing unless a river splits them",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const generation = s.generation + 1;
        if (s.mode === BeetleMode.Speciation) {
          // Left: no crows, so colour changes only by chance. Right: crows pick out the seen ones.
          const left = drift(breed(s.beetles, false), s.seed);
          let a = left.counts;
          let b = breed(s.right, true);
          if (!s.isSplit) ({ a, b } = mix(a, b));
          return set(
            {
              beetles: a,
              right: b,
              generation,
              seed: left.seed,
              generationsApart: s.isSplit ? s.generationsApart + 1 : 0,
            },
            { signal: BeetleSignal.Bred, payload: { generation } },
          );
        }
        return set(
          { beetles: breed(s.beetles, s.hasCrows), generation },
          { signal: BeetleSignal.Bred, payload: { generation } },
        );
      },
    }),
    [BeetleAction.Elephant]: act({
      describe: "An elephant tramples the bush: only a few beetles survive, picked by pure chance",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const t = trample(s.beetles, s.seed);
        return set(
          { beetles: t.counts, seed: t.seed, events: log(s, BeetleEvent.Elephant) },
          { signal: BeetleSignal.Trampled, payload: { survivors: t.counts } },
        );
      },
    }),
    [BeetleAction.SetFood]: act({
      describe: "Food runs short (beetles grow up small) or is plentiful again",
      byLearner: true,
      args: z.object({ food: z.nativeEnum(Food) }).strict(),
      run: (s, a) =>
        set(
          {
            food: a.food,
            events: log(s, a.food === Food.Scarce ? BeetleEvent.Scarcity : BeetleEvent.Plenty),
          },
          { signal: BeetleSignal.Changed, payload: { food: a.food } },
        ),
    }),
    [BeetleAction.Mutate]: act({
      describe: "A new colour turns up: one red beetle's young is green or blue, and passes it on",
      byLearner: true,
      args: z.object({ colour: z.enum([BeetleColour.Green, BeetleColour.Blue]) }).strict(),
      run: (s, a) => {
        if (s.beetles.red === 0) return set({});
        const beetles = {
          ...s.beetles,
          red: s.beetles.red - 1,
          [a.colour]: s.beetles[a.colour] + 1,
        };
        return set(
          { beetles, events: log(s, BeetleEvent.Mutation) },
          { signal: BeetleSignal.Changed, payload: { colour: a.colour } },
        );
      },
    }),
    [BeetleAction.SetCrows]: act({
      describe: "Crows come to the bush, or go",
      byLearner: true,
      args: z.object({ on: z.boolean() }).strict(),
      run: (s, a) =>
        set(
          { hasCrows: a.on, events: log(s, a.on ? BeetleEvent.Crows : BeetleEvent.NoCrows) },
          { signal: BeetleSignal.Changed, payload: { crows: a.on } },
        ),
    }),
    [BeetleAction.SetRiver]: act({
      describe: "Speciation mode: a river splits the two hills (or not)",
      byLearner: true,
      args: z.object({ on: z.boolean() }).strict(),
      run: (s, a) =>
        set(
          {
            isSplit: a.on,
            generationsApart: a.on ? s.generationsApart : 0,
            events: log(s, BeetleEvent.River),
          },
          { signal: BeetleSignal.Changed, payload: { river: a.on } },
        ),
    }),
    [BeetleAction.Reset]: act({
      describe: "Back to the start: generation 0",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        set({
          beetles:
            s.mode === BeetleMode.Speciation
              ? { red: 18, green: 2, blue: 0 }
              : { red: 12, green: 0, blue: 0 },
          right: { red: 18, green: 2, blue: 0 },
          generation: 0,
          food: Food.Plenty,
          isSplit: false,
          generationsApart: 0,
          events: [],
        }),
    }),
  },
  signals: {
    [BeetleSignal.Bred]: { describe: "A generation passed; `generation` is the new one" },
    [BeetleSignal.Trampled]: { describe: "An elephant trampled the bush; `survivors` by colour" },
    [BeetleSignal.Changed]: {
      describe: "The surroundings changed (food, crows, river) or a new colour appeared",
    },
  },
  observe: (s) => {
    const elements: Element[] =
      s.mode === BeetleMode.Speciation
        ? [
            { id: BeetlePart.Left, value: `left hill: ${describeCounts(s.beetles)}` },
            { id: BeetlePart.Right, value: `right hill: ${describeCounts(s.right)}` },
            {
              id: BeetlePart.River,
              value: s.isSplit
                ? `a river between them, ${s.generationsApart} generations apart`
                : "no river: beetles cross",
            },
          ]
        : [
            { id: BeetlePart.Bush, value: `${totalOf(s.beetles)} beetles, ${sizeOf(s)} size` },
            { id: BeetlePart.Bars, value: describeCounts(s.beetles) },
          ];
    return { summary: describeBeetles(s), elements };
  },
  parts: (s) =>
    s.mode === BeetleMode.Speciation
      ? [BeetlePart.Left, BeetlePart.Right, BeetlePart.River, BeetlePart.Controls]
      : [BeetlePart.Bush, BeetlePart.Bars, BeetlePart.Controls],
});
