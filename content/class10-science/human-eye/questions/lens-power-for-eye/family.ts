import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { askFact } from "../../kit";

const Defect = { Myopia: "myopia", Hypermetropia: "hypermetropia" } as const;

/** A power in dioptres, written the way an optician would: sign, then up to two decimals. */
function dioptres(p: number): string {
  const rounded = Math.round(p * 100) / 100;
  const text = Number.isInteger(rounded) ? rounded.toFixed(0) : String(rounded);
  return `${rounded > 0 ? "+" : rounded < 0 ? "−" : ""}${text.replace("-", "")} D`;
}

/**
 * The lens that corrects an eye. Myopia: a concave lens with its focus at the far point,
 * P = −100/far (cm). Hypermetropia: a convex lens that images 25 cm at the near point,
 * P = 100/25 − 100/near (cm). Distractors: the wrong sign, and the distance read as metres.
 */
export const lensPowerForEye = family({
  level: Level.Hard,
  tests: [Concept.DefectsOfVision],
  params: z
    .object({ defect: z.nativeEnum(Defect), cm: z.number().int().min(30).max(500) })
    .strict(),
  build: ({ defect, cm }, b) => {
    const isMyopia = defect === Defect.Myopia;
    const power = isMyopia ? -100 / cm : 4 - 100 / cm;
    const right = dioptres(power);
    const flipped = dioptres(-power);
    const metres = dioptres(isMyopia ? -cm / 100 : cm / 100);
    const kind = isMyopia ? t("concave", "अवतल") : t("convex", "उत्तल");
    const wrongKind = isMyopia ? t("convex", "उत्तल") : t("concave", "अवतल");
    const prompt = isMyopia
      ? t(
          `The far point of a myopic eye is ${cm} cm. What is the nature and power of the lens that corrects it?`,
          `निकट-दृष्टि वाली आँख का दूर बिंदु ${cm} सेमी है। उसे ठीक करने वाले लेंस की प्रकृति और क्षमता क्या है?`,
        )
      : t(
          `The near point of a hypermetropic eye is ${cm} cm. What lens lets it read at 25 cm?`,
          `दूर-दृष्टि वाली आँख का निकट बिंदु ${cm} सेमी है। कौन-सा लेंस उसे 25 सेमी पर पढ़ने देगा?`,
        );
    const how = isMyopia
      ? t(
          `The focus goes at the far point: $f = -${cm / 100}$ m, so $P = \\dfrac{1}{f}$ = ${right}.`,
          `फ़ोकस दूर बिंदु पर होता है: $f = -${cm / 100}$ मी, इसलिए $P = \\dfrac{1}{f}$ = ${right}।`,
        )
      : t(
          `Use $u = -25$ cm, $v = -${cm}$ cm in the lens formula: $P = \\dfrac{100}{25} - \\dfrac{100}{${cm}}$ = ${right}.`,
          `लेंस सूत्र में $u = -25$ सेमी, $v = -${cm}$ सेमी रखो: $P = \\dfrac{100}{25} - \\dfrac{100}{${cm}}$ = ${right}।`,
        );
    const wrong = [
      {
        label: t(`${wrongKind.en}, ${flipped}`, `${wrongKind.hi}, ${flipped}`),
        feedback: t(
          `${isMyopia ? "Myopia needs a concave lens, so a minus power." : "Hypermetropia needs a convex lens, so a plus power."} ${how.en}`,
          `${isMyopia ? "निकट-दृष्टिता को अवतल लेंस चाहिए, इसलिए ऋण क्षमता।" : "दूर-दृष्टिता को उत्तल लेंस चाहिए, इसलिए धन क्षमता।"} ${how.hi}`,
        ),
      },
    ];
    if (metres !== right && metres !== flipped)
      wrong.push({
        label: t(`${kind.en}, ${metres}`, `${kind.hi}, ${metres}`),
        feedback: t(
          `Power is 1 over the focal length in metres, not the distance itself. ${how.en}`,
          `क्षमता 1 बटा मीटर में फ़ोकस दूरी है, दूरी ख़ुद नहीं। ${how.hi}`,
        ),
      });
    return askFact(
      b,
      { prompt, right: t(`${kind.en}, ${right}`, `${kind.hi}, ${right}`), wrong },
      `${defect}${cm}`,
    );
  },
});
