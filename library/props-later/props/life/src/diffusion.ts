import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Why a big body needs a transport system (NCERT 6.1): a body seen in section as a square of cells,
 * `layers` cells deep from its surface. Oxygen diffuses in from outside, but diffusion is slow, so it
 * only reaches the outermost layer of cells (REACH). A single cell is fully fed; in a body three or
 * more layers deep, the inner cells starve, unless a transport system (blood vessels) carries
 * oxygen to every cell.
 */

/** How many cells deep oxygen reaches by diffusion alone. */
export const REACH = 1;
export const MAX_LAYERS = 5;

export const DiffusionAction = { SetLayers: "setLayers", SetTransport: "setTransport" } as const;
export const DiffusionSignal = { Changed: "changed" } as const;
export const DiffusionDerived = {
  Cells: "cells",
  Fed: "fed",
  Starving: "starving",
  FedFraction: "fedFraction",
} as const;
export const DiffusionPart = { Body: "body", Size: "size", Transport: "transport" } as const;

const diffusionState = z
  .object({
    /** How many cells deep the body is, from its surface to its middle (1 = a single cell). */
    layers: z.number().int().min(1).max(MAX_LAYERS),
    /** Blood vessels running through the body, bringing oxygen to every cell. */
    hasTransport: z.boolean(),
    canSetLayers: z.boolean(),
    canSetTransport: z.boolean(),
  })
  .strict();
export type DiffusionState = z.infer<typeof diffusionState>;

/** The body is a square of side 2·layers − 1 cells. */
export const sideOf = (layers: number): number => 2 * layers - 1;

/** How many cells in from the surface a cell is (1 = touching the outside). */
export function depthOf(layers: number, row: number, col: number): number {
  const n = sideOf(layers);
  return Math.min(row, col, n - 1 - row, n - 1 - col) + 1;
}

/** Whether the cell at (row, col) gets oxygen. */
export function isFed(
  s: Pick<DiffusionState, "layers" | "hasTransport">,
  row: number,
  col: number,
) {
  return s.hasTransport || depthOf(s.layers, row, col) <= REACH;
}

export function countsOf(s: Pick<DiffusionState, "layers" | "hasTransport">): {
  cells: number;
  fed: number;
} {
  const n = sideOf(s.layers);
  let fed = 0;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (isFed(s, r, c)) fed++;
  return { cells: n * n, fed };
}

export function describeDiffusion(s: DiffusionState): string {
  const { cells, fed } = countsOf(s);
  const body =
    s.layers === 1
      ? "A single cell, with its whole surface touching the water around it"
      : `A body ${s.layers} cells deep from its surface (${cells} cells in this section)`;
  const how = s.hasTransport
    ? "Blood vessels run through it and bring oxygen to every cell"
    : "Oxygen can only diffuse in from outside, and diffusion reaches just the outer layer of cells";
  return `${body}. ${how}: ${fed} of ${cells} cells get oxygen${fed < cells ? `, and ${cells - fed} inner cells are starving` : ""}.`;
}

const act = actionsFor<DiffusionState>();
const changed = (next: DiffusionState) => {
  const { cells, fed } = countsOf(next);
  return {
    signal: DiffusionSignal.Changed,
    payload: { layers: next.layers, hasTransport: next.hasTransport, cells, fed },
  };
};

export const diffusionReach = defineProp({
  type: "diffusionReach",
  describe:
    "Why diffusion is not enough for a big body: a body drawn in section as a square of cells, 1 to 5 cells deep. Oxygen diffuses in from outside but only reaches the outermost layer of cells; inner cells starve. Switching on a transport system (blood vessels) feeds every cell.",
  state: diffusionState,
  defaults: { layers: 3, hasTransport: false, canSetLayers: true, canSetTransport: true },
  inputs: ["canSetLayers", "canSetTransport"],
  derived: {
    [DiffusionDerived.Cells]: {
      describe: "How many cells are drawn in the section",
      compute: (s) => countsOf(s).cells,
    },
    [DiffusionDerived.Fed]: {
      describe: "How many cells get oxygen",
      compute: (s) => countsOf(s).fed,
    },
    [DiffusionDerived.Starving]: {
      describe: "How many cells get no oxygen",
      compute: (s) => {
        const c = countsOf(s);
        return c.cells - c.fed;
      },
    },
    [DiffusionDerived.FedFraction]: {
      describe: "The fraction of cells that get oxygen (0 to 1)",
      compute: (s) => {
        const c = countsOf(s);
        return c.fed / c.cells;
      },
    },
  },
  actions: {
    [DiffusionAction.SetLayers]: act({
      describe: "Make the body 1 (a single cell) to 5 cells deep",
      byLearner: true,
      args: z.object({ layers: z.number().int().min(1).max(MAX_LAYERS) }).strict(),
      run: (s, a) => set({ layers: a.layers }, changed({ ...s, layers: a.layers })),
    }),
    [DiffusionAction.SetTransport]: act({
      describe: "Switch the transport system (blood vessels through the body) on or off",
      byLearner: true,
      args: z.object({ on: z.boolean() }).strict(),
      run: (s, a) => set({ hasTransport: a.on }, changed({ ...s, hasTransport: a.on })),
    }),
  },
  signals: {
    [DiffusionSignal.Changed]: {
      describe: "The body's size or its transport changed; the payload has the new counts",
    },
  },
  observe: (s) => ({
    summary: describeDiffusion(s),
    elements: [{ id: DiffusionPart.Body, value: describeDiffusion(s) }],
  }),
  parts: () => [DiffusionPart.Body, DiffusionPart.Size, DiffusionPart.Transport],
});
