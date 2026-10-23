import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  Gate: "gate",
  Chips: "chips",
  Namkeen: "namkeen",
  Bridge: "bridge",
  Oil: "oil",
  Silver: "silver",
} as const;
type Case = (typeof Case)[keyof typeof Case];

const cases: Record<
  Case,
  {
    en: string;
    hi: string;
    process: "corrosion" | "rancidity";
    fix: { en: string; hi: string };
    wrong: { en: string; hi: string };
  }
> = {
  gate: {
    en: "An iron gate keeps getting rusty.",
    hi: "लोहे के गेट पर बार-बार ज़ंग लग जाता है।",
    process: "corrosion",
    fix: {
      en: "Paint it, so air and moisture can't reach the iron",
      hi: "पेंट करो, ताकि हवा और नमी लोहे तक न पहुँचे",
    },
    wrong: { en: "Keep it in an airtight container", hi: "इसे हवाबंद डिब्बे में रखो" },
  },
  bridge: {
    en: "The iron railings of a bridge over a river are corroding.",
    hi: "नदी के पुल की लोहे की रेलिंग का संक्षारण हो रहा है।",
    process: "corrosion",
    fix: { en: "Coat them with paint", hi: "उन पर पेंट की परत चढ़ाओ" },
    wrong: { en: "Add an antioxidant to the river water", hi: "नदी के पानी में प्रतिऑक्सीकारक मिलाओ" },
  },
  silver: {
    en: "Silver anklets turn black after months in an open drawer.",
    hi: "खुली दराज़ में महीनों रखी चाँदी की पायलें काली पड़ जाती हैं।",
    process: "corrosion",
    fix: {
      en: "Store them sealed away from air, and polish off the black layer",
      hi: "उन्हें हवा से दूर बंद रखो, और काली परत चमकाकर हटाओ",
    },
    wrong: { en: "Flush them with nitrogen like chips", hi: "चिप्स की तरह उनमें नाइट्रोजन भरो" },
  },
  chips: {
    en: "Potato chips in a packet must stay fresh for months.",
    hi: "पैकेट के आलू चिप्स महीनों ताज़े रहने चाहिए।",
    process: "rancidity",
    fix: { en: "Flush the packet with nitrogen", hi: "पैकेट में नाइट्रोजन भरो" },
    wrong: { en: "Paint the packet", hi: "पैकेट पर पेंट करो" },
  },
  namkeen: {
    en: "Namkeen in an open jar starts to smell and taste odd.",
    hi: "खुले जार का नमकीन अजीब गंध और स्वाद देने लगता है।",
    process: "rancidity",
    fix: { en: "Keep it in an airtight container", hi: "इसे हवाबंद डिब्बे में रखो" },
    wrong: { en: "Leave the lid open so it can breathe", hi: "ढक्कन खुला छोड़ो ताकि हवा लगे" },
  },
  oil: {
    en: "A company wants its packaged cooking oil and snacks not to go off quickly.",
    hi: "एक कंपनी चाहती है कि उसका पैक किया तेल और नाश्ता जल्दी ख़राब न हो।",
    process: "rancidity",
    fix: { en: "Add antioxidants", hi: "प्रतिऑक्सीकारक मिलाओ" },
    wrong: { en: "Add more oxygen", hi: "और ऑक्सीजन मिलाओ" },
  },
};

const processWords = {
  corrosion: { en: "corrosion", hi: "संक्षारण" },
  rancidity: { en: "rancidity", hi: "विकृतगंधिता" },
};

/** Name the slow oxidation (corrosion or rancidity) and pick the way to slow it. */
export const stopTheOxidation = family({
  level: Level.Easy,
  tests: [Concept.CorrosionAndRancidity],
  params: z.object({ case: z.nativeEnum(Case) }).strict(),
  build: (p, b) => {
    const c = cases[p.case];
    const word = processWords[c.process];
    const options: Option[] = [
      { id: "right", label: t(c.fix.en, c.fix.hi) },
      {
        id: "wrong",
        label: t(c.wrong.en, c.wrong.hi),
        feedback: t(
          `This is ${word.en}. The fix has to keep air (and for metals, moisture) away from it.`,
          `यह ${word.hi} है। उपाय को इससे हवा (और धातुओं के लिए नमी) दूर रखनी होगी।`,
        ),
      },
    ];
    const ask = choiceQuestion(b, {
      prompt: t(
        `${c.en} This is ${word.en}. What will slow it down?`,
        `${c.hi} यह ${word.hi} है। इसे क्या धीमा करेगा?`,
      ),
      options: settle(options, p.case.length),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
