import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Energy from the sea (NCERT 14.3.2):
 * - tidal: a dam across a narrow opening to the sea; at high tide the sea stands above the basin,
 *   at low tide below it. Opening the gate lets water rush through the turbine (in or out) until
 *   the two levels match; the moon's pull then changes the tide again;
 * - wave: the kinetic energy of waves turns a turbine; only strong waves (height 2 or 3 of 3) are
 *   worth it;
 * - ocean thermal (OTEC): the sun-warmed surface boils ammonia, which spins a turbine; cold water
 *   pumped up from as deep as 2 km turns it back to liquid. It works only if the surface is at
 *   least 20 °C (20 K) warmer than the deep water.
 */

export const OceanKind = { Tidal: "tidal", Wave: "wave", Thermal: "thermal" } as const;
export type OceanKind = (typeof OceanKind)[keyof typeof OceanKind];

export const Level = { High: "high", Low: "low" } as const;
export type Level = (typeof Level)[keyof typeof Level];

export const MIN_DIFFERENCE = 20;
export const MAX_WAVE = 3;

export const OceanAction = {
  OpenGate: "openGate",
  NextTide: "nextTide",
  SetWave: "setWave",
  SetSurface: "setSurface",
  SetDeep: "setDeep",
} as const;
export const OceanSignal = { Generated: "generated", Changed: "changed" } as const;
export const OceanDerived = {
  Flow: "flow",
  Difference: "difference",
  Works: "works",
  Output: "output",
} as const;
export const OceanPart = { Picture: "picture", Readout: "readout", Controls: "controls" } as const;

export const Flow = { In: "in", Out: "out", None: "none" } as const;
export type Flow = (typeof Flow)[keyof typeof Flow];

const oceanState = z
  .object({
    kind: z.nativeEnum(OceanKind),
    /** Tidal: the sea's level now, and the basin's behind the dam. */
    sea: z.nativeEnum(Level),
    basin: z.nativeEnum(Level),
    /** Tidal: whether water rushed through the turbine at the last opening (shown spinning). */
    isFlowing: z.boolean(),
    /** Wave: height of the waves, 0 (calm) … 3 (very strong). */
    wave: z.number().int().min(0).max(MAX_WAVE),
    /** Thermal: surface and deep (2 km) water temperatures, °C. */
    surface: z.number().int().min(10).max(35),
    deep: z.number().int().min(2).max(20),
    showNames: z.boolean(),
    canAct: z.boolean(),
  })
  .strict();
export type OceanState = z.infer<typeof oceanState>;

/** Which way water would rush through the turbine if the gate opened now. */
export function flowOf(s: Pick<OceanState, "sea" | "basin">): Flow {
  if (s.sea === s.basin) return Flow.None;
  return s.sea === Level.High ? Flow.In : Flow.Out;
}

export const differenceOf = (s: Pick<OceanState, "surface" | "deep">): number => s.surface - s.deep;

/** Whether the set-up can make electricity now. */
export function worksOf(s: OceanState): boolean {
  if (s.kind === OceanKind.Tidal) return s.isFlowing;
  if (s.kind === OceanKind.Wave) return s.wave >= 2;
  return differenceOf(s) >= MIN_DIFFERENCE;
}

/** Share of full output, 0 … 1. */
export function oceanOutputOf(s: OceanState): number {
  if (s.kind === OceanKind.Tidal) return s.isFlowing ? 1 : 0;
  if (s.kind === OceanKind.Wave) return s.wave / MAX_WAVE;
  return worksOf(s) ? Math.min(1, (differenceOf(s) - MIN_DIFFERENCE + 5) / 10) : 0;
}

export function describeOcean(s: OceanState): string {
  if (s.kind === OceanKind.Tidal) {
    return `Tidal energy: a dam with a turbine across a narrow opening to the sea. The sea is at ${s.sea} tide; the basin behind the dam is ${s.basin}. ${s.isFlowing ? "Water is rushing through the turbine, turning it." : flowOf(s) === Flow.None ? "The levels match, so opening the gate would move no water." : `Opening the gate would let water rush ${flowOf(s) === Flow.In ? "in from the sea" : "out to the sea"} through the turbine.`}`;
  }
  if (s.kind === OceanKind.Wave) {
    return `Wave energy: waves of height ${s.wave} of ${MAX_WAVE} rock a device that turns a turbine. ${worksOf(s) ? "The waves are strong enough to be worth it." : "The waves are too weak to be worth it."}`;
  }
  return `Ocean thermal energy: surface water at ${s.surface} °C, deep water (about 2 km down) at ${s.deep} °C, a difference of ${differenceOf(s)} °C. ${worksOf(s) ? "That is 20 °C or more: the warm water boils ammonia, the vapour turns a turbine, and cold deep water turns it back to liquid." : "That is less than 20 °C: the plant can't work."}`;
}

