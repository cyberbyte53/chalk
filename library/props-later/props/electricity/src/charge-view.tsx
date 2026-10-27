import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import {
  AMP_STEP,
  ChargeAction,
  ChargeShow,
  type ChargeState,
  MAX_AMPS,
  coulombsOf,
  describeCharge,
  electronsOf,
} from "./charge";
import { type Words, num, range, say, sig } from "./words";

const W = 320;
const H = 132;
const WIRE = { y: 58, r: 22, left: 30, right: 290 } as const;
const SECTION = 196;
/** Distance between neighbouring charges along the wire. */
const SPACING = 26;

const WORDS = {
  section: { en: "cross-section", hi: "अनुप्रस्थ काट" },
  plus: { en: "to + terminal", hi: "+ सिरे की ओर" },
  minus: { en: "to − terminal", hi: "− सिरे की ओर" },
  current: { en: "current", hi: "धारा" },
  electrons: { en: "electrons", hi: "इलेक्ट्रॉन" },
  count: { en: "Count", hi: "गिनो" },
  counting: { en: "Counting…", hi: "गिनती…" },
  again: { en: "Count again", hi: "फिर गिनो" },
  showConventional: { en: "Current", hi: "धारा" },
  showElectrons: { en: "Electrons", hi: "इलेक्ट्रॉन" },
  showBoth: { en: "Both", hi: "दोनों" },
  aboutElectrons: { en: "electrons", hi: "इलेक्ट्रॉन" },
  noCurrent: { en: "No current", hi: "कोई धारा नहीं" },
  seconds: { en: "s", hi: "s" },
} as const satisfies Record<string, Words>;

