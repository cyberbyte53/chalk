import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["ground", "watershed", "hills", "khadin", "local"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  ground: {
    prompt: {
      en: "Why is storing water underground better than in open ponds?",
      hi: "पानी को खुले तालाब के बजाय ज़मीन के नीचे रखना बेहतर क्यों है?",
    },
    right: {
      en: "It doesn't evaporate or breed mosquitoes",
      hi: "वह न भाप बनता है, न उसमें मच्छर पनपते हैं",
    },
    wrong: [
      {
        en: "It stays a lot colder than water kept in ponds",
        hi: "वह तालाब के पानी से कहीं ज़्यादा ठंडा रहता है",
      },
      { en: "It is saltier, so it keeps for longer", hi: "वह ज़्यादा खारा है, इसलिए ज़्यादा टिकता है" },
    ],
    why: {
      en: "Groundwater doesn't evaporate, recharges wells, and gives mosquitoes no breeding ground.",
      hi: "भूजल भाप नहीं बनता, कुओं को भरता है, और मच्छरों को पनपने की जगह नहीं देता।",
    },
  },
  watershed: {
    prompt: { en: "Watershed management aims to…", hi: "जलसंभर प्रबंधन का लक्ष्य है…" },
    right: { en: "Conserve soil and water to raise yields", hi: "मिट्टी और पानी बचाकर उपज बढ़ाना" },
    wrong: [
      { en: "Build one huge dam to serve the whole state", hi: "पूरे राज्य के लिए एक विशाल बाँध बनाना" },
      {
        en: "Drain the land quickly after every rain",
        hi: "हर बारिश के बाद ज़मीन से पानी जल्दी निकालना",
      },
    ],
    why: {
      en: "It conserves soil and water scientifically to increase biomass production.",
      hi: "यह वैज्ञानिक ढंग से मिट्टी और पानी बचाकर जैव-भार उत्पादन बढ़ाता है।",
    },
  },
  hills: {
    prompt: {
      en: "In-text question 2: in hilly areas, water is best harvested by…",
      hi: "पाठ्य प्रश्न 2: पहाड़ी इलाक़ों में पानी का संचयन सबसे अच्छा कैसे होता है?",
    },
    right: {
      en: "Channels leading stream water down slopes",
      hi: "नालियाँ जो झरने का पानी ढलान से नीचे ले जाएँ",
    },
    wrong: [
      {
        en: "Wide khadins dug across flat, sandy desert plains",
        hi: "सपाट, रेतीले मैदानों में बने चौड़े खडीन",
      },
      { en: "Pumping deep groundwater up the hills", hi: "गहरा भूजल पंप से पहाड़ पर चढ़ाना" },
    ],
    why: {
      en: "On slopes, channels like kulhs carry stream water to fields down the hillside.",
      hi: "ढलानों पर कुल्ह जैसी नालियाँ झरने का पानी नीचे के खेतों तक ले जाती हैं।",
    },
  },
  khadin: {
    prompt: {
      en: "In a khadin, the rain's runoff collects in…",
      hi: "खडीन में बारिश का बहता पानी कहाँ जमा होता है?",
    },
    right: { en: "A field behind an earthen bund", hi: "मिट्टी के बाँध के पीछे के खेत में" },
    wrong: [
      { en: "A covered tank on the rooftop", hi: "छत पर ढके टैंक में" },
      { en: "A deep well dug at the hilltop", hi: "पहाड़ी की चोटी पर खुदे गहरे कुएँ में" },
    ],
    why: {
      en: "Runoff from the catchment collects behind a bund, soaking the khadin bed for crops.",
      hi: "जलग्रहण क्षेत्र का पानी बाँध के पीछे जमा होकर खडीन की ज़मीन को फ़सल के लिए भिगोता है।",
    },
  },
  local: {
    prompt: {
      en: "In-text question 1: traditional water systems often work well because…",
      hi: "पाठ्य प्रश्न 1: पारंपरिक जल प्रणालियाँ अक्सर अच्छी क्यों चलती हैं?",
    },
    right: {
      en: "Local people control and maintain them",
      hi: "स्थानीय लोग उन्हें नियंत्रित करते और सँभालते हैं",
    },
    wrong: [
      {
        en: "They need very costly machines to run them",
        hi: "उन्हें चलाने के लिए बहुत महँगी मशीनें चाहिए",
      },
      { en: "Only the government is allowed to use them", hi: "केवल सरकार उनका उपयोग कर सकती है" },
    ],
    why: {
      en: "They are local, so people manage them and keep control of their water.",
      hi: "वे स्थानीय हैं, इसलिए लोग उन्हें सँभालते हैं और पानी पर उनका नियंत्रण रहता है।",
    },
  },
};

/** NCERT 16.3.2 and in-text questions 1 and 2: watersheds, khadins and groundwater. */
export const groundwaterAndWatershed = family({
  level: Level.Medium,
  tests: [Concept.WaterHarvesting],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