const act = actionsFor<OceanState>();

export const oceanEnergy = defineProp({
  type: "oceanEnergy",
  describe:
    "Energy from the sea (NCERT 14.3.2): tidal energy (a dam with a turbine across a narrow opening; open the gate when the sea and the basin differ and water rushes through; then the tide turns), wave energy (only strong waves are worth it), and ocean thermal energy (works only if the surface is at least 20 °C warmer than the water 2 km down).",
  state: oceanState,
  defaults: {
    kind: OceanKind.Tidal,
    sea: Level.High,
    basin: Level.Low,
    isFlowing: false,
    wave: 2,
    surface: 28,
    deep: 5,
    showNames: true,
    canAct: true,
  },
  inputs: ["kind", "showNames", "canAct"],
  derived: {
    [OceanDerived.Flow]: {
      describe:
        "Tidal: which way water would rush through the turbine if the gate opened: in, out or none",
      compute: (s) => flowOf(s),
    },
    [OceanDerived.Difference]: {
      describe: "Thermal: surface minus deep temperature, °C",
      compute: (s) => differenceOf(s),
    },
    [OceanDerived.Works]: {
      describe: "Whether the set-up makes electricity now",
      compute: (s) => worksOf(s),
    },
    [OceanDerived.Output]: {
      describe: "Share of full output, 0 … 1",
      compute: (s) => oceanOutputOf(s),
    },
  },
  actions: {
    [OceanAction.OpenGate]: act({
      describe:
        "Tidal: open the dam's gate; water rushes through the turbine until the levels match",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const flow = flowOf(s);
        return flow === Flow.None
          ? set({ isFlowing: false }, { signal: OceanSignal.Generated, payload: { flow } })
          : set(
              { isFlowing: true, basin: s.sea },
              { signal: OceanSignal.Generated, payload: { flow } },
            );
      },
    }),
    [OceanAction.NextTide]: act({
      describe: "Tidal: hours pass and the tide turns (high ↔ low)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => set({ sea: s.sea === Level.High ? Level.Low : Level.High, isFlowing: false }),
    }),
    [OceanAction.SetWave]: act({
      describe: "Wave: set the wave height, 0 … 3",
      byLearner: true,
      args: z.object({ wave: z.number().int().min(0).max(MAX_WAVE) }).strict(),
      run: (_s, a) =>
        set({ wave: a.wave }, { signal: OceanSignal.Changed, payload: { wave: a.wave } }),
    }),
    [OceanAction.SetSurface]: act({
      describe: "Thermal: set the surface water temperature, °C (10 … 35)",
      byLearner: true,
      args: z.object({ surface: z.number().int().min(10).max(35) }).strict(),
      run: (s, a) =>
        set(
          { surface: a.surface },
          {
            signal: OceanSignal.Changed,
            payload: {
              difference: a.surface - s.deep,
              works: a.surface - s.deep >= MIN_DIFFERENCE,
            },
          },
        ),
    }),
    [OceanAction.SetDeep]: act({
      describe: "Thermal: set the deep water temperature, °C (2 … 20)",
      byLearner: true,
      args: z.object({ deep: z.number().int().min(2).max(20) }).strict(),
      run: (s, a) =>
        set(
          { deep: a.deep },
          {
            signal: OceanSignal.Changed,
            payload: {
              difference: s.surface - a.deep,
              works: s.surface - a.deep >= MIN_DIFFERENCE,
            },
          },
        ),
    }),
  },
  signals: {
    [OceanSignal.Generated]: { describe: "Tidal: the gate was opened; the payload has the flow" },
    [OceanSignal.Changed]: { describe: "A wave height or temperature changed" },
  },
  observe: (s) => ({
    summary: describeOcean(s),
    elements: [
      { id: OceanPart.Picture, value: s.kind },
      { id: OceanPart.Readout, value: worksOf(s) ? "making electricity" : "not working" },
    ],
  }),
  parts: () => [OceanPart.Picture, OceanPart.Readout, OceanPart.Controls],
});
