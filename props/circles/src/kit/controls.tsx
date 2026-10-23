import type { ComponentChildren, JSX } from "preact";
import { type Words, say } from "./geometry";

/**
 * Controls shared by geometry props: a round button, a − value + nudger, and the step bar a
 * stepped proof or construction is walked with. All are real buttons (keyboard and screen reader
 * friendly) and at least 44 px tall.
 */

/** A round − or + button, or a wider labelled one. */
export function Button({
  children,
  label,
  onPress,
  isEnabled = true,
  isOn = false,
  isWide = false,
  part,
}: {
  children: ComponentChildren;
  label: string;
  onPress: () => void;
  isEnabled?: boolean;
  isOn?: boolean;
  isWide?: boolean;
  part?: string;
}): JSX.Element {
  return (
    <button
      type="button"
      class={`gk-button${isWide ? " is-wide" : ""}${isOn ? " is-on" : ""}`}
      aria-label={label}
      aria-pressed={isOn ? true : undefined}
      disabled={!isEnabled}
      data-part={part}
      onClick={onPress}
    >
      {children}
    </button>
  );
}

export const NUDGE_WORDS = {
  less: { en: "less", hi: "कम" },
  more: { en: "more", hi: "ज़्यादा" },
} as const satisfies Record<string, Words>;

/** − name = value +  (the buttons' names follow `locale` unless given). */
export function Nudger({
  name,
  value,
  onNudge,
  canDown = true,
  canUp = true,
  locale = "en",
  downLabel = say(locale, NUDGE_WORDS.less),
  upLabel = say(locale, NUDGE_WORDS.more),
  part,
}: {
  name: ComponentChildren;
  value: string;
  onNudge: (by: 1 | -1) => void;
  canDown?: boolean;
  canUp?: boolean;
  locale?: string;
  downLabel?: string;
  upLabel?: string;
  part?: string;
}): JSX.Element {
  return (
    <div class="gk-nudger" data-part={part}>
      <Button label={downLabel} isEnabled={canDown} onPress={() => onNudge(-1)}>
        −
      </Button>
      <span class="gk-nudger-value">
        <span class="gk-name">{name}</span> = {value}
      </span>
      <Button label={upLabel} isEnabled={canUp} onPress={() => onNudge(1)}>
        +
      </Button>
    </div>
  );
}

export const STEP_WORDS = {
  next: { en: "Next step", hi: "अगला चरण" },
  back: { en: "Back", hi: "पीछे" },
  again: { en: "Start again", hi: "फिर से" },
  step: { en: "Step", hi: "चरण" },
  of: { en: "of", hi: "में से" },
} as const satisfies Record<string, Words>;

/** Back · dots · Next (or Start again on the last step), for walking a stepped figure. */
export function StepBar({
  step,
  count,
  locale,
  onNext,
  onBack,
  onAgain,
  part,
}: {
  step: number;
  count: number;
  locale: string;
  onNext: () => void;
  onBack?: () => void;
  onAgain: () => void;
  part?: string;
}): JSX.Element {
  const isLast = step >= count - 1;
  return (
    <div class="gk-stepbar" data-part={part}>
      {onBack !== undefined && (
        <Button label={say(locale, STEP_WORDS.back)} isWide isEnabled={step > 0} onPress={onBack}>
          ←
        </Button>
      )}
      <span
        class="gk-stepdots"
        role="img"
        aria-label={`${say(locale, STEP_WORDS.step)} ${step + 1} ${say(locale, STEP_WORDS.of)} ${count}`}
      >
        {Array.from({ length: count }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: the dots are positions, not items
          <span key={i} class={`gk-stepdot${i <= step ? " is-on" : ""}`} />
        ))}
      </span>
      <Button
        label={say(locale, isLast ? STEP_WORDS.again : STEP_WORDS.next)}
        isWide
        onPress={isLast ? onAgain : onNext}
        part={part === undefined ? undefined : `${part}-next`}
      >
        {isLast ? say(locale, STEP_WORDS.again) : `${say(locale, STEP_WORDS.next)} →`}
      </Button>
    </div>
  );
}