/** A row of charges that slides one spacing per cycle, so the loop is seamless. */
function Charges({
  amps,
  dir,
  kind,
  y,
}: { amps: number; dir: 1 | -1; kind: "plus" | "minus"; y: number }): JSX.Element {
  const n = Math.ceil((WIRE.right - WIRE.left) / SPACING) + 2;
  const seconds = amps > 0 ? SPACING / (18 * amps) : 0;
  return (
    <g
      class={amps > 0 ? `el-cf-row is-moving dir-${dir > 0 ? "right" : "left"}` : "el-cf-row"}
      style={amps > 0 ? ({ animationDuration: `${seconds.toFixed(3)}s` } as JSX.CSSProperties) : {}}
    >
      {range(n).map((i) => {
        const x = WIRE.left - SPACING + i * SPACING + (kind === "minus" ? SPACING / 2 : 0);
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle class={kind === "plus" ? "el-cf-plus" : "el-cf-minus"} r={6} />
            <text class="el-cf-sign" text-anchor="middle" dominant-baseline="central" y={0.5}>
              {kind === "plus" ? "+" : "−"}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function ChargeView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as ChargeState;
  const k = width / W;
  const height = Math.round(H * k);
  const q = coulombsOf(s);
  const showPlus = s.show !== ChargeShow.Electrons;
  const showMinus = s.show !== ChargeShow.Conventional;
  const clip = `el-cf-clip-${useId()}`;
  return (
    <div class="el-cf">
      <Stage
        label={describeCharge(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "el-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="el-bg" x={0} y={0} width={W} height={H} rx={12} />
          <clipPath id={clip}>
            <rect
              x={WIRE.left}
              y={WIRE.y - WIRE.r + 3}
              width={WIRE.right - WIRE.left}
              height={2 * WIRE.r - 6}
            />
          </clipPath>
          <rect
            class="el-cf-wire"
            x={WIRE.left}
            y={WIRE.y - WIRE.r}
            width={WIRE.right - WIRE.left}
            height={2 * WIRE.r}
            data-part="wire"
          />
          <g clip-path={`url(#${clip})`}>
            {showPlus && (
              <Charges amps={s.amps} dir={1} kind="plus" y={showMinus ? WIRE.y - 8 : WIRE.y} />
            )}
            {showMinus && (
              <Charges amps={s.amps} dir={-1} kind="minus" y={showPlus ? WIRE.y + 8 : WIRE.y} />
            )}
          </g>
          {/* the marked section, an end-on ring through the wire */}
          <ellipse
            class="el-cf-section"
            cx={SECTION}
            cy={WIRE.y}
            rx={7}
            ry={WIRE.r + 4}
            data-part="section"
          />
          <text class="el-label" x={SECTION} y={WIRE.y - WIRE.r - 9} text-anchor="middle">
            {say(locale, WORDS.section)}
          </text>
          {/* the wire's two ends */}
          <text class="el-cf-end" x={WIRE.left - 6} y={WIRE.y + 4} text-anchor="end">
            +
          </text>
          <text class="el-cf-end" x={WIRE.right + 6} y={WIRE.y + 4} text-anchor="start">
            −
          </text>
          {/* direction arrows */}
          {s.amps > 0 && showPlus && (
            <g class="el-cf-arrow is-current">
              <line x1={60} y1={WIRE.y + WIRE.r + 14} x2={130} y2={WIRE.y + WIRE.r + 14} />
              <path d={`M130 ${WIRE.y + WIRE.r + 14} l -7 -4 v 8 z`} />
              <text x={64} y={WIRE.y + WIRE.r + 28}>
                {say(locale, WORDS.current)}
              </text>
            </g>
          )}
          {s.amps > 0 && showMinus && (
            <g class="el-cf-arrow is-electrons">
              <line x1={260} y1={WIRE.y + WIRE.r + 14} x2={190} y2={WIRE.y + WIRE.r + 14} />
              <path d={`M190 ${WIRE.y + WIRE.r + 14} l 7 -4 v 8 z`} />
              <text x={256} y={WIRE.y + WIRE.r + 28} text-anchor="end">
                {say(locale, WORDS.electrons)}
              </text>
            </g>
          )}
          {s.amps === 0 && (
            <text class="el-note" x={W / 2} y={WIRE.y + WIRE.r + 22} text-anchor="middle">
              {say(locale, WORDS.noCurrent)}
            </text>
          )}
        </g>
      </Stage>
      {s.showCount && (
        <div class="el-readout" data-part="counter">
          <span>
            I = {num(s.amps)} A, t = {num(s.seconds, 1)} s
          </span>
          <span class="el-readout-main">
            Q = I × t = {num(s.amps)} × {num(s.seconds, 1)} = {num(q, 3)} C
          </span>
          {s.showElectrons && q > 0 && (
            <span>
              ≈ {sig(electronsOf(q))} {say(locale, WORDS.aboutElectrons)}
            </span>
          )}
        </div>
      )}
      {(s.canSetCurrent || s.canCount) && (
        <div class="el-controls" data-part="controls">
          {s.canSetCurrent && (
            <div class="el-stepper">
              <button
                type="button"
                class="el-button"
                aria-label="−"
                disabled={s.amps <= AMP_STEP || s.isCounting}
                onClick={() =>
                  call(ChargeAction.SetCurrent, { amps: Math.max(AMP_STEP, s.amps - AMP_STEP) })
                }
              >
                −
              </button>
              <span class="el-stepper-value">I = {num(s.amps)} A</span>
              <button
                type="button"
                class="el-button"
                aria-label="+"
                disabled={s.amps >= MAX_AMPS || s.isCounting}
                onClick={() =>
                  call(ChargeAction.SetCurrent, { amps: Math.min(MAX_AMPS, s.amps + AMP_STEP) })
                }
              >
                +
              </button>
            </div>
          )}
          {s.canCount && (
            <button
              type="button"
              class="el-button is-primary"
              disabled={s.isCounting || s.amps === 0}
              onClick={() => call(ChargeAction.Count, {})}
            >
              {say(
                locale,
                s.isCounting ? WORDS.counting : s.seconds > 0 ? WORDS.again : WORDS.count,
              )}{" "}
              {s.isCounting ? "" : `${s.countFor} ${say(locale, WORDS.seconds)}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
