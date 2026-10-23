import type { ComponentChildren, JSX } from "preact";

/** A small round button with a symbol or a short word on it. */
export function SymbolButton({
  symbol,
  label,
  onPress,
  isEnabled = true,
  isWide = false,
  isPrimary = false,
  part,
}: {
  symbol: ComponentChildren;
  label: string;
  onPress: () => void;
  isEnabled?: boolean;
  isWide?: boolean;
  isPrimary?: boolean;
  /** What `point` calls it (the observation's element id). */
  part?: string;
}): JSX.Element {
  const cls = ["le-button", isWide ? "is-wide" : "", isPrimary ? "is-primary" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type="button"
      class={cls}
      aria-label={label}
      disabled={!isEnabled}
      data-part={part}
      onClick={onPress}
    >
      {symbol}
    </button>
  );
}

/** − value +, for a number the learner can nudge. */
export function Stepper({
  name,
  value,
  shown,
  min,
  max,
  onChange,
  step = 1,
  more,
  less,
  part,
}: {
  name: ComponentChildren;
  value: number;
  /** The value as it should read (a fraction stays a fraction). */
  shown: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
  step?: number;
  /** Screen-reader words for the two buttons. */
  more: string;
  less: string;
  part?: string;
}): JSX.Element {
  const clamp = (v: number) => Math.min(max, Math.max(min, Number(v.toFixed(6))));
  return (
    <div class="le-stepper" data-part={part}>
      <SymbolButton
        symbol="−"
        label={less}
        isEnabled={clamp(value - step) < value}
        onPress={() => onChange(clamp(value - step))}
      />
      <span class="le-stepper-value">
        <span class="le-name">{name}</span> = {shown}
      </span>
      <SymbolButton
        symbol="+"
        label={more}
        isEnabled={clamp(value + step) > value}
        onPress={() => onChange(clamp(value + step))}
      />
    </div>
  );
}
