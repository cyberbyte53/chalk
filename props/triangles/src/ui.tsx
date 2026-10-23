import type { ComponentChildren, JSX } from "preact";

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
      class={`tg-button${isWide ? " is-wide" : ""}${isOn ? " is-on" : ""}`}
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

/** − name = value + */
export function Nudger({
  name,
  value,
  onNudge,
  canDown = true,
  canUp = true,
  part,
}: {
  name: ComponentChildren;
  value: string;
  onNudge: (by: 1 | -1) => void;
  canDown?: boolean;
  canUp?: boolean;
  part?: string;
}): JSX.Element {
  return (
    <div class="tg-nudger" data-part={part}>
      <Button label="smaller" isEnabled={canDown} onPress={() => onNudge(-1)}>
        −
      </Button>
      <span class="tg-nudger-value">
        <span class="tg-name">{name}</span> = {value}
      </span>
      <Button label="bigger" isEnabled={canUp} onPress={() => onNudge(1)}>
        +
      </Button>
    </div>
  );
}
