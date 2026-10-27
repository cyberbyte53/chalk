import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Axes, frameOf } from "./chart";
import { MODE_STEPS, ModeAction, ModePart, type ModeState } from "./mode-chart";
import { type Words, isRounded, numText, say } from "./numbers";
import { meanOf, modalIndex, modeOf, modeParts, modeWorking } from "./stats";
import { Stepper, Working } from "./ui";

const WORDS = {
  mode: { en: "Mode", hi: "बहुलक" },
  mean: { en: "mean", hi: "माध्य" },
  modal: { en: "modal class", hi: "बहुलक वर्ग" },
  tap: { en: "Tap the modal class", hi: "बहुलक वर्ग पर टैप करो" },
  notThis: { en: "Not the tallest bar: look again", hi: "यह सबसे ऊँचा स्तंभ नहीं है: फिर देखो" },
} as const satisfies Record<string, Words>;

export function ModeChartView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ModeState;
  const rows = s.rows;
  const lo = rows[0]?.lo ?? 0;
  const hi = rows[rows.length - 1]?.hi ?? 1;
  const yMax = Math.max(...rows.map((r) => r.f)) * 1.25;
  const height = 210;
  const frame = frameOf(width, height, [lo, hi], yMax, {
    left: 34,
    right: 14,
    top: 22,
    bottom: 40,
  });
  const m = modalIndex(rows);
  const p = modeParts(rows);
  const mode = modeOf(rows);
  const mean = meanOf(rows);
  const ticks = [lo, ...rows.map((r) => r.hi)];
  const isWrongPick = s.picked !== null && s.picked !== m;
  const fLabel = (i: number, text: string) => {
    const r = rows[i];
    if (r === undefined) return null;
    return (
      <text
        class="dt-bar-label is-on"
        x={(frame.toX(r.lo) + frame.toX(r.hi)) / 2}
        y={frame.toY(r.f) - 5}
        text-anchor="middle"
      >
        {text}
      </text>
    );
  };
  return (
    <div class="dt-mode">
      <Stage
        label={`A histogram of ${say(locale, s.freqHeading)} by ${say(locale, s.classHeading)}`}
        x={[0, width]}
        width={width}
        height={height}
        svg={{ class: "dt-svg" }}
      >
        <g data-part={ModePart.Chart}>
          <Axes
            frame={frame}
            xTicks={ticks}
            yMax={yMax}
            xName={say(locale, s.classHeading)}
            yName={say(locale, s.freqHeading)}
          />
          {rows.map((r, i) => {
            const x = frame.toX(r.lo);
            const w = frame.toX(r.hi) - x;
            const isModal = s.step >= 1 && i === m;
            const cls = `dt-bar${isModal ? " is-modal" : ""}${s.picked === i && i !== m ? " is-wrong" : ""}${s.canPick ? " is-tappable" : ""}`;
            return (
              <g
                // biome-ignore lint/suspicious/noArrayIndexKey: bars are positional
                key={i}
                class={cls}
                role={s.canPick ? "button" : undefined}
                tabIndex={s.canPick ? 0 : undefined}
                aria-label={s.canPick ? `${numText(r.lo)} - ${numText(r.hi)}` : undefined}
                onClick={s.canPick ? () => call(ModeAction.Pick, { index: i }) : undefined}
                onKeyDown={
                  s.canPick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") call(ModeAction.Pick, { index: i });
                      }
                    : undefined
                }
              >
                <rect
                  x={x}
                  y={frame.toY(r.f)}
                  width={Math.max(1, w)}
                  height={frame.bottom - frame.toY(r.f)}
                />
                {s.step < 2 && (
                  <text
                    class="dt-bar-label"
                    x={x + w / 2}
                    y={frame.toY(r.f) - 5}
                    text-anchor="middle"
                  >
                    {r.f}
                  </text>
                )}
              </g>
            );
          })}
          {s.step >= 2 && (
            <g class="dt-marks">
              {fLabel(m, `f₁ = ${p.f1}`)}
              {m > 0 && fLabel(m - 1, `f₀ = ${p.f0}`)}
              {m < rows.length - 1 && fLabel(m + 1, `f₂ = ${p.f2}`)}
              <text
                class="dt-mark-text"
                x={frame.toX(p.l)}
                y={frame.bottom + 26}
                text-anchor="middle"
              >{`l = ${numText(p.l)}`}</text>
              <path
                class="dt-brace"
                d={`M${frame.toX(p.l) + 2} ${frame.bottom + 18} v 4 H ${frame.toX(p.l + p.h) - 2} v -4`}
              />
              <text
                class="dt-mark-text"
                x={frame.toX(p.l + p.h / 2) + 14}
                y={frame.bottom + 37}
                text-anchor="middle"
              >{`h = ${numText(p.h)}`}</text>
            </g>
          )}
          {s.step === MODE_STEPS && (
            <g class="dt-mode-line">
              <line x1={frame.toX(mode)} x2={frame.toX(mode)} y1={frame.top} y2={frame.bottom} />
              <circle cx={frame.toX(mode)} cy={frame.bottom} r={4} />
            </g>
          )}
          {s.showMean && (
            <g class="dt-mean-line">
              <line x1={frame.toX(mean)} x2={frame.toX(mean)} y1={frame.top} y2={frame.bottom} />
              <text
                x={frame.toX(mean) + 4}
                y={(frame.top + frame.bottom) / 2}
              >{`${say(locale, WORDS.mean)} ${numText(mean)}`}</text>
            </g>
          )}
        </g>
      </Stage>
      {s.canPick && s.step === 0 && (
        <p class={`dt-note${isWrongPick ? " is-wrong" : ""}`}>
          {say(locale, isWrongPick ? WORDS.notThis : WORDS.tap)}
        </p>
      )}
      {s.step >= 1 && s.step < MODE_STEPS && (
        <p class="dt-note">{`${say(locale, WORDS.modal)}: ${numText(rows[m]?.lo ?? 0)} - ${numText(rows[m]?.hi ?? 0)}`}</p>
      )}
      {s.step === MODE_STEPS && (
        <>
          <Working lines={modeWorking(rows)} part={ModePart.Working} />
          <p class="dt-verdict" data-part={ModePart.Result}>
            {`${say(locale, WORDS.mode)} ${isRounded(mode) ? "≈" : "="} ${numText(mode)}`}
          </p>
        </>
      )}
      {s.canStep && (
        <Stepper
          locale={locale}
          step={s.step}
          last={MODE_STEPS}
          nextPart={ModePart.Next}
          backPart={ModePart.Back}
          onNext={() => call(ModeAction.Next, {})}
          onBack={() => call(ModeAction.Back, {})}
        />
      )}
    </div>
  );
}
