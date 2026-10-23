import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  does: {
    prompt: t("A solar cell converts…", "सौर सेल बदलता है…"),
    right: t("sunlight into electricity", "धूप को बिजली में"),
    wrong: [
      {
        label: t("solar energy into heat only", "सौर ऊर्जा को केवल ऊष्मा में"),
        feedback: t(
          "That's a solar cooker or heater. A cell gives electricity.",
          "वह सौर कुकर या हीटर है। सेल बिजली देता है।",
        ),
      },
      {
        label: t("electricity into sunlight", "बिजली को धूप में"),
        feedback: t(
          "That's a bulb. A solar cell does the reverse.",
          "वह बल्ब है। सौर सेल उलटा करता है।",
        ),
      },
    ],
  },
  volts: {
    prompt: t(
      "One solar cell gives about 0.5 V. How many in series give about 12 V?",
      "एक सौर सेल लगभग 0.5 V देता है। श्रेणी में कितने सेल लगभग 12 V देंगे?",
    ),
    right: t("24", "24"),
    wrong: [
      {
        label: t("6", "6"),
        feedback: t(
          "6 × 0.5 V = 3 V. You need 12 ÷ 0.5 = 24.",
          "6 × 0.5 V = 3 V। चाहिए 12 ÷ 0.5 = 24।",
        ),
      },
      {
        label: t("12", "12"),
        feedback: t("12 × 0.5 V = 6 V. You need 24 cells.", "12 × 0.5 V = 6 V। 24 सेल चाहिए।"),
      },
    ],
  },
  silicon: {
    prompt: t("Solar cells are mostly made from…", "सौर सेल ज़्यादातर किससे बनते हैं?"),
    right: t("silicon", "सिलिकॉन"),
    wrong: [
      {
        label: t("copper oxide", "ताँबे का ऑक्साइड"),
        feedback: t(
          "Copper wires connect the cells, but the cells are silicon.",
          "ताँबे के तार सेलों को जोड़ते हैं, पर सेल सिलिकॉन के हैं।",
        ),
      },
      {
        label: t("iron", "लोहा"),
        feedback: t("Silicon is the material used.", "सिलिकॉन उपयोग होता है।"),
      },
    ],
  },
  cost: {
    prompt: t(
      "Why aren't solar cells used everywhere yet?",
      "सौर सेल अभी हर जगह उपयोग क्यों नहीं होते?",
    ),
    right: t(
      "They're costly to make and each gives little electricity",
      "उन्हें बनाना महँगा है और हर एक थोड़ी बिजली देता है",
    ),
    wrong: [
      {
        label: t(
          "They wear out within a single day of being put in sunlight",
          "धूप में लगाने के एक दिन में ही वे घिस जाते हैं",
        ),
        feedback: t(
          "Solar cells last for years with almost no care.",
          "सौर सेल लगभग बिना देखभाल के वर्षों चलते हैं।",
        ),
      },
      {
        label: t(
          "They pollute the air badly whenever they are working",
          "जब भी वे काम करते हैं, हवा बहुत प्रदूषित करते हैं",
        ),
        feedback: t(
          "Running solar cells don't pollute. Cost is the problem.",
          "चलते सौर सेल प्रदूषण नहीं करते। समस्या लागत है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Solar cells and panels (NCERT 14.3.1). */
export const solarCell = family({
  level: Level.Easy,
  tests: [Concept.SolarEnergy],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
