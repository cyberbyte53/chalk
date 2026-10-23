import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import {
  type Option,
  choiceQuestion,
  distinctOptions,
  settle,
} from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** A focal length in metres with its sign, and the kind of lens it means. */
function lensOf(f: number): ReturnType<typeof t> {
  const v = Number(Math.abs(f).toFixed(2));
  const s = `${f < 0 ? "−" : "+"}${v}`;
  return f > 0
    ? t(`${s} m, a convex (converging) lens`, `${s} मीटर, उत्तल (अभिसारी) लेंस`)
    : t(`${s} m, a concave (diverging) lens`, `${s} मीटर, अवतल (अपसारी) लेंस`);
}

/** f = 1/P from a prescription (NCERT Ex 16, 17). */
export const focalFromPower = family({
  level: Level.Medium,
  tests: [Concept.PowerOfALens],
  params: z.object({ power: z.number().refine((p) => p !== 0) }).strict(),
  build: ({ power }, b) => {
    const f = 1 / power;
    const flipKind = (() => {
      const v = Number(Math.abs(f).toFixed(2));
      const s = `${f < 0 ? "−" : "+"}${v}`;
      return f > 0
        ? t(`${s} m, a concave (diverging) lens`, `${s} मीटर, अवतल (अपसारी) लेंस`)
        : t(`${s} m, a convex (converging) lens`, `${s} मीटर, उत्तल (अभिसारी) लेंस`);
    })();
    const wrong: Option[] = [
      {
        id: "kind",
        label: flipKind,
        feedback: t(
          "The sign tells the kind: positive power is a convex, converging lens; negative is a concave, diverging one.",
          "चिह्न प्रकार बताता है: धनात्मक क्षमता उत्तल, अभिसारी लेंस है; ऋणात्मक अवतल, अपसारी।",
        ),
      },
      {
        id: "invert",
        label: lensOf(power),
        feedback: t(
          `The focal length is the reciprocal of the power: f = 1/P = 1/${power}.`,
          `फोकस दूरी क्षमता का व्युत्क्रम है: f = 1/P = 1/${power}।`,
        ),
      },
    ];
    const options = distinctOptions({ id: "right", label: lensOf(f) }, wrong);
    const p = `${power > 0 ? "+" : "−"}${Math.abs(power)} D`;
    const ask = choiceQuestion(b, {
      prompt: t(
        `A lens has a power of ${p}. What is its focal length, and what kind of lens is it?`,
        `एक लेंस की क्षमता ${p} है। उसकी फोकस दूरी क्या है, और वह किस तरह का लेंस है?`,
      ),
      options: settle(options, Math.round(Math.abs(power) * 13 + (power > 0 ? 1 : 2))),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
