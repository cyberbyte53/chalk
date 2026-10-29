import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { bareGround, check, isPlaced } from "@chalk/patterns";
import { coordinatePlaneDef } from "@chalk/prop-coordinates";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** On ground with no roads: put a stall at two distances from two fences. */
export const placeTheStall = family({
  level: Level.Medium,
  tests: [Concept.TwoNumbersForAPlace],
  params: z
    .object({ west: z.number().int().min(5).max(50), south: z.number().int().min(5).max(35) })
    .strict()
    .refine((p) => p.west % 5 === 0 && p.south % 5 === 0, "on the 5 m steps the stall moves by"),
  build: ({ west, south }, b) => {
    const ground = b.prop(coordinatePlaneDef, "ground", bareGround());
    const isSwapped = west !== south && south <= 55 && west <= 35;
    const ask = check(b, {
      about: ground,
      prompt: t(
        `The ice-cream stall goes **${west} m from the west fence** and **${south} m from the south fence**. Drag it there, then press Check.`,
        `आइसक्रीम का स्टॉल **पश्चिमी बाड़ से ${west} m** और **दक्षिणी बाड़ से ${south} m** पर लगेगा। उसे वहाँ खींचो, फिर जाँचो दबाओ।`,
      ),
      isRight: isPlaced(ground, west, south),
      solve: [ground.learner.movePoint({ x: west, y: south })],
      notes: isSwapped
        ? [
            {
              when: isPlaced(ground, south, west),
              say: t(
                `That spot is ${south} m from the west fence and ${west} m from the south fence: the two distances are swapped.`,
                `वह जगह पश्चिमी बाड़ से ${south} m और दक्षिणी बाड़ से ${west} m है: दोनों दूरियाँ उलट गईं।`,
              ),
              reach: [ground.learner.movePoint({ x: south, y: west })],
            },
          ]
        : [],
    });
    return [ground, ask];
  },
});
