import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  ironMercury: {
    prompt: t(
      "Iron: 10.0 × 10⁻⁸ Ω m. Mercury: 94.0 × 10⁻⁸ Ω m. Which is the better conductor?",
      "लोहा: 10.0 × 10⁻⁸ Ω m। पारा: 94.0 × 10⁻⁸ Ω m। बेहतर चालक कौन है?",
    ),
    right: t("Iron", "लोहा"),
    wrong: [
      {
        label: t("Mercury", "पारा"),
        feedback: t(
          "The better conductor has the smaller resistivity.",
          "बेहतर चालक की प्रतिरोधकता कम होती है।",
        ),
      },
    ],
  },
  best: {
    prompt: t(
      "From NCERT Table 12.2, which material is the best conductor?",
      "NCERT तालिका 12.2 से, सबसे अच्छा चालक कौन है?",
    ),
    right: t("Silver", "चाँदी"),
    wrong: [
      {
        label: t("Copper", "ताँबा"),
        feedback: t(
          "Copper is close (1.62 × 10⁻⁸), but silver's 1.60 × 10⁻⁸ is lower.",
          "ताँबा क़रीब है (1.62 × 10⁻⁸), पर चाँदी का 1.60 × 10⁻⁸ कम है।",
        ),
      },
      {
        label: t("Nichrome", "नाइक्रोम"),
        feedback: t(
          "Nichrome has the highest resistivity of the conductors listed.",
          "सूची के चालकों में नाइक्रोम की प्रतिरोधकता सबसे ज़्यादा है।",
        ),
      },
    ],
  },
  alloy: {
    prompt: t(
      "Why are the heating coils of toasters and irons made of an alloy rather than a pure metal?",
      "टोस्टर और इस्त्री की तापन कुंडलियाँ शुद्ध धातु की जगह मिश्रातु की क्यों होती हैं?",
    ),
    right: t(
      "Alloys have higher resistivity and don't oxidise readily at high temperature",
      "मिश्रातुओं की प्रतिरोधकता ज़्यादा होती है और वे ऊँचे ताप पर आसानी से ऑक्सीकृत नहीं होतीं",
    ),
    wrong: [
      {
        label: t("Alloys are better conductors", "मिश्रातु बेहतर चालक हैं"),
        feedback: t(
          "It's the opposite: alloys resist more, so they heat up more.",
          "उलटा है: मिश्रातु ज़्यादा रोकती हैं, इसलिए ज़्यादा गर्म होती हैं।",
        ),
      },
    ],
  },
  lines: {
    prompt: t(
      "Why are copper and aluminium wires usually used for electricity transmission?",
      "बिजली के संचरण के लिए आम तौर पर ताँबे और ऐलुमिनियम के तार क्यों लगते हैं?",
    ),
    right: t(
      "They have very low resistivity, so little energy is lost in the lines",
      "उनकी प्रतिरोधकता बहुत कम है, इसलिए लाइनों में कम ऊर्जा बर्बाद होती है",
    ),
    wrong: [
      {
        label: t("They have a high melting point", "उनका गलनांक ऊँचा है"),
        feedback: t(
          "That's why tungsten is used for filaments. Lines need low resistivity.",
          "इसीलिए तंतु के लिए टंगस्टन लगता है। लाइनों को कम प्रतिरोधकता चाहिए।",
        ),
      },
    ],
  },
  thick: {
    prompt: t(
      "Will current flow more easily through a thick wire or a thin wire of the same material, on the same source?",
      "एक ही पदार्थ के मोटे या पतले तार में, एक ही स्रोत पर, धारा आसानी से कहाँ बहेगी?",
    ),
    right: t(
      "The thick wire: a larger area means less resistance",
      "मोटे तार में: बड़ा क्षेत्रफल यानी कम प्रतिरोध",
    ),
    wrong: [
      {
        label: t("The thin wire", "पतले तार में"),
        feedback: t("R = ρl/A: bigger A, smaller R.", "R = ρl/A: बड़ा A, छोटा R।"),
      },
    ],
  },
  factors: {
    prompt: t(
      "On what factors does the resistance of a conductor depend?",
      "चालक का प्रतिरोध किन बातों पर निर्भर है?",
    ),
    right: t(
      "Its length, its area of cross-section and its material",
      "उसकी लंबाई, अनुप्रस्थ काट का क्षेत्रफल और उसका पदार्थ",
    ),
    wrong: [
      {
        label: t("The current through it", "उसमें बहने वाली धारा"),
        feedback: t(
          "The current depends on the resistance, not the other way round (at a fixed temperature).",
          "धारा प्रतिरोध पर निर्भर है, उलटा नहीं (स्थिर ताप पर)।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Resistivity and choosing materials (NCERT 12.5 in-text Q1, 2, 4, 5; Exercise 18). */
export const resistivityChoice = family({
  level: Level.Easy,
  tests: [Concept.ResistanceFactors],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
