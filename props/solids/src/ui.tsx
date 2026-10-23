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
      class={`so-button${isWide ? " is-wide" : ""}${isOn ? " is-on" : ""}`}
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
    <div class="so-nudger" data-part={part}>
      <Button label="smaller" isEnabled={canDown} onPress={() => onNudge(-1)}>
        −
      </Button>
      <span class="so-nudger-value">
        <span class="so-name">{name}</span> = {value}
      </span>
      <Button label="bigger" isEnabled={canUp} onPress={() => onNudge(1)}>
        +
      </Button>
    </div>
  );
}

/** A row of choice chips: one is on. */
export function Chips<T extends string>({
  options,
  value,
  label,
  onPick,
  part,
}: {
  options: readonly { id: T; text: string }[];
  value: T;
  label: string;
  onPick: (id: T) => void;
  part?: string;
}): JSX.Element {
  return (
    <fieldset class="so-chips" aria-label={label} data-part={part}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          class={`so-chip${o.id === value ? " is-on" : ""}`}
          aria-pressed={o.id === value}
          onClick={() => onPick(o.id)}
        >
          {o.text}
        </button>
      ))}
    </fieldset>
  );
}
