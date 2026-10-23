import { RichText } from "@chalk/player";
import type { ComponentChildren, JSX } from "preact";
import { type Words, say } from "./numbers";

/** A button: round for − / +, wider for a word. */
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
      class={`dt-button${isWide ? " is-wide" : ""}${isOn ? " is-on" : ""}`}
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

/** Next / Back for a stepped prop. */
export function Stepper({
  locale,
  step,
  last,
  onNext,
  onBack,
  nextPart,
  backPart,
}: {
  locale: string;
  step: number;
  last: number;
  onNext: () => void;
  onBack: () => void;
  nextPart: string;
  backPart: string;
}): JSX.Element {
  return (
    <div class="dt-controls">
      {step > 0 && (
        <Button isWide label={say(locale, UI.back)} part={backPart} onPress={onBack}>
          {say(locale, UI.back)}
        </Button>
      )}
      {step < last && (
        <Button isWide label={say(locale, UI.next)} part={nextPart} onPress={onNext}>
          {say(locale, UI.next)}
        </Button>
      )}
    </div>
  );
}

/** Lines of TeX working, one per line. */
export function Working({ lines, part }: { lines: readonly string[]; part?: string }) {
  return (
    <div class="dt-working" data-part={part}>
      {lines.map((line) => (
        <p key={line} class="dt-line">
          <RichText text={`$${line}$`} />
        </p>
      ))}
    </div>
  );
}

export const UI = {
  next: { en: "Next step", hi: "अगला कदम" },
  back: { en: "Back", hi: "पीछे" },
  reset: { en: "Start again", hi: "फिर से" },
} as const satisfies Record<string, Words>;
