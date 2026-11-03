import {
  AnswerFeedback,
  type PropViewProps,
  RichText,
  plainText,
  t,
  useFitColumns,
  usePlayMode,
} from "@chalk/player";
import { AnswerStatus, cssColor, does, says, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { choice, type goal, type text } from "./props";

// The player hands each view what its own prop reads now, already checked against its schema.

type ChoiceView = PropViewProps<typeof choice>["view"];

/**
 * In a play mode a wrong answer waits for Try again (the banner under the board): until then the
 * question can't be answered or checked again.
 */
function useIsHeld(status: AnswerStatus): boolean {
  return usePlayMode() !== undefined && status === AnswerStatus.Wrong;
}

export function TextView({ view, locale }: PropViewProps<typeof text>): JSX.Element {
  const s = view;
  return (
    <p
      class={`piece-text text-${s.style}${s.color === null ? "" : " has-color"}`}
      style={s.color === null ? undefined : { "--tone": cssColor(s.color) }}
      {...shows("text", s.text[locale])}
    >
      <RichText text={s.text[locale]} />
    </p>
  );
}

function choiceClass(s: ChoiceView, option: string): string {
  if (s.selected !== option) return "choice";
  if (s.status === AnswerStatus.Correct) return "choice is-selected is-right";
  if (s.status === AnswerStatus.Wrong) return "choice is-selected is-wrong";
  return "choice is-selected";
}

/** The labels in this locale, so the options are measured again when they change. */
function labelsKey(
  options: readonly { label: { en: string; hi: string } }[],
  locale: PropViewProps["locale"],
): string {
  return options.map((option) => option.label[locale]).join("\n");
}

/** Tapping an option answers: it is picked and checked at once, and the feedback shows below. */
export function ChoiceView({ view, locale, call }: PropViewProps<typeof choice>): JSX.Element {
  const s = view;
  const isHeld = useIsHeld(s.status);
  const isLocked = s.status === AnswerStatus.Correct || isHeld;
  const answer = (option: string) => {
    call(choice.actions.select, { option });
    call(choice.actions.check);
  };
  const [fit, columns] = useFitColumns<HTMLFieldSetElement>(
    s.options.length,
    labelsKey(s.options, locale),
  );
  return (
    <div class="piece-question">
      <p class="question-prompt" {...shows("prompt", s.prompt[locale])}>
        <RichText text={s.prompt[locale]} />
      </p>
      <fieldset ref={fit} class="choices" style={{ "--columns": String(columns) }}>
        {s.options.map((option) => (
          <button
            type="button"
            key={option.id}
            aria-pressed={s.selected === option.id}
            aria-label={plainText(option.label[locale])}
            class={choiceClass(s, option.id)}
            disabled={isLocked}
            {...says([choice.actions.select, choice.actions.check], option.id)}
            {...shows(`option:${option.id}`, option.label[locale])}
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

/**
 * A question answered in another prop: its prompt, then the result. The prop the learner works in
 * is drawn beside it on the board; its Check is the bar's (`checkedBy: CheckedBy.Bar`), always in
 * reach under the board.
 */
export function GoalView({ view, locale }: PropViewProps<typeof goal>): JSX.Element {
  const s = view;
  return (
    <div class="piece-question">
      <p class="question-prompt" {...shows("prompt", s.prompt[locale])}>
        <RichText text={s.prompt[locale]} />
      </p>
      <AnswerFeedback status={s.status} feedback={s.feedback} locale={locale} />
    </div>
  );
}
