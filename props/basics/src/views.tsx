import { AnswerFeedback, type PropViewProps, RichText, t } from "@chalk/player";
import { AnswerStatus, QuestionAction, cssColor } from "@chalk/prop";
import type { JSX } from "preact";
import { ButtonAction, type ButtonState } from "./button";
import { Avatar } from "./cast";
import { ChoiceAction, type ChoiceState } from "./choice";
import type { GoalState } from "./goal";
import type { LineState } from "./line";
import type { TextState } from "./text";

// The player hands each view its own prop's state, already checked against that prop's schema.

export function TextView({ view, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as TextState;
  return (
    <p
      class={`piece-text text-${s.style}${s.color === null ? "" : " has-color"}`}
      style={s.color === null ? undefined : { "--tone": cssColor(s.color) }}
    >
      <RichText text={s.text[locale]} />
    </p>
  );
}

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
function choiceClass(s: ChoiceState, option: string): string {
  if (s.selected !== option) return "choice";
  if (s.status === AnswerStatus.Correct) return "choice is-selected is-right";
  if (s.status === AnswerStatus.Wrong) return "choice is-selected is-wrong";
  return "choice is-selected";
}

/** Two or four short options sit side by side (Yes / No); anything else is one column. */
const PAIR_LABEL = 14;
function isInPairs(s: ChoiceState, locale: PropViewProps["locale"]): boolean {
  return (
    (s.options.length === 2 || s.options.length === 4) &&
    s.options.every((option) => (option.label[locale] ?? "").length <= PAIR_LABEL)
  );
}

/** Tapping an option answers: it is picked and checked at once, and the feedback shows below. */
export function ChoiceView({ view, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as ChoiceState;
  const isLocked = s.status === AnswerStatus.Correct;
  const answer = (option: string) => {
    call(ChoiceAction.Select, { option });
    call(QuestionAction.Check);
  };
  return (
    <div class="piece-question">
      <p class="question-prompt">
        <RichText text={s.prompt[locale]} />
      </p>
      <fieldset class={isInPairs(s, locale) ? "choices is-pairs" : "choices"}>
        {s.options.map((option) => (
          <button
            type="button"
            key={option.id}
            aria-pressed={s.selected === option.id}
            class={choiceClass(s, option.id)}
            disabled={isLocked}
            onClick={() => answer(option.id)}
          >
            <RichText text={option.label[locale]} />
          </button>
        ))}
      </fieldset>
      <AnswerFeedback status={s.status} feedback={s.feedback} locale={locale} />
    </div>
  );
}

/** "Get that prop into the goal": the learner works the prop, then presses this question's Check. */
export function GoalView({ view, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as GoalState & { canCheck: boolean };
  return (
    <div class="piece-question">
      <p class="question-prompt">
        <RichText text={s.prompt[locale]} />
      </p>
      <button
        type="button"
        class="question-check"
        disabled={!s.canCheck}
        onClick={() => call(QuestionAction.Check)}
      >
        {t(locale, s.status === AnswerStatus.Wrong ? "tryAgain" : "check")}
      </button>
      <AnswerFeedback status={s.status} feedback={s.feedback} locale={locale} />
    </div>
  );
}

export function ButtonView({ view, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as ButtonState;
  return (
    <button
      type="button"
      class="button"
      disabled={!s.isEnabled}
      onClick={() => call(ButtonAction.Press)}
    >
      <RichText text={s.label[locale]} />
    </button>
  );
}

/** The timer has nothing to show. */
export function NothingView(): null {
  return null;
}
