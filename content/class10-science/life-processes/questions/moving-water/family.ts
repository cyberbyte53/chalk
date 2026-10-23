import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = [
  "dayForce",
  "nightForce",
  "transpiration",
  "rootPressure",
  "bag",
  "cooling",
] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  dayForce: {
    prompt: {
      en: "What mainly moves water up the xylem during the day?",
      hi: "दिन में जाइलम में पानी को मुख्यतः कौन ऊपर ले जाता है?",
    },
    right: { en: "Transpiration pull", hi: "वाष्पोत्सर्जन खिंचाव" },
    wrong: [
      { en: "Root pressure", hi: "मूल दाब" },
      { en: "The plant's heart", hi: "पौधे का हृदय" },
    ],
    why: {
      en: "With stomata open by day, evaporation from leaves pulls water up.",
      hi: "दिन में रंध्र खुले होने पर पत्तियों से वाष्पन पानी को ऊपर खींचता है।",
    },
  },
  nightForce: {
    prompt: {
      en: "What matters most for moving water up at night?",
      hi: "रात में पानी ऊपर ले जाने के लिए सबसे अहम क्या है?",
    },
    right: { en: "Root pressure", hi: "मूल दाब" },
    wrong: [
      { en: "Transpiration pull", hi: "वाष्पोत्सर्जन खिंचाव" },
      { en: "Sunlight", hi: "सूर्य का प्रकाश" },
    ],
    why: {
      en: "At night the stomata are closed, so root pressure matters most.",
      hi: "रात में रंध्र बंद होते हैं, इसलिए मूल दाब सबसे अहम है।",
    },
  },
  transpiration: {
    prompt: { en: "What is transpiration?", hi: "वाष्पोत्सर्जन क्या है?" },
    right: {
      en: "Loss of water vapour from the plant's aerial parts",
      hi: "पौधे के वायवीय भागों से जलवाष्प की हानि",
    },
    wrong: [
      { en: "Water entering the roots from the soil", hi: "मिट्टी से जड़ों में आता पानी" },
      {
        en: "Food moving down from the leaves in the phloem",
        hi: "पत्तियों से फ्लोएम में नीचे जाता भोजन",
      },
    ],
    why: {
      en: "Transpiration is water lost as vapour, mainly through the stomata.",
      hi: "वाष्पोत्सर्जन मुख्यतः रंध्रों से वाष्प के रूप में पानी का निकलना है।",
    },
  },
  rootPressure: {
    prompt: {
      en: "Why does water move from the soil into the root?",
      hi: "पानी मिट्टी से जड़ में क्यों जाता है?",
    },
    right: {
      en: "Root cells take up ions, and water follows them",
      hi: "जड़ की कोशिकाएँ आयन लेती हैं, और पानी उनके पीछे आता है",
    },
    wrong: [
      { en: "The leaves push water down into the soil", hi: "पत्तियाँ पानी को नीचे मिट्टी में धकेलती हैं" },
      { en: "The phloem pumps it in using ATP energy", hi: "फ्लोएम ATP ऊर्जा से इसे भीतर पंप करता है" },
    ],
    why: {
      en: "Root cells take up ions actively; water then moves into the root, building root pressure.",
      hi: "जड़ की कोशिकाएँ सक्रिय रूप से आयन लेती हैं; फिर पानी जड़ में आकर मूल दाब बनाता है।",
    },
  },
  bag: {
    prompt: {
      en: "In Activity 6.8, why does only the plant's plastic cover mist over?",
      hi: "क्रियाकलाप 6.8 में केवल पौधे का प्लास्टिक कवर धुँधला क्यों होता है?",
    },
    right: {
      en: "The plant loses water vapour by transpiration",
      hi: "पौधा वाष्पोत्सर्जन से जलवाष्प खोता है",
    },
    wrong: [
      { en: "Water evaporates from the soil in the pot", hi: "गमले की मिट्टी से पानी वाष्पित होता है" },
      { en: "The stick absorbs water and gives it off again", hi: "डंडी पानी सोखकर फिर से छोड़ती है" },
    ],
    why: {
      en: "The soil was covered and the stick gave off nothing; the water came out of the plant's leaves.",
      hi: "मिट्टी ढकी थी और डंडी से कुछ नहीं निकला; पानी पौधे की पत्तियों से आया।",
    },
  },
  cooling: {
    prompt: {
      en: "Besides pulling water up, what else does transpiration help with?",
      hi: "पानी ऊपर खींचने के अलावा वाष्पोत्सर्जन और किसमें मदद करता है?",
    },
    right: { en: "Keeping the plant cool", hi: "पौधे को ठंडा रखना" },
    wrong: [
      { en: "Making starch in the leaves", hi: "पत्तियों में मंड बनाना" },
      { en: "Storing waste in the bark", hi: "छाल में अपशिष्ट संग्रह करना" },
    ],
    why: {
      en: "Transpiration also helps in temperature regulation.",
      hi: "वाष्पोत्सर्जन तापमान नियंत्रण में भी मदद करता है।",
    },
  },
};

/** NCERT 6.4.2: root pressure, transpiration and the transpiration pull. */
export const movingWater = family({
  level: Level.Medium,
  tests: [Concept.TransportInPlants],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
