import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Item = {
  Magnesium: "magnesium",
  LeadIodide: "leadIodide",
  ZincAcid: "zincAcid",
  QuickLime: "quickLime",
  FerrousSulphate: "ferrousSulphate",
  SilverChloride: "silverChloride",
} as const;
type Item = (typeof Item)[keyof typeof Item];

const Sign = { State: "state", Colour: "colour", Gas: "gas", Temperature: "temperature" } as const;
type Sign = (typeof Sign)[keyof typeof Sign];

const signWords: Record<Sign, { en: string; hi: string }> = {
  state: { en: "A change in state", hi: "अवस्था में परिवर्तन" },
  colour: { en: "A change in colour", hi: "रंग में परिवर्तन" },
  gas: { en: "A gas given off", hi: "गैस का निकलना" },
  temperature: { en: "A change in temperature", hi: "ताप में परिवर्तन" },
};

const items: Record<Item, { en: string; hi: string; sign: Sign }> = {
  magnesium: {
    en: "A shiny magnesium ribbon burns and turns into a white powder.",
    hi: "चमकदार मैग्नीशियम पट्टी जलकर सफ़ेद चूर्ण बन जाती है।",
    sign: Sign.State,
  },
  leadIodide: {
    en: "Two colourless solutions are mixed and turn bright yellow.",
    hi: "दो रंगहीन विलयन मिलाए जाते हैं और चटक पीले हो जाते हैं।",
    sign: Sign.Colour,
  },
  zincAcid: {
    en: "Zinc granules dropped in dilute acid are soon covered in bubbles.",
    hi: "तनु अम्ल में डाले जिंक के दानों पर जल्दी ही बुलबुले छा जाते हैं।",
    sign: Sign.Gas,
  },
  quickLime: {
    en: "Water poured on quick lime makes the beaker too hot to hold.",
    hi: "बिना बुझे चूने पर डाला पानी बीकर को इतना गर्म कर देता है कि पकड़ा न जाए।",
    sign: Sign.Temperature,
  },
  ferrousSulphate: {
    en: "Green ferrous sulphate crystals turn reddish brown when heated.",
    hi: "हरे फ़ेरस सल्फ़ेट क्रिस्टल गर्म करने पर लाल-भूरे हो जाते हैं।",
    sign: Sign.Colour,
  },
  silverChloride: {
    en: "White silver chloride left in sunlight turns grey.",
    hi: "धूप में छोड़ा सफ़ेद सिल्वर क्लोराइड स्लेटी हो जाता है।",
    sign: Sign.Colour,
  },
};

/** Which of NCERT's four signs best shows that a reaction took place. */
export const reactionSign = family({
  level: Level.Easy,
  tests: [Concept.WhatIsAReaction],
  params: z.object({ item: z.nativeEnum(Item) }).strict(),
  build: ({ item }, b) => {
    const it = items[item];
    const options: Option[] = (Object.values(Sign) as Sign[]).map((sign) =>
      sign === it.sign
        ? { id: sign, label: signWords[sign] }
        : {
            id: sign,
            label: signWords[sign],
            feedback: t(
              `Read it again: what does the description say you see or feel? That's ${signWords[it.sign].en.toLowerCase()}.`,
              `फिर पढ़ो: विवरण क्या देखने या महसूस करने को कहता है? वह ${signWords[it.sign].hi} है।`,
            ),
          },
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        `${it.en} Which sign of a chemical reaction does this show best?`,
        `${it.hi} यह रासायनिक अभिक्रिया का कौन-सा संकेत सबसे अच्छी तरह दिखाता है?`,
      ),
      options: settle(options, item.length * 3),
      answer: it.sign,
    });
    return column([ask, space()]);
  },
});
