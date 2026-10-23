import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** NCERT Table 10.3, the media these questions use. */
const media = {
  air: { n: 1.0003, en: "air", hi: "वायु" },
  water: { n: 1.33, en: "water", hi: "पानी" },
  alcohol: { n: 1.36, en: "alcohol", hi: "ऐल्कोहॉल" },
  kerosene: { n: 1.44, en: "kerosene", hi: "किरोसिन" },
  glass: { n: 1.52, en: "crown glass", hi: "क्राउन काँच" },
  diamond: { n: 2.42, en: "diamond", hi: "हीरा" },
} as const;
type Name = keyof typeof media;
const names = Object.keys(media) as [Name, ...Name[]];

/** Light goes slantwise from one medium into another: towards or away from the normal, and why. */
export const bendWhichWay = family({
  level: Level.Easy,
  tests: [Concept.Refraction],
  params: z.object({ from: z.enum(names), to: z.enum(names) }).strict(),
  build: ({ from, to }, b) => {
    const a = media[from];
    const c = media[to];
    if (a.n === c.n) throw new Error("bend-which-way: the two media must differ");
    const slower = c.n > a.n;
    const towards = {
      id: slower ? "right" : "towards",
      label: t("Towards the normal: light slows down", "अभिलंब की ओर: प्रकाश धीमा होता है"),
    };
    const away = {
      id: slower ? "away" : "right",
      label: t("Away from the normal: light speeds up", "अभिलंब से दूर: प्रकाश तेज़ होता है"),
    };
    const why = t(
      `The refractive index of ${a.en} is ${a.n} and of ${c.en} is ${c.n}. Light is ${slower ? "slower" : "faster"} in ${c.en}, so it bends ${slower ? "towards" : "away from"} the normal.`,
      `${a.hi} का अपवर्तनांक ${a.n} और ${c.hi} का ${c.n} है। ${c.hi} में प्रकाश ${slower ? "धीमा" : "तेज़"} है, इसलिए वह अभिलंब ${slower ? "की ओर" : "से दूर"} मुड़ता है।`,
    );
    const options: Option[] = [
      slower ? towards : { ...towards, feedback: why },
      slower ? { ...away, feedback: why } : away,
      {
        id: "straight",
        label: t("It doesn't bend", "वह नहीं मुड़ता"),
        feedback: t(
          `Light only goes straight on along the normal. Slantwise, it bends whenever its speed changes. ${why.en}`,
          `प्रकाश केवल अभिलंब के साथ सीधा जाता है। तिरछा जाने पर, चाल बदलते ही वह मुड़ता है। ${why.hi}`,
        ),
      },
    ];
    const ask = choiceQuestion(b, {
      prompt: t(
        `A ray of light goes slantwise from ${a.en} into ${c.en}. Which way does it bend, and why?`,
        `प्रकाश की एक किरण ${a.hi} से ${c.hi} में तिरछी जाती है। वह किस ओर मुड़ती है, और क्यों?`,
      ),
      options: settle(options, from.length * 7 + to.length * 3),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
