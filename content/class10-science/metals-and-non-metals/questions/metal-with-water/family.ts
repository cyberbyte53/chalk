import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

const Way = {
  Violent: "violent",
  Floats: "floats",
  Hot: "hot",
  Steam: "steam",
  None: "none",
} as const;
type Way = (typeof Way)[keyof typeof Way];

const WAYS: Record<Way, { en: string; hi: string }> = {
  violent: {
    en: "Reacts violently with cold water; the hydrogen catches fire",
    hi: "ठंडे पानी से बहुत तेज़ी से अभिक्रिया करती है; हाइड्रोजन आग पकड़ लेती है",
  },
  floats: {
    en: "Reacts with cold water less violently, and floats on hydrogen bubbles",
    hi: "ठंडे पानी से कम तेज़ी से अभिक्रिया करती है, और हाइड्रोजन के बुलबुलों पर तैरती है",
  },
  hot: {
    en: "Doesn't react with cold water, but reacts with hot water",
    hi: "ठंडे पानी से अभिक्रिया नहीं करती, पर गर्म पानी से करती है",
  },
  steam: {
    en: "Reacts only with steam, giving the metal oxide and hydrogen",
    hi: "केवल भाप से अभिक्रिया करती है, और धातु ऑक्साइड और हाइड्रोजन देती है",
  },
  none: { en: "Doesn't react with water at all", hi: "पानी से बिल्कुल अभिक्रिया नहीं करती" },
};

const METALS = {
  potassium: { name: { en: "potassium", hi: "पोटैशियम" }, way: Way.Violent },
  sodium: { name: { en: "sodium", hi: "सोडियम" }, way: Way.Violent },
  calcium: { name: { en: "calcium", hi: "कैल्शियम" }, way: Way.Floats },
  magnesium: { name: { en: "magnesium", hi: "मैग्नीशियम" }, way: Way.Hot },
  aluminium: { name: { en: "aluminium", hi: "ऐलुमिनियम" }, way: Way.Steam },
  zinc: { name: { en: "zinc", hi: "ज़िंक" }, way: Way.Steam },
  iron: { name: { en: "iron", hi: "लोहा" }, way: Way.Steam },
  lead: { name: { en: "lead", hi: "लेड" }, way: Way.None },
  copper: { name: { en: "copper", hi: "ताँबा" }, way: Way.None },
  gold: { name: { en: "gold", hi: "सोना" }, way: Way.None },
} as const;
type Metal = keyof typeof METALS;

/** Activity 3.10: how a metal reacts with water. */
export const metalWithWater = family({
  level: Level.Medium,
  tests: [Concept.MetalsWithWaterAndAcids],
  params: z.object({ metal: z.enum(Object.keys(METALS) as [Metal, ...Metal[]]) }).strict(),
  build: ({ metal }, b) => {
    const m = METALS[metal];
    const others = (Object.values(Way) as Way[]).filter((w) => w !== m.way).slice(0, 3);
    const ask = pickOne(b, {
      prompt: t(
        `How does ${m.name.en} react with water?`,
        `${m.name.hi} पानी से कैसे अभिक्रिया करता है?`,
      ),
      right: t(WAYS[m.way].en, WAYS[m.way].hi),
      wrong: others.map((w) => ({
        label: t(WAYS[w].en, WAYS[w].hi),
        why: t(
          "Recall Activity 3.10: K, Na violently; Ca less so; Mg with hot water; Al, Zn, Fe with steam; Pb, Cu, Ag, Au not at all.",
          "क्रियाकलाप 3.10 याद करो: K, Na बहुत तेज़ी से; Ca उससे कम; Mg गर्म पानी से; Al, Zn, Fe भाप से; Pb, Cu, Ag, Au बिल्कुल नहीं।",
        ),
      })),
      seed: seedOf(metal),
    });
    return column([ask, space()]);
  },
});
