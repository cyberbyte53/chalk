import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

const COMPOUNDS = {
  NaCl: { cation: "Na+", anion: "Cl-" },
  KCl: { cation: "K+", anion: "Cl-" },
  MgCl2: { cation: "Mg^2+", anion: "Cl-" },
  CaCl2: { cation: "Ca^2+", anion: "Cl-" },
  Na2O: { cation: "Na+", anion: "O^2-" },
  MgO: { cation: "Mg^2+", anion: "O^2-" },
  CaO: { cation: "Ca^2+", anion: "O^2-" },
} as const;
type Compound = keyof typeof COMPOUNDS;

/** A wrong charge: one too big or too small. */
const wrongCation = (c: string): string =>
  c.endsWith("^2+") ? c.replace("^2+", "+") : c.replace("+", "^2+");
const wrongAnion = (a: string): string =>
  a.endsWith("^2-") ? a.replace("^2-", "-") : a.replace("-", "^2-");

/** The cation and anion in an ionic compound (Figs 3.5, 3.6; in-text Q1). */
export const ionsInCompound = family({
  level: Level.Medium,
  tests: [Concept.IonicCompounds],
  params: z
    .object({ compound: z.enum(Object.keys(COMPOUNDS) as [Compound, ...Compound[]]) })
    .strict(),
  build: ({ compound }, b) => {
    const { cation, anion } = COMPOUNDS[compound];
    const pair = (c: string, a: string) =>
      t(`$\\ce{${c}}$ and $\\ce{${a}}$`, `$\\ce{${c}}$ और $\\ce{${a}}$`);
    const ask = pickOne(b, {
      prompt: t(
        `Which ions are present in $\\ce{${compound}}$?`,
        `$\\ce{${compound}}$ में कौन-से आयन हैं?`,
      ),
      right: pair(cation, anion),
      wrong: [
        {
          label: pair(wrongCation(cation), anion),
          why: t(
            "Count the metal's valence electrons: it loses all of them, and that number is its positive charge.",
            "धातु के संयोजकता इलेक्ट्रॉन गिनो: वह सब खो देती है, और वही संख्या उसका धनावेश है।",
          ),
        },
        {
          label: pair(cation, wrongAnion(anion)),
          why: t(
            "Count how many electrons the non-metal needs to reach eight: that is its negative charge.",
            "गिनो कि अधातु को आठ तक पहुँचने के लिए कितने इलेक्ट्रॉन चाहिए: वही उसका ऋणावेश है।",
          ),
        },
      ],
      seed: seedOf(compound),
    });
    return column([ask, space()]);
  },
});
