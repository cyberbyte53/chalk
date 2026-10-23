import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Crossing, Galvanometer, Pole } from "./draw";
import {
  GeneratorAction,
  type GeneratorState,
  Rings,
  armCurrentOf,
  currentInABOf,
  describeGenerator,
  outputOf,
} from "./generator";
import { type Words, say } from "./words";

const W = 320;
const MACHINE_H = 200;
const GRAPH_H = 112;
const O = { x: 150, y: 92 } as const;
const R = 58;
const RING = 14;

const WORDS = {
  turn45: { en: "Turn 45°", hi: "45° घुमाओ" },
  turn90: { en: "Turn 90°", hi: "90° घुमाओ" },
  crank: { en: "Keep turning", hi: "घुमाते रहो" },
  stop: { en: "Stop", hi: "रोको" },
  slip: { en: "Slip rings (AC)", hi: "सर्पी वलय (AC)" },
  split: { en: "Split ring (DC)", hi: "विभक्त वलय (DC)" },
  current: { en: "current", hi: "धारा" },
  oneTurn: { en: "1 turn", hi: "1 चक्कर" },
  twoTurns: { en: "2 turns", hi: "2 चक्कर" },
  ac: { en: "AC: reverses every half turn", hi: "AC: हर आधे चक्कर पर दिशा बदलती है" },
  dc: { en: "DC: always one way", hi: "DC: सदा एक दिशा में" },
} as const satisfies Record<string, Words>;

const rad = (d: number) => (d * Math.PI) / 180;
const norm = (a: number) => ((a % 360) + 360) % 360;
const at = (deg: number, r: number) =>
  [O.x + r * Math.cos(rad(deg)), O.y - r * Math.sin(rad(deg))] as const;

function arc(a: number, b: number, r: number): string {
  const [x1, y1] = at(a, r);
  const [x2, y2] = at(b, r);
  return `M${x1} ${y1} A ${r} ${r} 0 ${norm(b - a) > 180 ? 1 : 0} 0 ${x2} ${y2}`;
}

function Graph({ s, locale }: { s: GeneratorState; locale: string }): JSX.Element {
  const x0 = 34;
  const x1 = W - 14;
  const mid = 50;
  const amp = 34;
  const sx = (deg: number) => x0 + ((x1 - x0) * deg) / 720;
  const pts: string[] = [];
  for (let d = 0; d <= 720; d += 6) {
    const v = outputOf({ angle: d, rings: s.rings });
    pts.push(`${d === 0 ? "M" : "L"}${sx(d).toFixed(1)} ${(mid - amp * v).toFixed(1)}`);
  }
  const a = norm(s.angle);
  const v = outputOf(s);
  return (
    <g class="mg-graph" data-part="graph">
      <rect class="mg-bg" x={0} y={0} width={W} height={GRAPH_H} rx={12} />
      <line class="mg-axis" x1={x0} y1={mid} x2={x1} y2={mid} />
      <line class="mg-axis" x1={x0} y1={mid - amp - 8} x2={x0} y2={mid + amp + 8} />
      <text class="mg-small" x={x0 - 4} y={mid - amp + 4} text-anchor="end">
        +
      </text>
      <text class="mg-small" x={x0 - 4} y={mid + amp + 4} text-anchor="end">
        −
      </text>
      <text class="mg-small" x={x0 + 4} y={12}>
        {say(locale, WORDS.current)}
      </text>
      {[360, 720].map((d) => (
        <g key={d}>
          <line class="mg-grid" x1={sx(d)} y1={mid - amp - 6} x2={sx(d)} y2={mid + amp + 6} />
          <text class="mg-small" x={sx(d)} y={GRAPH_H - 8} text-anchor="end">
            {say(locale, d === 360 ? WORDS.oneTurn : WORDS.twoTurns)}
          </text>
        </g>
      ))}
      <path class="mg-curve" d={pts.join(" ")} />
      {!s.isRunning && <circle class="mg-marker" cx={sx(a)} cy={mid - amp * v} r={5} />}
      <text class="mg-graph-kind" x={W - 14} y={14} text-anchor="end">
        {say(locale, s.rings === Rings.Slip ? WORDS.ac : WORDS.dc)}
      </text>
    </g>
  );
}

