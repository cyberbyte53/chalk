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
import { ChoiceAction, type ChoiceState } from "./choice";
import { MultiChoiceAction, type MultiChoiceState } from "./multi-choice";
import { OrderStepsAction, type OrderStepsState } from "./order-steps";
import type { TextState } from "./text";

// The player hands each view its own prop's state, already checked against that prop's schema.

/**
 * In a play mode a wrong answer waits for Try again (the banner under the board): until then the
 * question can't be answered or checked again.
 */
function useIsHeld(status: AnswerStatus): boolean {
  return usePlayMode() !== undefined && status === AnswerStatus.Wrong;
}

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

function choiceClass(s: ChoiceState, option: string): string {
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
  return options.map((option) => option.label[locale] ?? "").join("\n");
}

/** Tapping an option answers: it is picked and checked at once, and the feedback shows below. */
export function ChoiceView({ view, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as ChoiceState;
  const isHeld = useIsHeld(s.status);
  const isLocked = s.status === AnswerStatus.Correct || isHeld;
  const answer = (option: string) => {
    call(ChoiceAction.Select, { option });
    call(QuestionAction.Check);
  };
  const [fit, columns] = useFitColumns<HTMLFieldSetElement>(
    s.options.length,
    labelsKey(s.options, locale),
  );
  return (
    <div class="piece-question">
      <p class="question-prompt">
        <RichText text={s.prompt[locale]} />
      </p>
      <fieldset ref={fit} class="choices" style={{ "--columns": String(columns) }}>
        {s.options.map((option) => (
          <button
            type="button"
            key={option.id}
            aria-pressed={s.selected === option.id}
            aria-label={plainText(option.label[locale] ?? "")}
            class={choiceClass(s, option.id)}
            disabled={isLocked}
            {...says(ChoiceAction.Select, QuestionAction.Check)}
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

/** A multi-choice option's look: picked, and once checked, right or wrong. */
function multiClass(s: MultiChoiceState, option: string): string {
  if (!s.selected.includes(option)) return "choice";
  if (s.status === AnswerStatus.Correct) return "choice is-selected is-right";
  if (s.status === AnswerStatus.Wrong) return "choice is-selected is-wrong";
  return "choice is-selected";
}

/** Pick every right option, then Check: tapping only picks, so one tap gives nothing away. */
export function MultiChoiceView({ view, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as MultiChoiceState & { canCheck: boolean };
  const isHeld = useIsHeld(s.status);
  const isLocked = s.status === AnswerStatus.Correct || isHeld;
  const [fit, columns] = useFitColumns<HTMLFieldSetElement>(
    s.options.length,
    labelsKey(s.options, locale),
  );
  return (
    <div class="piece-question">
      <p class="question-prompt">
        <RichText text={s.prompt[locale]} />
      </p>
      <fieldset ref={fit} class="choices" style={{ "--columns": String(columns) }}>
        {s.options.map((option) => (
          <button
            type="button"
            key={option.id}
            aria-pressed={s.selected.includes(option.id)}
            aria-label={plainText(option.label[locale] ?? "")}
            class={multiClass(s, option.id)}
            disabled={isLocked}
            {...does(MultiChoiceAction.Toggle, { option: option.id })}
          >
            <RichText text={option.label[locale]} />
          </button>
        ))}
      </fieldset>
      {!isLocked && (
        <button
          type="button"
          class="question-check"
          disabled={!s.canCheck || isHeld}
          {...does(QuestionAction.Check)}
        >
          {t(locale, s.status === AnswerStatus.Wrong ? "tryAgain" : "check")}
        </button>
      )}
      <AnswerFeedback status={s.status} feedback={s.feedback} locale={locale} />
    </div>
  );
}

/**
 * Put a proof's steps in order: the lines placed so far, numbered, then the steps still to place.
 * Tap a step to add it as the next line; tap a line to take it back.
 */
export function OrderStepsView({ view, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as OrderStepsState & { canCheck: boolean };
  const isHeld = useIsHeld(s.status);
  const isLocked = s.status === AnswerStatus.Correct || isHeld;
  const byId = new Map(s.steps.map((st) => [st.id, st]));
  const rest = s.steps.filter((st) => !s.placed.includes(st.id));
  return (
    <div class="piece-question">
      <p class="question-prompt">
        <RichText text={s.prompt[locale]} />
      </p>
      <ol class={isLocked ? "order-lines is-right" : "order-lines"}>
        {s.placed.map((id) => {
          const step = byId.get(id);
          if (step === undefined) return null;
          return (
            <li key={id}>
              <button
                type="button"
                class="order-line"
                disabled={isLocked}
                aria-label={`Take back: ${plainText(step.label[locale] ?? "")}`}
                {...does(OrderStepsAction.Remove, { step: id })}
              >
                <RichText text={step.label[locale]} />
              </button>
            </li>
          );
        })}
        {!isLocked &&
          Array.from({ length: s.steps.length - s.placed.length }, (_, k) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: empty slots, in order
            <li key={`slot${k}`} class="order-slot" />
          ))}
      </ol>
      {rest.length > 0 && (
        <div class="order-pool">
          {rest.map((step) => (
            <button
              type="button"
              key={step.id}
              class="choice order-step"
              aria-label={plainText(step.label[locale] ?? "")}
              {...does(OrderStepsAction.Place, { step: step.id })}
            >
              <RichText text={step.label[locale]} />
            </button>
          ))}
        </div>
      )}
      {!isLocked && (
        <button
          type="button"
          class="question-check"
          disabled={!s.canCheck || isHeld}
          {...does(QuestionAction.Check)}
        >
          {t(locale, s.status === AnswerStatus.Wrong ? "tryAgain" : "check")}
        </button>
      )}
      <AnswerFeedback status={s.status} feedback={s.feedback} locale={locale} />
    </div>
  );
}
