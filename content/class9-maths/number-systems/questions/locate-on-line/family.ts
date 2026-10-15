import { column, decimal, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { goalQuestion, reach } from "@chalk/content-source/patterns";
import { NumberLineAction, numberLineDef } from "@chalk/prop-number-line";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** Put the marker exactly on a decimal, zooming in as far as its digits need. */
export const locateOnLine = family({
  level: Level.Medium,
  tests: [Concept.SuccessiveMagnification],
  params: z.object({ target: decimal, from: z.number(), to: z.number() }).strict(),
  build: ({ target, from, to }, b) => {
    const line = b.prop(numberLineDef, "line", {
      from,
      to,
      showMarker: true,
      marker: (from + to) / 2,
      isZoomable: true,
    });
    b.studentOnly(line.action(NumberLineAction.MoveMarker));
    const marker = line.field("marker");
    const early = target.round(target.places - 1);
    const swapped = target.swapLastTwo();
    const goal = goalQuestion(b, {
      about: line,
      prompt: t(
        `Put the marker exactly on ${target}. Zoom in as far as you need.`,
        `मार्कर को ठीक ${target} पर रखो। जितना ज़रूरी हो उतना ज़ूम करो।`,
      ),
      isMet: marker.isAt(target),
      solve: reach(line, target),
      notes: [
        {
          when: marker.isAt(early.at(target.places)),
          say: t(
            `That's ${early}: you stopped one zoom early. ${target} has ${target.places} digits after the point.`,
            `यह ${early} है: तुम एक ज़ूम पहले रुक गए। ${target} में दशमलव के बाद ${target.places} अंक हैं।`,
          ),
          reach: reach(line, early),
        },
        {
          when: marker.isAt(swapped),
          say: t(
            `That's ${swapped}. Read the digits of ${target} in order, one per zoom.`,
            `यह ${swapped} है। ${target} के अंक क्रम से पढ़ो, हर ज़ूम पर एक।`,
          ),
          reach: reach(line, swapped),
        },
      ],
    });
    return column([line, goal, space()]);
  },
});
