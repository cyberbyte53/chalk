import { column, family, noParams, space, t, theBoard } from "@chalk/author";
import { Level } from "@chalk/content";
import { QuestionAction, QuestionSignal } from "@chalk/prop";
import { ChoiceAction, choiceDef } from "@chalk/prop-basics";
import { numberLineDef } from "@chalk/prop-number-line";
import { Concept } from "../../concepts.gen";

/** The options, by id. */
const Option = { Yes: "yes", Three: "three", No: "no" } as const;

const doesItStop = t(
  "What is 1/3 as a decimal? Does it ever stop?",
  "दशमलव में 1/3 कितना है? क्या वह कभी रुकता है?",
);

/** Magnifying around 1/3 never lands on a tick: its address never ends. */
export const oneThirdNeverLands = family({
  level: Level.Easy,
  tests: [Concept.SuccessiveMagnification],
  params: noParams,
  build: (_params, b) => {
    const line = b.prop(numberLineDef, "line", {
      from: 0,
      to: 1,
      marks: [{ at: 1 / 3, label: "1/3" }],
    });
    const ask = b.prop(choiceDef, "everLand", {
      prompt: t(
        "If we keep magnifying around 1/3, will it ever land exactly on a tick?",
        "अगर हम 1/3 के आसपास आवर्धन करते रहें, तो क्या वह कभी ठीक किसी निशान पर आएगा?",
      ),
      options: [
        { id: Option.Yes, label: t("Yes, eventually", "हाँ, कभी न कभी"), feedback: doesItStop },
        {
          id: Option.Three,
          label: t("Yes, after 3 zooms", "हाँ, 3 ज़ूम के बाद"),
          feedback: doesItStop,
        },
        { id: Option.No, label: t("No, never", "नहीं, कभी नहीं") },
      ],
      answer: Option.No,
    });
    b.when(ask.on(QuestionSignal.Correct), theBoard.pass());
    b.witness(
      ask.learner(ChoiceAction.Select, { option: Option.No }),
      ask.learner(QuestionAction.Check),
    );
    b.noteCheck({
      steps: [
        ask.learner(ChoiceAction.Select, { option: Option.Yes }),
        ask.learner(QuestionAction.Check),
      ],
      feedback: doesItStop,
    });
    return column([line, ask, space()]);
  },
});
