import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["short", "long", "limited", "waste"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  short: {
    prompt: {
      en: "Exercise 2: exploiting resources with short-term aims mainly gives…",
      hi: "अभ्यास 2: अल्पकालिक लक्ष्यों से संसाधनों के दोहन से मुख्य रूप से मिलता है…",
    },
    right: { en: "Quick profit and needs met for now", hi: "जल्दी मुनाफ़ा और अभी की ज़रूरतें पूरी" },
    wrong: [
      { en: "Resources that last for all generations", hi: "सभी पीढ़ियों तक चलने वाले संसाधन" },
      { en: "Lower pollution than long-term use", hi: "दीर्घकालिक उपयोग से कम प्रदूषण" },
    ],
    why: {
      en: "Short-term use meets today's demand and gives quick gains, but uses resources up.",
      hi: "अल्पकालिक उपयोग आज की माँग पूरी करता है और जल्दी लाभ देता है, पर संसाधन ख़त्म करता है।",
    },
  },
  long: {
    prompt: {
      en: "Exercise 3: a long-term view of resources mainly gives…",
      hi: "अभ्यास 3: संसाधनों पर दीर्घकालिक दृष्टि से मुख्य रूप से मिलता है…",
    },
    right: {
      en: "Enough left for generations to come",
      hi: "आने वाली पीढ़ियों के लिए पर्याप्त बचा रहना",
    },
    wrong: [
      { en: "The biggest possible profit this year", hi: "इस साल सबसे बड़ा संभव मुनाफ़ा" },
      { en: "Faster use of everything we have", hi: "जो कुछ है उसका और तेज़ इस्तेमाल" },
    ],
    why: {
      en: "A long-term view keeps resources available for future generations too.",
      hi: "दीर्घकालिक दृष्टि संसाधनों को भावी पीढ़ियों के लिए भी बचाए रखती है।",
    },
  },
  limited: {
    prompt: {
      en: "Why must natural resources be managed carefully?",
      hi: "प्राकृतिक संसाधनों का सावधानी से प्रबंधन क्यों ज़रूरी है?",
    },
    right: {
      en: "They are limited, and demand keeps growing",
      hi: "वे सीमित हैं, और माँग बढ़ती जा रही है",
    },
    wrong: [
      {
        en: "Only so that the government can tax their use",
        hi: "केवल इसलिए कि सरकार उनके उपयोग पर कर ले सके",
      },
      {
        en: "Because nature cannot renew any resource",
        hi: "क्योंकि प्रकृति कोई संसाधन नवीकृत नहीं कर सकती",
      },
    ],
    why: {
      en: "Resources are limited while population and demand keep rising.",
      hi: "संसाधन सीमित हैं जबकि जनसंख्या और माँग बढ़ रही है।",
    },
  },
  waste: {
    prompt: {
      en: "Sustainable management should also make sure of…",
      hi: "संपोषित प्रबंधन को यह भी सुनिश्चित करना चाहिए…",
    },
    right: { en: "Safe disposal of the wastes produced", hi: "बनने वाले कचरे का सुरक्षित निपटान" },
    wrong: [
      { en: "Making every resource as cheap as possible", hi: "हर संसाधन को जितना हो सके सस्ता करना" },
      { en: "Moving all factories into the forests", hi: "सब कारख़ाने जंगलों में ले जाना" },
    ],
    why: {
      en: "Using resources creates waste, like slag from mining, which must be disposed of safely.",
      hi: "संसाधनों के उपयोग से कचरा बनता है, जैसे खनन का धातुमल, जिसका सुरक्षित निपटान ज़रूरी है।",
    },
  },
};

/** NCERT 16.1.1 and Exercises 2 and 3: short-term and long-term use. */
export const shortOrLongTerm = family({
  level: Level.Medium,
  tests: [Concept.WhyManageResources],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
