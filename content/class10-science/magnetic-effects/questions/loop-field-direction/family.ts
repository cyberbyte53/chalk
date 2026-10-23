import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  table: {
    prompt: t(
      "A loop lies flat on a table with the current clockwise (seen from above). The field inside the loop points…",
      "एक पाश मेज़ पर सपाट रखा है, धारा (ऊपर से देखने पर) दक्षिणावर्त। पाश के अंदर क्षेत्र…",
    ),
    right: t("down, into the table", "नीचे, मेज़ के अंदर"),
    wrong: [
      {
        label: t("up, out of the table", "ऊपर, मेज़ से बाहर"),
        feedback: t(
          "That is outside the loop. Thumb along the clockwise current: inside, the fingers point down.",
          "यह पाश के बाहर है। अँगूठा दक्षिणावर्त धारा के साथ: अंदर उँगलियाँ नीचे इशारा करती हैं।",
        ),
      },
    ],
  },
  reverse: {
    prompt: t(
      "The current in a solenoid is reversed. Its poles…",
      "परिनालिका में धारा उलटी की जाती है। उसके ध्रुव…",
    ),
    right: t("swap ends", "सिरे बदल लेते हैं"),
    wrong: [
      {
        label: t("stay the same", "वही रहते हैं"),
        feedback: t(
          "The field inside reverses, so the N end becomes the S end.",
          "अंदर क्षेत्र उलटता है, इसलिए N सिरा S बन जाता है।",
        ),
      },
    ],
  },
  test: {
    prompt: t(
      "The N pole of a bar magnet repels one end of a hanging solenoid. That end is…",
      "छड़ चुंबक का N ध्रुव लटकी परिनालिका के एक सिरे को प्रतिकर्षित करता है। वह सिरा है…",
    ),
    right: t("a north pole", "उत्तर ध्रुव"),
    wrong: [
      {
        label: t("a south pole", "दक्षिण ध्रुव"),
        feedback: t(
          "A south pole would be attracted, not repelled.",
          "दक्षिण ध्रुव आकर्षित होता, प्रतिकर्षित नहीं।",
        ),
      },
    ],
  },
  centre: {
    prompt: t(
      "True or false: the field at the centre of a long circular coil carrying a current is made of parallel straight lines.",
      "सही या ग़लत: धारावाही लंबी वृत्ताकार कुंडली के केंद्र पर क्षेत्र समांतर सीधी रेखाओं से बना होता है।",
    ),
    right: t("True", "सही"),
    wrong: [
      {
        label: t("False", "ग़लत"),
        feedback: t(
          "At the centre, the big circles from every part look straight and run the same way.",
          "केंद्र पर हर भाग के बड़े वृत्त सीधे दिखते हैं और एक ही ओर चलते हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** The direction of the field of a loop or solenoid (NCERT 13.2.3; in-text Q1; Exercise 8). */
export const loopFieldDirection = family({
  level: Level.Medium,
  tests: [Concept.LoopsAndSolenoids],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
