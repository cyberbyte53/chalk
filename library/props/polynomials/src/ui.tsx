import type { ComponentChildren, JSX } from "preact";

/** A small round button with a symbol on it (props show no words; the label is for screen readers). */
export function SymbolButton({
  symbol,
  label,
  onPress,
  isEnabled = true,
  isWide = false,
  part,
}: {
  symbol: ComponentChildren;
  label: string;
  onPress: () => void;
  isEnabled?: boolean;
  isWide?: boolean;
  /** What `point` calls it (the observation's element id). */
  part?: string;
}): JSX.Element {
  return (
    <button
      type="button"
      class={isWide ? "pp-button is-wide" : "pp-button"}
      aria-label={label}
      disabled={!isEnabled}
      data-part={part}
      onClick={onPress}
    >
      {symbol}
    </button>
  );
}

/** − value +, for a number the learner can nudge; `skip` is a value it steps over (a = 0). */
export function Stepper({
  name,
  value,
  min,
  max,
  onChange,
  step = 1,
  skip,
  part,
  shown,
}: {
  name: string;
  value: number;
  /** How the value is written, when not as plain digits (½, −3.6). */
  shown?: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
  step?: number;
  skip?: number;
  part?: string;
}): JSX.Element {
  const next = (by: number) => {
    let to = value + by;
    if (skip !== undefined && to === skip) to += by;
    return Math.min(max, Math.max(min, to));
  };
  return (
    <div class="pp-stepper" data-part={part}>
      <SymbolButton
        symbol="−"
        label={`${name} − ${step}`}
        isEnabled={next(-step) < value}
        onPress={() => onChange(next(-step))}
      />
      <span class="pp-stepper-value">
        <span class="pp-name">{name}</span> = {shown ?? value}
      </span>
      <SymbolButton
        symbol="+"
        label={`${name} + ${step}`}
        isEnabled={next(step) > value}
        onPress={() => onChange(next(step))}
      />
    </div>
  );
}
