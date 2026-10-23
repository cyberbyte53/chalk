import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, distinctOptions, settle } from "@chalk/patterns";
import { solutionOf } from "@chalk/prop-linear-equations";
import { Concept } from "../../concepts.gen";
import { linesOf, pairParams, plane, seedOf } from "../../kit";

/** Read the solution off the drawing: where the two lines meet (NCERT 3.3, Exercise 3.2 Q1 and Q4). */
export const readTheCrossing = family({
  level: Level.Easy,
  tests: [Concept.GraphicalMethod],
  params: pairParams,
  build: (p, bk) => {
    const [l1, l2] = linesOf(p);
    const s = solutionOf(l1, l2);
    if (s === null) throw new Error("read-the-crossing: the lines must cross");
    const [x, y] = [s[0].valueOf(), s[1].valueOf()];
    const pad = 3;
    const graph = plane(bk, "graph", [l1, l2], {
      xMin: Math.min(-1, x - pad),
      xMax: Math.max(6, x + pad),
      yMin: Math.min(-1, y - pad),
      yMax: Math.max(6, y + pad),
    });
    bk.standsFor(graph, "the two lines of the pair drawn on one graph, crossing at one point");
    const at = (a: number, b: number) => t(`$(${a}, ${b})$`, `$(${a}, ${b})$`);
    const check = t(
      "The first number is how far along the $x$-axis, the second how far up. Find the point that is on both lines.",
      "पहली संख्या $x$-अक्ष पर कितनी दूर, दूसरी कितना ऊपर। वह बिंदु खोजो जो दोनों रेखाओं पर हो।",
    );
    const options = distinctOptions({ id: "right", label: at(x, y) }, [
      { id: "swap", label: at(y, x), feedback: check },
      { id: "off", label: at(x + 1, y), feedback: check },
    ]);
    const ask = choiceQuestion(bk, {
      prompt: t("Where do the two lines meet?", "दोनों रेखाएँ कहाँ मिलती हैं?"),
      options: settle(options, seedOf(p) + 7),
      answer: "right",
    });
    return column([graph, ask, space()]);
  },
});
