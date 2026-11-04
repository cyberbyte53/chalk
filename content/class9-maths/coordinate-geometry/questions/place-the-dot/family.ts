import { family, place, scene, t, tap } from "@chalk/author";
import { Level } from "@chalk/content";
import { check, plane } from "@chalk/patterns";
import { coordinatePlane } from "@chalk/prop-coordinates";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** On a notebook page: put a dot at two distances, from the left edge and from the bottom. */
export const placeTheDot = family({
  level: Level.Medium,
  tests: [Concept.TwoNumbersForAPlace],
  // The page is 15 cm across and 12 cm up; the dot starts in the top right corner, at (14, 11).
  params: z
    .object({ left: z.number().int().min(1).max(13), bottom: z.number().int().min(1).max(10) })
    .strict(),
  build: ({ left, bottom }) => {
    const { isPlaced, placedAt, notebook } = plane;
    const sheet = place(coordinatePlane, notebook());
    // The swapped spot, when it is on the page too.
    const isSwapped = left !== bottom && bottom <= 15 && left <= 12;
    const ask = check({
      about: "sheet",
      prompt: t(
        `Put the dot **${left} cm from the left edge** and **${bottom} cm above the bottom**. Each small square is 1 cm. Drag it there, then press Check.`,
        `बिंदु को **बाएँ किनारे से ${left} cm** और **नीचे के किनारे से ${bottom} cm ऊपर** रखो। हर छोटा खाना 1 cm है। उसे वहाँ खींचो, फिर जाँचो दबाओ।`,
      ),
      says: t(
        `Put the dot ${left} centimetres from the left edge and ${bottom} centimetres above the bottom. Each small square is 1 centimetre. Drag it there, then press Check.`,
        `बिंदु को बाएँ किनारे से ${left} सेंटीमीटर और नीचे के किनारे से ${bottom} सेंटीमीटर ऊपर रखो। हर छोटा खाना 1 सेंटीमीटर है। उसे वहाँ खींचो, फिर जाँचो दबाओ।`,
      ),
      isRight: isPlaced("sheet", left, bottom),
      answer: (read) => {
        const p = placedAt("sheet")(read);
        return p === null
          ? null
          : t(
              `${p.x} cm from the left edge, ${p.y} cm above the bottom`,
              `बाएँ किनारे से ${p.x} cm, नीचे के किनारे से ${p.y} cm ऊपर`,
            );
      },
      solve: [tap("sheet.reading", "movePoint", { x: left, y: bottom })],
      notes: isSwapped
        ? [
            {
              when: isPlaced("sheet", bottom, left),
              say: t(
                `That spot is ${bottom} cm from the left edge and ${left} cm above the bottom: the two distances are swapped.`,
                `वह जगह बाएँ किनारे से ${bottom} cm और नीचे के किनारे से ${left} cm ऊपर है: दोनों दूरियाँ उलट गईं।`,
              ),
              reach: [tap("sheet.reading", "movePoint", { x: bottom, y: left })],
            },
          ]
        : [],
    });
    return scene({ pieces: { sheet, ask: ask.piece }, uses: [ask.use] });
  },
});
