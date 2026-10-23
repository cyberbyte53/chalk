import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

const Way = {
  Fire: "fire",
  Layer: "layer",
  Filings: "filings",
  Black: "black",
  None: "none",
} as const;
type Way = (typeof Way)[keyof typeof Way];

const WAYS: Record<Way, { en: string; hi: string }> = {
  fire: {
    en: "Catches fire in the open, so it is kept under kerosene",
    hi: "खुले में आग पकड़ लेती है, इसलिए केरोसिन में रखी जाती है",
  },
  layer: {
    en: "Gets a thin protective oxide layer at ordinary temperature",
    hi: "सामान्य ताप पर उस पर पतली सुरक्षात्मक ऑक्साइड परत बनती है",
  },
  filings: {
    en: "Doesn't burn as a lump, but its filings burn vigorously in a flame",
    hi: "डली के रूप में नहीं जलती, पर उसका बुरादा आँच में तेज़ी से जलता है",
  },
  black: {
    en: "Doesn't burn, but the hot metal gets a black oxide coat",
    hi: "जलती नहीं, पर गर्म धातु पर काली ऑक्साइड परत चढ़ जाती है",
  },
  none: {
    en: "Doesn't react with oxygen even at high temperatures",
    hi: "ऊँचे ताप पर भी ऑक्सीजन से अभिक्रिया नहीं करती",
  },
};

const METALS = {
  potassium: { name: { en: "potassium", hi: "पोटैशियम" }, way: Way.Fire },
  sodium: { name: { en: "sodium", hi: "सोडियम" }, way: Way.Fire },
  magnesium: { name: { en: "magnesium", hi: "मैग्नीशियम" }, way: Way.Layer },
  aluminium: { name: { en: "aluminium", hi: "ऐलुमिनियम" }, way: Way.Layer },
  zinc: { name: { en: "zinc", hi: "ज़िंक" }, way: Way.Layer },
  iron: { name: { en: "iron", hi: "लोहा" }, way: Way.Filings },
  copper: { name: { en: "copper", hi: "ताँबा" }, way: Way.Black },
  silver: { name: { en: "silver", hi: "चाँदी" }, way: Way.None },
  gold: { name: { en: "gold", hi: "सोना" }, way: Way.None },
} as const;
type Metal = keyof typeof METALS;

/** Activity 3.9: how a metal behaves with oxygen. */
export const metalInAir = family({
  level: Level.Medium,
  tests: [Concept.MetalsAndOxygen],
  params: z.object({ metal: z.enum(Object.keys(METALS) as [Metal, ...Metal[]]) }).strict(),
  build: ({ metal }, b) => {
    const m = METALS[metal];
    const others = (Object.values(Way) as Way[]).filter((w) => w !== m.way).slice(0, 3);
    const ask = pickOne(b, {
      prompt: t(
        `Which of these describes how ${m.name.en} behaves with the oxygen in air?`,
        `इनमें से कौन-सा बताता है कि ${m.name.hi} हवा की ऑक्सीजन के साथ कैसा व्यवहार करता है?`,
      ),
      right: t(WAYS[m.way].en, WAYS[m.way].hi),
      wrong: others.map((w) => ({
        label: t(WAYS[w].en, WAYS[w].hi),
        why: t(
          `Not ${m.name.en}. Think where it sits in reactivity: K and Na most, then Mg, Al, Zn, then Fe, Cu, and Ag, Au least.`,
          `${m.name.hi} नहीं। सोचो क्रियाशीलता में यह कहाँ है: K और Na सबसे अधिक, फिर Mg, Al, Zn, फिर Fe, Cu, और Ag, Au सबसे कम।`,
        ),
      })),
      seed: seedOf(metal),
    });
    return column([ask, space()]);
  },
});
