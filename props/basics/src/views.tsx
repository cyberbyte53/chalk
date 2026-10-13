import type { PropViewProps } from "@chalk/player";
import { AnswerStatus } from "@chalk/prop";
import type { JSX } from "preact";
import type { ButtonState } from "./button";
import { Avatar } from "./cast";
import type { ChoiceState } from "./choice";
import type { GoalState } from "./goal";
import type { LineState } from "./line";
import type { TextState } from "./text";

// The player hands each view its own prop's state, already checked against that prop's schema.

export function TextView({ view, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as TextState;
  return <p class={`piece-text text-${s.style}`}>{s.text[locale]}</p>;
}

export function LineView({ view, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as LineState;
  return (
    <div class="piece-line">
      <Avatar character={s.character} />
      <p class="bubble">{s.line[locale]}</p>
    </div>
  );
}

export function ChoiceView({ view, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as ChoiceState;
  const isLocked = s.status === AnswerStatus.Correct;
  return (
    <div class="piece-question">
      <p class="question-prompt">{s.prompt[locale]}</p>
      <fieldset class="choices">
        {s.options.map((option) => (
          <button
            type="button"
            key={option.id}
            aria-pressed={s.selected === option.id}
            class={s.selected === option.id ? "choice is-selected" : "choice"}
            disabled={isLocked}
            onClick={() => call("select", { option: option.id })}
          >
            {option.label[locale]}
          </button>
        ))}
      </fieldset>
    </div>
  );
}

export function GoalView({ view, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as GoalState;
  return (
    <div class="piece-question">
      <p class="question-prompt">{s.prompt[locale]}</p>
    </div>
  );
}

export function ButtonView({ view, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as ButtonState;
  return (
    <button type="button" class="button" disabled={!s.isEnabled} onClick={() => call("press")}>
      {s.label[locale]}
    </button>
  );
}

/** The timer has nothing to show. */
export function NothingView(): null {
  return null;
}
