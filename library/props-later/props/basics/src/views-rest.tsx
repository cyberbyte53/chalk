import {
  AnswerFeedback,
  type PropViewProps,
  RichText,
  does,
  plainText,
  says,
  t,
  useFitColumns,
  usePlayMode,
} from "@chalk/player";
import { AnswerStatus, QuestionAction, cssColor } from "@chalk/prop";
import type { JSX } from "preact";
import { ButtonAction, type ButtonState } from "./button";
import { Avatar } from "./cast";
import { ChoiceAction, type ChoiceState } from "./choice";
import type { GoalState } from "./goal";
import type { LineState } from "./line";
import { MultiChoiceAction, type MultiChoiceState } from "./multi-choice";
import { OrderStepsAction, type OrderStepsState } from "./order-steps";
import type { TextState } from "./text";

// The player hands each view its own prop's state, already checked against that prop's schema.

/**
 * In a play mode a wrong answer waits for Try again (the banner under the board): until then the
 * question can't be answered or checked again.
 */
// Parked from views.tsx: the views of the parked basics props.

export function LineView({ view, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as LineState;
  return (
    <div class="piece-line">
      <Avatar character={s.character} />
      <p class="bubble">
        <RichText text={s.line[locale]} />
      </p>
    </div>
  );
}

/** An option's look: picked, and once checked, right or wrong. */
export function GoalView({ view, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as GoalState & { canCheck: boolean };
  const isHeld = useIsHeld(s.status);
  return (
    <div class="piece-question">
      <p class="question-prompt">
        <RichText text={s.prompt[locale]} />
      </p>
      <button
        type="button"
        class="question-check"
        disabled={!s.canCheck || isHeld}
        {...does(QuestionAction.Check)}
      >
        {t(locale, s.status === AnswerStatus.Wrong ? "tryAgain" : "check")}
      </button>
      <AnswerFeedback status={s.status} feedback={s.feedback} locale={locale} />
    </div>
  );
}

export function ButtonView({ view, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ButtonState;
  return (
    <button
      type="button"
      class="button"
      aria-label={plainText(s.label[locale] ?? "")}
      disabled={!s.isEnabled}
      {...does(ButtonAction.Press)}
    >
      <RichText text={s.label[locale]} />
    </button>
  );
}

/** The timer has nothing to show. */
export function NothingView(): null {
  return null;
}
