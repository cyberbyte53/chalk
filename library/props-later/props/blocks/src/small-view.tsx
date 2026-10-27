import { RichText, leafView } from "@chalk/player";
import { MathLinePart, StepperPart, iconButton, mathLine, stepper } from "./small";

export const StepperView = leafView(stepper, ({ s, part }) => (
  <div class="bk-stepper">
    <button type="button" class="bk-button" {...part(StepperPart.Less)}>
      −
    </button>
    <span class="bk-stepper-value" {...part(StepperPart.Value)}>
      <span class="bk-name">{s.name}</span> = {s.shown ?? s.value}
    </span>
    <button type="button" class="bk-button" {...part(StepperPart.More)}>
      +
    </button>
  </div>
));

/** The maths on one line, or with what follows its last " = " on a line of its own. */
export const MathLineView = leafView(mathLine, ({ s, part }) => {
  const at = s.tex.lastIndexOf(" = ");
  return (
    <p class="bk-math" {...part(MathLinePart.Line)}>
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
});

export const IconButtonView = leafView(iconButton, ({ s, part }) => (
  <button type="button" class="bk-button" {...part("button")}>
    {s.symbol}
  </button>
));
