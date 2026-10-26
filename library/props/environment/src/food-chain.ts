import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Food chains, trophic levels, food webs and energy flow (NCERT 15.1.1, Figs 15.1–15.4).
 * - chain: a Fig 15.1 chain (forest, grassland or pond), revealed one trophic level at a time.
 * - web: a grassland food web (Fig 15.3 style); tap an organism to see what it eats and what eats it.
 * - pyramid: the energy at each level. Plants capture about 1% of the sunlight on their leaves; about
 *   10% of each level's food energy reaches the next. Energy flows one way, up.
 * Removing a level shows what happens to the others (NCERT Exercises 4–5).
 */

export const Habitat = { Forest: "forest", Grassland: "grassland", Pond: "pond" } as const;
export type Habitat = (typeof Habitat)[keyof typeof Habitat];

export const ChainMode = { Chain: "chain", Web: "web", Pyramid: "pyramid" } as const;
export type ChainMode = (typeof ChainMode)[keyof typeof ChainMode];

/** NCERT Fig 15.1's chains, producers first. */
export const CHAINS: Readonly<Record<Habitat, readonly string[]>> = {
  forest: ["plants", "deer", "lion"],
  grassland: ["grass", "grasshopper", "frog", "snake"],
  pond: ["phytoplankton", "zooplankton", "smallFish", "bigFish"],
};

/** Sunlight falling on the leaves (kJ), and the share plants turn into food. */
export const SUNLIGHT_KJ = 1_000_000;
export const PLANT_SHARE = 0.01;
/** The share of a level's food energy that reaches the next level. */
export const PASS_ON = 0.1;

/** The food energy at trophic level `level` (1 = producers), in kJ. */
export const energyAt = (level: number): number =>
  Math.round(SUNLIGHT_KJ * PLANT_SHARE * PASS_ON ** (level - 1));

/** The trophic levels' names, 1 to 4. */
export const LevelKind = {
  Producer: "producer",
  Herbivore: "herbivore",
  SmallCarnivore: "smallCarnivore",
  LargeCarnivore: "largeCarnivore",
} as const;
export type LevelKind = (typeof LevelKind)[keyof typeof LevelKind];
export const LEVEL_KINDS: readonly LevelKind[] = [
  LevelKind.Producer,
  LevelKind.Herbivore,
  LevelKind.SmallCarnivore,
  LevelKind.LargeCarnivore,
];

/** The grassland web: each organism and what eats it. */
export const WEB_EATEN_BY: Readonly<Record<string, readonly string[]>> = {
  grass: ["grasshopper", "rabbit", "mouse"],
  grasshopper: ["frog", "lizard"],
  rabbit: ["hawk"],
  mouse: ["snake", "hawk"],
  frog: ["snake"],
  lizard: ["hawk"],
  snake: ["hawk"],
  hawk: [],
};
export const WEB_NODES = Object.keys(WEB_EATEN_BY);

export const eatenBy = (node: string): readonly string[] => WEB_EATEN_BY[node] ?? [];
export const eats = (node: string): string[] =>
  WEB_NODES.filter((n) => (WEB_EATEN_BY[n] ?? []).includes(node));

/** How many separate food chains run through the web, from grass to an animal nobody eats. */
export function chainsInWeb(): string[][] {
  const out: string[][] = [];
  const walk = (path: string[]) => {
    const last = path[path.length - 1] as string;
    const next = eatenBy(last);
    if (next.length === 0) out.push(path);
    for (const n of next) walk([...path, n]);
  };
  walk(["grass"]);
  return out;
}

/** What happens to each level when one is wiped out. */
export const Effect = {
  Gone: "gone",
  Starves: "starves",
  Declines: "declines",
  Grows: "grows",
  Unchanged: "unchanged",
} as const;
export type Effect = (typeof Effect)[keyof typeof Effect];

export function effectsOf(levels: number, removed: number | null): Effect[] {
  return Array.from({ length: levels }, (_, i) => {
    const level = i + 1;
    if (removed === null) return Effect.Unchanged;
    if (level === removed) return Effect.Gone;
    if (level === removed + 1) return Effect.Starves;
    if (level > removed) return Effect.Declines;
    if (level === removed - 1) return Effect.Grows;
    return Effect.Unchanged;
  });
}

export const ChainAction = {
  Reveal: "reveal",
  ShowAll: "showAll",
  SetHabitat: "setHabitat",
  Remove: "remove",
  Tap: "tap",
  Reset: "reset",
} as const;
export const ChainSignal = { Revealed: "revealed", Removed: "removed", Tapped: "tapped" } as const;
export const ChainDerived = {
  Organisms: "organisms",
  Levels: "levels",
  Energy: "energy",
  IsAllShown: "isAllShown",
  Effects: "effects",
  Eats: "eats",
  EatenBy: "eatenBy",
  ChainCount: "chainCount",
} as const;
export const ChainPart = {
  Picture: "picture",
  Next: "next",
  Habitats: "habitats",
  Remove: "remove",
} as const;

