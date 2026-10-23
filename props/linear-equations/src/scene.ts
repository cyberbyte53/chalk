import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story pictures for the pair-of-linear-equations chapter: Riya and Kabir run their class's
 * lemonade-and-samosa stall at the school mela, and every errand of the day is two clues about
 * two unknowns.
 */

export const LinearSceneKind = {
  MelaStall: "melaStall",
  GiantWheel: "giantWheel",
  TwoBills: "twoBills",
  RailTracks: "railTracks",
  CashBoxLock: "cashBoxLock",
  BusTickets: "busTickets",
  BoatRiver: "boatRiver",
  MelaNight: "melaNight",
} as const;
export type LinearSceneKind = (typeof LinearSceneKind)[keyof typeof LinearSceneKind];

export const LinearScenePart = { Picture: "picture" } as const;

export const LINEAR_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(LinearSceneKind) }).strict();
export type LinearSceneState = z.infer<typeof sceneState>;

const DESCRIPTIONS: Record<LinearSceneKind, string> = {
  [LinearSceneKind.MelaStall]:
    "The school mela by day: bunting overhead, a giant wheel far behind. Riya and Kabir stand behind their class's stall: a jug of lemonade with glasses, a tray of samosas and a small metal cash box. A price board says a glass of lemonade is ₹10 and a samosa ₹15.",
  [LinearSceneKind.GiantWheel]:
    "The mela rides: a giant wheel (₹3 a ride) on the left, and a hoopla stall (₹4 a game) on the right with prizes on pegs. Kabir throws a ring; Riya counts coins in her hand.",
  [LinearSceneKind.TwoBills]:
    "Two stationery bills on a table: one for 2 pencils and 3 erasers, ₹9; the other for 4 pencils and 6 erasers, ₹18. Riya looks from one to the other.",
  [LinearSceneKind.RailTracks]:
    "Beside the mela ground: a railway track seen from above, two straight rails side by side with sleepers between, running right across; a train engine coming in from the right; tents behind the fence. Kabir and Riya watch from the fence.",
  [LinearSceneKind.CashBoxLock]:
    "Evening at the stall: the metal cash box is shut with a two-digit number lock, both dials showing question marks. Kabir scratches his head; Riya holds her notebook.",
  [LinearSceneKind.BusTickets]:
    "The bus stop outside the school: a bus pulls in; Riya holds two tickets of one colour and three of another; a stop sign shows two stops, near and far.",
  [LinearSceneKind.BoatRiver]:
    "The river at the edge of the mela: a rowing boat with Grandpa at the oars and the children aboard; ripples and arrows show the stream flowing to the right; the boat heads left, against the stream.",
  [LinearSceneKind.MelaNight]:
    "Mela night: strings of lights, stars, the stall closed. The family sits round the table with the open cash box and neat piles of notes and coins; Kabir cheers with both arms up.",
};

export function describeLinearScene(s: LinearSceneState): string {
  return DESCRIPTIONS[s.scene];
}

export const linearScene = defineProp({
  type: "linearScene",
  describe:
    "An illustrated story panel for the pair-of-linear-equations chapter: Riya and Kabir's lemonade-and-samosa stall at the school mela (the stall, the giant wheel and hoopla, two stationery bills, the railway track, the cash box's number lock, bus tickets, a boat on the river, mela night).",
  state: sceneState,
  defaults: { scene: LinearSceneKind.MelaStall },
  isExplainer: false,
  actions: {},
  observe: (s) => ({
    summary: describeLinearScene(s),
    elements: [{ id: LinearScenePart.Picture, value: describeLinearScene(s) }],
  }),
  parts: () => [LinearScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === LinearScenePart.Picture
      ? {
          x: 0,
          y: 0,
          width,
          height: Math.round((LINEAR_PICTURE.height * width) / LINEAR_PICTURE.width),
        }
      : undefined,
});
