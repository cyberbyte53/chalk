import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { Relation, fracTex, ratiosOf, relationOf } from "@chalk/prop-linear-equations";
import { Concept } from "../../concepts.gen";
import { linesOf, pairParams, pairTex, seedOf } from "../../kit";

/** Intersecting, parallel or coincident, by comparing a₁/a₂, b₁/b₂ and c₁/c₂ (NCERT Table 3.4, Exercise 3.2 Q2). */
export const howDoLinesSit = family({
  level: Level.Easy,
  tests: [Concept.ThreeKindsOfPairs, Concept.GraphicalMethod],
  params: pairParams,
  build: (p, bk) => {
    const [l1, l2] = linesOf(p);
    const relation = relationOf(l1, l2);
    const r = ratiosOf(l1, l2);
    const show = (f: typeof r.a, top: string) =>
      f === null ? `$${top}_2 = 0$` : `$\\tfrac{${top}_1}{${top}_2} = ${fracTex(f)}$`;
    const ratios = `${show(r.a, "a")}, ${show(r.b, "b")}, ${show(r.c, "c")}`;
    const why = t(`Compare: ${ratios}.`, `मिलाओ: ${ratios}।`);
    const options: Option[] = [
      {
        id: Relation.Intersecting,
        label: t("They intersect at one point", "वे एक बिंदु पर प्रतिच्छेद करती हैं"),
      },
      { id: Relation.Parallel, label: t("They are parallel", "वे समांतर हैं") },
      { id: Relation.Coincident, label: t("They coincide", "वे संपाती हैं") },
    ].map((o) => (o.id === relation ? o : { ...o, feedback: why }));
    const pair = pairTex(l1, l2, p.general === true);
    const ask = choiceQuestion(bk, {
      prompt: t(`How do the lines of ${pair.en} sit?`, `${pair.hi} की रेखाएँ कैसी हैं?`),
      options: settle(options, seedOf(p)),
      answer: relation,
    });
    return column([ask, space()]);
  },
});
