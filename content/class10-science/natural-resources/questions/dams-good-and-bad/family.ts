import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["benefit", "social", "economic", "environmental", "narmada"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  benefit: {
    prompt: { en: "Big dams are built mainly to…", hi: "बड़े बाँध मुख्य रूप से किसलिए बनाए जाते हैं?" },
    right: { en: "Store water for irrigation and power", hi: "सिंचाई और बिजली के लिए पानी जमा करने" },
    wrong: [
      { en: "Make rivers flow faster towards the sea", hi: "नदियों को समुद्र की ओर तेज़ बहाने" },
      { en: "Keep fish out of the farming canals", hi: "खेती की नहरों से मछलियाँ दूर रखने" },
    ],
    why: {
      en: "Dams store water for irrigation and for generating electricity.",
      hi: "बाँध सिंचाई और बिजली बनाने के लिए पानी जमा करते हैं।",
    },
  },
  social: {
    prompt: {
      en: "Displacing many people without fair rehabilitation is a…",
      hi: "बड़ी संख्या में लोगों को बिना उचित पुनर्वास उजाड़ना… है",
    },
    right: { en: "Social problem", hi: "सामाजिक समस्या" },
    wrong: [
      { en: "Economic problem", hi: "आर्थिक समस्या" },
      { en: "Environmental problem", hi: "पर्यावरणीय समस्या" },
    ],
    why: {
      en: "Large numbers of people displaced without compensation is a social problem.",
      hi: "बिना मुआवज़े के बहुत से लोगों का उजड़ना सामाजिक समस्या है।",
    },
  },
  economic: {
    prompt: {
      en: "Spending huge sums of money without matching benefits is an…",
      hi: "भारी रक़म ख़र्च करना पर उतना लाभ न मिलना… है",
    },
    right: { en: "Economic problem", hi: "आर्थिक समस्या" },
    wrong: [
      { en: "Social problem", hi: "सामाजिक समस्या" },
      { en: "Environmental problem", hi: "पर्यावरणीय समस्या" },
    ],
    why: {
      en: "Swallowing public money without proportionate benefits is an economic problem.",
      hi: "बिना अनुपातिक लाभ के जनता का पैसा ख़र्च होना आर्थिक समस्या है।",
    },
  },
  environmental: {
    prompt: {
      en: "Deforestation and loss of biodiversity caused by a dam is an…",
      hi: "बाँध से वनों की कटाई और जैव-विविधता का नुक़सान… है",
    },
    right: { en: "Environmental problem", hi: "पर्यावरणीय समस्या" },
    wrong: [
      { en: "Economic problem", hi: "आर्थिक समस्या" },
      { en: "Social problem", hi: "सामाजिक समस्या" },
    ],
    why: {
      en: "Loss of forests and biodiversity is an environmental problem.",
      hi: "वनों और जैव-विविधता की हानि पर्यावरणीय समस्या है।",
    },
  },
  narmada: {
    prompt: { en: "The Narmada Bachao Andolan was about…", hi: "नर्मदा बचाओ आंदोलन किस बारे में था?" },
    right: {
      en: "Raising the height of the Sardar Sarovar Dam",
      hi: "सरदार सरोवर बाँध की ऊँचाई बढ़ाने के बारे में",
    },
    wrong: [
      {
        en: "Building new wells in every village in Gujarat",
        hi: "गुजरात के हर गाँव में नए कुएँ बनाने के बारे में",
      },
      { en: "Cleaning the river under the Ganga plan", hi: "गंगा योजना के तहत नदी साफ़ करने के बारे में" },
    ],
    why: {
      en: "It opposed raising the height of the Sardar Sarovar Dam on the Narmada.",
      hi: "इसने नर्मदा पर सरदार सरोवर बाँध की ऊँचाई बढ़ाने का विरोध किया।",
    },
  },
};

/** NCERT 16.3.1: big dams, what they give and the problems they raise. */
export const damsGoodAndBad = family({
  level: Level.Medium,
  tests: [Concept.WaterForAll],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
