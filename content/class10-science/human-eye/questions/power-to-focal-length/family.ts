import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { askFact } from "../../kit";

const cm = (f: number): string => {
  const r = Math.round(f * 10) / 10;
  return `${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r)}`;
};

/** From a spectacle power to its focal length and kind of lens: f = 1/P metres (NCERT Exercise 5). */
export const powerToFocalLength = family({
  level: Level.Medium,
  tests: [Concept.DefectsOfVision],
  params: z.object({ tenths: z.number().int().min(-80).max(80) }).strict(),
  build: ({ tenths }, b) => {
    const p = tenths / 10;
    const f = 100 / p;
    const pText = `${p > 0 ? "+" : "−"}${Math.abs(p)}`;
    const kind = p < 0 ? t("concave", "अवतल") : t("convex", "उत्तल");
    const other = p < 0 ? t("convex", "उत्तल") : t("concave", "अवतल");
    const use =
      p < 0
        ? t("distant vision (myopia)", "दूर की दृष्टि (निकट-दृष्टिता)")
        : t("near vision (hypermetropia)", "पास की दृष्टि (दूर-दृष्टिता)");
    const otherUse =
      p < 0
        ? t("near vision (hypermetropia)", "पास की दृष्टि (दूर-दृष्टिता)")
        : t("distant vision (myopia)", "दूर की दृष्टि (निकट-दृष्टिता)");
    const how = t(
      `$f = \\dfrac{1}{P} = \\dfrac{1}{${pText.replace("−", "-")}}$ m = ${cm(f)} cm.`,
      `$f = \\dfrac{1}{P} = \\dfrac{1}{${pText.replace("−", "-")}}$ मी = ${cm(f)} सेमी।`,
    );
    return askFact(
      b,
      {
        prompt: t(
          `A spectacle lens has a power of ${pText} D. What is its focal length, and what kind of lens is it?`,
          `एक चश्मे के लेंस की क्षमता ${pText} D है। उसकी फ़ोकस दूरी क्या है, और वह कैसा लेंस है?`,
        ),
        right: t(
          `${cm(f)} cm, ${kind.en}: for ${use.en}`,
          `${cm(f)} सेमी, ${kind.hi}: ${use.hi} के लिए`,
        ),
        wrong: [
          {
            label: t(
              `${cm(-f)} cm, ${other.en}: for ${otherUse.en}`,
              `${cm(-f)} सेमी, ${other.hi}: ${otherUse.hi} के लिए`,
            ),
            feedback: t(
              `The sign of the power is the sign of the focal length: ${how.en}`,
              `क्षमता का चिह्न ही फ़ोकस दूरी का चिह्न है: ${how.hi}`,
            ),
          },
          {
            label: t(
              `${cm(1 / p)} cm, ${kind.en}: for ${use.en}`,
              `${cm(1 / p)} सेमी, ${kind.hi}: ${use.hi} के लिए`,
            ),
            feedback: t(
              `$\\dfrac{1}{P}$ gives metres, not centimetres: ${how.en}`,
              `$\\dfrac{1}{P}$ मीटर देता है, सेंटीमीटर नहीं: ${how.hi}`,
            ),
          },
        ],
      },
      `power${tenths}`,
    );
  },
});
