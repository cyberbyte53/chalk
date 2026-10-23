import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { Relation, relationOf } from "@chalk/prop-linear-equations";
import { Concept } from "../../concepts.gen";
import { linesOf, pairParams, pairTex, seedOf } from "../../kit";

const answerOf = {
  [Relation.Intersecting]: "one",
  [Relation.Parallel]: "none",
  [Relation.Coincident]: "many",
};

/** One, none or infinitely many: how the lines sit decides how many solutions (NCERT 3.2–3.3). */
export const howManySolutions = family({
  level: Level.Easy,
  tests: [Concept.ThreeKindsOfPairs],
  params: pairParams,
  build: (p, bk) => {
    const [l1, l2] = linesOf(p);
    const answer = answerOf[relationOf(l1, l2)];
    const hint = {
      one: t(
        "The left sides are not multiples of each other, so the lines tilt differently and cross once.",
        "बाएँ पक्ष एक-दूसरे के गुणज नहीं, इसलिए रेखाओं का झुकाव अलग है और वे एक बार कटती हैं।",
      ),
      none: t(
        "One left side is a multiple of the other but the right sides don't match: parallel lines, no common point.",
        "एक बायाँ पक्ष दूसरे का गुणज है पर दाएँ पक्ष मेल नहीं खाते: समांतर रेखाएँ, कोई साझा बिंदु नहीं।",
      ),
      many: t(
        "One whole equation is a multiple of the other: the same line, so every point on it works.",
        "एक पूरा समीकरण दूसरे का गुणज है: एक ही रेखा, तो उसका हर बिंदु चलता है।",
      ),
    }[answer];
    const options: Option[] = [
      { id: "one", label: t("Exactly one", "ठीक एक") },
      { id: "none", label: t("No solution", "कोई हल नहीं") },
      { id: "many", label: t("Infinitely many", "अपरिमित रूप से अनेक") },
    ].map((o) => (o.id === answer ? o : { ...o, feedback: hint }));
    const pair = pairTex(l1, l2, p.general === true);
    const ask = choiceQuestion(bk, {
      prompt: t(`How many solutions does ${pair.en} have?`, `${pair.hi} के कितने हल हैं?`),
      options: settle(options, seedOf(p) + 1),
      answer,
    });
    return column([ask, space()]);
  },
});
