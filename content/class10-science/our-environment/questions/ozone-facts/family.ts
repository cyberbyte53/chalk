import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["formula", "uv", "harm", "cfc", "ground", "unep"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  formula: {
    prompt: {
      en: "Ozone is made of how many oxygen atoms?",
      hi: "ओज़ोन में कितने ऑक्सीजन परमाणु होते हैं?",
    },
    right: { en: "Three", hi: "तीन" },
    wrong: [
      { en: "Two", hi: "दो" },
      { en: "Four", hi: "चार" },
    ],
    why: { en: "Ozone is O₃: three oxygen atoms.", hi: "ओज़ोन O₃ है: तीन ऑक्सीजन परमाणु।" },
  },
  uv: {
    prompt: { en: "What does the ozone layer protect us from?", hi: "ओज़ोन परत हमें किससे बचाती है?" },
    right: { en: "UV radiation", hi: "UV विकिरण" },
    wrong: [
      { en: "Acid rain", hi: "अम्ल वर्षा" },
      { en: "Heat at night", hi: "रात की गर्मी" },
    ],
    why: {
      en: "It shields the Earth from the Sun's ultraviolet radiation.",
      hi: "यह पृथ्वी को सूर्य के पराबैंगनी विकिरण से बचाती है।",
    },
  },
  harm: {
    prompt: {
      en: "What can UV radiation cause in human beings?",
      hi: "UV विकिरण मनुष्यों में क्या कर सकता है?",
    },
    right: { en: "Skin cancer", hi: "त्वचा कैंसर" },
    wrong: [
      { en: "Night blindness", hi: "रतौंधी" },
      { en: "Tooth decay", hi: "दाँतों का क्षय" },
    ],
    why: { en: "NCERT: UV is known to cause skin cancer.", hi: "NCERT: UV से त्वचा कैंसर होता है।" },
  },
  cfc: {
    prompt: {
      en: "Which chemicals were linked to the drop in ozone?",
      hi: "ओज़ोन घटने से कौन-से रसायन जुड़े थे?",
    },
    right: { en: "CFCs", hi: "CFC" },
    wrong: [
      { en: "Pesticides", hi: "कीटनाशक" },
      { en: "Detergents", hi: "अपमार्जक" },
    ],
    why: {
      en: "Chlorofluorocarbons (CFCs), used in fridges and fire extinguishers.",
      hi: "क्लोरोफ़्लोरोकार्बन (CFC), जो फ़्रिज और अग्निशामकों में इस्तेमाल होते थे।",
    },
  },
  ground: {
    prompt: { en: "At ground level, ozone is…", hi: "ज़मीन पर ओज़ोन…" },
    right: { en: "A deadly poison", hi: "घातक ज़हर है" },
    wrong: [
      { en: "Needed for breathing", hi: "साँस के लिए ज़रूरी है" },
      { en: "Harmless to all life", hi: "सभी जीवों के लिए हानिरहित है" },
    ],
    why: {
      en: "Ozone is a deadly poison; only high up does it do a useful job.",
      hi: "ओज़ोन घातक ज़हर है; केवल ऊपर यह उपयोगी काम करती है।",
    },
  },
  unep: {
    prompt: { en: "What did the 1987 UNEP agreement do?", hi: "1987 के UNEP समझौते ने क्या किया?" },
    right: { en: "Froze CFC production", hi: "CFC उत्पादन रोका" },
    wrong: [
      { en: "Banned all fridges", hi: "सारे फ़्रिज बंद किए" },
      { en: "Banned pesticides", hi: "कीटनाशक बंद किए" },
    ],
    why: {
      en: "It froze CFC production at 1986 levels; fridges must now be CFC-free.",
      hi: "इसने CFC उत्पादन 1986 के स्तर पर रोका; अब फ़्रिज CFC-मुक्त होने चाहिए।",
    },
  },
};

/** NCERT 15.2.1: ozone, UV, CFCs and the 1987 agreement. */
export const ozoneFacts = family({
  level: Level.Medium,
  tests: [Concept.OzoneLayer],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
