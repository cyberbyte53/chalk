import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story panels for the life-processes chapter's "Kabir's 1500 m at Sports Day" arc: Kabir trains,
 * Riya coaches, and Grandpa's terrace garden shows the plant side of each life process. A fixed
 * 320 × 180 picture, scaled; nothing to tap.
 */

export const LifeScene = {
  SignUp: "signUp",
  FirstRun: "firstRun",
  Cramp: "cramp",
  Breakfast: "breakfast",
  MoneyPlant: "moneyPlant",
  AmarBel: "amarBel",
  LimeWaterStraw: "limeWaterStraw",
  Pulse: "pulse",
  WiltingPeas: "wiltingPeas",
  HotDay: "hotDay",
  RaceDay: "raceDay",
} as const;
export type LifeScene = (typeof LifeScene)[keyof typeof LifeScene];

export const LifeScenePart = { Picture: "picture" } as const;
export const LIFE_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(LifeScene) }).strict();
export type LifeSceneState = z.infer<typeof sceneState>;

const WORDS: Readonly<Record<LifeScene, string>> = {
  signUp:
    "The school notice board: a Sports Day sign-up sheet for the 1500 m race. Kabir writes his name on it, beaming; Riya looks over his shoulder.",
  firstRun:
    "The school track at dawn: Kabir, bent over with his hands on his knees, out of breath and sweating after two rounds; Riya holds a stopwatch.",
  cramp: "On the track: Kabir sits holding his calf, which has cramped; Riya kneels beside him.",
  breakfast:
    "The breakfast table: Mom puts down a plate of parathas, curd and a banana for Kabir; Grandpa reads the paper.",
  moneyPlant:
    "Grandpa's terrace in the morning sun: a money plant with green-and-cream leaves climbs a stick in a pot; Grandpa points at a leaf.",
  amarBel:
    "The hedge by Grandpa's gate, wrapped in thin yellow leafless threads of amar-bel (cuscuta); Kabir pulls at one.",
  limeWaterStraw:
    "The kitchen table: Kabir blows through a straw into a glass of clear lime water; Riya watches closely.",
  pulse:
    "After a sprint: Riya holds two fingers on Kabir's wrist and counts his pulse, looking at her watch; Kabir pants.",
  wiltingPeas:
    "Grandpa's terrace at noon on a hot day: the pea plants droop, their leaves limp; Grandpa holds a watering can.",
  hotDay:
    "A hot afternoon: Kabir, sweaty after practice, gulps from a big water bottle; the sun blazes.",
  raceDay:
    "Sports Day: Kabir crosses the finish line of the 1500 m, arms up; Riya, Mom and Grandpa cheer from the side.",
};

export const describeLifeScene = (s: LifeSceneState): string => WORDS[s.scene];

export const lifeScene = defineProp({
  type: "lifeScene",
  describe:
    "A story panel for the life-processes chapter (Kabir trains for the 1500 m at Sports Day, coached by Riya; Grandpa's garden): the sign-up sheet, the first practice run, a cramp, breakfast, Grandpa's money plant, amar-bel on the hedge, blowing into lime water, a pulse check, wilting peas at noon, a hot day's water bottle, and race day. Nothing to tap.",
  state: sceneState,
  defaults: { scene: LifeScene.SignUp },
  inputs: ["scene"],
  actions: {},
  observe: (s) => ({
    summary: describeLifeScene(s),
    elements: [{ id: LifeScenePart.Picture, value: describeLifeScene(s) }],
  }),
  parts: () => [LifeScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === LifeScenePart.Picture
      ? {
          x: 0,
          y: 0,
          width,
          height: Math.round((LIFE_PICTURE.height * width) / LIFE_PICTURE.width),
        }
      : undefined,
});
