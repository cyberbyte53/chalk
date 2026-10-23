import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { Relation, relationOf } from "@chalk/prop-linear-equations";
import { Concept } from "../../concepts.gen";
import { linesOf, pairParams, pairTex, seedOf } from "../../kit";

const answerOf = {
  [Relation.Intersecting]: "consistent",
  [Relation.Parallel]: "inconsistent",
  [Relation.Coincident]: "dependent",
};

/** Consistent, inconsistent or dependent (NCERT 3.3, Exercise 3.2 Q3 and Q4). */
export const consistentOrNot = family({
  level: Level.Medium,
  tests: [Concept.GraphicalMethod],
  params: pairParams,
  build: (p, bk) => {
    const [l1, l2] = linesOf(p);
    const answer = answerOf[relationOf(l1, l2)];
    const say = {
      consistent: t(
        "The lines cross once: exactly one solution, which makes the pair consistent (but not dependent).",
        "रेखाएँ एक बार कटती हैं: ठीक एक हल, यानी युग्म संगत है (पर आश्रित नहीं)।",
      ),
      inconsistent: t(
        "The lines are parallel: no solution at all, so the pair is inconsistent.",
        "रेखाएँ समांतर हैं: कोई हल नहीं, इसलिए युग्म असंगत है।",
      ),
      dependent: t(
        "One equation is a multiple of the other: infinitely many solutions, a dependent (and so consistent) pair.",
        "एक समीकरण दूसरे का गुणज है: अपरिमित हल, एक आश्रित (और इसलिए संगत) युग्म।",
      ),
    }[answer];
    const options: Option[] = [
      { id: "consistent", label: t("Consistent, with one solution", "संगत, एक हल के साथ") },
      { id: "inconsistent", label: t("Inconsistent", "असंगत") },
      { id: "dependent", label: t("Dependent (consistent)", "आश्रित (संगत)") },
    ].map((o) => (o.id === answer ? o : { ...o, feedback: say }));
    const pair = pairTex(l1, l2, p.general === true);
    const ask = choiceQuestion(bk, {
      prompt: t(`What kind of pair is ${pair.en}?`, `${pair.hi} किस तरह का युग्म है?`),
      options: settle(options, seedOf(p) + 2),
      answer,
    });
    return column([ask, space()]);
  },
});
