import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { type Words, isWhole, numText, say, termsOf } from "./ap";
import {
  GAUSS_STEPS,
  GaussAction,
  GaussMode,
  GaussPart,
  type GaussState,
  lastOf,
  linesTex,
  pairSumOf,
  sumOfState,
} from "./gauss";
import { Button, Nudger } from "./ui";

const WORDS = {
  next: { en: "Next step", hi: "अगला कदम" },
  back: { en: "Back", hi: "पीछे" },
  terms: { en: "terms", hi: "पद" },
  half: { en: "half the rectangle", hi: "आयत का आधा" },
} as const satisfies Record<string, Words>;

const PAD = { left: 14, right: 40, top: 40 };
const PLOT_H = 150;

/** The staircase, its upside-down copy and the rectangle they make. */
function Bars({ s, width }: { s: GaussState; width: number }): JSX.Element {
  const values = termsOf(s.a, s.d, s.n);
  const total = pairSumOf(s);
  const slotW = (width - PAD.left - PAD.right) / s.n;
  const k = PLOT_H / Math.max(1e-9, total);
  const bottom = PAD.top + PLOT_H;
  // A step's copy floats above until it slides down onto the staircase.
  const lift = s.step === 1 ? 26 : 0;
  const height = bottom + 26;
  const cells = isWhole(s.a) && isWhole(s.d) && total <= 30 && k >= 4;
  const x0 = (i: number) => PAD.left + i * slotW + 1;
  const w = Math.max(2, slotW - 2);
  const gridLines = (x: number, yTop: number, h: number) =>
    cells
      ? Array.from({ length: Math.round(h / k) - 1 }, (_, j) => (
          <line
            // biome-ignore lint/suspicious/noArrayIndexKey: unit cells are positional
            key={j}
            class="ap-cell"
            x1={x}
            x2={x + w}
            y1={yTop + (j + 1) * k}
            y2={yTop + (j + 1) * k}
          />
        ))
      : null;
  return (
    <Stage
      label={`A staircase of ${s.n} columns, ${numText(s.a)} up to ${numText(lastOf(s))}`}
      x={[0, width]}
      width={width}
      height={height}
      svg={{ class: "ap-svg" }}
    >
      <g data-part={GaussPart.Picture}>
        {s.step >= 1 &&
          values.map((_, i) => {
            const h = (values[s.n - 1 - i] as number) * k;
            const y = PAD.top - lift;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional
              <g key={`c${i}`} class={s.step === 3 ? "ap-copy is-faded" : "ap-copy"}>
                <rect x={x0(i)} y={y} width={w} height={Math.max(1, h)} rx={2} />
                {gridLines(x0(i), y, h)}
              </g>
            );
          })}
        {values.map((v, i) => {
          const h = v * k;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional
            <g key={`o${i}`} class={s.step === 3 ? "ap-stair is-picked" : "ap-stair"}>
              <rect x={x0(i)} y={bottom - h} width={w} height={Math.max(1, h)} rx={2} />
              {gridLines(x0(i), bottom - h, h)}
              {slotW >= 20 && (
                <text
                  class="ap-col-value"
                  x={x0(i) + w / 2}
                  y={bottom - h - 4}
                  text-anchor="middle"
                >
                  {s.step === 0 || s.step === 3 ? numText(v) : ""}
                </text>
              )}
            </g>
          );
        })}
        <line class="ap-zero" x1={PAD.left} y1={bottom} x2={width - PAD.right + 4} y2={bottom} />
        {s.step >= 2 && (
          <g class="ap-rect-dims">
            <rect
              class="ap-rect-outline"
              x={PAD.left}
              y={PAD.top}
              width={s.n * slotW}
              height={PLOT_H}
            />
            <path d={`M${width - PAD.right + 8} ${PAD.top} h 5 V ${bottom} h -5`} class="ap-dim" />
            <text class="ap-dim-text" x={width - PAD.right + 16} y={PAD.top + PLOT_H / 2 + 4}>
              {numText(total)}
            </text>
            <text
              class="ap-dim-text"
              x={PAD.left + (s.n * slotW) / 2}
              y={bottom + 18}
              text-anchor="middle"
            >
              {`n = ${s.n}`}
            </text>
          </g>
        )}
      </g>
    </Stage>
  );
}

export function GaussView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as GaussState;
  const lines = linesTex(s);
  return (
    <div class="ap-gauss">
      {s.mode === GaussMode.Bars && <Bars s={s} width={width} />}
      <div class="ap-lines" data-part={GaussPart.Lines}>
        {lines.slice(0, s.step + 1).map((line, i) => (
          <p
            key={line}
            class={i === 1 && s.mode === GaussMode.Pairs ? "ap-line is-back" : "ap-line"}
          >
            <RichText text={`$${line}$`} />
          </p>
        ))}
      </div>
      {s.step === GAUSS_STEPS && s.mode === GaussMode.Bars && (
        <p class="ap-verdict is-on" data-part={GaussPart.Result}>
          {`S = ${say(locale, WORDS.half)} = ${numText(sumOfState(s))}`}
        </p>
      )}
      <div class="ap-controls">
        {s.canSetN && (
          <Nudger
            name="n"
            value={`${s.n}`}
            part={GaussPart.StepN}
            canDown={s.n > 1}
            canUp={s.n < s.nMax}
            onNudge={(by) => call(GaussAction.NudgeN, { by })}
          />
        )}
        {s.canStep && s.step > 0 && (
          <Button
            isWide
            label={say(locale, WORDS.back)}
            part={GaussPart.Back}
            onPress={() => call(GaussAction.Back, {})}
          >
            {say(locale, WORDS.back)}
          </Button>
        )}
        {s.canStep && s.step < GAUSS_STEPS && (
          <Button
            isWide
            label={say(locale, WORDS.next)}
            part={GaussPart.Next}
            onPress={() => call(GaussAction.Next, {})}
          >
            {say(locale, WORDS.next)}
          </Button>
        )}
      </div>
    </div>
  );
}
