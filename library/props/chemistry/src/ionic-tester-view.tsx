import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  FORM_WORDS,
  SALT_POINTS,
  SaltForm,
  TesterAction,
  type TesterState,
  describeTester,
  ionsFree,
} from "./ionic-tester";
import { type Words, range, say } from "./words";

const W = 320;
const H = 180;
const FLOOR = 166;
const BOX = { left: 100, right: 220, top: 82, bottom: 150 } as const;
const ANODE = 128;
const CATHODE = 192;

const WORDS = {
  on: { en: "Switch on", hi: "स्विच चालू करो" },
  off: { en: "Switch off", hi: "स्विच बंद करो" },
  glows: { en: "glows", hi: "जलता है" },
  dark: { en: "off", hi: "बंद" },
  mp: { en: "melts at", hi: "गलनांक" },
} as const satisfies Record<string, Words>;

/** A grid of alternating + and − ions: a rigid lattice. */
function Lattice({ x, y, cols, rows }: { x: number; y: number; cols: number; rows: number }) {
  return (
    <g class="mn-lattice">
      {range(rows).flatMap((r) =>
        range(cols).map((c) => {
          const plus = (r + c) % 2 === 0;
          return (
            <g key={`${r}-${c}`}>
              <circle
                class={plus ? "mn-ion is-plus" : "mn-ion is-minus"}
                cx={x + c * 9}
                cy={y + r * 9}
                r={plus ? 3 : 4}
              />
            </g>
          );
        }),
      )}
    </g>
  );
}

/** Ions scattered through a liquid; with the current on they drift to the electrodes. */
function FreeIons({ on, liquidTop }: { on: boolean; liquidTop: number }) {
  return (
    <g class={on ? "mn-free is-on" : "mn-free"}>
      {range(14).map((i) => {
        const plus = i % 2 === 0;
        const x = BOX.left + 12 + ((i * 37) % (BOX.right - BOX.left - 24));
        const y = liquidTop + 8 + ((i * 23) % (BOX.bottom - liquidTop - 14));
        const toward = plus ? CATHODE : ANODE;
        return (
          <circle
            key={i}
            class={plus ? "mn-ion is-plus mn-drift" : "mn-ion is-minus mn-drift"}
            cx={x}
            cy={y}
            r={plus ? 3 : 4}
            style={
              {
                "--dx": `${(toward - x) * 0.6}px`,
                animationDelay: `${(i * 0.21) % 1.4}s`,
              } as JSX.CSSProperties
            }
          />
        );
      })}
    </g>
  );
}

