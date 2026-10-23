import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["kulh", "individual", "canal", "shortage", "fair"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  kulh: {
    prompt: {
      en: "The water in Himachal's kulhs was managed by…",
      hi: "हिमाचल के कुल्हों का पानी कौन सँभालता था?",
    },
    right: { en: "The villages, by agreement among them", hi: "गाँव, आपस में समझौते से" },
    wrong: [
      { en: "A private company that sold the water", hi: "एक निजी कंपनी जो पानी बेचती थी" },
      { en: "The state's irrigation department", hi: "राज्य का सिंचाई विभाग" },
    ],
    why: {
      en: "Kulh water was managed by common agreement among all the villages.",
      hi: "कुल्ह का पानी सब गाँवों के साझा समझौते से सँभाला जाता था।",
    },
  },
  individual: {
    prompt: {
      en: "Exercise 4(b): as one person, how can you help manage water?",
      hi: "अभ्यास 4(b): तुम एक व्यक्ति के रूप में पानी के प्रबंधन में कैसे मदद कर सकते हो?",
    },
    right: {
      en: "Turn off taps and reuse water for plants",
      hi: "नल बंद रखना और पौधों के लिए पानी दोबारा इस्तेमाल करना",
    },
    wrong: [
      { en: "Wash the car every day with a running hose", hi: "हर दिन चलते पाइप से गाड़ी धोना" },
      { en: "Let rainwater run off into the drains", hi: "बारिश का पानी नालियों में बह जाने देना" },
    ],
    why: {
      en: "Saving and reusing water at home leaves more for everyone.",
      hi: "घर में पानी बचाने और दोबारा इस्तेमाल से सबके लिए ज़्यादा बचता है।",
    },
  },
  canal: {
    prompt: {
      en: "Why does water from big dams often not reach everyone?",
      hi: "बड़े बाँधों का पानी अक्सर सब तक क्यों नहीं पहुँचता?",
    },
    right: {
      en: "The well-off near the source take more",
      hi: "स्रोत के पास के संपन्न लोग ज़्यादा ले लेते हैं",
    },
    wrong: [
      { en: "The canals were all built in the wrong places", hi: "सारी नहरें ग़लत जगह बनाई गईं" },
      { en: "Rain never falls near the large dams", hi: "बड़े बाँधों के पास कभी बारिश नहीं होती" },
    ],
    why: {
      en: "People near the source grow water-hungry crops; those at the far end get little.",
      hi: "स्रोत के पास के लोग ज़्यादा पानी वाली फ़सलें उगाते हैं; दूर वालों को कम मिलता है।",
    },
  },
  shortage: {
    prompt: {
      en: "Water shortage in many regions is mostly due to…",
      hi: "कई क्षेत्रों में पानी की कमी मुख्य रूप से किस कारण है?",
    },
    right: {
      en: "Poor management, not only a lack of rain",
      hi: "ख़राब प्रबंधन, केवल बारिश की कमी नहीं",
    },
    wrong: [
      {
        en: "Too much rain falling during every single season",
        hi: "हर एक मौसम में बहुत ज़्यादा बारिश",
      },
      { en: "People drinking far more water than before", hi: "लोगों का पहले से कहीं ज़्यादा पानी पीना" },
    ],
    why: {
      en: "Loss of vegetation, water-hungry crops and pollution fail to sustain water, even where it rains.",
      hi: "वनस्पति का घटना, ज़्यादा पानी वाली फ़सलें और प्रदूषण पानी को टिकने नहीं देते, बारिश हो तब भी।",
    },
  },
  fair: {
    prompt: {
      en: "In-text question 3: a village's water source is fair only if…",
      hi: "पाठ्य प्रश्न 3: गाँव का जल स्रोत तभी न्यायसंगत है जब…",
    },
    right: { en: "Everyone in the area can get enough", hi: "इलाक़े में सबको पर्याप्त मिल सके" },
    wrong: [
      { en: "Those who pay most get first use", hi: "सबसे ज़्यादा देने वालों को पहले मिले" },
      { en: "The nearest houses take all they want", hi: "पास के घर जितना चाहें ले लें" },
    ],
    why: {
      en: "Water is a basic need, so a fair source serves every person living in the area.",
      hi: "पानी बुनियादी ज़रूरत है, इसलिए न्यायसंगत स्रोत इलाक़े के हर व्यक्ति के काम आता है।",
    },
  },
};

/** NCERT 16.3, the kulhs, in-text question 3 and Exercise 4(b): water for all. */
export const waterForEveryone = family({
  level: Level.Medium,
  tests: [Concept.WaterForAll],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
