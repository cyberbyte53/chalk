import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["blueprint", "proteins", "apparatus", "notIdentical", "drastic"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  blueprint: {
    prompt: { en: "What is the basic event in reproduction?", hi: "जनन की बुनियादी घटना क्या है?" },
    right: { en: "Making a copy of the DNA", hi: "DNA की प्रतिकृति बनाना" },
    wrong: [
      { en: "Taking in food", hi: "भोजन लेना" },
      { en: "Releasing energy from glucose", hi: "ग्लूकोज़ से ऊर्जा निकालना" },
      { en: "Removing wastes", hi: "अपशिष्ट निकालना" },
    ],
    why: {
      en: "Reproduction passes on the blueprint of body design, which is DNA; so its basic event is DNA copying.",
      hi: "जनन शारीरिक संरचना का ख़ाका, यानी DNA, आगे देता है; इसलिए इसकी बुनियादी घटना DNA प्रतिकृति है।",
    },
  },
  proteins: {
    prompt: {
      en: "DNA in the nucleus is the information source for making what?",
      hi: "केंद्रक का DNA किसे बनाने की सूचना का स्रोत है?",
    },
    right: { en: "Proteins", hi: "प्रोटीन" },
    wrong: [
      { en: "Starch", hi: "मंड" },
      { en: "Water", hi: "पानी" },
      { en: "Oxygen", hi: "ऑक्सीजन" },
    ],
    why: {
      en: "DNA carries the information for making proteins; changed information means different proteins and, in the end, a changed body design.",
      hi: "DNA प्रोटीन बनाने की सूचना रखता है; सूचना बदली तो प्रोटीन बदलते हैं और अंततः शारीरिक संरचना।",
    },
  },
  apparatus: {
    prompt: {
      en: "Along with copying its DNA, what else must a reproducing cell create?",
      hi: "अपने DNA की प्रति के साथ जनन करती कोशिका को और क्या बनाना होता है?",
    },
    right: { en: "Additional cellular apparatus", hi: "अतिरिक्त कोशिकीय उपकरण" },
    wrong: [
      { en: "A second nucleus only, with no other parts", hi: "केवल दूसरा केंद्रक, बिना किसी और भाग के" },
      { en: "New chromosomes from food", hi: "भोजन से नए गुणसूत्र" },
      { en: "A cell wall of sugar", hi: "शर्करा की कोशिका भित्ति" },
    ],
    why: {
      en: "A bare DNA copy pushed out would have no organised cell to keep life processes going, so the cell also builds extra apparatus, then divides.",
      hi: "बाहर धकेली गई अकेली DNA प्रति के पास जैव प्रक्रम चलाने को कोई कोशिका नहीं होती, इसलिए कोशिका अतिरिक्त उपकरण भी बनाती है, फिर बँटती है।",
    },
  },
  notIdentical: {
    prompt: {
      en: "Why are the two cells formed by division similar but not absolutely identical?",
      hi: "विभाजन से बनी दोनों कोशिकाएँ मिलती-जुलती पर बिल्कुल एक जैसी क्यों नहीं होतीं?",
    },
    right: {
      en: "No copying reaction is absolutely reliable",
      hi: "कोई भी प्रतिलिपि अभिक्रिया पूरी तरह विश्वसनीय नहीं होती",
    },
    wrong: [
      {
        en: "Each one gets a different share of the parent's food",
        hi: "हर एक को जनक के भोजन का अलग हिस्सा मिलता है",
      },
      { en: "One of them always gets the older DNA", hi: "एक को हमेशा पुराना DNA मिलता है" },
    ],
    why: {
      en: "Copying reactions make small variations each time, so DNA copies are similar but may not be identical.",
      hi: "नक़ल की अभिक्रियाएँ हर बार छोटी विभिन्नताएँ बनाती हैं, इसलिए DNA प्रतियाँ मिलती-जुलती होती हैं पर हूबहू नहीं।",
    },
  },
  drastic: {
    prompt: {
      en: "A new cell gets a drastic change in its DNA copy. What usually happens?",
      hi: "एक नई कोशिका की DNA प्रति में भारी बदलाव आता है। आमतौर पर क्या होता है?",
    },
    right: {
      en: "It can't work with the cell and dies",
      hi: "यह कोशिका के साथ काम नहीं कर पाती और मर जाती है",
    },
    wrong: [
      {
        en: "It becomes a new species at once, in one step",
        hi: "यह एक ही चरण में तुरंत नई जाति बन जाती है",
      },
      { en: "Nothing at all changes", hi: "कुछ भी नहीं बदलता" },
    ],
    why: {
      en: "Some variations are so drastic that the new DNA can't work with the apparatus it inherits; such a cell simply dies.",
      hi: "कुछ विभिन्नताएँ इतनी भारी होती हैं कि नया DNA विरासत में मिले उपकरण के साथ काम नहीं कर पाता; ऐसी कोशिका मर जाती है।",
    },
  },
};

/** NCERT 8.1: what reproduction copies (DNA, the blueprint for proteins and body design), and why copies are similar but not identical. */
export const dnaAndCopies = family({
  level: Level.Easy,
  tests: [Concept.ExactCopies],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
