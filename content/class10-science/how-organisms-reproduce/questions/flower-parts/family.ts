import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["anther", "male", "ovary", "stigma", "papaya", "hibiscus"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  anther: {
    prompt: { en: "The anther contains:", hi: "परागकोश में होते हैं:" },
    right: { en: "pollen", hi: "पराग" },
    wrong: [
      { en: "sepals", hi: "बाह्यदल" },
      { en: "ovules", hi: "बीजांड" },
      { en: "pistil", hi: "स्त्रीकेसर" },
    ],
    why: {
      en: "The anther, on top of the stamen, produces the yellowish pollen grains.",
      hi: "पुंकेसर के ऊपर का परागकोश पीले-से परागकण बनाता है।",
    },
  },
  male: {
    prompt: {
      en: "Which is the male reproductive part of a flower?",
      hi: "फूल का नर जनन भाग कौन-सा है?",
    },
    right: { en: "Stamen", hi: "पुंकेसर" },
    wrong: [
      { en: "Pistil", hi: "स्त्रीकेसर" },
      { en: "Sepal", hi: "बाह्यदल" },
      { en: "Petal", hi: "दल" },
    ],
    why: {
      en: "The stamen (anther and filament) is male; the pistil is female; sepals and petals are not reproductive.",
      hi: "पुंकेसर (परागकोश और तंतु) नर है; स्त्रीकेसर मादा है; बाह्यदल और दल जनन भाग नहीं हैं।",
    },
  },
  ovary: {
    prompt: {
      en: "The swollen bottom part of the pistil, which contains the ovules, is the:",
      hi: "स्त्रीकेसर का फूला हुआ निचला भाग, जिसमें बीजांड होते हैं, है:",
    },
    right: { en: "Ovary", hi: "अंडाशय" },
    wrong: [
      { en: "Stigma", hi: "वर्तिकाग्र" },
      { en: "Style", hi: "वर्तिका" },
      { en: "Anther", hi: "परागकोश" },
    ],
    why: {
      en: "The pistil has three parts: the ovary at the bottom, the style in the middle and the stigma at the tip.",
      hi: "स्त्रीकेसर के तीन भाग हैं: नीचे अंडाशय, बीच में वर्तिका और सिरे पर वर्तिकाग्र।",
    },
  },
  stigma: {
    prompt: {
      en: "The tip of the pistil, which may be sticky and where pollen lands, is the:",
      hi: "स्त्रीकेसर का सिरा, जो चिपचिपा हो सकता है और जहाँ पराग गिरता है, है:",
    },
    right: { en: "Stigma", hi: "वर्तिकाग्र" },
    wrong: [
      { en: "Ovary", hi: "अंडाशय" },
      { en: "Filament", hi: "तंतु" },
      { en: "Sepal", hi: "बाह्यदल" },
    ],
    why: {
      en: "Pollen must be transferred to the stigma, the terminal part of the pistil.",
      hi: "पराग को स्त्रीकेसर के अंतिम भाग, वर्तिकाग्र, तक पहुँचना होता है।",
    },
  },
  papaya: {
    prompt: {
      en: "A papaya flower has either stamens or a pistil, not both. It is:",
      hi: "पपीते के फूल में पुंकेसर या स्त्रीकेसर में से एक होता है, दोनों नहीं। यह है:",
    },
    right: { en: "Unisexual", hi: "एकलिंगी" },
    wrong: [{ en: "Bisexual", hi: "उभयलिंगी" }],
    why: {
      en: "A flower with either stamens or pistil is unisexual (papaya, watermelon); with both it is bisexual (Hibiscus, mustard).",
      hi: "पुंकेसर या स्त्रीकेसर में से केवल एक वाला फूल एकलिंगी है (पपीता, तरबूज़); दोनों वाला उभयलिंगी (गुड़हल, सरसों)।",
    },
  },
  hibiscus: {
    prompt: {
      en: "A Hibiscus flower has both stamens and a pistil. It is:",
      hi: "गुड़हल के फूल में पुंकेसर और स्त्रीकेसर दोनों होते हैं। यह है:",
    },
    right: { en: "Bisexual", hi: "उभयलिंगी" },
    wrong: [{ en: "Unisexual", hi: "एकलिंगी" }],
    why: {
      en: "A flower containing both stamens and pistil is bisexual.",
      hi: "पुंकेसर और स्त्रीकेसर दोनों वाला फूल उभयलिंगी है।",
    },
  },
};

/** NCERT 8.3.2, Fig 8.7 and Exercise 3: the parts of a flower, their jobs, and unisexual vs bisexual flowers. */
export const flowerParts = family({
  level: Level.Easy,
  tests: [Concept.FloweringPlants],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
