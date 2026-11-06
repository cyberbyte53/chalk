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
    "Quadrant [[I|one]] is [[(+, +)|plus, plus]]: both coordinates positive.",
    "पहला चतुर्थांश [[(+, +)|धन, धन]] है: दोनों निर्देशांक धनात्मक।",
  ),
  II: t(
    "Quadrant [[II|two]] is [[(−, +)|minus, plus]]: x negative, y positive.",
    "दूसरा चतुर्थांश [[(−, +)|ऋण, धन]] है: [[x|एक्स]] ऋणात्मक, [[y|वाई]] धनात्मक।",
  ),
  III: t(
    "Quadrant [[III|three]] is [[(−, −)|minus, minus]]: both coordinates negative.",
    "तीसरा चतुर्थांश [[(−, −)|ऋण, ऋण]] है: दोनों निर्देशांक ऋणात्मक।",
  ),
  IV: t(
    "Quadrant [[IV|four]] is [[(+, −)|plus, minus]]: x positive, y negative.",
    "चौथा चतुर्थांश [[(+, −)|धन, ऋण]] है: [[x|एक्स]] धनात्मक, [[y|वाई]] ऋणात्मक।",
  ),
  xAxis: t(
    "A point on the x-axis has [[y\u00a0=\u00a00|y equal to 0]].",
    "[[x|एक्स]]-अक्ष पर एक बिंदु का [[y\u00a0=\u00a00|वाई बराबर 0]] होता है।",
  ),
  yAxis: t(
    "A point on the y-axis has [[x\u00a0=\u00a00|x equal to 0]].",
    "[[y|वाई]]-अक्ष पर एक बिंदु का [[x\u00a0=\u00a00|एक्स बराबर 0]] होता है।",
  ),
};
/** Every question offers the same six: none stands out by which kinds are offered. */
const ALL: Where[] = ["I", "II", "III", "IV", "xAxis", "yAxis"];

/** A pair as a mark: shown (−2, 3), said "minus 2, 3" in a language's words. */
const pairMark = (minus: string) => (x: number, y: number) => {
  const shown = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
  const said = (n: number) => (n < 0 ? `${minus} ${-n}` : `${n}`);
  return `[[(${shown(x)}, ${shown(y)})|${said(x)}, ${said(y)}]]`;
};
const pairEn = pairMark("minus");
const pairHi = pairMark("माइनस");

/** NCERT Ex 3.3 Q1: in which quadrant, or on which axis, a point lies, from its coordinates. */
export const quadrantOrAxis = family({
  level: Level.Easy,
  tests: [Concept.CoordinatesOfAPoint],
  params: z.object({ x: z.number().int(), y: z.number().int() }).strict(),
  build: ({ x, y }) => {
    const pair = t(pairEn(x, y), pairHi(x, y));
    const ask = choice({
      prompt: t(
        `In which quadrant, or on which axis, does the point ${pair.en} lie?`,
        `बिंदु ${pair.hi} किस चतुर्थांश में, या किस अक्ष पर स्थित है?`,
      ),
      options: ALL.map((id) =>
        id === whereOf(x, y)
          ? { id, label: WHERE[id] }
          : {
              id,
              label: WHERE[id],
              feedback: t(
                `${SIGNS_OF[id].en} This point is ${pair.en}.`,
                `${SIGNS_OF[id].hi} यह बिंदु ${pair.hi} है।`,
              ),
            },
      ),
      keepOrder: true,
      answer: whereOf(x, y),
    });
    return scene({ pieces: { ask: ask } });
  },
});
