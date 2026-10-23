import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  CombinedAction,
  CombinedPart,
  type CombinedState,
  type Figure,
  figureOf,
  totalOf,
} from "./combined";
import { StepBar } from "./kit/controls";
import { frameOf } from "./kit/frame";
import { type Words, numText, say } from "./kit/geometry";
import { PathShape } from "./kit/path";
import { type LabelItem, Labels } from "./kit/pieces";

export const COMBINED_WORDS = {
  add: { en: "add", hi: "जोड़ो" },
  takeAway: { en: "take away", hi: "घटाओ" },
  shaded: { en: "Shaded area", hi: "छायांकित क्षेत्रफल" },
} as const satisfies Record<string, Words>;

const H = 240;

export function CombinedView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as CombinedState;
  const fig: Figure = figureOf(s.kind);
  const count = fig.terms.length + 2;
  const step = Math.min(s.step, count - 1);
  const isDone = step === count - 1;
  const current = step >= 1 && !isDone ? fig.terms[step - 1] : undefined;
  const frame = frameOf(fig.box, { width, height: H }, 10);
  const total = totalOf(s);
  const u = fig.unit;
  const labels: LabelItem[] = fig.labels.map((l, i) => ({
    id: `l${i}`,
    at: l.at,
    text: l.text,
    away: l.away,
    prefer: l.prefer,
    kind: l.isNote === true ? "note" : "point",
  }));
  const done = fig.terms.slice(0, isDone ? fig.terms.length : Math.max(0, step));
  return (
    <div class="ci ci-combined">
      <Stage
        label={`${fig.question.en}${current === undefined ? "" : ` Now ${current.op > 0 ? "adding" : "taking away"} the ${current.name.en}.`}`}
        x={frame.x}
        y={frame.y}
        width={width}
        height={H}
        svg={{ class: "ci-svg" }}
      >
        <g data-part={CombinedPart.Figure}>
          <PathShape
            cmds={fig.shaded.flat()}
            tone="accent"
            isEvenOdd
            class={current === undefined ? "" : "ci-dim"}
          />
          {current !== undefined && (
            <PathShape
              key={step}
              cmds={current.cmds}
              tone={current.op > 0 ? "construction" : "wrong"}
              isEvenOdd
              isOutlined
              class="ci-lit"
            />
          )}
          {isDone && <PathShape cmds={fig.shaded.flat()} tone="result" isEvenOdd class="ci-lit" />}
          {fig.outlines.map((o, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: outlines are a fixed list
            <PathShape key={i} cmds={o} tone="muted" class="ci-outline" />
          ))}
        </g>
        <Labels items={labels} />
      </Stage>
      <div class="ci-working" data-part={CombinedPart.Working} aria-live="polite">
        {step === 0 && <p>{say(locale, fig.question)}</p>}
        {done.map((t, i) => (
          <p key={t.name.en} class={i === step - 1 && !isDone ? "is-now" : ""}>
            {t.op > 0 ? "+" : "−"} {say(locale, t.name)}: {t.working} {u}²
          </p>
        ))}
        {isDone && (
          <p class="is-total">
            {say(locale, COMBINED_WORDS.shaded)} ={" "}
            {fig.terms
              .map((t, i) => `${i === 0 ? "" : t.op > 0 ? " + " : " − "}${numText(t.value)}`)
              .join("")}{" "}
            = {numText(total)} {u}²
          </p>
        )}
      </div>
      {s.canStep && (
        <StepBar
          step={step}
          count={count}
          locale={locale}
          part={CombinedPart.Steps}
          onNext={() => call(CombinedAction.Next, {})}
          onBack={() => call(CombinedAction.Back, {})}
          onAgain={() => call(CombinedAction.Reset, {})}
        />
      )}
    </div>
  );
}
