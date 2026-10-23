import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["regulate", "filtrate", "urine", "dialysis", "plantLeaves", "resins"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  regulate: {
    prompt: {
      en: "What decides how much water the kidney tubes take back?",
      hi: "वृक्क नलियाँ कितना पानी वापस लें, यह किससे तय होता है?",
    },
    right: {
      en: "How much extra water and waste the body has",
      hi: "शरीर में कितना अतिरिक्त पानी और अपशिष्ट है",
    },
    wrong: [
      { en: "Only the time of day, more at night", hi: "केवल दिन का समय, रात में अधिक" },
      { en: "How fast the heart is beating at that time", hi: "उस समय हृदय कितनी तेज़ी से धड़क रहा है" },
    ],
    why: {
      en: "Re-absorption of water depends on the body's spare water and the waste to be excreted.",
      hi: "पानी का वापस सोखना शरीर के अतिरिक्त पानी और निकाले जाने वाले अपशिष्ट पर निर्भर है।",
    },
  },
  filtrate: {
    prompt: {
      en: "About how much filtrate do healthy kidneys make in a day?",
      hi: "स्वस्थ वृक्क एक दिन में लगभग कितना निस्यंद बनाते हैं?",
    },
    right: { en: "About 180 L", hi: "लगभग 180 L" },
    wrong: [
      { en: "About 2 L", hi: "लगभग 2 L" },
      { en: "About 18 L", hi: "लगभग 18 L" },
    ],
    why: {
      en: "About 180 L of filtrate is made daily, but only a litre or two leaves as urine.",
      hi: "रोज़ लगभग 180 L निस्यंद बनता है, पर केवल एक-दो लीटर मूत्र बनकर निकलता है।",
    },
  },
  urine: {
    prompt: {
      en: "About how much urine does a healthy adult pass in a day?",
      hi: "स्वस्थ वयस्क एक दिन में लगभग कितना मूत्र करता है?",
    },
    right: { en: "A litre or two", hi: "एक-दो लीटर" },
    wrong: [
      { en: "About 180 litres", hi: "लगभग 180 लीटर" },
      { en: "About 20 litres", hi: "लगभग 20 लीटर" },
    ],
    why: {
      en: "Most of the 180 L of filtrate is re-absorbed; only a litre or two is excreted.",
      hi: "180 L निस्यंद का ज़्यादातर भाग वापस सोखा जाता है; केवल एक-दो लीटर निकलता है।",
    },
  },
  dialysis: {
    prompt: {
      en: "How is an artificial kidney different from a real one?",
      hi: "कृत्रिम वृक्क असली वृक्क से कैसे अलग है?",
    },
    right: { en: "No re-absorption takes place in it", hi: "उसमें वापस सोखना नहीं होता" },
    wrong: [
      { en: "It doesn't remove nitrogen wastes", hi: "वह नाइट्रोजनी अपशिष्ट नहीं हटाता" },
      { en: "It makes much more urine", hi: "यह बहुत अधिक मूत्र बनाता है" },
    ],
    why: {
      en: "Dialysis removes wastes by diffusion, but nothing is taken back as in the kidney's tubes.",
      hi: "अपोहन विसरण से अपशिष्ट हटाता है, पर वृक्क नलियों की तरह कुछ वापस नहीं लिया जाता।",
    },
  },
  plantLeaves: {
    prompt: {
      en: "Which is a way plants get rid of waste?",
      hi: "पौधे अपशिष्ट से छुटकारा पाने का कौन-सा तरीक़ा अपनाते हैं?",
    },
    right: { en: "Storing it in leaves that fall off", hi: "उसे गिरने वाली पत्तियों में जमा करके" },
    wrong: [
      { en: "Through tiny kidneys in the roots", hi: "जड़ों में नन्हे वृक्कों से" },
      { en: "By sweating through the bark", hi: "छाल से पसीना बहाकर" },
    ],
    why: {
      en: "Plants store wastes in leaves that fall, in vacuoles, as resins and gums, or release them to the soil.",
      hi: "पौधे अपशिष्ट गिरने वाली पत्तियों, रिक्तिकाओं, रेज़िन और गोंद में रखते हैं, या मिट्टी में छोड़ते हैं।",
    },
  },
  resins: {
    prompt: {
      en: "Where are some plant wastes stored as resins and gums?",
      hi: "पौधों के कुछ अपशिष्ट रेज़िन और गोंद के रूप में कहाँ जमा होते हैं?",
    },
    right: { en: "In old xylem", hi: "पुराने जाइलम में" },
    wrong: [
      { en: "In the root hairs", hi: "मूल रोमों में" },
      { en: "In the guard cells", hi: "द्वार कोशिकाओं में" },
    ],
    why: {
      en: "Resins and gums are stored especially in old xylem.",
      hi: "रेज़िन और गोंद ख़ासकर पुराने जाइलम में जमा होते हैं।",
    },
  },
};

/** NCERT 6.5: regulating urine, dialysis and excretion in plants. */
export const urineAndWaste = family({
  level: Level.Medium,
  tests: [Concept.Excretion],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
