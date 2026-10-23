import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** The variable cancels and leaves "left = right": true means infinitely many, false means none. */
export const leftoverStatement = family({
  level: Level.Easy,
  tests: [Concept.SubstitutionMethod, Concept.EliminationMethod],
  params: z.object({ left: z.number(), right: z.number() }).strict(),
  build: ({ left, right }, bk) => {
    const isTrue = left === right;
    const answer = isTrue ? "many" : "none";
    const why = isTrue
      ? t(
          `$${left} = ${right}$ is true whatever the variables are, so every solution of one equation solves the other.`,
          `$${left} = ${right}$ चरों के किसी भी मान पर सही है, इसलिए एक समीकरण का हर हल दूसरे का भी हल है।`,
        )
      : t(
          `$${left} = ${right}$ is false whatever the variables are, so no pair of values satisfies both equations.`,
          `$${left} = ${right}$ चरों के किसी भी मान पर ग़लत है, इसलिए कोई भी मान-जोड़ा दोनों समीकरणों को संतुष्ट नहीं करता।`,
        );
    const options: Option[] = [
      { id: "many", label: t("Infinitely many solutions", "अपरिमित हल") },
      { id: "none", label: t("No solution", "कोई हल नहीं") },
      { id: "one", label: t(`One solution, $x = ${left}$`, `एक हल, $x = ${left}$`) },
    ].map((o) => (o.id === answer ? o : { ...o, feedback: why }));
    const ask = choiceQuestion(bk, {
      prompt: t(
        `Solving a pair, every variable cancels and you are left with $${left} = ${right}$. So the pair has…`,
        `एक युग्म हल करते हुए हर चर कट जाता है और बचता है $${left} = ${right}$। तो युग्म के…`,
      ),
      options: settle(options, left * 3 + right),
      answer,
    });
    return column([ask, space()]);
  },
});
