import { buildBoard, t, theBoard } from "@chalk/author";
import type { Lesson } from "@chalk/content";
import { choiceQuestion } from "@chalk/patterns";
import { SAY } from "@chalk/prop";
import { TextStyle, textDef } from "@chalk/prop-basics";
import { DecimalExpansionSignal, decimalExpansionDef } from "@chalk/prop-decimal";
import { LapRaceSignal, SweetShareSignal, lapRaceDef, sweetShareDef } from "@chalk/prop-primes";

/**
 * A small lesson on the library's own props, for the platform's tests (validator, runtime, server,
 * voice): built the way content is, so it stays what the phone runs. A fresh copy each call, since
 * tests change it and its rules are code.
 *
 * - `share`: 17 sweets among 5 friends. Words under it follow the box (an IS rule); when the game
 *   ends a question asks what's left; answering it passes the board.
 * - `race`: two runners, 4 and 6 minutes a round. Play glides the clock to 12, where they meet.
 * - `divide`: 22 ÷ 7, a digit a tap, until a remainder comes back.
 */
export function testLesson(): Lesson {
  const share = buildBoard("share", (b) => {
    const title = b.prop(textDef, "title", {
      style: TextStyle.Title,
      text: t("Share $17$ sweets among 5 friends.", "$17$ मिठाइयाँ 5 दोस्तों में बाँटो।"),
      speak: t("Share 17 sweets among 5 friends.", "17 मिठाइयाँ 5 दोस्तों में बाँटो।"),
    });
    const game = b.prop(sweetShareDef, "game", { sweets: 17, friends: 5 });
    const box = b.prop(textDef, "box", { text: t("17 in the box", "डिब्बे में 17") });
    b.is(box.field("text"), (at) => {
      const left = at(game).box as number;
      return { en: `${left} in the box`, hi: `डिब्बे में ${left}` };
    });
    const left = choiceQuestion(b, {
      name: "left",
      prompt: t("What is left in the box?", "डिब्बे में क्या बचा?"),
      options: [
        { id: "two", label: t("2", "2") },
        {
          id: "three",
          label: t("3", "3"),
          feedback: t("Count the box again.", "डिब्बा फिर गिनो।"),
        },
      ],
      answer: "two",
      isHidden: true,
      keepOrder: true,
    });
    b.when(theBoard.started, title.call(SAY));
    b.when(game.on(SweetShareSignal.Over), theBoard.show(left));
    return [title, game, box, left];
  });

  const race = buildBoard("race", (b) => {
    const title = b.prop(textDef, "title", {
      style: TextStyle.Title,
      text: t("When are both at the start together?", "दोनों साथ में शुरुआत पर कब होंगे?"),
    });
    const runners = b.prop(lapRaceDef, "runners", { lapA: 4, lapB: 6 });
    const met = b.prop(
      textDef,
      "met",
      { text: t("Together at 12 minutes.", "12 मिनट पर साथ में।") },
      { isHidden: true },
    );
    b.when(theBoard.started, title.call(SAY));
    b.when(runners.on(LapRaceSignal.Met), [theBoard.show(met), met.call(SAY)]);
    b.passWhen(runners.on(LapRaceSignal.Met));
    return [title, runners, met];
  });

  const divide = buildBoard("divide", (b) => {
    const title = b.prop(textDef, "title", {
      style: TextStyle.Title,
      text: t("Does 22 ÷ 7 end?", "क्या 22 ÷ 7 ख़त्म होता है?"),
    });
    const division = b.prop(decimalExpansionDef, "division", { numerator: 22, denominator: 7 });
    const repeats = b.prop(
      textDef,
      "repeats",
      { text: t("A remainder came back: it repeats.", "एक शेषफल लौट आया: यह दोहराता है।") },
      { isHidden: true },
    );
    b.when(theBoard.started, title.call(SAY));
    b.when(division.on(DecimalExpansionSignal.Repeated), [
      theBoard.show(repeats),
      repeats.call(SAY),
    ]);
    b.passWhen(division.on(DecimalExpansionSignal.Repeated));
    return [title, division, repeats];
  });

  return {
    id: "test-lesson",
    version: "1",
    title: t("A lesson for tests", "परीक्षण का पाठ"),
    concepts: ["division-lemma"],
    boards: [share.board, race.board, divide.board],
  };
}
