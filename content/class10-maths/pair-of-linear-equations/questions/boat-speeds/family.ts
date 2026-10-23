import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, distinctOptions, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/**
 * Boat x km/h in still water, stream y km/h: downstream x + y, upstream x − y. From the two
 * speeds, find the boat's or the stream's (NCERT Example 19, Exercise 3.6 Q2).
 */
export const boatSpeeds = family({
  level: Level.Medium,
  tests: [Concept.ReducibleToLinear],
  params: z
    .object({
      down: z.number().positive(),
      up: z.number().positive(),
      ask: z.enum(["boat", "stream"]),
    })
    .strict(),
  build: ({ down, up, ask }, bk) => {
    const boat = (down + up) / 2;
    const stream = (down - up) / 2;
    const right = ask === "boat" ? boat : stream;
    const why = t(
      `$x + y = ${down}$ and $x - y = ${up}$. Adding gives $2x = ${down + up}$; subtracting gives $2y = ${down - up}$.`,
      `$x + y = ${down}$ और $x - y = ${up}$। जोड़ने से $2x = ${down + up}$; घटाने से $2y = ${down - up}$।`,
    );
    const kmh = (n: number) => t(`${n} km/h`, `${n} km/h`);
    const options = distinctOptions({ id: "right", label: kmh(right) }, [
      { id: "other", label: kmh(ask === "boat" ? stream : boat), feedback: why },
      { id: "down", label: kmh(down), feedback: why },
      { id: "diff", label: kmh(down - up), feedback: why },
    ]);
    const q = choiceQuestion(bk, {
      prompt: t(
        `A boat goes ${down} km/h downstream and ${up} km/h upstream. What is the speed of ${ask === "boat" ? "the boat in still water" : "the stream"}?`,
        `एक नाव धारा के साथ ${down} km/h और धारा के विरुद्ध ${up} km/h चलती है। ${ask === "boat" ? "स्थिर पानी में नाव" : "धारा"} की चाल क्या है?`,
      ),
      options: settle(options, down * 3 + up * 5 + (ask === "boat" ? 1 : 2)),
      answer: "right",
    });
    return column([q, space()]);
  },
});
