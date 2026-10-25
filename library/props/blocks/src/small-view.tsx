import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import {
  IconButtonAction,
  IconButtonPart,
  type IconButtonState,
  type MathLineState,
  StepperAction,
  StepperPart,
  type StepperState,
  stepped,
} from "./small";

export function StepperView({ view, call }: PropViewProps): JSX.Element {
  const s = view as unknown as StepperState;
  const less = stepped(s, -1);
  const more = stepped(s, 1);
  return (
    <div class="bk-stepper">
      <button
        type="button"
        class="bk-button"
        aria-label={`${s.name} − ${s.step}`}
        disabled={!(less < s.value)}
        data-part={StepperPart.Less}
        onClick={() => call(StepperAction.Change, { to: less })}
      >
        −
      </button>
      <span class="bk-stepper-value" data-part={StepperPart.Value}>
        <span class="bk-name">{s.name}</span> = {s.shown ?? s.value}
      </span>
      <button
        type="button"
        class="bk-button"
        aria-label={`${s.name} + ${s.step}`}
        disabled={!(more > s.value)}
        data-part={StepperPart.More}
        onClick={() => call(StepperAction.Change, { to: more })}
      >
        +
      </button>
    </div>
  );
}

/** The maths on one line, or with what follows its last " = " on a line of its own. */
export function MathLineView({ view }: PropViewProps): JSX.Element {
  const s = view as unknown as MathLineState;
  const at = s.tex.lastIndexOf(" = ");
  return (
    <p class="bk-math" data-part="line">
      {s.tex === "" ? (
        <span class="bk-math-empty">{s.placeholder}</span>
      ) : !s.isSplit || at < 0 ? (
        <RichText text={`$${s.tex}$`} />
      ) : (
        <>
          <RichText text={`$${s.tex.slice(0, at)}$`} />
          <span class="bk-math-rest">
            <RichText text={`$${s.tex.slice(at + 1)}$`} />
          </span>
        </>
      )}
    </p>
  );
}

export function IconButtonView({ view, call }: PropViewProps): JSX.Element {
  const s = view as unknown as IconButtonState;
  return (
    <button
      type="button"
      class="bk-button"
      aria-label={s.label}
      disabled={!s.isEnabled}
      data-part={IconButtonPart.Button}
      onClick={() => call(IconButtonAction.Press, {})}
    >
      {s.symbol}
    </button>
  );
}
