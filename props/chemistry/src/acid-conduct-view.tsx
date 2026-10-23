import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  ConductAction,
  type ConductState,
  PARTICLES,
  brightnessOf,
  describeConduct,
  hasIons,
} from "./acid-conduct";
import { SUBSTANCES } from "./acid-data";
import { Beaker, Chips } from "./acid-draw";
import { type Words, say } from "./words";

const W = 320;
const H = 196;
const TABLE = 186;
const BEAKER_X = 92;

const WORDS = {
  on: { en: "Switch on", hi: "स्विच ऑन करो" },
  off: { en: "Switch off", hi: "स्विच ऑफ़ करो" },
  pour: { en: "Solution in the beaker", hi: "बीकर में विलयन" },
  battery: { en: "6 V", hi: "6 V" },
  closeUp: { en: "in the water", hi: "पानी के अंदर" },
  noIons: { en: "no ions", hi: "कोई आयन नहीं" },
  nails: { en: "nails", hi: "कीलें" },
} as const satisfies Record<string, Words>;

/** Where the particles of the close-up sit (inside a circle of radius 40 at (0, 0)). */
const SPOTS: readonly [number, number][] = [
  [-22, -18],
  [10, -26],
  [26, -4],
  [-6, 2],
  [-28, 14],
  [14, 20],
  [-8, 28],
  [30, 18],
];

/** A name over at most two lines (split at its middle space when long). */
function nameLines(text: string): string[] {
  if (text.length <= 14) return [text];
  const words = text.split(" ");
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")].filter((x) => x !== "");
}

/** The circuit: battery, switch, bulb, two nails in a beaker; and a close-up of the solution. */
export function ConductivityView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ConductState;
  const k = width / W;
  const height = Math.round(H * k);
  const b = brightnessOf(s);
  const ions = PARTICLES[s.solution];
  const nailL = BEAKER_X - 14;
  const nailR = BEAKER_X + 14;
  return (
    <div class="ct ac">
      <Stage
        label={describeConduct(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "ct-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="ac-bg" x={0} y={0} width={W} height={H} rx={12} />
          <rect class="ac-table" x={0} y={TABLE} width={W} height={H - TABLE} />
          {/* wires: battery → switch → bulb → left nail; right nail → battery */}
          <path class={s.isOn ? "ct-wire is-live" : "ct-wire"} d={`M${nailL} 108 V40 H128`} />
          <path class={s.isOn ? "ct-wire is-live" : "ct-wire"} d="M160 40 H196" />
          <path class={s.isOn ? "ct-wire is-live" : "ct-wire"} d="M226 40 H240 V150 H232" />
          <path
            class={s.isOn ? "ct-wire is-live" : "ct-wire"}
            d={`M196 150 H${nailR + 26} V100 H${nailR}  V108`}
          />
          {/* the bulb */}
          <g data-part="bulb" class={`ct-bulb is-${b}`}>
            {b > 0 && <circle class="ct-glow" cx={144} cy={28} r={b === 2 ? 26 : 16} />}
            <circle class="ct-glass" cx={144} cy={28} r={11} />
            <path class="ct-filament" d="M139 32 q 2.5 -8 5 0 q 2.5 -8 5 0" />
            <rect class="ct-cap" x={138} y={38} width={12} height={6} rx={1.5} />
            <line class="ct-wire" x1={128} y1={40} x2={138} y2={40} />
            <line class="ct-wire" x1={150} y1={40} x2={160} y2={40} />
          </g>
          {/* the switch */}
          <g data-part="switch" class="ct-switch">
            <circle cx={198} cy={40} r={3} />
            <circle cx={224} cy={40} r={3} />
            <line class="ct-lever" x1={198} y1={40} x2={s.isOn ? 224 : 220} y2={s.isOn ? 40 : 28} />
          </g>
          {/* the battery */}
          <g class="ct-battery">
            <rect x={196} y={140} width={36} height={20} rx={3} />
            <text x={214} y={154} text-anchor="middle">
              {say(locale, WORDS.battery)}
            </text>
          </g>
          {/* the beaker, the cork and the nails */}
          <g data-part="beaker">
            <Beaker x={BEAKER_X} top={104} bottom={TABLE} w={84} fill="ac-water" level={126} />
            <rect class="ct-cork" x={BEAKER_X - 24} y={170} width={48} height={12} rx={3} />
            <rect class="ct-nail" x={nailL - 1.5} y={108} width={3} height={64} />
            <rect class="ct-nail" x={nailR - 1.5} y={108} width={3} height={64} />
            {nameLines(say(locale, SUBSTANCES[s.solution].name)).map((line, i) => (
              <text key={line} class="ac-label" x={140} y={114 + i * 12}>
                {line}
              </text>
            ))}
          </g>
          {/* the close-up of what is in the water */}
          {s.showIons && (
            <g data-part="closeUp" class="ct-closeup" transform="translate(284 96)">
              <circle class="ct-lens" r={33} />
              <g transform="scale(0.78)">
                {ions.flatMap((p, i) =>
                  [0, 1, 2].map((j) => {
                    const spot = SPOTS[(i * 3 + j) % SPOTS.length] ?? [0, 0];
                    const cls =
                      p.charge > 0
                        ? "ct-ion is-plus"
                        : p.charge < 0
                          ? "ct-ion is-minus"
                          : "ct-molecule";
                    return (
                      <g
                        key={`${p.label}-${j}`}
                        class={s.isOn && p.charge !== 0 ? `${cls} is-drifting` : cls}
                        transform={`translate(${spot[0]} ${spot[1]})`}
                      >
                        <circle r={p.charge === 0 ? 5 : 4} />
                        {j === 0 && (
                          <text y={-7} text-anchor="middle">
                            {p.label}
                          </text>
                        )}
                      </g>
                    );
                  }),
                )}
              </g>
              <text class="ct-closeup-label" y={46} text-anchor="middle">
                {hasIons(s.solution) ? say(locale, WORDS.closeUp) : say(locale, WORDS.noIons)}
              </text>
            </g>
          )}
        </g>
      </Stage>
      <div class="ac-under">
        {s.canSwitch && (
          <button
            type="button"
            class={s.isOn ? "ac-button is-on" : "ac-button"}
            data-part="switch"
            aria-pressed={s.isOn}
            onClick={() => call(ConductAction.Switch, { on: !s.isOn })}
          >
            {say(locale, s.isOn ? WORDS.off : WORDS.on)}
          </button>
        )}
      </div>
      {s.canChoose && (
        <Chips
          options={s.solutions.map((id) => ({ id, words: SUBSTANCES[id].name }))}
          chosen={s.solution}
          label={WORDS.pour}
          onChoose={(solution) => call(ConductAction.Choose, { solution })}
          locale={locale}
          part="solutions"
        />
      )}
    </div>
  );
}
