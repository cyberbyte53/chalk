import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow } from "./draw";
import {
  MAX_MILLS,
  MAX_SPEED,
  SPEED_STEP,
  Supply,
  WindAction,
  WindPart,
  type WindState,
  describeWind,
  isTurningAt,
  landOf,
  outputOf,
  supplyOf,
} from "./wind";
import { type Words, num, range, say } from "./words";

const W = 320;
const H = 180;
const GROUND = 150;

const WORDS = {
  wind: { en: "wind", hi: "पवन" },
  kmh: { en: "km/h", hi: "km/h" },
  mills: { en: "mills", hi: "पवनचक्कियाँ" },
  battery: { en: "Back-up cells", hi: "बैकअप सेल" },
  noBattery: { en: "No back-up", hi: "बैकअप नहीं" },
  output: { en: "output", hi: "उत्पादन" },
  land: { en: "land", hi: "भूमि" },
  ha: { en: "ha", hi: "हेक्टेयर" },
  still: { en: "too slow: blades still", hi: "बहुत धीमी: पंखे रुके" },
  cutIn: { en: "needs more than 15 km/h", hi: "15 km/h से अधिक चाहिए" },
  litWind: { en: "lights on (wind)", hi: "बत्ती जली (पवन)" },
  litBattery: { en: "lights on (back-up)", hi: "बत्ती जली (बैकअप)" },
  dark: { en: "lights out", hi: "बत्ती बुझी" },
} as const satisfies Record<string, Words>;

function Mill({ x, s, scale, speed }: { x: number; s: WindState; scale: number; speed: number }) {
  const turning = isTurningAt(s.speed);
  const top = GROUND - 70 * scale;
  const dur = turning ? Math.max(0.4, 3 - speed / 15) : 0;
  return (
    <g>
      <path
        class="en-tower"
        d={`M${x - 3 * scale} ${GROUND} L ${x - 1.2 * scale} ${top} L ${x + 1.2 * scale} ${top} L ${x + 3 * scale} ${GROUND} Z`}
      />
      <g transform={`translate(${x} ${top})`}>
        <g
          class={turning ? "en-rotor is-turning" : "en-rotor"}
          style={turning ? { animationDuration: `${dur.toFixed(2)}s` } : undefined}
        >
          {[0, 120, 240].map((a) => (
            <path
              key={a}
              class="en-mill-blade"
              transform={`rotate(${a})`}
              d={`M0 0 L ${3 * scale} ${-4 * scale} L ${1 * scale} ${-30 * scale} L ${-1.5 * scale} ${-4 * scale} Z`}
            />
          ))}
        </g>
        <circle class="en-hub" r={2.4 * scale} />
      </g>
    </g>
  );
}

export function WindView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as WindState;
  const k = width / W;
  const turning = isTurningAt(s.speed);
  const supply = supplyOf(s);
  const scale = s.mills <= 3 ? 1 : s.mills <= 6 ? 0.75 : 0.55;
  const span = 200;
  const xs = range(s.mills).map(
    (i) => 30 + (s.mills === 1 ? span / 2 : (i * span) / (s.mills - 1)),
  );
  const gusts = Math.round(s.speed / 10);
  return (
    <div class="en-wf">
      <Stage
        label={describeWind(s)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "en-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="en-sky" x={0} y={0} width={W} height={H} rx={12} />
          <path
            class="en-hill"
            d={`M0 ${GROUND - 6} Q 120 ${GROUND - 26} 240 ${GROUND - 8} T 320 ${GROUND} V ${H} H 0 Z`}
          />
          <g data-part={WindPart.Farm}>
            {xs.map((x) => (
              <Mill key={x} x={x} s={s} scale={scale} speed={s.speed} />
            ))}
          </g>
          {range(gusts).map((i) => (
            <Arrow
              key={i}
              cls="en-gust"
              x1={6}
              y1={22 + i * 14}
              x2={6 + 18 + s.speed}
              y2={22 + i * 14}
              head={5}
            />
          ))}
          <text class="en-small" x={10} y={H - 8}>
            {say(locale, WORDS.wind)} {s.speed} {WORDS.kmh.en}
            {!turning ? ` · ${say(locale, WORDS.still)}` : ""}
          </text>
          {/* the village house: lit by wind, by back-up, or dark */}
          <g transform={`translate(272 ${GROUND - 2})`}>
            <path class="en-house" d="M-20 0 V -22 L 0 -36 L 20 -22 V 0 Z" />
            <rect
              class={supply === Supply.None ? "en-window" : "en-window is-lit"}
              x={-7}
              y={-18}
              width={14}
              height={11}
            />
            <text class="en-tiny" x={0} y={-42} text-anchor="middle">
              {say(
                locale,
                supply === Supply.Wind
                  ? WORDS.litWind
                  : supply === Supply.Battery
                    ? WORDS.litBattery
                    : WORDS.dark,
              )}
            </text>
          </g>
        </g>
      </Stage>
      {s.showReadout && (
        <div class="en-readout" data-part={WindPart.Readout}>
          <span>
            {say(locale, WORDS.output)} <strong>{num(outputOf(s))} MW</strong>
          </span>
          <span>
            {say(locale, WORDS.land)}{" "}
            <strong>
              {landOf(s.mills)} {say(locale, WORDS.ha)}
            </strong>
          </span>
          {!turning && <span class="en-note">{say(locale, WORDS.cutIn)}</span>}
        </div>
      )}
      <div class="en-controls" data-part={WindPart.Controls}>
        {s.canSetSpeed && (
          <span class="en-stepper">
            <button
              type="button"
              class="en-button is-small"
              disabled={s.speed <= 0}
              onClick={() => call(WindAction.SetSpeed, { speed: s.speed - SPEED_STEP })}
            >
              −
            </button>
            <span class="en-stepper-value">
              {s.speed} {WORDS.kmh.en}
            </span>
            <button
              type="button"
              class="en-button is-small"
              disabled={s.speed >= MAX_SPEED}
              onClick={() => call(WindAction.SetSpeed, { speed: s.speed + SPEED_STEP })}
            >
              +
            </button>
          </span>
        )}
        {s.canSetMills && (
          <span class="en-stepper">
            <button
              type="button"
              class="en-button is-small"
              disabled={s.mills <= 1}
              onClick={() => call(WindAction.SetMills, { mills: s.mills - 1 })}
            >
              −
            </button>
            <span class="en-stepper-value">
              {s.mills} {say(locale, WORDS.mills)}
            </span>
            <button
              type="button"
              class="en-button is-small"
              disabled={s.mills >= MAX_MILLS}
              onClick={() => call(WindAction.SetMills, { mills: s.mills + 1 })}
            >
              +
            </button>
          </span>
        )}
        {s.canSetBattery && (
          <button
            type="button"
            class={s.hasBattery ? "en-button is-on" : "en-button"}
            aria-pressed={s.hasBattery}
            onClick={() => call(WindAction.SetBattery, { hasBattery: !s.hasBattery })}
          >
            {say(locale, s.hasBattery ? WORDS.battery : WORDS.noBattery)}
          </button>
        )}
      </div>
    </div>
  );
}
