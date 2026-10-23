import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Item = {
  QuickLime: "quickLime",
  Respiration: "respiration",
  NaturalGas: "naturalGas",
  Compost: "compost",
  Limestone: "limestone",
  Electrolysis: "electrolysis",
  SilverChloride: "silverChloride",
  ColdTube: "coldTube",
} as const;
type Item = (typeof Item)[keyof typeof Item];

const items: Record<Item, { en: string; hi: string; isExo: boolean }> = {
  quickLime: {
    en: "Quick lime reacting with water",
    hi: "बिना बुझे चूने की पानी से अभिक्रिया",
    isExo: true,
  },
  respiration: {
    en: "Respiration: glucose combining with oxygen in our cells",
    hi: "श्वसन: हमारी कोशिकाओं में ग्लूकोज़ का ऑक्सीजन से मिलना",
    isExo: true,
  },
  naturalGas: {
    en: "Natural gas burning on a stove",
    hi: "चूल्हे पर प्राकृतिक गैस का जलना",
    isExo: true,
  },
  compost: {
    en: "Vegetable waste decomposing into compost",
    hi: "सब्ज़ियों के कचरे का सड़कर खाद बनना",
    isExo: true,
  },
  limestone: {
    en: "Limestone breaking down into quick lime when heated",
    hi: "गर्म करने पर चूना-पत्थर का बिना बुझे चूने में टूटना",
    isExo: false,
  },
  electrolysis: {
    en: "Water being split by electricity",
    hi: "बिजली से पानी का टूटना",
    isExo: false,
  },
  silverChloride: {
    en: "Silver chloride turning grey in sunlight",
    hi: "धूप में सिल्वर क्लोराइड का स्लेटी होना",
    isExo: false,
  },
  coldTube: {
    en: "Barium hydroxide mixed with ammonium chloride, making the test tube cold",
    hi: "बेरियम हाइड्रॉक्साइड में अमोनियम क्लोराइड मिलाना, जिससे परखनली ठंडी हो जाती है",
    isExo: false,
  },
};

/** Exothermic (heat given out) or endothermic (energy taken in)? */
export const heatInOrOut = family({
  level: Level.Easy,
  tests: [Concept.CombinationReactions, Concept.DecompositionReactions],
  params: z.object({ item: z.nativeEnum(Item) }).strict(),
  build: ({ item }, b) => {
    const it = items[item];
    const exo: Option = {
      id: "exo",
      label: t("Exothermic: heat is given out", "ऊष्माक्षेपी: ऊष्मा निकलती है"),
    };
    const endo: Option = {
      id: "endo",
      label: t("Endothermic: energy is taken in", "ऊष्माशोषी: ऊर्जा ली जाती है"),
    };
    if (it.isExo)
      endo.feedback = t(
        "This reaction warms its surroundings or gives energy: it gives heat out.",
        "यह अभिक्रिया आसपास को गर्म करती है या ऊर्जा देती है: ऊष्मा बाहर देती है।",
      );
    else
      exo.feedback = t(
        "This reaction only goes while energy (heat, light, electricity) is put in, or it draws heat from around it.",
        "यह अभिक्रिया तभी चलती है जब ऊर्जा (ऊष्मा, प्रकाश, विद्युत) दी जाए, या यह आसपास से ऊष्मा खींचती है।",
      );
    const ask = choiceQuestion(b, {
      prompt: t(`${it.en}: exothermic or endothermic?`, `${it.hi}: ऊष्माक्षेपी या ऊष्माशोषी?`),
      options: settle([exo, endo], item.length),
      answer: it.isExo ? "exo" : "endo",
    });
    return column([ask, space()]);
  },
});
