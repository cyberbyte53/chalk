import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  two: {
    prompt: t("Which two are renewable sources of energy?", "कौन-से दो ऊर्जा के नवीकरणीय स्रोत हैं?"),
    right: t("Wind and biogas", "पवन और बायोगैस"),
    wrong: [
      {
        label: t("Coal and natural gas", "कोयला और प्राकृतिक गैस"),
        feedback: t("Both are fossil fuels: they will run out.", "दोनों जीवाश्म ईंधन हैं: वे ख़त्म होंगे।"),
      },
      {
        label: t("Petroleum and uranium", "पेट्रोलियम और यूरेनियम"),
        feedback: t("Both are limited, so they're exhaustible.", "दोनों सीमित हैं, इसलिए समाप्य हैं।"),
      },
    ],
  },
  exhaust: {
    prompt: t("Which two are exhaustible sources of energy?", "कौन-से दो ऊर्जा के समाप्य स्रोत हैं?"),
    right: t("Coal and petroleum", "कोयला और पेट्रोलियम"),
    wrong: [
      {
        label: t("Sunlight and tides", "धूप और ज्वार"),
        feedback: t("These keep coming; they're renewable.", "ये आते रहते हैं; ये नवीकरणीय हैं।"),
      },
      {
        label: t("Wood and biogas", "लकड़ी और बायोगैस"),
        feedback: t(
          "These can be regenerated if we replant and keep cattle.",
          "पेड़ लगाने और पशु रखने पर ये फिर बनते हैं।",
        ),
      },
    ],
  },
  criteria: {
    prompt: t(
      "What decides our choice of an energy source? (Exercise 10)",
      "हम ऊर्जा स्रोत किस आधार पर चुनते हैं? (अभ्यास 10)",
    ),
    right: t(
      "Cost and ease of getting it, efficiency, and environmental harm",
      "पाने की लागत और सुविधा, दक्षता, और पर्यावरण को हानि",
    ),
    wrong: [
      {
        label: t(
          "Only the colour of its flame and how loud the machines are to hear",
          "केवल उसकी लौ का रंग और मशीनें सुनने में कितनी तेज़ हैं",
        ),
        feedback: t(
          "These don't matter. Cost, efficiency and environmental harm do.",
          "ये मायने नहीं रखते। लागत, दक्षता और पर्यावरणीय हानि रखते हैं।",
        ),
      },
      {
        label: t(
          "Only how old the technology is, since older means more reliable",
          "केवल तकनीक कितनी पुरानी है, क्योंकि पुरानी अधिक भरोसेमंद है",
        ),
        feedback: t(
          "Age isn't the test; cost, efficiency and environmental harm are.",
          "उम्र कसौटी नहीं; लागत, दक्षता और पर्यावरणीय हानि हैं।",
        ),
      },
    ],
  },
  cleaner: {
    prompt: t(
      'Why do we say CNG is a "cleaner" fuel rather than a "clean" one?',
      'हम सीएनजी को "साफ़" की बजाय "ज़्यादा साफ़" ईंधन क्यों कहते हैं?',
    ),
    right: t(
      "It pollutes less than petrol, but still gives CO₂",
      "यह पेट्रोल से कम प्रदूषण करती है, पर CO₂ फिर भी छोड़ती है",
    ),
    wrong: [
      {
        label: t(
          "It releases no gases at all, only pure water vapour",
          "यह कोई गैस नहीं छोड़ती, केवल शुद्ध जलवाष्प",
        ),
        feedback: t(
          "CNG is mostly methane, so burning it gives CO₂ too.",
          "सीएनजी ज़्यादातर मीथेन है, इसलिए जलने पर CO₂ भी बनती है।",
        ),
      },
      {
        label: t(
          "It pollutes more than petrol, but is cheaper to buy",
          "यह पेट्रोल से ज़्यादा प्रदूषण करती है, पर सस्ती है",
        ),
        feedback: t(
          "CNG pollutes less than petrol; that's why it's called cleaner.",
          "सीएनजी पेट्रोल से कम प्रदूषण करती है; इसीलिए उसे ज़्यादा साफ़ कहते हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Renewable and exhaustible sources, and the environment (NCERT 14.4, 14.5; Exercises 7 and 10). */
export const renewableOrNot = family({
  level: Level.Easy,
  tests: [Concept.EnvironmentAndHowLong],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
