import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Item = {
  MilkSours: "milkSours",
  IronRusts: "ironRusts",
  GrapesFerment: "grapesFerment",
  FoodCooks: "foodCooks",
  CandleBurns: "candleBurns",
  IceMelts: "iceMelts",
  SaltDissolves: "saltDissolves",
  WaterBoils: "waterBoils",
  GlassBreaks: "glassBreaks",
} as const;
type Item = (typeof Item)[keyof typeof Item];

const items: Record<
  Item,
  { en: string; hi: string; isChemical: boolean; why: { en: string; hi: string } }
> = {
  milkSours: {
    en: "Milk left at room temperature in summer turns sour.",
    hi: "गर्मियों में कमरे के ताप पर रखा दूध खट्टा हो जाता है।",
    isChemical: true,
    why: {
      en: "Sour milk tastes and smells different: a new substance has formed.",
      hi: "खट्टे दूध का स्वाद और गंध अलग है: नया पदार्थ बना है।",
    },
  },
  ironRusts: {
    en: "An iron nail left in humid air gets a reddish-brown coating.",
    hi: "नम हवा में छोड़ी लोहे की कील पर लाल-भूरी परत चढ़ जाती है।",
    isChemical: true,
    why: {
      en: "Rust is a new substance, made from the iron itself.",
      hi: "ज़ंग एक नया पदार्थ है, जो ख़ुद लोहे से बना है।",
    },
  },
  grapesFerment: {
    en: "Grapes left for some days ferment and froth.",
    hi: "कुछ दिन रखे अंगूर किण्वित होकर झाग देते हैं।",
    isChemical: true,
    why: {
      en: "A gas is given off and new substances with a new smell form.",
      hi: "गैस निकलती है और नई गंध वाले नए पदार्थ बनते हैं।",
    },
  },
  foodCooks: {
    en: "A potato is cooked.",
    hi: "आलू पकाया जाता है।",
    isChemical: true,
    why: {
      en: "Cooked potato can't be turned back into raw potato: new substances have formed.",
      hi: "पका आलू वापस कच्चा नहीं बन सकता: नए पदार्थ बने हैं।",
    },
  },
  candleBurns: {
    en: "A candle's wax burns in the flame.",
    hi: "मोमबत्ती का मोम लौ में जलता है।",
    isChemical: true,
    why: {
      en: "Burning wax gives carbon dioxide and water: new substances, with heat and light.",
      hi: "जलता मोम कार्बन डाइऑक्साइड और पानी देता है: नए पदार्थ, ऊष्मा और प्रकाश के साथ।",
    },
  },
  iceMelts: {
    en: "Ice cream melts on a hot day.",
    hi: "गर्म दिन में आइसक्रीम पिघल जाती है।",
    isChemical: false,
    why: {
      en: "Melting changes only the state. Freeze it again and it's a solid again.",
      hi: "पिघलने से केवल अवस्था बदलती है। फिर जमाओ तो फिर ठोस।",
    },
  },
  saltDissolves: {
    en: "Salt dissolves in water.",
    hi: "नमक पानी में घुल जाता है।",
    isChemical: false,
    why: {
      en: "Dry the water away and the same salt is left behind.",
      hi: "पानी सुखा दो तो वही नमक बच जाता है।",
    },
  },
  waterBoils: {
    en: "Water boils into steam.",
    hi: "पानी उबलकर भाप बन जाता है।",
    isChemical: false,
    why: {
      en: "Steam is still water: only its state has changed.",
      hi: "भाप अब भी पानी है: केवल अवस्था बदली है।",
    },
  },
  glassBreaks: {
    en: "A glass tumbler breaks into pieces.",
    hi: "काँच का गिलास टुकड़ों में टूट जाता है।",
    isChemical: false,
    why: {
      en: "The pieces are still glass: only the shape has changed.",
      hi: "टुकड़े अब भी काँच हैं: केवल आकार बदला है।",
    },
  },
};

/** Is an everyday change a chemical reaction (new substances) or only a physical change? */
export const chemicalOrPhysical = family({
  level: Level.Easy,
  tests: [Concept.WhatIsAReaction],
  params: z.object({ item: z.nativeEnum(Item) }).strict(),
  build: ({ item }, b) => {
    const it = items[item];
    const chemical: Option = {
      id: "chemical",
      label: t("A chemical change: a new substance forms", "रासायनिक परिवर्तन: नया पदार्थ बनता है"),
    };
    const physical: Option = {
      id: "physical",
      label: t("A physical change: still the same substance", "भौतिक परिवर्तन: वही पदार्थ"),
    };
    if (it.isChemical) physical.feedback = it.why;
    else chemical.feedback = it.why;
    const ask = choiceQuestion(b, {
      prompt: t(`${it.en} What kind of change is this?`, `${it.hi} यह किस तरह का परिवर्तन है?`),
      options: settle([chemical, physical], item.length),
      answer: it.isChemical ? "chemical" : "physical",
    });
    return column([ask, space()]);
  },
});
