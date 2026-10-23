import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  change: {
    prompt: t("A hydro power plant changes…", "जल विद्युत संयंत्र बदलता है…"),
    right: t(
      "the potential energy of high water into electricity",
      "ऊँचाई पर रखे पानी की स्थितिज ऊर्जा को बिजली में",
    ),
    wrong: [
      {
        label: t(
          "the heat of warm river water into electrical energy",
          "गर्म नदी के पानी की ऊष्मा को विद्युत ऊर्जा में",
        ),
        feedback: t(
          "It's the height of the water, not its temperature, that matters.",
          "पानी की ऊँचाई मायने रखती है, उसका ताप नहीं।",
        ),
      },
      {
        label: t(
          "the chemical energy in the water into steam power",
          "पानी की रासायनिक ऊर्जा को भाप की शक्ति में",
        ),
        feedback: t(
          "No burning or steam: falling water turns the turbine directly.",
          "न जलना, न भाप: गिरता पानी सीधे टरबाइन घुमाता है।",
        ),
      },
    ],
  },
  dam: {
    prompt: t(
      "Why is a high dam built across a river for hydro power?",
      "जल विद्युत के लिए नदी पर ऊँचा बाँध क्यों बनाया जाता है?",
    ),
    right: t(
      "To store water high up so that it falls hard onto the turbines",
      "पानी ऊँचाई पर जमा करने के लिए ताकि वह ज़ोर से टरबाइनों पर गिरे",
    ),
    wrong: [
      {
        label: t(
          "To heat the water in the reservoir so it rises up as steam",
          "जलाशय का पानी गर्म करने के लिए ताकि वह भाप बनकर उठे",
        ),
        feedback: t(
          "A dam stores water high up; nothing is heated.",
          "बाँध पानी को ऊँचाई पर जमा करता है; कुछ गर्म नहीं होता।",
        ),
      },
      {
        label: t(
          "To stop the river from flowing so that it never reaches the sea",
          "नदी का बहना रोकने के लिए ताकि वह कभी समुद्र तक न पहुँचे",
        ),
        feedback: t(
          "Water still flows on through the turbines.",
          "पानी टरबाइनों से होकर आगे बहता रहता है।",
        ),
      },
    ],
  },
  renew: {
    prompt: t("Why is hydro power called renewable?", "जल विद्युत को नवीकरणीय क्यों कहते हैं?"),
    right: t("Rain refills the reservoir after use", "उपयोग के बाद बारिश जलाशय फिर भर देती है"),
    wrong: [
      {
        label: t(
          "The same water is pumped back up for free",
          "वही पानी मुफ़्त में फिर ऊपर पंप हो जाता है",
        ),
        feedback: t(
          "Pumping needs energy. It's the rain, driven by the Sun, that refills it.",
          "पंप करने में ऊर्जा लगती है। सूर्य से चलने वाली बारिश उसे भरती है।",
        ),
      },
      {
        label: t(
          "Dams last forever and never need any repair",
          "बाँध हमेशा चलते हैं और कभी मरम्मत नहीं माँगते",
        ),
        feedback: t(
          "Renewable is about the source being refilled, not the dam.",
          "नवीकरणीय का अर्थ स्रोत का फिर भरना है, बाँध नहीं।",
        ),
      },
    ],
  },
  share: {
    prompt: t(
      "About what share of India's energy needs does hydro power meet?",
      "भारत की ऊर्जा ज़रूरतों का लगभग कितना भाग जल विद्युत पूरा करती है?",
    ),
    right: t("A quarter", "एक चौथाई"),
    wrong: [
      {
        label: t("Nine tenths", "नौ दहाई"),
        feedback: t(
          "Most of India's electricity comes from thermal plants.",
          "भारत की ज़्यादातर बिजली तापीय संयंत्रों से आती है।",
        ),
      },
      {
        label: t("All of it", "पूरा"),
        feedback: t(
          "Hydro meets about a quarter of India's energy needs.",
          "जल विद्युत भारत की ऊर्जा ज़रूरतों का लगभग चौथाई पूरा करती है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** How a hydro power plant works (NCERT 14.2.2). */
export const hydroFacts = family({
  level: Level.Easy,
  tests: [Concept.HydroPower],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
