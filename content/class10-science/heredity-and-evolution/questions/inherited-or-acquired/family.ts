import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  Earlobe: "earlobe",
  Scar: "scar",
  EyeColour: "eyeColour",
  Muscles: "muscles",
  FlowerColour: "flowerColour",
  TailCut: "tailCut",
  StarvedBeetle: "starvedBeetle",
  Language: "language",
} as const;
type Case = (typeof Case)[keyof typeof Case];

const cases: Record<
  Case,
  { en: string; hi: string; inherited: boolean; why: { en: string; hi: string } }
> = {
  earlobe: {
    en: "free or attached ear lobes",
    hi: "स्वतंत्र या जुड़ी कान की लौ",
    inherited: true,
    why: {
      en: "Ear-lobe shape comes from the parents' DNA.",
      hi: "कान की लौ का आकार माता-पिता के DNA से आता है।",
    },
  },
  scar: {
    en: "a scar from a cut on the knee",
    hi: "घुटने पर कटने का निशान",
    inherited: false,
    why: {
      en: "A scar comes from an injury during life; it doesn't change the DNA of the germ cells.",
      hi: "निशान जीवन में लगी चोट से आता है; यह जनन कोशिकाओं का DNA नहीं बदलता।",
    },
  },
  eyeColour: {
    en: "the colour of the eyes",
    hi: "आँखों का रंग",
    inherited: true,
    why: {
      en: "Eye colour is set by genes inherited from the parents.",
      hi: "आँखों का रंग माता-पिता से मिले जीनों से तय होता है।",
    },
  },
  muscles: {
    en: "big muscles from years of exercise",
    hi: "सालों की कसरत से बनी मज़बूत मांसपेशियाँ",
    inherited: false,
    why: {
      en: "Exercise changes the body, not the germ cells, so the children don't inherit the muscles.",
      hi: "कसरत शरीर बदलती है, जनन कोशिकाएँ नहीं, इसलिए बच्चे वे मांसपेशियाँ नहीं पाते।",
    },
  },
  flowerColour: {
    en: "violet or white flowers in a pea plant",
    hi: "मटर के पौधे में बैंगनी या सफ़ेद फूल",
    inherited: true,
    why: {
      en: "Flower colour is one of Mendel's inherited traits, set by a gene (W or w).",
      hi: "फूल का रंग मेंडल के वंशानुगत लक्षणों में से है, जो एक जीन (W या w) तय करता है।",
    },
  },
  tailCut: {
    en: "a mouse with its tail cut off by surgery",
    hi: "शल्य से पूँछ कटा चूहा",
    inherited: false,
    why: {
      en: "Removing the tail can't change the genes of the germ cells: its young are born with tails.",
      hi: "पूँछ हटाने से जनन कोशिकाओं के जीन नहीं बदलते: उसकी संतान पूँछ के साथ पैदा होती है।",
    },
  },
  starvedBeetle: {
    en: "a beetle that is small because it was starved",
    hi: "भूखा रहने से छोटा रह गया भृंग",
    inherited: false,
    why: {
      en: "Low weight from starving is acquired; well-fed young grow to normal size.",
      hi: "भूख से कम वज़न उपार्जित है; अच्छा खाने वाली संतान सामान्य आकार की होती है।",
    },
  },
  language: {
    en: "speaking Hindi fluently",
    hi: "धाराप्रवाह हिंदी बोलना",
    inherited: false,
    why: {
      en: "A language is learnt during life. A baby raised elsewhere learns that place's language.",
      hi: "भाषा जीवन में सीखी जाती है। कहीं और पला बच्चा वहाँ की भाषा सीखता है।",
    },
  },
};

/** NCERT 9.2.1 and 9.3.2: is a trait inherited (from the parents' DNA) or acquired in a lifetime? */
export const inheritedOrAcquired = family({
  level: Level.Easy,
  tests: [Concept.VariationAndTraits, Concept.NaturalSelectionAndDrift],
  params: z.object({ case: z.nativeEnum(Case) }).strict(),
  build: ({ case: c }, b) => {
    const k = cases[c];
    const options: Option[] = [
      k.inherited
        ? { id: "right", label: t("Inherited", "वंशानुगत") }
        : { id: "inherited", label: t("Inherited", "वंशानुगत"), feedback: k.why },
      k.inherited
        ? { id: "acquired", label: t("Acquired", "उपार्जित"), feedback: k.why }
        : { id: "right", label: t("Acquired", "उपार्जित") },
    ];
    const ask = choiceQuestion(b, {
      prompt: t(
        `Is this trait inherited or acquired: ${k.en}?`,
        `यह लक्षण वंशानुगत है या उपार्जित: ${k.hi}?`,
      ),
      options: settle(options, c.length * 3 + 1),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
