import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  land: {
    prompt: t(
      "A 1 MW wind farm needs about 2 hectares of land. About how much does a 5 MW farm need?",
      "1 MW के पवन फ़ार्म को लगभग 2 हेक्टेयर ज़मीन चाहिए। 5 MW के फ़ार्म को लगभग कितनी चाहिए?",
    ),
    right: t("10 hectares", "10 हेक्टेयर"),
    wrong: [
      {
        label: t("7 hectares", "7 हेक्टेयर"),
        feedback: t(
          "That adds 5 to 2. Land grows in proportion: 5 × 2 = 10 ha.",
          "यह 2 में 5 जोड़ना है। ज़मीन अनुपात में बढ़ती है: 5 × 2 = 10 ha।",
        ),
      },
      {
        label: t("2.5 hectares", "2.5 हेक्टेयर"),
        feedback: t(
          "That divides. Five times the power needs five times the land.",
          "यह भाग है। पाँच गुना शक्ति को पाँच गुना ज़मीन चाहिए।",
        ),
      },
    ],
  },
  farm: {
    prompt: t(
      "Why are many windmills joined together in a wind energy farm?",
      "पवन ऊर्जा फ़ार्म में कई पवनचक्कियाँ क्यों जोड़ी जाती हैं?",
    ),
    right: t(
      "One mill gives too little power; many add up",
      "एक चक्की बहुत कम शक्ति देती है; कई मिलकर बढ़ाती हैं",
    ),
    wrong: [
      {
        label: t(
          "Each windmill needs another to push it round",
          "हर पवनचक्की को घुमाने के लिए दूसरी चाहिए",
        ),
        feedback: t("Each mill is turned by the wind alone.", "हर चक्की केवल हवा से घूमती है।"),
      },
      {
        label: t("Many mills together make the wind blow faster", "कई चक्कियाँ मिलकर हवा तेज़ चलाती हैं"),
        feedback: t(
          "Mills take energy from the wind; they can't speed it up.",
          "चक्कियाँ हवा से ऊर्जा लेती हैं; उसे तेज़ नहीं कर सकतीं।",
        ),
      },
    ],
  },
  denmark: {
    prompt: t(
      "Which country is called the country of winds, with over 25% of its electricity from windmills?",
      "किस देश को पवनों का देश कहते हैं, जिसकी 25% से अधिक बिजली पवनचक्कियों से आती है?",
    ),
    right: t("Denmark", "डेनमार्क"),
    wrong: [
      {
        label: t("Germany", "जर्मनी"),
        feedback: t(
          'Germany is a leader in wind power, but Denmark is the "country of winds".',
          'जर्मनी पवन शक्ति में अग्रणी है, पर "पवनों का देश" डेनमार्क है।',
        ),
      },
      {
        label: t("Nepal", "नेपाल"),
        feedback: t("Denmark is the one NCERT names.", "NCERT डेनमार्क का नाम लेती है।"),
      },
    ],
  },
  tower: {
    prompt: t(
      "Why is the rotor of a wind generator put on a tower about 20 m high?",
      "पवन जनित्र का रोटर लगभग 20 m ऊँचे टावर पर क्यों लगाया जाता है?",
    ),
    right: t(
      "Wind is stronger and steadier high above the ground",
      "ज़मीन से ऊँचाई पर हवा तेज़ और स्थिर होती है",
    ),
    wrong: [
      {
        label: t(
          "So that birds can't reach the blades and stop them",
          "ताकि पक्षी पंखुड़ियों तक पहुँचकर उन्हें न रोकें",
        ),
        feedback: t(
          "Height is chosen for better wind, not for birds.",
          "ऊँचाई बेहतर हवा के लिए है, पक्षियों के लिए नहीं।",
        ),
      },
      {
        label: t(
          "So that the blades stay cool in the summer sunshine",
          "ताकि गर्मी की धूप में पंखुड़ियाँ ठंडी रहें",
        ),
        feedback: t(
          "Temperature doesn't matter here; wind speed does.",
          "यहाँ ताप मायने नहीं रखता; हवा की चाल रखती है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Wind farms in numbers (NCERT 14.2.4). */
export const windFarmNumbers = family({
  level: Level.Easy,
  tests: [Concept.WindEnergy],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
