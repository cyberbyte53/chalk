import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["why", "name", "entry", "residue"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  why: {
    prompt: {
      en: "Why do pesticides build up along a food chain?",
      hi: "कीटनाशक आहार श्रृंखला में क्यों जमा होते हैं?",
    },
    right: { en: "They are not degradable", hi: "वे अनिम्नीकरणीय हैं" },
    wrong: [
      { en: "They are made by plants", hi: "उन्हें पौधे बनाते हैं" },
      { en: "They evaporate quickly", hi: "वे जल्दी उड़ जाते हैं" },
    ],
    why: {
      en: "Nothing breaks them down, so they accumulate at each level.",
      hi: "इन्हें कोई नहीं तोड़ता, इसलिए ये हर स्तर पर जमा होते हैं।",
    },
  },
  name: {
    prompt: {
      en: "The build-up of chemicals at higher trophic levels is called…",
      hi: "ऊँचे पोषी स्तरों पर रसायनों का जमाव कहलाता है…",
    },
    right: { en: "Biological magnification", hi: "जैव आवर्धन" },
    wrong: [
      { en: "Biological decomposition", hi: "जैव अपघटन" },
      { en: "Ozone depletion", hi: "ओज़ोन क्षय" },
    ],
    why: { en: "NCERT calls it biological magnification.", hi: "NCERT इसे जैव आवर्धन कहती है।" },
  },
  entry: {
    prompt: {
      en: "How do pesticides reach water plants in a pond?",
      hi: "कीटनाशक तालाब के जलीय पौधों तक कैसे पहुँचते हैं?",
    },
    right: { en: "Washed in from the fields", hi: "खेतों से बहकर" },
    wrong: [
      { en: "Made inside the fish", hi: "मछलियों के अंदर बनकर" },
      { en: "Formed by the sunlight", hi: "धूप से बनकर" },
    ],
    why: {
      en: "They are washed down into soil and water bodies, then taken up by plants.",
      hi: "ये बहकर मिट्टी और जल-स्रोतों में जाते हैं, फिर पौधे इन्हें ले लेते हैं।",
    },
  },
  residue: {
    prompt: {
      en: "Why can pesticide residues be found even in meat?",
      hi: "मांस में भी कीटनाशक के अवशेष क्यों मिल सकते हैं?",
    },
    right: { en: "Animals ate sprayed plants", hi: "जंतुओं ने छिड़के पौधे खाए" },
    wrong: [
      { en: "Meat is sprayed in shops", hi: "दुकानों में मांस पर छिड़काव होता है" },
      { en: "Animals make the chemicals", hi: "जंतु ये रसायन बनाते हैं" },
    ],
    why: {
      en: "The chemical passes from plants to the animals that eat them, and builds up.",
      hi: "रसायन पौधों से उन्हें खाने वाले जंतुओं में जाता है, और जमा होता है।",
    },
  },
};

/** NCERT 15.1.1: how pesticides enter food chains and build up (biological magnification). */
export const magnificationFacts = family({
  level: Level.Medium,
  tests: [Concept.BiologicalMagnification],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
