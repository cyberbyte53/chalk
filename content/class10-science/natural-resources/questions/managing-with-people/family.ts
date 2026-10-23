import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["approach", "individual", "lop", "grazing", "stake"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  approach: {
    prompt: {
      en: "Exercise 6: which approach helps conserve forests?",
      hi: "अभ्यास 6: कौन-सा तरीक़ा वनों के संरक्षण में मदद करता है?",
    },
    right: {
      en: "Involving local people in protecting them",
      hi: "उनकी रक्षा में स्थानीय लोगों को शामिल करना",
    },
    wrong: [
      { en: "Handing them all over to industries for use", hi: "उन्हें पूरी तरह उद्योगों को सौंप देना" },
      {
        en: "Fencing them off from every single villager",
        hi: "उन्हें हर एक गाँव वाले से बाड़ लगाकर अलग करना",
      },
    ],
    why: {
      en: "Chipko and Arabari show that forests recover when local people share in protecting them.",
      hi: "चिपको और अराबाड़ी दिखाते हैं कि स्थानीय लोग साथ दें तो वन फिर पनपते हैं।",
    },
  },
  individual: {
    prompt: {
      en: "Exercise 4(a): as one person, how can you help forests and wildlife?",
      hi: "अभ्यास 4(a): तुम एक व्यक्ति के रूप में वनों और वन्यजीवों की मदद कैसे कर सकते हो?",
    },
    right: {
      en: "Use less paper and never buy wildlife products",
      hi: "कम कागज़ इस्तेमाल करना और वन्यजीव उत्पाद कभी न ख़रीदना",
    },
    wrong: [
      {
        en: "Buy furniture made only from rare forest timber",
        hi: "केवल दुर्लभ वन लकड़ी का फ़र्नीचर ख़रीदना",
      },
      {
        en: "Feed wild animals snacks whenever you see them",
        hi: "जब भी दिखें, जंगली जानवरों को नाश्ता खिलाना",
      },
    ],
    why: {
      en: "Less paper means fewer trees cut; no wildlife products means no demand for poaching.",
      hi: "कम कागज़ यानी कम पेड़ कटेंगे; वन्यजीव उत्पाद न ख़रीदना यानी शिकार की माँग नहीं।",
    },
  },
  lop: {
    prompt: {
      en: "Why is lopping branches better than felling the tree?",
      hi: "पेड़ काटने से डालियाँ छाँटना बेहतर क्यों है?",
    },
    right: { en: "The tree grows its branches back", hi: "पेड़ की डालियाँ फिर उग आती हैं" },
    wrong: [
      { en: "It gives far more wood every year", hi: "इससे हर साल कहीं ज़्यादा लकड़ी मिलती है" },
      { en: "Felled trees are replanted at once", hi: "काटे गए पेड़ तुरंत फिर लगा दिए जाते हैं" },
    ],
    why: {
      en: "A lopped tree survives and regrows; a felled tree is gone.",
      hi: "छाँटा गया पेड़ बचा रहता है और फिर बढ़ता है; काटा गया पेड़ ख़त्म।",
    },
  },
  grazing: {
    prompt: {
      en: "Stopping sheep grazing in the Great Himalayan National Park led to…",
      hi: "ग्रेट हिमालयन नेशनल पार्क में भेड़ों की चराई रोकने से क्या हुआ?",
    },
    right: {
      en: "Tall grass that fell and choked new growth",
      hi: "लंबी घास जो गिरकर नई बढ़त रोक देती थी",
    },
    wrong: [
      {
        en: "Far more fresh grass for wild animals to eat",
        hi: "जंगली जानवरों के खाने के लिए कहीं ज़्यादा ताज़ी घास",
      },
      { en: "Shepherds earning more from their sheep", hi: "चरवाहों की भेड़ों से ज़्यादा कमाई" },
    ],
    why: {
      en: "Without grazing the grass grew very tall, then fell over and prevented fresh growth.",
      hi: "चराई के बिना घास बहुत लंबी हुई, फिर गिरकर नई बढ़त रोकने लगी।",
    },
  },
  stake: {
    prompt: {
      en: "Why did the villagers of Chipko protect their forest?",
      hi: "चिपको के गाँव वालों ने अपने वन की रक्षा क्यों की?",
    },
    right: { en: "Their daily needs depended on it", hi: "उनकी रोज़ की ज़रूरतें उस पर निर्भर थीं" },
    wrong: [
      { en: "A paper mill paid them to guard it", hi: "एक पेपर मिल ने रखवाली के पैसे दिए" },
      { en: "They wanted to sell its timber themselves", hi: "वे उसकी लकड़ी ख़ुद बेचना चाहते थे" },
    ],
    why: {
      en: "Their fuel, fodder and food came from the forest, so they had a stake in keeping it.",
      hi: "उनका ईंधन, चारा और भोजन वन से आता था, इसलिए उसे बचाने में उनका हित था।",
    },
  },
};

/** NCERT 16.2 and Exercises 4(a) and 6: managing forests with local people. */
export const managingWithPeople = family({
  level: Level.Medium,
  tests: [Concept.ManagingForestsWithPeople],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