const chainState = z
  .object({
    habitat: z.nativeEnum(Habitat),
    mode: z.nativeEnum(ChainMode),
    /** How many trophic levels are shown, from the producers up (chain and pyramid). */
    shown: z.number().int().min(1).max(4),
    /** The web organism tapped, or null. */
    selected: z.string().nullable(),
    /** The trophic level wiped out (1 = producers), or null. */
    removed: z.number().int().min(1).max(4).nullable(),
    /** The kJ numbers in the pyramid, and the sunlight row under it. */
    showEnergy: z.boolean(),
    /** "Producers", "Herbivores", … beside each level. */
    showLevelNames: z.boolean(),
    canReveal: z.boolean(),
    canSetHabitat: z.boolean(),
    canRemove: z.boolean(),
    canTap: z.boolean(),
  })
  .strict();
export type ChainState = z.infer<typeof chainState>;

export const chainOf = (s: Pick<ChainState, "habitat">): readonly string[] => CHAINS[s.habitat];

const NAMES: Readonly<Record<string, string>> = {
  plants: "plants",
  deer: "deer",
  lion: "lion",
  grass: "grass",
  grasshopper: "grasshopper",
  frog: "frog",
  snake: "snake",
  phytoplankton: "phytoplankton (tiny plants)",
  zooplankton: "zooplankton (tiny animals)",
  smallFish: "small fish",
  bigFish: "big fish",
  rabbit: "rabbit",
  mouse: "mouse",
  lizard: "lizard",
  hawk: "hawk",
};
export const nameOf = (id: string): string => NAMES[id] ?? id;

const KIND_WORDS: Readonly<Record<LevelKind, string>> = {
  producer: "producers",
  herbivore: "herbivores (primary consumers)",
  smallCarnivore: "secondary consumers (small carnivores)",
  largeCarnivore: "tertiary consumers (large carnivores)",
};

export function describeChain(s: ChainState): string {
  if (s.mode === ChainMode.Web) {
    const pick =
      s.selected === null
        ? "Nothing is selected."
        : `${nameOf(s.selected)} eats ${eats(s.selected).map(nameOf).join(", ") || "nothing here (it is a producer)"}, and is eaten by ${eatenBy(s.selected).map(nameOf).join(", ") || "nothing here"}.`;
    return `A grassland food web: grass is eaten by grasshoppers, rabbits and mice; grasshoppers by frogs and lizards; mice by snakes and hawks; frogs by snakes; rabbits, lizards and snakes by hawks. ${chainsInWeb().length} food chains run through it. ${pick}`;
  }
  const chain = chainOf(s);
  const shown = chain.slice(0, s.shown);
  const list = shown
    .map((o, i) => `level ${i + 1}: ${nameOf(o)} (${KIND_WORDS[LEVEL_KINDS[i] as LevelKind]})`)
    .join("; ");
  const energy =
    s.mode === ChainMode.Pyramid && s.showEnergy
      ? ` Sunlight on the leaves: ${SUNLIGHT_KJ.toLocaleString("en-IN")} kJ; plants turn 1% into food. Food energy: ${shown.map((_, i) => `${energyAt(i + 1).toLocaleString("en-IN")} kJ`).join(", ")}: about 10% passes up each step.`
      : "";
  const removed =
    s.removed === null
      ? ""
      : ` Level ${s.removed} (${nameOf(chain[s.removed - 1] ?? "")}) is wiped out: ${effectsOf(
          chain.length,
          s.removed,
        )
          .map((e, i) =>
            e === Effect.Unchanged || e === Effect.Gone ? null : `${nameOf(chain[i] ?? "")} ${e}`,
          )
          .filter((x) => x !== null)
          .join(", ")}.`;
  return `A ${s.habitat} food chain, ${s.mode === ChainMode.Pyramid ? "drawn as an energy pyramid" : "drawn as arrows from eaten to eater"}. ${list}.${energy}${removed}`;
}

const act = actionsFor<ChainState>();

