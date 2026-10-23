import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["warming", "stability", "individual", "niche"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  warming: {
    prompt: {
      en: "Bacteria live in temperate water. Global warming heats the water. Which bacteria survive?",
      hi: "जीवाणु समशीतोष्ण पानी में रहते हैं। वैश्विक ऊष्मण पानी को गरम कर देता है। कौन-से जीवाणु बचते हैं?",
    },
    right: { en: "The few variants that resist heat", hi: "ताप सह सकने वाले कुछ विभिन्नरूप" },
    wrong: [
      { en: "All of them, since bacteria never vary", hi: "सभी, क्योंकि जीवाणुओं में विभिन्नता नहीं होती" },
      { en: "None of them; heat kills every bacterium", hi: "कोई नहीं; ताप हर जीवाणु को मार देता है" },
    ],
    why: {
      en: "Most die, but a few heat-resistant variants survive and grow further; variation helps the species survive.",
      hi: "ज़्यादातर मर जाते हैं, पर गर्मी सहने वाले कुछ विभिन्न जीवाणु बचकर बढ़ते हैं; विभिन्नता स्पीशीज़ को बचाती है।",
    },
  },
  stability: {
    prompt: {
      en: "What keeps a population suited to its niche over generations?",
      hi: "पीढ़ियों तक समष्टि को उसके निकेत के अनुकूल क्या बनाए रखता है?",
    },
    right: {
      en: "Consistent DNA copying during reproduction",
      hi: "जनन के दौरान DNA की एक जैसी नक़ल",
    },
    wrong: [
      { en: "Copying that changes everything each time", hi: "हर बार सब कुछ बदल देने वाली नक़ल" },
      { en: "Not reproducing at all", hi: "जनन बिल्कुल न करना" },
    ],
    why: {
      en: "Consistent copying keeps the body-design features that let the organism use its niche: reproduction is linked to the stability of populations.",
      hi: "एक जैसी नक़ल वे शारीरिक लक्षण बनाए रखती है जो जीव को अपने निकेत का उपयोग करने देते हैं: जनन समष्टि की स्थिरता से जुड़ा है।",
    },
  },
  individual: {
    prompt: {
      en: "Is a variation always good for the individual that has it?",
      hi: "क्या विभिन्नता हमेशा उस जीव के लिए अच्छी होती है जिसमें वह है?",
    },
    right: {
      en: "No; it may help the species when conditions change",
      hi: "नहीं; हालात बदलने पर यह जाति के काम आ सकती है",
    },
    wrong: [
      {
        en: "Yes; every variation helps the individual survive",
        hi: "हाँ; हर विभिन्नता व्यष्टि को जीवित रहने में मदद करती है",
      },
      {
        en: "Only if it is drastic enough to be noticed",
        hi: "केवल तब, जब वह इतनी बड़ी हो कि दिखाई दे",
      },
    ],
    why: {
      en: "Variations may not help an individual at all, but in a changed niche a few variants may survive and keep the species going.",
      hi: "विभिन्नताएँ शायद किसी जीव की मदद बिल्कुल न करें, पर बदले निकेत में कुछ विभिन्न जीव बचकर स्पीशीज़ को चलाए रख सकते हैं।",
    },
  },
  niche: {
    prompt: { en: "What is a niche?", hi: "निकेत क्या है?" },
    right: {
      en: "The place and way of life an organism is suited to",
      hi: "वह स्थान और जीवन-ढंग जिसके लिए कोई जीव अनुकूल है",
    },
    wrong: [
      {
        en: "The part of the nucleus that holds the DNA copy",
        hi: "केंद्रक का वह भाग जिसमें DNA की प्रति होती है",
      },
      { en: "A germ cell that carries half the DNA", hi: "एक जनन कोशिका जिसमें आधा DNA होता है" },
    ],
    why: {
      en: "Populations fill well-defined places, or niches, in the ecosystem, using their ability to reproduce.",
      hi: "समष्टियाँ जनन की अपनी क्षमता से पारितंत्र में निश्चित जगहों, यानी निकेतों, को भरती हैं।",
    },
  },
};

/** NCERT 8.1.1: niches, stability of populations, and why variation helps a species survive change (heat-resistant bacteria). */
export const whyVariationHelps = family({
  level: Level.Medium,
  tests: [Concept.ExactCopies],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
