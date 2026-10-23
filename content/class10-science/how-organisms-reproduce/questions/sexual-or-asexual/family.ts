import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["calf", "rose", "peaSeed", "yeast"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  calf: {
    prompt: {
      en: "A cow and a bull produce a calf. This is:",
      hi: "गाय और बैल से बछड़ा होता है। यह है:",
    },
    right: { en: "Sexual reproduction", hi: "लैंगिक जनन" },
    wrong: [{ en: "Asexual reproduction", hi: "अलैंगिक जनन" }],
    why: {
      en: "Two individuals, male and female, are involved: sexual reproduction.",
      hi: "दो जीव, नर और मादा, शामिल हैं: लैंगिक जनन।",
    },
  },
  rose: {
    prompt: {
      en: "A gardener grows a new rose plant by grafting a cutting. This is:",
      hi: "माली कलम रोपकर नया गुलाब का पौधा उगाता है। यह है:",
    },
    right: { en: "Asexual reproduction", hi: "अलैंगिक जनन" },
    wrong: [{ en: "Sexual reproduction", hi: "लैंगिक जनन" }],
    why: {
      en: "A new plant from one plant's part, with no germ cells fusing, is asexual (vegetative propagation).",
      hi: "एक पौधे के भाग से नया पौधा, बिना जनन कोशिकाओं के मिले, अलैंगिक है (कायिक प्रवर्धन)।",
    },
  },
  peaSeed: {
    prompt: {
      en: "Pea seeds form after pollen reaches the stigma and fertilisation happens. This is:",
      hi: "पराग वर्तिकाग्र पर पहुँचने और निषेचन होने के बाद मटर के बीज बनते हैं। यह है:",
    },
    right: { en: "Sexual reproduction", hi: "लैंगिक जनन" },
    wrong: [{ en: "Asexual reproduction", hi: "अलैंगिक जनन" }],
    why: {
      en: "Fertilisation is the fusion of male and female germ cells: sexual reproduction.",
      hi: "निषेचन नर और मादा जनन कोशिकाओं का मिलना है: लैंगिक जनन।",
    },
  },
  yeast: {
    prompt: {
      en: "A yeast cell puts out a bud that separates. This is:",
      hi: "यीस्ट कोशिका से एक कली निकलकर अलग हो जाती है। यह है:",
    },
    right: { en: "Asexual reproduction", hi: "अलैंगिक जनन" },
    wrong: [{ en: "Sexual reproduction", hi: "लैंगिक जनन" }],
    why: {
      en: "Budding creates a new individual from a single parent: asexual.",
      hi: "मुकुलन एक जनक से नया जीव बनाता है: अलैंगिक।",
    },
  },
};

/** NCERT 8.2–8.3: decide whether a way of producing new individuals is sexual (two individuals, germ cells) or asexual (one individual). */
export const sexualOrAsexual = family({
  level: Level.Easy,
  tests: [Concept.WhyTwoParents, Concept.PlantsFromParts],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