/** A salt in a container with two electrodes, wired through a battery and a bulb. */
export function IonicTesterView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as TesterState;
  const salt = SALT_POINTS[s.salt];
  const k = width / W;
  const height = Math.round(H * k);
  const glows = s.isOn && ionsFree(s.form);
  const liquidTop = BOX.top + 12;
  const isLiquid = s.form !== SaltForm.Solid;
  return (
    <div class="mn mn-it">
      <Stage
        label={describeTester(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "mn-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="mn-bg" x={0} y={0} width={W} height={H} rx={12} />
          <rect class="mn-bench" x={0} y={FLOOR} width={W} height={H - FLOOR} />
          <text class="mn-title" x={12} y={20}>
            {salt.formula}
          </text>
          <text class="mn-small" x={12} y={34}>
            {say(locale, FORM_WORDS[s.form])}
          </text>
          {/* The circuit: battery, bulb, two electrodes. */}
          <rect class="mn-battery" x={24} y={58} width={40} height={22} rx={3} />
          <path class="mn-wire-lead" d={`M64 69 H ${ANODE} V ${BOX.top}`} />
          <path
            class="mn-wire-lead"
            d={`M44 58 V 40 H 250 V 50 M250 70 V 74 H ${CATHODE} V ${BOX.top}`}
          />
          {glows && <circle class="mn-glow mn-after" cx={250} cy={60} r={22} />}
          <circle class={glows ? "mn-bulb is-on" : "mn-bulb"} cx={250} cy={60} r={10} />
          <text class="mn-small" x={274} y={64}>
            {say(locale, glows ? WORDS.glows : WORDS.dark)}
          </text>
          <g data-part="container">
            {s.form === SaltForm.Molten && (
              <g>
                <path
                  class="mn-flame"
                  d={`M${(BOX.left + BOX.right) / 2 - 6} ${FLOOR} q 12 -10 0 -14 q 16 4 10 14 z`}
                />
              </g>
            )}
            {isLiquid && (
              <rect
                class={
                  s.form === SaltForm.Water
                    ? "mn-liquid is-water"
                    : s.form === SaltForm.Kerosene
                      ? "mn-liquid is-kerosene"
                      : "mn-liquid is-melt"
                }
                x={BOX.left + 2}
                y={liquidTop}
                width={BOX.right - BOX.left - 4}
                height={BOX.bottom - liquidTop}
              />
            )}
            {s.showIons && s.form === SaltForm.Solid && (
              <Lattice x={BOX.left + 26} y={BOX.bottom - 40} cols={8} rows={5} />
            )}
            {s.showIons && s.form === SaltForm.Kerosene && (
              <Lattice x={BOX.left + 34} y={BOX.bottom - 22} cols={6} rows={3} />
            )}
            {s.showIons && ionsFree(s.form) && <FreeIons on={s.isOn} liquidTop={liquidTop} />}
            {!s.showIons && s.form === SaltForm.Solid && (
              <rect
                class="mn-salt-lump"
                x={BOX.left + 24}
                y={BOX.bottom - 36}
                width={72}
                height={34}
                rx={4}
              />
            )}
            <rect
              class="mn-electrode"
              x={ANODE - 3}
              y={BOX.top - 2}
              width={6}
              height={BOX.bottom - BOX.top - 8}
              rx={1}
            />
            <rect
              class="mn-electrode"
              x={CATHODE - 3}
              y={BOX.top - 2}
              width={6}
              height={BOX.bottom - BOX.top - 8}
              rx={1}
            />
            <text class="mn-small" x={ANODE} y={BOX.top - 6} text-anchor="middle">
              +
            </text>
            <text class="mn-small" x={CATHODE} y={BOX.top - 6} text-anchor="middle">
              −
            </text>
            <path
              class="mn-glass-line"
              d={`M${BOX.left} ${BOX.top} V ${BOX.bottom} H ${BOX.right} V ${BOX.top}`}
            />
          </g>
          <text class="mn-small" x={W - 12} y={FLOOR - 4} text-anchor="end">
            {say(locale, WORDS.mp)} {salt.meltingK} K
          </text>
        </g>
      </Stage>
      {s.forms.length > 1 && (
        <div class="mn-chips" data-part="forms">
          {s.forms.map((f) => (
            <button
              key={f}
              type="button"
              class={f === s.form ? "mn-chip is-on" : "mn-chip"}
              aria-pressed={f === s.form}
              onClick={() => call(TesterAction.SetForm, { form: f })}
            >
              {say(locale, FORM_WORDS[f])}
            </button>
          ))}
        </div>
      )}
      {s.salts.length > 1 && (
        <div class="mn-chips" data-part="salts">
          {s.salts.map((x) => (
            <button
              key={x}
              type="button"
              class={x === s.salt ? "mn-chip is-on" : "mn-chip"}
              aria-pressed={x === s.salt}
              onClick={() => call(TesterAction.Choose, { salt: x })}
            >
              {SALT_POINTS[x].formula}
            </button>
          ))}
        </div>
      )}
      <div class="mn-row">
        <button
          type="button"
          class={s.isOn ? "mn-button is-on" : "mn-button is-again"}
          data-part="switch"
          aria-pressed={s.isOn}
          onClick={() => call(TesterAction.Switch, { on: !s.isOn })}
        >
          {say(locale, s.isOn ? WORDS.off : WORDS.on)}
        </button>
      </div>
    </div>
  );
}
