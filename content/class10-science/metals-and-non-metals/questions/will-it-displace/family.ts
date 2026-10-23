import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

/** Table 3.2, most reactive first (the metals used here). */
const SERIES = ["Na", "Mg", "Al", "Zn", "Fe", "Pb", "Cu", "Ag", "Au"] as const;
type Metal = (typeof SERIES)[number];

const NAMES: Record<Metal, { en: string; hi: string }> = {
  Na: { en: "sodium", hi: "सोडियम" },
  Mg: { en: "magnesium", hi: "मैग्नीशियम" },
  Al: { en: "aluminium", hi: "ऐलुमिनियम" },
  Zn: { en: "zinc", hi: "ज़िंक" },
  Fe: { en: "iron", hi: "लोहा" },
  Pb: { en: "lead", hi: "लेड" },
  Cu: { en: "copper", hi: "ताँबा" },
  Ag: { en: "silver", hi: "चाँदी" },
  Au: { en: "gold", hi: "सोना" },
};

const SALTS: Partial<Record<Metal, { formula: string; en: string; hi: string }>> = {
  Na: { formula: "NaCl", en: "sodium chloride", hi: "सोडियम क्लोराइड" },
  Mg: { formula: "MgCl2", en: "magnesium chloride", hi: "मैग्नीशियम क्लोराइड" },
  Zn: { formula: "ZnSO4", en: "zinc sulphate", hi: "ज़िंक सल्फ़ेट" },
  Fe: { formula: "FeSO4", en: "iron(II) sulphate", hi: "आयरन(II) सल्फ़ेट" },
  Pb: { formula: "Pb(NO3)2", en: "lead nitrate", hi: "लेड नाइट्रेट" },
  Cu: { formula: "CuSO4", en: "copper(II) sulphate", hi: "कॉपर(II) सल्फ़ेट" },
  Ag: { formula: "AgNO3", en: "silver nitrate", hi: "सिल्वर नाइट्रेट" },
};

const DIPPED = ["Mg", "Al", "Zn", "Fe", "Pb", "Cu", "Ag", "Au"] as const;
const SALT_OF = ["Na", "Mg", "Zn", "Fe", "Pb", "Cu", "Ag"] as const;

/** A metal in a solution of another metal's salt: does a displacement happen? (Exercise 1.) */
export const willItDisplaceSeries = family({
  level: Level.Medium,
  tests: [Concept.ReactivitySeries],
  params: z.object({ metal: z.enum(DIPPED), salt: z.enum(SALT_OF) }).strict(),
  build: ({ metal, salt }, b) => {
    if (metal === salt)
      throw new Error("willItDisplaceSeries: the metal and the salt's metal must differ");
    const s = SALTS[salt];
    if (s === undefined) throw new Error(`willItDisplaceSeries: no salt for ${salt}`);
    const yes = SERIES.indexOf(metal) < SERIES.indexOf(salt);
    const m = NAMES[metal];
    const n = NAMES[salt];
    const happens = t(`Yes: ${n.en} is displaced`, `हाँ: ${n.hi} विस्थापित होता है`);
    const nothing = t("No reaction", "कोई अभिक्रिया नहीं");
    const ask = pickOne(b, {
      prompt: t(
        `${m.en[0]?.toUpperCase()}${m.en.slice(1)} is put into ${s.en} solution, $\\ce{${s.formula}}$. Does a displacement reaction take place?`,
        `${m.hi} को ${s.hi} विलयन, $\\ce{${s.formula}}$, में डाला जाता है। क्या विस्थापन अभिक्रिया होती है?`,
      ),
      right: yes ? happens : nothing,
      wrong: [
        {
          label: yes ? nothing : happens,
          why: yes
            ? t(
                `${m.en} is above ${n.en} in the series, so it displaces it.`,
                `श्रेणी में ${m.hi}, ${n.hi} से ऊपर है, इसलिए उसे विस्थापित करता है।`,
              )
            : t(
                `${m.en} is below ${n.en} in the series, so it can't displace it.`,
                `श्रेणी में ${m.hi}, ${n.hi} से नीचे है, इसलिए उसे विस्थापित नहीं कर सकता।`,
              ),
        },
      ],
      seed: seedOf(metal, salt),
    });
    return column([ask, space()]);
  },
});
