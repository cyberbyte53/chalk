import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Crossing, Pole } from "./draw";
import {
  MotorAction,
  type MotorState,
  brushXOf,
  currentInAB,
  describeMotor,
  forceOnAB,
  norm,
  spinOf,
} from "./motor";
import { type Words, say } from "./words";

const W = 320;
const H = 220;
const O = { x: 160, y: 104 } as const;
const R = 64;
const RING = 15;

const WORDS = {
  turn45: { en: "Turn 45°", hi: "45° घुमाओ" },
  turn90: { en: "Turn 90°", hi: "90° घुमाओ" },
  on: { en: "Battery on", hi: "बैटरी चालू" },
  off: { en: "Battery off", hi: "बैटरी बंद" },
  run: { en: "Run motor", hi: "मोटर चलाओ" },
  stop: { en: "Stop", hi: "रोको" },
  split: { en: "Use split ring", hi: "विभक्त वलय लगाओ" },
  slip: { en: "Use plain rings", hi: "सादे वलय लगाओ" },
  anticlockwise: { en: "turns anticlockwise", hi: "वामावर्त घूमती है" },
  clockwise: { en: "turns clockwise", hi: "दक्षिणावर्त घूमती है" },
  gap: { en: "brushes on the gaps: no current", hi: "ब्रश दरारों पर: कोई धारा नहीं" },
  off2: { en: "no current", hi: "कोई धारा नहीं" },
  rocking: { en: "plain rings: the coil only rocks", hi: "सादे वलय: कुंडली केवल झूलती है" },
  spinning: { en: "running: it keeps turning", hi: "चल रही है: घूमती रहती है" },
} as const satisfies Record<string, Words>;

const rad = (d: number) => (d * Math.PI) / 180;
const at = (deg: number, r: number) =>
  [O.x + r * Math.cos(rad(deg)), O.y - r * Math.sin(rad(deg))] as const;

/** An arc of the ring from angle a to b (anticlockwise, degrees), radius r. */
function arc(a: number, b: number, r: number): string {
  const [x1, y1] = at(a, r);
  const [x2, y2] = at(b, r);
  const large = norm(b - a) > 180 ? 1 : 0;
  return `M${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x2} ${y2}`;
}

function Rings({ s }: { s: MotorState }): JSX.Element {
  const a = norm(s.angle);
  const touchX = brushXOf(s);
  if (!s.hasSplitRing)
    return (
      <g data-part="rings">
        <circle class="mg-ring is-p" cx={O.x} cy={O.y} r={RING} />
        <circle class="mg-ring is-q" cx={O.x} cy={O.y} r={RING - 6} />
      </g>
    );
  return (
    <g data-part="rings">
      <path
        class={touchX === "P" ? "mg-ring is-p is-touched" : "mg-ring is-p"}
        d={arc(90 + a + 8, 270 + a - 8, RING)}
      />
      <path
        class={touchX === "Q" ? "mg-ring is-q is-touched" : "mg-ring is-q"}
        d={arc(270 + a + 8, 450 + a - 8, RING)}
      />
      {(() => {
        const [px, py] = at(180 + a, RING + 9);
        const [qx, qy] = at(a, RING + 9);
        return (
          <g class="mg-ring-names">
            <text x={px} y={py + 4} text-anchor="middle">
              P
            </text>
            <text x={qx} y={qy + 4} text-anchor="middle">
              Q
            </text>
          </g>
        );
      })()}
    </g>
  );
}