export const foodChain = defineProp({
  type: "foodChain",
  describe:
    "Food chains, trophic levels, a food web and energy flow. Chain mode shows a forest, grassland or pond chain (NCERT Fig 15.1) one trophic level at a time; web mode a grassland food web where tapping an organism shows what it eats and what eats it; pyramid mode the food energy at each level (plants capture 1% of sunlight, about 10% passes up each step). Wiping out a level shows the effect on the others.",
  state: chainState,
  defaults: {
    habitat: Habitat.Grassland,
    mode: ChainMode.Chain,
    shown: 1,
    selected: null,
    removed: null,
    showEnergy: true,
    showLevelNames: true,
    canReveal: true,
    canSetHabitat: false,
    canRemove: false,
    canTap: true,
  },
  inputs: [
    "habitat",
    "mode",
    "showEnergy",
    "showLevelNames",
    "canReveal",
    "canSetHabitat",
    "canRemove",
    "canTap",
  ],
  invariant: (s) => {
    const n = chainOf(s).length;
    if (s.shown > n) return `shown is past this chain's ${n} levels`;
    if (s.removed !== null && s.removed > n) return `removed is past this chain's ${n} levels`;
    if (s.selected !== null && !WEB_NODES.includes(s.selected)) return "selected is not in the web";
    return undefined;
  },
  derived: {
    [ChainDerived.Organisms]: {
      describe: "The chain's organisms, producers first",
      compute: (s) => [...chainOf(s)],
    },
    [ChainDerived.Levels]: {
      describe:
        "The trophic level kind of each link: producer, herbivore, smallCarnivore, largeCarnivore",
      compute: (s) => LEVEL_KINDS.slice(0, chainOf(s).length),
    },
    [ChainDerived.Energy]: {
      describe: "The food energy at each level of the chain, in kJ",
      compute: (s) => chainOf(s).map((_, i) => energyAt(i + 1)),
    },
    [ChainDerived.IsAllShown]: {
      describe: "Whether every level of the chain is showing",
      compute: (s) => s.shown === chainOf(s).length,
    },
    [ChainDerived.Effects]: {
      describe:
        "For each level, what wiping out the removed level does to it: gone, starves, declines, grows, unchanged",
      compute: (s) => effectsOf(chainOf(s).length, s.removed),
    },
    [ChainDerived.Eats]: {
      describe: "In the web, what the selected organism eats",
      compute: (s) => (s.selected === null ? [] : eats(s.selected)),
    },
    [ChainDerived.EatenBy]: {
      describe: "In the web, what eats the selected organism",
      compute: (s) => (s.selected === null ? [] : [...eatenBy(s.selected)]),
    },
    [ChainDerived.ChainCount]: {
      describe: "How many separate food chains run through the web",
      compute: () => chainsInWeb().length,
    },
  },
  actions: {
    [ChainAction.Reveal]: act({
      describe: "Show the next trophic level up",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const shown = Math.min(s.shown + 1, chainOf(s).length);
        return set({ shown }, { signal: ChainSignal.Revealed, payload: { shown } });
      },
    }),
    [ChainAction.ShowAll]: act({
      describe: "Show every level at once",
      args: z.object({}).strict(),
      run: (s) => set({ shown: chainOf(s).length }),
    }),
    [ChainAction.SetHabitat]: act({
      describe: "Switch to the forest, grassland or pond chain (starts again from the producers)",
      byLearner: true,
      args: z.object({ habitat: z.nativeEnum(Habitat) }).strict(),
      run: (s, a) =>
        set({
          habitat: a.habitat,
          shown: s.canReveal ? 1 : CHAINS[a.habitat].length,
          removed: null,
        }),
    }),
    [ChainAction.Remove]: act({
      describe:
        "Wipe out every organism at one trophic level (1 = producers), or null to bring them back",
      byLearner: true,
      args: z.object({ level: z.number().int().min(1).max(4).nullable() }).strict(),
      run: (s, a) => {
        const level = a.level === null ? null : Math.min(a.level, chainOf(s).length);
        return set(
          { removed: level },
          {
            signal: ChainSignal.Removed,
            payload: { level, effects: effectsOf(chainOf(s).length, level) },
          },
        );
      },
    }),
    [ChainAction.Tap]: act({
      describe: "Tap an organism in the web to see what it eats and what eats it",
      byLearner: true,
      args: z.object({ node: z.enum(WEB_NODES as [string, ...string[]]) }).strict(),
      run: (_s, a) =>
        set(
          { selected: a.node },
          {
            signal: ChainSignal.Tapped,
            payload: { node: a.node, eats: eats(a.node), eatenBy: [...eatenBy(a.node)] },
          },
        ),
    }),
    [ChainAction.Reset]: act({
      describe: "Back to the producers only, nothing removed or selected",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        set({ shown: s.canReveal ? 1 : chainOf(s).length, removed: null, selected: null }),
    }),
  },
  signals: {
    [ChainSignal.Revealed]: { describe: "A new trophic level is showing; `shown` levels in all" },
    [ChainSignal.Removed]: {
      describe: "A level was wiped out (or brought back); the payload has each level's effect",
    },
    [ChainSignal.Tapped]: { describe: "An organism in the web was tapped" },
  },
  observe: (s) => ({
    summary: describeChain(s),
    elements: [{ id: ChainPart.Picture, value: describeChain(s) }],
  }),
  parts: () => [ChainPart.Picture, ChainPart.Next, ChainPart.Habitats, ChainPart.Remove],
});
