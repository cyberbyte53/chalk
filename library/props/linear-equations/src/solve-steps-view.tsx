import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { type Line, equationOf, frac, fracText } from "./algebra";
import {
  Method,
  SolveStepsAction,
  SolveStepsPart,
  type SolveStepsState,
  needsChoice,
  workedOf,
} from "./solve-steps";
import { StepKind, canIsolate } from "./steps";
import { SymbolButton } from "./ui";
import { WORDS, fill, say } from "./words";

const STEP_WORD = { en: "Step", hi: "चरण" } as const;

/** NCERT's memory aid: b₁ c₁ a₁ b₁ over b₂ c₂ a₂ b₂, arrows down (×) and up (− ×). */
function CrossDiagram({ s, width }: { s: SolveStepsState; width: number }): JSX.Element {
  const id = useId();
  const [l1, l2] = s.equations;
  const top = [l1.b, l1.c, l1.a, l1.b];
  const low = [l2.b, l2.c, l2.a, l2.b];
  const names = ["b", "c", "a", "b"];
  const xs = [40, 115, 190, 265];
  const heads = [s.variables[0], s.variables[1], "1"];
  const W = 305;
  const H = 132;
  const shown = Math.min(width, 360);
  const showNumber = (n: number) => {
    return fracText(frac(n));
  };
  return (
    <svg
      class="le-cross"
      data-part={SolveStepsPart.Diagram}
      viewBox={`0 0 ${W} ${H}`}
      width={shown}
      height={(shown * H) / W}
      role="img"
      aria-label={
        "x over b1 c2 minus b2 c1, equals y over c1 a2 minus c2 a1, equals 1 over a1 b2 minus a2 b1"
      }
    >
      <defs>
        <marker
          id={`${id}-down`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path class="le-cross-head is-down" d="M0 0 L10 5 L0 10 z" />
        </marker>
        <marker
          id={`${id}-up`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path class="le-cross-head is-up" d="M0 0 L10 5 L0 10 z" />
        </marker>
      </defs>
      {heads.map((h, i) => (
        <text
          key={h + String(i)}
          class="le-cross-headword"
          x={((xs[i] as number) + (xs[i + 1] as number)) / 2}
          y={16}
        >
          {h}
        </text>
      ))}
      {xs.map((x, i) => (
        <g key={x}>
          <text class="le-cross-name" x={x} y={36}>
            {`${names[i]}₁`}
          </text>
          <text class="le-cross-value" x={x} y={56}>
            {showNumber(top[i] as number)}
          </text>
          <text class="le-cross-value" x={x} y={100}>
            {showNumber(low[i] as number)}
          </text>
          <text class="le-cross-name" x={x} y={122}>
            {`${names[i]}₂`}
          </text>
        </g>
      ))}
      {[0, 1, 2].map((i) => {
        const x1 = (xs[i] as number) + 16;
        const x2 = (xs[i + 1] as number) - 16;
        return (
          <g key={i}>
            <line
              class="le-cross-arrow is-down"
              x1={x1}
              y1={60}
              x2={x2}
              y2={84}
              marker-end={`url(#${id}-down)`}
            />
            <line
              class="le-cross-arrow is-up"
              x1={x1}
              y1={84}
              x2={x2}
              y2={60}
              marker-end={`url(#${id}-up)`}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function SolveStepsView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as SolveStepsState;
  const w = workedOf(s);
  const waiting = needsChoice(s);
  const shown = waiting ? 0 : Math.min(s.step, w.steps.length);
  const tex = (l: Line) => equationOf(l, s.variables, s.form, true);
  let number = 0;
  return (
    <div class="le-solve">
      <div class="le-given" data-part={SolveStepsPart.Equations}>
        {s.equations.map((l, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: the equations are numbered by place
          <div key={i} class="le-given-line">
            <RichText text={`$$${tex(l)}\\qquad (${i + 1})$$`} />
          </div>
        ))}
      </div>

      {s.method === Method.CrossMultiplication && s.showDiagram && (
        <CrossDiagram s={s} width={width} />
      )}

      {waiting && (
        <div class="le-choices" data-part={SolveStepsPart.Choices}>
          <p class="le-choices-prompt">
            {say(
              locale,
              s.method === Method.Substitution ? WORDS.isolatePrompt : WORDS.eliminatePrompt,
            )}
          </p>
          <div class="le-choice-row">
            {s.method === Method.Substitution
              ? ([0, 1] as const).flatMap((equation) =>
                  ([0, 1] as const).map((variable) => {
                    const c = { equation, variable };
                    if (!canIsolate(s.equations, c)) return null;
                    const words = fill(WORDS.isolateChoice, {
                      v: s.variables[variable],
                      n: String(equation + 1),
                    });
                    return (
                      <SymbolButton
                        key={`${equation}${variable}`}
                        symbol={say(locale, words)}
                        label={say(locale, words)}
                        isWide
                        onPress={() => call(SolveStepsAction.Choose, { isolate: c })}
                      />
                    );
                  }),
                )
              : ([0, 1] as const).map((v) => {
                  const words = fill(WORDS.eliminateChoice, { v: s.variables[v] });
                  return (
                    <SymbolButton
                      key={v}
                      symbol={say(locale, words)}
                      label={say(locale, words)}
                      isWide
                      onPress={() => call(SolveStepsAction.Choose, { eliminate: v })}
                    />
                  );
                })}
          </div>
        </div>
      )}

      <ol class="le-steps">
        {w.steps.slice(0, shown).map((step, i) => {
          const isStep = step.kind === undefined || step.kind === StepKind.Step;
          if (isStep) number += 1;
          const head = isStep ? `${say(locale, STEP_WORD)} ${number}: ` : "";
          return (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: steps are shown in a fixed order
              key={i}
              class={`le-step is-${step.kind ?? StepKind.Step}`}
              data-part={`${SolveStepsPart.Step}:${i}`}
            >
              <p class="le-step-caption">
                {head !== "" && <strong>{head}</strong>}
                {say(locale, step.caption)}
              </p>
              {step.lines.map((line, j) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: a step's lines are in a fixed order
                <div key={j} class="le-step-line">
                  <RichText text={`$$${line}$$`} />
                </div>
              ))}
            </li>
          );
        })}
      </ol>

      {s.canStep && !waiting && (
        <div class="le-step-controls">
          {shown < w.steps.length ? (
            <SymbolButton
              symbol={`${say(locale, WORDS.next)} →`}
              label={say(locale, WORDS.next)}
              isWide
              isPrimary
              part={SolveStepsPart.Next}
              onPress={() => call(SolveStepsAction.Next, {})}
            />
          ) : (
            s.canChoose &&
            s.method !== Method.CrossMultiplication && (
              <SymbolButton
                symbol={say(locale, WORDS.again)}
                label={say(locale, WORDS.again)}
                isWide
                onPress={() => call(SolveStepsAction.Reset, {})}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
