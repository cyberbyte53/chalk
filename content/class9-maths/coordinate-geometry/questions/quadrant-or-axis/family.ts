import { family, scene, t } from "@chalk/author";
import { Level, type Localized } from "@chalk/content";
import { choice } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

type Where = "I" | "II" | "III" | "IV" | "xAxis" | "yAxis";

const WHERE: Record<Where, Localized> = {
  I: t("Quadrant I", "पहला चतुर्थांश (I)"),
  II: t("Quadrant II", "दूसरा चतुर्थांश (II)"),
  III: t("Quadrant III", "तीसरा चतुर्थांश (III)"),
  IV: t("Quadrant IV", "चौथा चतुर्थांश (IV)"),
  xAxis: t("On the x-axis", "x-अक्ष पर"),
  yAxis: t("On the y-axis", "y-अक्ष पर"),
};

/** Where a point lies, from the signs of its coordinates (0: on an axis). */
function whereOf(x: number, y: number): Where {
  if (y === 0) return "xAxis";
  if (x === 0) return "yAxis";
  if (x > 0) return y > 0 ? "I" : "IV";
  return y > 0 ? "II" : "III";
}

/** Where each place is, by the signs of its coordinates: what a wrong choice is told. */
const SIGNS_OF: Record<Where, Localized> = {
  I: t(
    "Quadrant I is (+, +): both coordinates positive.",
    "पहला चतुर्थांश (+, +) है: दोनों निर्देशांक धनात्मक।",
  ),
  II: t(
    "Quadrant II is (−, +): x negative, y positive.",
    "दूसरा चतुर्थांश (−, +) है: x ऋणात्मक, y धनात्मक।",
  ),
  III: t(
    "Quadrant III is (−, −): both coordinates negative.",
    "तीसरा चतुर्थांश (−, −) है: दोनों निर्देशांक ऋणात्मक।",
  ),
  IV: t(
    "Quadrant IV is (+, −): x positive, y negative.",
    "चौथा चतुर्थांश (+, −) है: x धनात्मक, y ऋणात्मक।",
  ),
  xAxis: t("A point on the x-axis has y = 0.", "x-अक्ष पर एक बिंदु का y = 0 होता है।"),
  yAxis: t("A point on the y-axis has x = 0.", "y-अक्ष पर एक बिंदु का x = 0 होता है।"),
};
const SIGNS_SAID: Record<Where, Localized> = {
  I: t(
    "Quadrant one is plus, plus: both coordinates positive.",
    "पहला चतुर्थांश धन, धन है: दोनों निर्देशांक धनात्मक।",
  ),
  II: t(
    "Quadrant two is minus, plus: x negative, y positive.",
    "दूसरा चतुर्थांश ऋण, धन है: एक्स ऋणात्मक, वाई धनात्मक।",
  ),
  III: t(
    "Quadrant three is minus, minus: both coordinates negative.",
    "तीसरा चतुर्थांश ऋण, ऋण है: दोनों निर्देशांक ऋणात्मक।",
  ),
  IV: t(
    "Quadrant four is plus, minus: x positive, y negative.",
    "चौथा चतुर्थांश धन, ऋण है: एक्स धनात्मक, वाई ऋणात्मक।",
  ),
  xAxis: t("A point on the x-axis has y equal to 0.", "एक्स-अक्ष पर एक बिंदु का वाई बराबर 0 होता है।"),
  yAxis: t("A point on the y-axis has x equal to 0.", "वाई-अक्ष पर एक बिंदु का एक्स बराबर 0 होता है।"),
};
/** Every question offers the same six: none stands out by which kinds are offered. */
const ALL: Where[] = ["I", "II", "III", "IV", "xAxis", "yAxis"];

/** A number as said: "minus 2". */
const said = (n: number, minus: string) => (n < 0 ? `${minus} ${-n}` : `${n}`);
const shown = (n: number) => (n < 0 ? `−${-n}` : `${n}`);

/** NCERT Ex 3.3 Q1: in which quadrant, or on which axis, a point lies, from its coordinates. */
export const quadrantOrAxis = family({
  level: Level.Easy,
  tests: [Concept.CoordinatesOfAPoint],
  params: z.object({ x: z.number().int(), y: z.number().int() }).strict(),
  build: ({ x, y }) => {
    const pair = `(${shown(x)}, ${shown(y)})`;
    const ask = choice({
      prompt: t(
        `In which quadrant, or on which axis, does the point ${pair} lie?`,
        `बिंदु ${pair} किस चतुर्थांश में, या किस अक्ष पर स्थित है?`,
      ),
      says: t(
        `In which quadrant, or on which axis, does the point ${said(x, "minus")}, ${said(y, "minus")} lie?`,
        `बिंदु ${said(x, "माइनस")}, ${said(y, "माइनस")} किस चतुर्थांश में, या किस अक्ष पर स्थित है?`,
      ),
      options: ALL.map((id) =>
        id === whereOf(x, y)
          ? { id, label: WHERE[id] }
          : {
              id,
              label: WHERE[id],
              feedback: t(
                `${SIGNS_OF[id].en} This point is ${pair}.`,
                `${SIGNS_OF[id].hi} यह बिंदु ${pair} है।`,
              ),
              feedbackSays: t(
                `${SIGNS_SAID[id].en} This point is ${said(x, "minus")}, ${said(y, "minus")}.`,
                `${SIGNS_SAID[id].hi} यह बिंदु ${said(x, "माइनस")}, ${said(y, "माइनस")} है।`,
              ),
            },
      ),
      keepOrder: true,
      answer: whereOf(x, y),
    });
    return scene({ pieces: { ask: ask.piece }, uses: [ask.use] });
  },
});
