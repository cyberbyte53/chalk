import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  drown: {
    prompt: t("What happens to the land behind a big dam?", "बड़े बाँध के पीछे की ज़मीन का क्या होता है?"),
    right: t("Farms, villages and forests are submerged", "खेत, गाँव और जंगल पानी में डूब जाते हैं"),
    wrong: [
      {
        label: t(
          "It becomes richer farmland for the farmers",
          "वह किसानों के लिए और उपजाऊ खेत बन जाती है",
        ),
        feedback: t("The land is drowned, not farmed.", "ज़मीन डूब जाती है, उस पर खेती नहीं होती।"),
      },
      {
        label: t("It dries up and turns into a sandy desert", "वह सूखकर रेतीला रेगिस्तान बन जाती है"),
        feedback: t(
          "Behind the dam the water rises, so the land floods.",
          "बाँध के पीछे पानी चढ़ता है, इसलिए ज़मीन डूबती है।",
        ),
      },
    ],
  },
  methane: {
    prompt: t(
      "Plants drowned under a dam rot without air. What do they give off?",
      "बाँध में डूबे पौधे बिना हवा के सड़ते हैं। वे क्या छोड़ते हैं?",
    ),
    right: t("Methane, a greenhouse gas", "मीथेन, एक ग्रीनहाउस गैस"),
    wrong: [
      {
        label: t("Oxygen, which cleans the air", "ऑक्सीजन, जो हवा साफ़ करती है"),
        feedback: t(
          "Rotting without air (anaerobic) gives methane.",
          "बिना हवा के सड़ने (अवायवीय) से मीथेन बनती है।",
        ),
      },
      {
        label: t("Pure water, which fills the lake", "शुद्ध पानी, जो झील भरता है"),
        feedback: t(
          "Rotting plants give methane, a greenhouse gas.",
          "सड़ते पौधे मीथेन देते हैं, एक ग्रीनहाउस गैस।",
        ),
      },
    ],
  },
  limit: {
    prompt: t(
      "What is a limitation of getting energy from dams? (Exercise 5)",
      "बाँधों से ऊर्जा पाने की एक सीमा क्या है? (अभ्यास 5)",
    ),
    right: t(
      "Dams can be built only in a few places, mostly in hilly areas",
      "बाँध केवल कुछ जगहों पर, ज़्यादातर पहाड़ी इलाक़ों में बन सकते हैं",
    ),
    wrong: [
      {
        label: t(
          "Dams work only at night, when the river water is at its coolest",
          "बाँध केवल रात में काम करते हैं, जब नदी का पानी सबसे ठंडा होता है",
        ),
        feedback: t(
          "Dams run day and night; the water's height is what matters.",
          "बाँध दिन-रात चलते हैं; पानी की ऊँचाई मायने रखती है।",
        ),
      },
      {
        label: t(
          "Dams give off thick black smoke from their turbines every day",
          "बाँधों की टरबाइनों से हर दिन घना काला धुआँ निकलता है",
        ),
        feedback: t(
          "Nothing burns in a hydro plant, so there's no smoke.",
          "जल विद्युत संयंत्र में कुछ नहीं जलता, इसलिए धुआँ नहीं।",
        ),
      },
    ],
  },
  people: {
    prompt: t(
      "Projects like Tehri and Sardar Sarovar faced protests mainly because…",
      "टिहरी और सरदार सरोवर जैसी परियोजनाओं का विरोध मुख्यतः इसलिए हुआ क्योंकि…",
    ),
    right: t(
      "many people lost their homes and land without fair rehabilitation",
      "बहुत लोगों के घर और ज़मीन गए और उचित पुनर्वास नहीं मिला",
    ),
    wrong: [
      {
        label: t(
          "the electricity they made was far too cheap for the companies to sell",
          "उनकी बनाई बिजली कंपनियों के बेचने के लिए बहुत सस्ती थी",
        ),
        feedback: t(
          "The protests were about displaced people and the environment.",
          "विरोध विस्थापित लोगों और पर्यावरण को लेकर था।",
        ),
      },
      {
        label: t(
          "the water behind the dams became too salty for the fish to live in",
          "बाँधों के पीछे का पानी मछलियों के लिए बहुत खारा हो गया",
        ),
        feedback: t(
          "River water stays fresh. People losing their land was the issue.",
          "नदी का पानी मीठा रहता है। मुद्दा लोगों की ज़मीन जाना था।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** The problems with big dams (NCERT 14.2.2; in-text Q3; Exercise 5). */
export const damProblems = family({
  level: Level.Easy,
  tests: [Concept.HydroPower],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
