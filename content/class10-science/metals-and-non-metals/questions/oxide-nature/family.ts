import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

const Kind = { Basic: "basic", Acidic: "acidic", Amphoteric: "amphoteric" } as const;
type Kind = (typeof Kind)[keyof typeof Kind];

const WORDS: Record<Kind, { en: string; hi: string }> = {
  basic: { en: "Basic", hi: "क्षारकीय" },
  acidic: { en: "Acidic", hi: "अम्लीय" },
  amphoteric: { en: "Amphoteric", hi: "उभयधर्मी" },
};

const WHY: Record<Kind, { en: string; hi: string }> = {
  basic: {
    en: "Most metal oxides are basic: they react with acids.",
    hi: "अधिकतर धातु ऑक्साइड क्षारकीय हैं: वे अम्लों से अभिक्रिया करते हैं।",
  },
  acidic: {
    en: "Non-metal oxides dissolve in water to give acids.",
    hi: "अधातु ऑक्साइड पानी में घुलकर अम्ल देते हैं।",
  },
  amphoteric: {
    en: "Aluminium oxide and zinc oxide react with both acids and bases.",
    hi: "ऐलुमिनियम ऑक्साइड और ज़िंक ऑक्साइड अम्लों और क्षारकों दोनों से अभिक्रिया करते हैं।",
  },
};

const OXIDES = {
  MgO: Kind.Basic,
  CaO: Kind.Basic,
  Na2O: Kind.Basic,
  K2O: Kind.Basic,
  CuO: Kind.Basic,
  SO2: Kind.Acidic,
  CO2: Kind.Acidic,
  Al2O3: Kind.Amphoteric,
  ZnO: Kind.Amphoteric,
} as const satisfies Record<string, Kind>;
type Oxide = keyof typeof OXIDES;

/** Is this oxide basic, acidic or amphoteric? */
export const oxideNature = family({
  level: Level.Medium,
  tests: [Concept.MetalsAndOxygen],
  params: z.object({ oxide: z.enum(Object.keys(OXIDES) as [Oxide, ...Oxide[]]) }).strict(),
  build: ({ oxide }, b) => {
    const kind = OXIDES[oxide];
    const ask = pickOne(b, {
      prompt: t(
        `What is the nature of the oxide $\\ce{${oxide}}$?`,
        `ऑक्साइड $\\ce{${oxide}}$ की प्रकृति क्या है?`,
      ),
      right: t(WORDS[kind].en, WORDS[kind].hi),
      wrong: (Object.values(Kind) as Kind[])
        .filter((k) => k !== kind)
        .map((k) => ({ label: t(WORDS[k].en, WORDS[k].hi), why: t(WHY[kind].en, WHY[kind].hi) })),
      seed: seedOf(oxide),
    });
    return column([ask, space()]);
  },
});
