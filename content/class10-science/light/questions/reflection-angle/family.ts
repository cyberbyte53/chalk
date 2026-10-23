import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** Where the question measures the given angle from. */
const From = { Normal: "normal", Surface: "surface" } as const;

/** What the question asks for. */
const Ask = { Reflection: "reflection", Between: "between" } as const;

/**
 * A ray meets a plane mirror at a given angle (from the normal, or from the surface: the usual trap);
 * find the angle of reflection, or the angle between the incident and reflected rays.
 */
export const reflectionAngle = family({
  level: Level.Easy,
  tests: [Concept.ReflectionAndImages],
  params: z
    .object({
      angle: z.number().int().min(10).max(80),
      from: z.nativeEnum(From),
      ask: z.nativeEnum(Ask),
    })
    .strict(),
  build: ({ angle, from, ask }, b) => {
    const i = from === From.Normal ? angle : 90 - angle;
    const right = ask === Ask.Reflection ? i : 2 * i;
    const given =
      from === From.Normal
        ? t(`at ${angle}° to the normal`, `अभिलंब से ${angle}° पर`)
        : t(`making ${angle}° with the mirror's surface`, `दर्पण की सतह से ${angle}° बनाती हुई`);
    const asked =
      ask === Ask.Reflection
        ? t("The angle of reflection is…", "परावर्तन कोण है…")
        : t(
            "The angle between the incident and reflected rays is…",
            "आपतित और परावर्तित किरणों के बीच का कोण है…",
          );
    const deg = (v: number) => t(`${v}°`, `${v}°`);
    const options: Option[] = [{ id: "right", label: deg(right) }];
    if (from === From.Surface) {
      options.push({
        id: "surface",
        label: deg(ask === Ask.Reflection ? angle : 2 * angle),
        feedback: t(
          `${angle}° is the angle with the surface. Angles of incidence and reflection are measured from the normal: i = 90° − ${angle}° = ${i}°.`,
          `${angle}° सतह से बना कोण है। आपतन और परावर्तन कोण अभिलंब से नापे जाते हैं: i = 90° − ${angle}° = ${i}°।`,
        ),
      });
    }
    if (ask === Ask.Reflection) {
      options.push({
        id: "double",
        label: deg(2 * i),
        feedback: t(
          `${2 * i}° is the angle between the two rays. The angle of reflection alone equals the angle of incidence, ${i}°.`,
          `${2 * i}° दोनों किरणों के बीच का कोण है। अकेला परावर्तन कोण आपतन कोण के बराबर है, ${i}°।`,
        ),
      });
    } else {
      options.push({
        id: "single",
        label: deg(i),
        feedback: t(
          `${i}° is the angle of reflection. The two rays sit on either side of the normal, so the angle between them is i + r = ${2 * i}°.`,
          `${i}° परावर्तन कोण है। दोनों किरणें अभिलंब के दोनों ओर हैं, इसलिए उनके बीच का कोण i + r = ${2 * i}° है।`,
        ),
      });
    }
    // At 30° from the surface the "surface" slip and the "single" slip give the same number: keep one.
    const unique = options.filter(
      (o, k) => options.findIndex((p) => p.label.en === o.label.en) === k,
    );
    options.length = 0;
    options.push(...unique);
    if (options.length < 3 && !options.some((o) => o.label.en === "90°")) {
      options.push({
        id: "ninety",
        label: deg(90),
        feedback: t(
          "90° is the angle between the mirror and its normal, not an angle the ray makes.",
          "90° दर्पण और अभिलंब के बीच का कोण है, किरण का बनाया कोण नहीं।",
        ),
      });
    }
    if (options.length < 3) {
      options.push({
        id: "straight",
        label: deg(180),
        feedback: t(
          `180° would put the two rays in one straight line. They sit on either side of the normal, so the angle between them is i + r = ${2 * i}°.`,
          `180° पर दोनों किरणें एक सीधी रेखा में होतीं। वे अभिलंब के दोनों ओर हैं, इसलिए उनके बीच का कोण i + r = ${2 * i}° है।`,
        ),
      });
    }
    const ask1 = choiceQuestion(b, {
      prompt: t(
        `A ray of light strikes a plane mirror ${given.en}. ${asked.en}`,
        `प्रकाश की एक किरण समतल दर्पण पर ${given.hi} पड़ती है। ${asked.hi}`,
      ),
      options: settle(options, angle * 7 + (from === From.Normal ? 1 : 2)),
      answer: "right",
    });
    return column([ask1, space()]);
  },
});
