/** @jsxImportSource preact */
import { type InputTags, tagsOf } from "@chalk/prop";
import type { ComponentChildren, JSX } from "preact";

/**
 * The inputs every prop draws with. Each says what it does (`does(…)` for a button the player
 * presses, `says(…)` for one whose own handler works out the arguments), spread on as its props:
 * `<SymbolButton symbol="+" label="One more round" {...does(sweetShare.actions.giveRound)} />`.
 * An input shows a value (a stepper's number) as part of what it is.
 */

/** A round button with a symbol on it (props show no words; the label is for screen readers). */
export function SymbolButton({
  symbol,
  label,
  isEnabled = true,
  isWide = false,
  isOn = false,
  ...tags
}: {
  symbol: ComponentChildren;
  label: string;
  isEnabled?: boolean;
  /** For a word or two on it instead of a symbol. */
  isWide?: boolean;
  /** Drawn pressed in: the option that is chosen. */
  isOn?: boolean;
} & InputTags): JSX.Element {
  const classes = ["draw-button"];
  if (isWide) classes.push("is-wide");
  if (isOn) classes.push("is-on");
  return (
    <button
      type="button"
      class={classes.join(" ")}
      aria-label={label}
      aria-pressed={isOn}
      disabled={!isEnabled}
      {...tagsOf(tags)}
    >
      {symbol}
    </button>
  );
}

/**
 * One of a stepper's own − and + buttons, named under its stepper (`setFriends/less`,
 * `setFriends/more`), so it is pressed by name like any input.
 */
function StepButton({
  symbol,
  label,
  isEnabled,
  onPress,
  ...tags
}: {
  symbol: string;
  label: string;
  isEnabled: boolean;
  onPress: () => void;
} & InputTags): JSX.Element {
  return (
    <button
      type="button"
      class="draw-button"
      aria-label={label}
      disabled={!isEnabled}
      {...tagsOf(tags)}
      onClick={onPress}
    >
      {symbol}
    </button>
  );
}

/** − value +, for a whole number the learner nudges. Says what it does: `says(action)`. */
export function Stepper({
  name,
  value,
  min,
  max,
  onChange,
  step = 1,
  ...tags
}: {
  /** What the number is called, maths only ("a", "b", "n"). */
  name: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  step?: number;
} & InputTags): JSX.Element {
  return (
    <div class="draw-stepper" {...tagsOf(tags)} data-shows={JSON.stringify(value)}>
      <StepButton
        symbol="−"
        label={`${name} − ${step}`}
        {...tags}
        data-part={`${tags["data-part"]}/less`}
        isEnabled={value > min}
        onPress={() => onChange(Math.max(min, value - step))}
      />
      <span class="draw-stepper-value">
        <span class="draw-name">{name}</span> = {value}
      </span>
      <StepButton
        symbol="+"
        label={`${name} + ${step}`}
        {...tags}
        data-part={`${tags["data-part"]}/more`}
        isEnabled={value < max}
        onPress={() => onChange(Math.min(max, value + step))}
      />
    </div>
  );
}

/**
 * A box to type a whole number into: the value is sent when it is a whole number in range, and
 * snaps back otherwise. Says what it does: `says(action)`.
 */
export function NumberField({
  name,
  value,
  min,
  max,
  onChange,
  ...tags
}: {
  name: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
} & InputTags): JSX.Element {
  return (
    <label class="draw-number" {...tagsOf(tags)} data-shows={JSON.stringify(value)}>
      <span class="draw-name">{name}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          const input = event.target as HTMLInputElement;
          const next = Number(input.value);
          if (Number.isInteger(next) && next >= min && next <= max) onChange(next);
          else input.value = String(value);
        }}
      />
    </label>
  );
}
