import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["soil", "biotic", "cropField", "lake", "define"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  soil: {
    prompt: {
      en: "Which of these is an abiotic component of a pond?",
      hi: "इनमें से कौन तालाब का अजैव घटक है?",
    },
    right: { en: "The minerals in its mud", hi: "उसकी कीचड़ के खनिज" },
    wrong: [
      { en: "The algae on its surface", hi: "उसकी सतह पर शैवाल" },
      { en: "The frogs on its banks", hi: "उसके किनारों के मेंढक" },
    ],
    why: {
      en: "Abiotic means non-living: minerals, water, temperature, light.",
      hi: "अजैव का अर्थ है निर्जीव: खनिज, पानी, ताप, प्रकाश।",
    },
  },
  biotic: {
    prompt: {
      en: "Which of these is a biotic component of a garden?",
      hi: "इनमें से कौन बगीचे का जैव घटक है?",
    },
    right: { en: "Earthworms in the soil", hi: "मिट्टी के केंचुए" },
    wrong: [
      { en: "Rain falling on the soil", hi: "मिट्टी पर गिरती बारिश" },
      { en: "Wind blowing the leaves", hi: "पत्तियाँ हिलाती हवा" },
    ],
    why: { en: "Biotic components are the living organisms.", hi: "जैव घटक जीवित जीव हैं।" },
  },
  cropField: {
    prompt: {
      en: "A crop field is which kind of ecosystem?",
      hi: "फ़सल का खेत किस तरह का पारितंत्र है?",
    },
    right: { en: "Human-made", hi: "मानव-निर्मित" },
    wrong: [
      { en: "Natural", hi: "प्राकृतिक" },
      { en: "Not an ecosystem", hi: "पारितंत्र नहीं" },
    ],
    why: {
      en: "People set up crop fields, gardens and aquariums: they are artificial ecosystems.",
      hi: "फ़सल के खेत, बगीचे और जलजीवशाला लोग बनाते हैं: ये कृत्रिम पारितंत्र हैं।",
    },
  },
  lake: {
    prompt: { en: "A lake is which kind of ecosystem?", hi: "झील किस तरह का पारितंत्र है?" },
    right: { en: "Natural", hi: "प्राकृतिक" },
    wrong: [
      { en: "Human-made", hi: "मानव-निर्मित" },
      { en: "Not an ecosystem", hi: "पारितंत्र नहीं" },
    ],
    why: {
      en: "Forests, ponds and lakes are natural ecosystems.",
      hi: "वन, तालाब और झीलें प्राकृतिक पारितंत्र हैं।",
    },
  },
  define: {
    prompt: { en: "What makes up an ecosystem?", hi: "पारितंत्र किससे मिलकर बनता है?" },
    right: { en: "Organisms plus their non-living surroundings", hi: "जीव और उनका निर्जीव परिवेश" },
    wrong: [
      { en: "Only the plants and animals living in a place", hi: "किसी जगह के केवल पौधे और जंतु" },
      {
        en: "Only the soil, water and air found in a place",
        hi: "किसी जगह की केवल मिट्टी, पानी और हवा",
      },
    ],
    why: {
      en: "An ecosystem is all the interacting organisms in an area together with its non-living parts.",
      hi: "पारितंत्र किसी क्षेत्र के सभी परस्पर क्रिया करने वाले जीव और उसके निर्जीव हिस्से मिलकर है।",
    },
  },
};

/** NCERT 15.1: biotic and abiotic components; natural and human-made ecosystems. */
export const ecosystemParts = family({
  level: Level.Easy,
  tests: [Concept.WhatIsAnEcosystem],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
