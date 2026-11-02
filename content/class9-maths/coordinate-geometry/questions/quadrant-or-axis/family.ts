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

/**
 * The slips a student makes: for a point in a quadrant, the other three (one sign read wrong, or
 * both); for a point on an axis, the other axis and the two quadrants either side of it.
 */
function slipsOf(x: number, y: number): Where[] {
  const at = whereOf(x, y);
  if (at === "xAxis") return ["yAxis", x > 0 ? "I" : "II", x > 0 ? "IV" : "III"];
  if (at === "yAxis") return ["xAxis", y > 0 ? "I" : "IV", y > 0 ? "II" : "III"];
  return (["I", "II", "III", "IV"] as const).filter((q) => q !== at);
}

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
      options: [whereOf(x, y), ...slipsOf(x, y)].map((id) => ({ id, label: WHERE[id] })),
      answer: whereOf(x, y),
    });
    return scene({ pieces: { ask: ask.piece }, uses: [ask.use] });
  },
});
