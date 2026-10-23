import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Genotype = { TTWW: "TTWW", TtWW: "TtWW", TTWw: "TTWw", TtWw: "TtWw" } as const;
type Genotype = (typeof Genotype)[keyof typeof Genotype];

/** What the children of (genotype × ttww) look like, in words. */
const outcome: Record<Genotype, { en: string; hi: string }> = {
  TTWW: {
    en: "all the children are tall with violet flowers",
    hi: "सारे बच्चे लंबे और बैंगनी फूलों वाले हैं",
  },
  TtWW: {
    en: "all the children have violet flowers, but about half of them are short",
    hi: "सारे बच्चों के फूल बैंगनी हैं, पर उनमें से लगभग आधे बौने हैं",
  },
  TTWw: {
    en: "all the children are tall, but about half of them have white flowers",
    hi: "सारे बच्चे लंबे हैं, पर उनमें से लगभग आधों के फूल सफ़ेद हैं",
  },
  TtWw: {
    en: "about half the children are short, and, separately, about half have white flowers",
    hi: "लगभग आधे बच्चे बौने हैं, और, अलग से, लगभग आधों के फूल सफ़ेद हैं",
  },
};

/** Why a wrong genotype doesn't fit: name only the trait(s) where it disagrees with the real parent. */
function why(g: Genotype, real: Genotype): { en: string; hi: string } {
  const en: string[] = [];
  const hi: string[] = [];
  if (g.slice(0, 2) !== real.slice(0, 2)) {
    en.push(
      g.startsWith("TT")
        ? "TT would make every child tall"
        : "Tt would make about half the children short",
    );
    hi.push(g.startsWith("TT") ? "TT हर बच्चे को लंबा बनाता" : "Tt लगभग आधे बच्चों को बौना बनाता");
  }
  if (g.slice(2) !== real.slice(2)) {
    en.push(
      g.endsWith("WW")
        ? "WW would make every flower violet"
        : "Ww would make about half the flowers white",
    );
    hi.push(g.endsWith("WW") ? "WW हर फूल को बैंगनी बनाता" : "Ww लगभग आधे फूलों को सफ़ेद बनाता");
  }
  return {
    en: `Take one trait at a time. The short white parent (ttww) only gives t and w. ${en.join(", and ")}: that doesn't match.`,
    hi: `एक बार में एक लक्षण लो। बौना सफ़ेद जनक (ttww) केवल t और w देता है। ${hi.join(", और ")}: यह मेल नहीं खाता।`,
  };
}

/** NCERT Exercise 1 and its variants: a tall violet plant × short white (ttww); find the tall parent. */
export const parentGenotype = family({
  level: Level.Hard,
  tests: [Concept.MendelTwoTraits],
  params: z.object({ parent: z.nativeEnum(Genotype) }).strict(),
  build: ({ parent }, b) => {
    const options: Option[] = (Object.values(Genotype) as Genotype[]).map((g) =>
      g === parent
        ? { id: "right", label: t(g, g) }
        : { id: g, label: t(g, g), feedback: why(g, parent) },
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        `A tall pea plant with violet flowers is crossed with a short plant with white flowers (ttww). T (tall) and W (violet) are dominant. If ${outcome[parent].en}, the tall parent is…`,
        `लंबे, बैंगनी फूलों वाले मटर के पौधे का सफ़ेद फूलों वाले बौने पौधे (ttww) से संकरण होता है। T (लंबा) और W (बैंगनी) प्रभावी हैं। अगर ${outcome[parent].hi}, तो लंबा जनक है…`,
      ),
      options: settle(options, parent.charCodeAt(1) * 3 + parent.charCodeAt(3)),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
