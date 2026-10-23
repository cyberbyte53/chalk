import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** The metals of this chapter, most reactive first (as far as Class 10 Chapter 1 needs). */
const ORDER = ["Al", "Zn", "Fe", "Pb", "Cu", "Ag"] as const;
type Metal = (typeof ORDER)[number];

const names: Record<Metal, { en: string; hi: string }> = {
  Al: { en: "aluminium", hi: "ऐलुमिनियम" },
  Zn: { en: "zinc", hi: "जिंक" },
  Fe: { en: "iron", hi: "लोहा" },
  Pb: { en: "lead", hi: "लेड" },
  Cu: { en: "copper", hi: "ताँबा" },
  Ag: { en: "silver", hi: "चाँदी" },
};

const salts: Record<Metal, { formula: string; en: string; hi: string }> = {
  Al: { formula: "Al2(SO4)3", en: "aluminium sulphate", hi: "ऐलुमिनियम सल्फ़ेट" },
  Zn: { formula: "ZnSO4", en: "zinc sulphate", hi: "जिंक सल्फ़ेट" },
  Fe: { formula: "FeSO4", en: "iron sulphate", hi: "आयरन सल्फ़ेट" },
  Pb: { formula: "Pb(NO3)2", en: "lead nitrate", hi: "लेड नाइट्रेट" },
  Cu: { formula: "CuSO4", en: "copper sulphate", hi: "कॉपर सल्फ़ेट" },
  Ag: { formula: "AgNO3", en: "silver nitrate", hi: "सिल्वर नाइट्रेट" },
};

/** A metal dipped in a solution of another metal's salt: does it displace that metal? */
export const willItDisplace = family({
  level: Level.Medium,
  tests: [Concept.DisplacementReactions],
  params: z.object({ metal: z.enum(ORDER), salt: z.enum(ORDER) }).strict(),
  build: ({ metal, salt }, b) => {
    if (metal === salt)
      throw new Error("willItDisplace: the metal and the salt's metal must differ");
    const yes = ORDER.indexOf(metal) < ORDER.indexOf(salt);
    const m = names[metal];
    const s = salts[salt];
    const n = names[salt];
    const options: Option[] = [
      {
        id: "yes",
        label: t(`Yes: ${n.en} comes out as metal`, `हाँ: ${n.hi} धातु के रूप में निकलता है`),
        ...(yes
          ? {}
          : {
              feedback: t(
                `${m.en[0]?.toUpperCase()}${m.en.slice(1)} is less reactive than ${n.en}, so it can't push ${n.en} out.`,
                `${m.hi}, ${n.hi} से कम क्रियाशील है, इसलिए उसे बाहर नहीं धकेल सकता।`,
              ),
            }),
      },
      {
        id: "no",
        label: t("No reaction", "कोई अभिक्रिया नहीं"),
        ...(yes
          ? {
              feedback: t(
                `${m.en[0]?.toUpperCase()}${m.en.slice(1)} is more reactive than ${n.en}, so it displaces it.`,
                `${m.hi}, ${n.hi} से अधिक क्रियाशील है, इसलिए उसे विस्थापित करता है।`,
              ),
            }
          : {}),
      },
    ];
    const ask = choiceQuestion(b, {
      prompt: t(
        `A piece of ${m.en} is dipped in ${s.en} solution, $\\ce{${s.formula}}$. Does a displacement reaction take place?`,
        `${m.hi} का एक टुकड़ा ${s.hi} विलयन, $\\ce{${s.formula}}$, में डुबोया जाता है। क्या विस्थापन अभिक्रिया होती है?`,
      ),
      options: settle(options, metal.length + salt.length * 3),
      answer: yes ? "yes" : "no",
    });
    return column([ask, space()]);
  },
});
