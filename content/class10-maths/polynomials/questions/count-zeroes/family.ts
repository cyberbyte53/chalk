import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import {
  type Option,
  choiceQuestion,
  distinctOptions,
  parsePoly,
  settle,
} from "@chalk/content-source/patterns";
import { PlaneForm, degreeOf, realZeroes, valueAt, zeroPlaneDef } from "@chalk/prop-polynomials";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** How many zeroes, read off the graph (NCERT Example 1 and Ex 2.1): touches count once. */
export const countZeroes = family({
  level: Level.Easy,
  tests: [Concept.ZeroesOnTheGraph],
  params: z.object({ coefficients: z.string() }).strict(),
  build: ({ coefficients }, b) => {
    const p = parsePoly(coefficients);
    const zeroes = realZeroes(p);
    const count = zeroes.length;
    const touches = zeroes.filter((zero) => zero.multiplicity % 2 === 0).length;
    // A window that shows every zero with room around it, and the curve's turns.
    const xs = zeroes.map((zero) => zero.x);
    const xMin = Math.floor(Math.min(-2, ...xs) - 1.5);
    const xMax = Math.ceil(Math.max(2, ...xs) + 1.5);
    const samples = Array.from({ length: 41 }, (_, i) =>
      valueAt(p, xMin + ((xMax - xMin) * i) / 40),
    );
    const inner = samples.slice(5, 36);
    const yMin = Math.max(-12, Math.floor(Math.min(-2, ...inner) - 1));
    const yMax = Math.min(12, Math.ceil(Math.max(2, ...inner) + 1));
    const label = (n: number) => t(`${n}`, `${n}`);
    const wrong: Option[] = [];
    if (touches > 0) {
      wrong.push({
        id: "double",
        label: label(count + touches),
        feedback: t(
          "Where the curve only touches the $x$-axis, that is one point: count it once.",
          "जहाँ वक्र $x$-अक्ष को केवल छूता है, वह एक बिंदु है: उसे एक बार गिनो।",
        ),
      });
    }
    wrong.push({
      id: "degree",
      label: label(degreeOf(p)),
      feedback: t(
        "The degree is the most zeroes it could have. Count where this graph actually meets the $x$-axis.",
        "घात अधिकतम संभव शून्यकों की संख्या है। गिनो कि यह ग्राफ़ सचमुच $x$-अक्ष से कहाँ मिलता है।",
      ),
    });
    wrong.push({
      id: "less",
      label: label(Math.max(0, count - 1)),
      feedback: t(
        "Look again along the whole $x$-axis, the origin included.",
        "पूरे $x$-अक्ष पर फिर से देखो, मूलबिंदु समेत।",
      ),
    });
    wrong.push({
      id: "more",
      label: label(count + 1),
      feedback: t(
        "Only points on the $x$-axis count, not where the curve crosses the $y$-axis.",
        "केवल $x$-अक्ष के बिंदु गिने जाते हैं, $y$-अक्ष को काटने वाले नहीं।",
      ),
    });
    const ask = choiceQuestion(b, {
      prompt: t(
        "This is the graph of $y = p(x)$. How many zeroes does $p(x)$ have?",
        "यह $y = p(x)$ का ग्राफ़ है। $p(x)$ के कितने शून्यक हैं?",
      ),
      options: settle(
        distinctOptions({ id: "right", label: label(count) }, wrong),
        p.length * 7 + count,
      ),
      answer: "right",
    });
    return column([
      b.prop(zeroPlaneDef, "graph", {
        form: PlaneForm.Coefficients,
        fixed: p,
        isDraggable: false,
        isEquationShown: false,
        window: { xMin, xMax, yMin, yMax },
      }),
      ask,
      space(),
    ]);
  },
});
