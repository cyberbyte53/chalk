import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, distinctOptions, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** A power with its sign: "+2.25 D". */
function dioptres(p: number): ReturnType<typeof t> {
  const v = Number(Math.abs(p).toFixed(2));
  const s = `${p < 0 ? "−" : "+"}${v} D`;
  return t(s, s);
}

/** Thin lenses in contact: P = P1 + P2, with the signs (NCERT 10.3.8, More to Know). */
export const lensesInContact = family({
  level: Level.Medium,
  tests: [Concept.PowerOfALens],
  params: z.object({ p1: z.number(), p2: z.number() }).strict(),
  build: ({ p1, p2 }, b) => {
    const wrong: Option[] = [
      {
        id: "signs",
        label: dioptres(Math.abs(p1) + Math.abs(p2)),
        feedback: t(
          "Keep each power's sign when you add: a concave lens's power is negative.",
          "जोड़ते समय हर क्षमता का चिह्न रखो: अवतल लेंस की क्षमता ऋणात्मक होती है।",
        ),
      },
      {
        id: "times",
        label: dioptres(p1 * p2),
        feedback: t(
          "Powers in contact add; they don't multiply.",
          "संपर्क में रखे लेंसों की क्षमताएँ जुड़ती हैं; गुणा नहीं होतीं।",
        ),
      },
      {
        id: "minus",
        label: dioptres(p1 - p2),
        feedback: t("Add the two powers, signs and all.", "दोनों क्षमताएँ चिह्नों समेत जोड़ो।"),
      },
    ];
    const options = distinctOptions({ id: "right", label: dioptres(p1 + p2) }, wrong);
    const a = dioptres(p1);
    const c = dioptres(p2);
    const ask = choiceQuestion(b, {
      prompt: t(
        `Thin lenses of power ${a.en} and ${c.en} are put together, touching. What single lens do they act like?`,
        `${a.hi} और ${c.hi} क्षमता के पतले लेंस एक-दूसरे से सटाकर रखे जाते हैं। वे किस अकेले लेंस की तरह काम करते हैं?`,
      ),
      options: settle(options, Math.round(Math.abs(p1) * 17 + Math.abs(p2) * 5)),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