export function GeneratorView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as GeneratorState;
  const k = width / W;
  const H = MACHINE_H + (s.showGraph ? GRAPH_H + 8 : 0);
  const a = norm(s.angle);
  const ab = 180 - a;
  const [abx, aby] = at(ab, R);
  const [cdx, cdy] = at(ab + 180, R);
  const [abLx, abLy] = at(ab - 20, R + 4);
  const [cdLx, cdLy] = at(ab + 160, R + 4);
  const i = s.isRunning || !s.showCurrent ? "none" : currentInABOf(s);
  const cd = i === "in" ? "out" : i === "out" ? "in" : "none";
  const moving = armCurrentOf(s.angle);
  return (
    <div class="mg-ge">
      <Stage
        label={describeGenerator(s)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "mg-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="mg-bg" x={0} y={0} width={W} height={MACHINE_H} rx={12} />
          <Pole x={10} y={34} w={36} h={116} name="N" />
          <Pole x={254} y={34} w={36} h={116} name="S" />
          {[56, 92, 128].map((y) => (
            <Arrow key={y} cls="mg-faint-arrow" x1={52} y1={y} x2={248} y2={y} head={6} />
          ))}
          <g class={s.isRunning ? "mg-rotor is-cranking" : "mg-rotor"}>
            <g data-part="coil">
              <line class="mg-coil" x1={abx} y1={aby} x2={cdx} y2={cdy} />
              <Crossing x={abx} y={aby} r={9} current={i} />
              <Crossing x={cdx} y={cdy} r={9} current={cd} />
            </g>
            <g data-part="rings">
              {s.rings === Rings.Slip ? (
                <>
                  <circle class="mg-ring is-p" cx={O.x} cy={O.y} r={RING} />
                  <circle class="mg-ring is-q" cx={O.x} cy={O.y} r={RING - 6} />
                </>
              ) : (
                <>
                  <path class="mg-ring is-p" d={arc(270 - a + 8, 450 - a - 8, RING)} />
                  <path class="mg-ring is-q" d={arc(90 - a + 8, 270 - a - 8, RING)} />
                </>
              )}
            </g>
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
          {!s.isRunning && s.showCurrent && Math.abs(moving) > 0.05 && (
            <g class="mg-motion-arrows">
              <Arrow
                cls="mg-motion"
                x1={abx - 18}
                y1={aby}
                x2={abx - 18}
                y2={aby + (Math.cos(rad(a)) > 0 ? -22 : 22)}
                head={6}
              />
            </g>
          )}
          <g class="mg-brushes">
            <rect x={O.x - RING - 12} y={O.y - 4} width={11} height={8} rx={2} />
            <rect x={O.x + RING + 1} y={O.y - 4} width={11} height={8} rx={2} />
            {s.showLabels && (
              <g class="mg-small-names">
                <text x={O.x - RING - 14} y={O.y + 18} text-anchor="middle">
                  B1
                </text>
                <text x={O.x + RING + 14} y={O.y + 18} text-anchor="middle">
                  B2
                </text>
              </g>
            )}
          </g>
          <path class="mg-lead" d={`M${O.x - RING - 12} ${O.y} H 66 V 166 H 128`} />
          <path class="mg-lead" d={`M${O.x + RING + 12} ${O.y} H 236 V 166 H 172`} />
          <g data-part="galvanometer">
            <Galvanometer x={150} y={170} r={20} swing={s.isRunning ? 0 : outputOf(s) * 0.9} />
          </g>
        </g>
        {s.showGraph && (
          <g transform={`scale(${k}) translate(0 ${MACHINE_H + 8})`}>
            <Graph s={s} locale={locale} />
          </g>
        )}
      </Stage>
      {(s.canTurn || s.canRun || s.canSetRings) && (
        <div class="mg-controls" data-part="controls">
          {s.canTurn && !s.isRunning && (
            <>
              <button
                type="button"
                class="mg-button"
                onClick={() => call(GeneratorAction.Turn, { by: 45 })}
              >
                {say(locale, WORDS.turn45)}
              </button>
              <button
                type="button"
                class="mg-button"
                onClick={() => call(GeneratorAction.Turn, { by: 90 })}
              >
                {say(locale, WORDS.turn90)}
              </button>
            </>
          )}
          {s.canRun && (
            <button
              type="button"
              class={s.isRunning ? "mg-button is-on" : "mg-button is-primary"}
              aria-pressed={s.isRunning}
              onClick={() => call(GeneratorAction.Run, { isRunning: !s.isRunning })}
            >
              {say(locale, s.isRunning ? WORDS.stop : WORDS.crank)}
            </button>
          )}
          {s.canSetRings && (
            <button
              type="button"
              class="mg-button"
              onClick={() =>
                call(GeneratorAction.SetRings, {
                  rings: s.rings === Rings.Slip ? Rings.Split : Rings.Slip,
                })
              }
            >
              {say(locale, s.rings === Rings.Slip ? WORDS.split : WORDS.slip)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