export function MotorView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as MotorState;
  const k = width / W;
  const a = norm(s.angle);
  const i = s.isRunning ? "none" : currentInAB(s);
  const f = forceOnAB(s);
  const spin = spinOf(s);
  const [abx, aby] = at(180 + a, R);
  const [cdx, cdy] = at(a, R);
  const [abLx, abLy] = at(180 + a + 18, R + 4);
  const [cdLx, cdLy] = at(a + 18, R + 4);
  const cdCurrent = i === "in" ? "out" : i === "out" ? "in" : "none";
  const caption = s.isRunning
    ? s.hasSplitRing
      ? WORDS.spinning
      : WORDS.rocking
    : !s.isOn
      ? WORDS.off2
      : i === "none"
        ? WORDS.gap
        : spin === "clockwise"
          ? WORDS.clockwise
          : spin === "anticlockwise"
            ? WORDS.anticlockwise
            : WORDS.gap;
  const spinClass = s.isRunning ? (s.hasSplitRing ? " is-spinning" : " is-rocking") : "";
  return (
    <div class="mg-mo">
      <Stage
        label={describeMotor(s)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "mg-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="mg-bg" x={0} y={0} width={W} height={H} rx={12} />
          <Pole x={12} y={40} w={40} h={128} name="N" />
          <Pole x={268} y={40} w={40} h={128} name="S" />
          {[62, 104, 146].map((y) => (
            <Arrow key={y} cls="mg-faint-arrow" x1={60} y1={y} x2={262} y2={y} head={6} />
          ))}
          <g class={`mg-rotor${spinClass}`}>
            <g data-part="coil">
              <line class="mg-coil" x1={abx} y1={aby} x2={cdx} y2={cdy} />
              <Crossing x={abx} y={aby} r={9} current={i} />
              <Crossing x={cdx} y={cdy} r={9} current={cdCurrent} />
            </g>
            <Rings s={s} />
          </g>
          {!s.isRunning && s.showLabels && (
            <g class="mg-arm-names">
              <text x={abLx} y={abLy + 4} text-anchor="middle">
                AB
              </text>
              <text x={cdLx} y={cdLy + 4} text-anchor="middle">
                CD
              </text>
            </g>
          )}
          <g data-part="brushes" class="mg-brushes">
            <rect x={O.x - RING - 13} y={O.y - 4} width={12} height={8} rx={2} />
            <rect x={O.x + RING + 1} y={O.y - 4} width={12} height={8} rx={2} />
            {s.showLabels && (
              <g class="mg-small-names">
                <text x={O.x - RING - 16} y={O.y + 18} text-anchor="middle">
                  X
                </text>
                <text x={O.x + RING + 16} y={O.y + 18} text-anchor="middle">
                  Y
                </text>
              </g>
            )}
          </g>
          {s.showForces && !s.isRunning && f !== "none" && (
            <g data-part="forces">
              <Arrow
                cls="mg-force"
                x1={abx}
                y1={aby + (f === "down" ? 11 : -11)}
                x2={abx}
                y2={aby + (f === "down" ? 40 : -40)}
                head={8}
              />
              <Arrow
                cls="mg-force"
                x1={cdx}
                y1={cdy + (f === "down" ? -11 : 11)}
                x2={cdx}
                y2={cdy + (f === "down" ? -40 : 40)}
                head={8}
              />
            </g>
          )}
          <text class="mg-caption" x={W / 2} y={H - 10} text-anchor="middle">
            {say(locale, caption)}
          </text>
        </g>
      </Stage>
      {(s.canTurn || s.canRun || s.canSwapRings) && (
        <div class="mg-controls" data-part="controls">
          {s.canTurn && !s.isRunning && (
            <>
              <button
                type="button"
                class="mg-button"
                onClick={() => call(MotorAction.Turn, { by: 45 })}
              >
                {say(locale, WORDS.turn45)}
              </button>
              <button
                type="button"
                class="mg-button"
                onClick={() => call(MotorAction.Turn, { by: 90 })}
              >
                {say(locale, WORDS.turn90)}
              </button>
              <button
                type="button"
                class={s.isOn ? "mg-button is-on" : "mg-button"}
                aria-pressed={s.isOn}
                onClick={() => call(MotorAction.SetOn, { isOn: !s.isOn })}
              >
                {say(locale, s.isOn ? WORDS.off : WORDS.on)}
              </button>
            </>
          )}
          {s.canRun && (
            <button
              type="button"
              class={s.isRunning ? "mg-button is-on" : "mg-button is-primary"}
              aria-pressed={s.isRunning}
              onClick={() => call(MotorAction.Run, { isRunning: !s.isRunning })}
            >
              {say(locale, s.isRunning ? WORDS.stop : WORDS.run)}
            </button>
          )}
          {s.canSwapRings && (
            <button
              type="button"
              class="mg-button"
              onClick={() => call(MotorAction.SetRings, { hasSplitRing: !s.hasSplitRing })}
            >
              {say(locale, s.hasSplitRing ? WORDS.slip : WORDS.split)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
