import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const SYMBOLS = ["s", "l", "g", "aq"] as const;
type Symbol = (typeof SYMBOLS)[number];

const meaning: Record<Symbol, { en: string; hi: string }> = {
  s: { en: "solid (a fixed shape)", hi: "ठोस (निश्चित आकार)" },
  l: { en: "liquid (pure, not a solution)", hi: "द्रव (शुद्ध, विलयन नहीं)" },
  g: { en: "gas (spreads to fill space)", hi: "गैस (जगह भरने को फैलती है)" },
  aq: { en: "aqueous (dissolved in water)", hi: "जलीय (पानी में घुला)" },
};

const example: Record<Symbol, string> = {
  s: "Fe3O4(s)",
  l: "H2O(l)",
  g: "H2(g)",
  aq: "NaCl(aq)",
};

/** What a state symbol written after a formula means. */
export const stateSymbol = family({
  level: Level.Easy,
  tests: [Concept.BalancingEquations],
  params: z.object({ symbol: z.enum(SYMBOLS) }).strict(),
  build: ({ symbol }, b) => {
    const options: Option[] = SYMBOLS.map((s) =>
      s === symbol
        ? { id: s, label: t(meaning[s].en, meaning[s].hi) }
        : {
            id: s,
            label: t(meaning[s].en, meaning[s].hi),
            feedback: t(`That one is written (${s}).`, `वह (${s}) लिखा जाता है।`),
          },
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        `In $\\ce{${example[symbol]}}$, what does (${symbol}) say about the substance?`,
        `$\\ce{${example[symbol]}}$ में (${symbol}) पदार्थ के बारे में क्या बताता है?`,
      ),
      options: settle(options, symbol.length * 11),
      answer: symbol,
    });
    return column([ask, space()]);
  },
});
