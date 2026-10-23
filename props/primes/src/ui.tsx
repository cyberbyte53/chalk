import type { ComponentChildren, JSX } from "preact";
import { type Bag, primesIn, toneOf } from "./arithmetic";

/** One prime factor: a bead with the prime on it, in its prime's colour. */
export function Bead({
  prime,
  isGhost = false,
  isMarked = false,
  part,
}: {
  prime: number;
  /** Drawn hollow: a bead that would have to be added. */
  isGhost?: boolean;
  /** Ringed: the bead the page is talking about. */
  isMarked?: boolean;
  part?: string;
}): JSX.Element {
  const classes = ["pr-bead", `pr-${toneOf(prime)}`];
  if (isGhost) classes.push("is-ghost");
  if (isMarked) classes.push("is-marked");
  if (prime >= 100) classes.push("is-long");
  return (
    <span class={classes.join(" ")} data-part={part}>
      {prime}
    </span>
  );
}

/** A bag of primes: one row of beads per prime, smallest prime first. */
export function BagRows({
  bag,
  marked = [],
  label,
  part,
}: {
  bag: Bag;
  /** Primes whose beads are ringed. */
  marked?: readonly number[];
  label: string;
  /** What `point` calls it (the observation's element id). */
  part?: string;
}): JSX.Element {
  const primes = primesIn(bag);
  return (
    <div class="pr-bag" role="img" aria-label={label} data-part={part}>
      {primes.length === 0 && <span class="pr-empty">1</span>}
      {primes.map((p) => (
        <div class="pr-bag-row" key={p} data-part={`prime:${p}`}>
          {Array.from({ length: bag[p] ?? 0 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: identical items that never reorder
            <Bead key={i} prime={p} isMarked={marked.includes(p)} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * A bag as towers on a prime axis: primes left to right, smallest first, each a stack of its beads
 * with the prime under it. Height is the power, the same picture as prime-towers.
 */
export function BagTowers({
  bag,
  label,
  part,
}: {
  bag: Bag;
  label: string;
  /** What `point` calls it (the observation's element id). */
  part?: string;
}): JSX.Element {
  const primes = primesIn(bag);
  return (
    <div class="pr-btowers" role="img" aria-label={label} data-part={part}>
      {primes.length === 0 && <span class="pr-empty">1</span>}
      {primes.map((p) => (
        <div class="pr-btower" key={p} data-part={`prime:${p}`}>
          <div class="pr-btower-stack">
            {Array.from({ length: bag[p] ?? 0 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: identical items that never reorder
              <Bead key={i} prime={p} />
            ))}
          </div>
          <span class="pr-btower-prime">{p}</span>
        </div>
      ))}
    </div>
  );
}

/** A small round button with a symbol on it (props show no words; the label is for screen readers). */
export function SymbolButton({
  symbol,
  label,
  onPress,
  isEnabled = true,
  isWide = false,
  isOn = false,
  part,
}: {
  symbol: ComponentChildren;
  label: string;
  onPress: () => void;
  isEnabled?: boolean;
  isWide?: boolean;
  /** Drawn pressed in: the option that is chosen. */
  isOn?: boolean;
  part?: string;
}): JSX.Element {
  const classes = ["pr-button"];
  if (isWide) classes.push("is-wide");
  if (isOn) classes.push("is-on");
  return (
    <button
      type="button"
      class={classes.join(" ")}
      aria-label={label}
      aria-pressed={isOn}
      disabled={!isEnabled}
      data-part={part}
      onClick={onPress}
    >
      {symbol}
    </button>
  );
}

/** − value +, for a whole number the learner can nudge. */
export function Stepper({
  name,
  value,
  min,
  max,
  onChange,
  step = 1,
  part,
}: {
  /** What the number is called, maths only ("a", "b", "n"). */
  name: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  step?: number;
  /** What `point` calls it (the observation's element id). */
  part?: string;
}): JSX.Element {
  return (
    <div class="pr-stepper" data-part={part}>
      <SymbolButton
        symbol="−"
        label={`${name} − ${step}`}
        isEnabled={value > min}
        onPress={() => onChange(Math.max(min, value - step))}
      />
      <span class="pr-stepper-value">
        <span class="pr-name">{name}</span> = {value}
      </span>
      <SymbolButton
        symbol="+"
        label={`${name} + ${step}`}
        isEnabled={value < max}
        onPress={() => onChange(Math.min(max, value + step))}
      />
    </div>
  );
}

/** A box to type a whole number into; the value is sent when it is a whole number in range. */
export function NumberBox({
  name,
  value,
  min,
  max,
  onChange,
  part,
}: {
  name: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** What `point` calls it (the observation's element id). */
  part?: string;
}): JSX.Element {
  return (
    <label class="pr-numberbox" data-part={part}>
      <span class="pr-name">{name}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          const next = Number((event.target as HTMLInputElement).value);
          if (Number.isInteger(next) && next >= min && next <= max) onChange(next);
          else (event.target as HTMLInputElement).value = String(value);
        }}
      />
    </label>
  );
}

export { sup } from "./seen";
