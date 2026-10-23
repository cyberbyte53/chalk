import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Person } from "./draw";
import {
  APPLIANCES_ON,
  Appliance,
  Circuit,
  Fault,
  RATING,
  WATTS,
  WiringAction,
  type WiringState,
  currentOf,
  describeWiring,
  isBodyLiveOf,
  isShockOf,
} from "./wiring";
import { type Words, num, say } from "./words";

const W = 320;
const H = 262;
const ROW: Readonly<Record<Circuit, { live: number; neutral: number }>> = {
  five: { live: 116, neutral: 134 },
  fifteen: { live: 182, neutral: 200 },
};
const EARTH_Y = 222;
const LIVE_X = 20;
const NEUTRAL_X = 34;
const EARTH_X = 48;
const FUSE_X = 72;
const SLOTS = [130, 182, 234] as const;
const OVEN_X = 286;

const NAMES: Readonly<Record<Appliance | "oven", Words>> = {
  bulb: { en: "bulb", hi: "बल्ब" },
  fan: { en: "fan", hi: "पंखा" },
  tv: { en: "TV", hi: "टीवी" },
  geyser: { en: "geyser", hi: "गीज़र" },
  cooler: { en: "cooler", hi: "कूलर" },
  iron: { en: "iron", hi: "इस्त्री" },
  oven: { en: "oven 2 kW", hi: "ओवन 2 kW" },
};

const WORDS = {
  live: { en: "live (red)", hi: "विद्युन्मय (लाल)" },
  neutral: { en: "neutral (black)", hi: "उदासीन (काला)" },
  earth: { en: "earth (green)", hi: "भू-संपर्क (हरा)" },
  meter: { en: "meter", hi: "मीटर" },
  fuse: { en: "fuse", hi: "फ्यूज़" },
  switch: { en: "switch", hi: "स्विच" },
  melted: { en: "fuse melted", hi: "फ्यूज़ पिघला" },
  circuit5: { en: "5 A circuit", hi: "5 A परिपथ" },
  circuit15: { en: "15 A circuit", hi: "15 A परिपथ" },
  replace: { en: "New fuse", hi: "नया फ्यूज़" },
  ovenOut: { en: "Oven unplugged", hi: "ओवन बिना प्लग" },
  oven5: { en: "Oven in 5 A", hi: "ओवन 5 A में" },
  oven15: { en: "Oven in 15 A", hi: "ओवन 15 A में" },
  noFault: { en: "No fault", hi: "कोई दोष नहीं" },
  short: { en: "Short circuit", hi: "लघुपथन" },
  leak: { en: "Live touches iron's body", hi: "विद्युन्मय तार इस्त्री के ढाँचे से छुआ" },
  earthOn: { en: "Earth wire on", hi: "भू-तार लगा है" },
  earthOff: { en: "Earth wire off", hi: "भू-तार हटा है" },
  touch: { en: "Touch the iron", hi: "इस्त्री छुओ" },
  letGo: { en: "Let go", hi: "छोड़ो" },
  shock: { en: "SHOCK!", hi: "झटका!" },
  bodyLive: { en: "body at 220 V", hi: "ढाँचा 220 V पर" },
  missing: { en: "no earth", hi: "भू-तार नहीं" },
} as const satisfies Record<string, Words>;

function Fuse({
  x,
  y,
  isBlown,
  part,
}: { x: number; y: number; isBlown: boolean; part?: string }): JSX.Element {
  return (
    <g class={isBlown ? "mg-fuse is-blown" : "mg-fuse"} data-part={part}>
      <rect x={x - 9} y={y - 5} width={18} height={10} rx={2} />
      {isBlown ? (
        <>
          <line x1={x - 7} y1={y} x2={x - 2} y2={y - 2} />
          <line x1={x + 2} y1={y + 2} x2={x + 7} y2={y} />
        </>
      ) : (
        <line x1={x - 7} y1={y} x2={x + 7} y2={y} />
      )}
    </g>
  );
}

function Device({
  x,
  row,
  name,
  isOn,
  isPowered,
  locale,
  isMetal = false,
}: {
  x: number;
  row: { live: number; neutral: number };
  name: Words;
  isOn: boolean;
  isPowered: boolean;
  locale: string;
  isMetal?: boolean;
}): JSX.Element {
  const glow = isOn && isPowered;
  return (
    <g class={glow ? "mg-device is-on" : "mg-device"}>
      <line class="mg-wire is-live" x1={x - 8} y1={row.live} x2={x - 8} y2={row.live + 4} />
      <line
        class="mg-wire is-neutral"
        x1={x + 8}
        y1={row.neutral}
        x2={x + 8}
        y2={row.neutral - 2}
      />
      <rect
        class={isMetal ? "mg-device-box is-metal" : "mg-device-box"}
        x={x - 14}
        y={row.live + 4}
        width={28}
        height={row.neutral - row.live - 6}
        rx={4}
      />
      <circle class="mg-device-light" cx={x} cy={(row.live + row.neutral) / 2 + 1} r={4} />
      <text class="mg-tiny" x={x} y={row.live - 6} text-anchor="middle">
        {say(locale, name)}
      </text>
    </g>
  );
}

export function WiringView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as WiringState;
  const k = width / W;
  const bodyLive = isBodyLiveOf(s);
  const shock = isShockOf(s);
  const iron = SLOTS[2];
  const fifteen = ROW.fifteen;
  const powered = (c: Circuit) => (c === Circuit.Five ? !s.isBlownFive : !s.isBlownFifteen);
  const rows = [Circuit.Five, Circuit.Fifteen] as const;
  return (
    <div class="mg-hw">
      <Stage
        label={describeWiring(s)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "mg-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="mg-bg" x={0} y={0} width={W} height={H} rx={12} />
          {/* mains down the left, through the meter, main fuse and main switch */}
          <g data-part="mains">
            <line class="mg-wire is-live" x1={LIVE_X} y1={8} x2={LIVE_X} y2={ROW.fifteen.live} />
            <line
              class="mg-wire is-neutral"
              x1={NEUTRAL_X}
              y1={8}
              x2={NEUTRAL_X}
              y2={ROW.fifteen.neutral}
            />
            <line class="mg-wire is-earth" x1={EARTH_X} y1={8} x2={EARTH_X} y2={EARTH_Y} />
          </g>
          <g data-part="meter" class="mg-meter-box">
            <rect x={LIVE_X - 9} y={20} width={NEUTRAL_X - LIVE_X + 18} height={26} rx={4} />
            <text x={(LIVE_X + NEUTRAL_X) / 2} y={37} text-anchor="middle">
              kWh
            </text>
          </g>
          <g class="mg-vfuse">
            <rect x={LIVE_X - 5} y={54} width={10} height={18} rx={2} />
            <line x1={LIVE_X} y1={56} x2={LIVE_X} y2={70} />
          </g>
          <g class="mg-main-switch">
            <rect x={LIVE_X - 9} y={78} width={NEUTRAL_X - LIVE_X + 18} height={14} rx={3} />
          </g>
          <g class="mg-legend">
            <text class="mg-tiny" x={EARTH_X + 10} y={36}>
              ← {say(locale, WORDS.meter)}
            </text>
            <text class="mg-tiny" x={EARTH_X + 10} y={66}>
              ← {say(locale, WORDS.fuse)}
            </text>
            <text class="mg-tiny" x={EARTH_X + 10} y={89}>
              ← {say(locale, WORDS.switch)}
            </text>
            <line class="mg-wire is-live" x1={196} y1={14} x2={212} y2={14} />
            <text class="mg-tiny" x={216} y={17}>
              {say(locale, WORDS.live)} · 220 V
            </text>
            <line class="mg-wire is-neutral" x1={196} y1={30} x2={212} y2={30} />
            <text class="mg-tiny" x={216} y={33}>
              {say(locale, WORDS.neutral)}
            </text>
            <line class="mg-wire is-earth" x1={196} y1={46} x2={212} y2={46} />
            <text class="mg-tiny" x={216} y={49}>
              {say(locale, WORDS.earth)}
            </text>
          </g>
          {rows.map((c) => {
            const row = ROW[c];
            const ok = powered(c);
            return (
              <g key={c}>
                <line
                  class={ok ? "mg-wire is-live" : "mg-wire is-dead"}
                  x1={LIVE_X}
                  y1={row.live}
                  x2={W - 14}
                  y2={row.live}
                />
                <line
                  class={ok ? "mg-wire is-neutral" : "mg-wire is-dead"}
                  x1={NEUTRAL_X}
                  y1={row.neutral}
                  x2={W - 14}
                  y2={row.neutral}
                />
                <Fuse
                  x={FUSE_X}
                  y={row.live}
                  isBlown={!ok}
                  part={c === Circuit.Five ? "fuseFive" : "fuseFifteen"}
                />
                <text class="mg-tiny is-strong" x={FUSE_X - 10} y={row.live - 9}>
                  {say(locale, c === Circuit.Five ? WORDS.circuit5 : WORDS.circuit15)}
                </text>
                {APPLIANCES_ON[c].map((a, n) => (
                  <Device
                    key={a}
                    x={SLOTS[n] as number}
                    row={row}
                    name={NAMES[a]}
                    isOn={s.on.includes(a)}
                    isPowered={ok}
                    locale={locale}
                    isMetal={a === Appliance.Iron}
                  />
                ))}
                {s.oven === c && (
                  <Device
                    x={OVEN_X}
                    row={row}
                    name={NAMES.oven}
                    isOn
                    isPowered={ok}
                    locale={locale}
                  />
                )}
                <text
                  class={ok ? "mg-reading-small" : "mg-warn"}
                  x={FUSE_X - 10}
                  y={row.neutral + 15}
                >
                  {ok ? `${num(currentOf(s, c), 2)} A / ${RATING[c]} A` : say(locale, WORDS.melted)}
                </text>
              </g>
            );
          })}
          {/* the iron's earth */}
          <g data-part="earth">
            <line
              class="mg-wire is-earth"
              x1={EARTH_X}
              y1={EARTH_Y}
              x2={s.hasEarth ? iron : iron - 30}
              y2={EARTH_Y}
            />
            {s.hasEarth ? (
              <line
                class="mg-wire is-earth"
                x1={iron}
                y1={EARTH_Y}
                x2={iron}
                y2={fifteen.neutral - 2}
              />
            ) : (
              <text class="mg-warn" x={iron - 34} y={EARTH_Y + 4} text-anchor="end">
                ✕ {say(locale, WORDS.missing)}
              </text>
            )}
            <g class="mg-earth-plate">
              <line x1={EARTH_X - 8} y1={EARTH_Y + 18} x2={EARTH_X + 8} y2={EARTH_Y + 18} />
              <line x1={EARTH_X - 5} y1={EARTH_Y + 22} x2={EARTH_X + 5} y2={EARTH_Y + 22} />
              <line x1={EARTH_X - 2} y1={EARTH_Y + 26} x2={EARTH_X + 2} y2={EARTH_Y + 26} />
              <line x1={EARTH_X} y1={EARTH_Y} x2={EARTH_X} y2={EARTH_Y + 18} />
            </g>
          </g>
          <g data-part="iron">
            {s.fault === Fault.Short && (
              <path class="mg-spark" d={`M${iron - 10} ${fifteen.live + 2} l 6 6 l -5 3 l 8 7`} />
            )}
            {s.fault === Fault.Leak && (
              <path class="mg-spark" d={`M${iron - 8} ${fifteen.live + 2} l 5 4 l -4 2 l 6 4`} />
            )}
            {bodyLive && (
              <text class="mg-warn" x={iron} y={fifteen.neutral + 12} text-anchor="middle">
                {say(locale, WORDS.bodyLive)}
              </text>
            )}
          </g>
          {s.isTouching && (
            <g class={shock ? "mg-touch is-shock" : "mg-touch"}>
              <Person who="mom" x={iron + 52} y={H - 6} s={0.9} point={[-30, -22]} />
              {shock && (
                <text class="mg-warn" x={iron + 58} y={H - 58} text-anchor="middle">
                  {say(locale, WORDS.shock)}
                </text>
              )}
            </g>
          )}
        </g>
      </Stage>
      <div class="mg-controls" data-part="controls">
        {s.canToggle &&
          (Object.values(Appliance) as Appliance[]).map((a) => (
            <button
              key={a}
              type="button"
              class={s.on.includes(a) ? "mg-chip is-on" : "mg-chip"}
              aria-pressed={s.on.includes(a)}
              onClick={() => call(WiringAction.Toggle, { appliance: a })}
            >
              {say(locale, NAMES[a])} {WATTS[a] >= 1000 ? `${WATTS[a] / 1000} kW` : `${WATTS[a]} W`}
            </button>
          ))}
      </div>
      {s.canPlugOven && (
        <div class="mg-controls">
          {(["none", "five", "fifteen"] as const).map((socket) => (
            <button
              key={socket}
              type="button"
              class={s.oven === socket ? "mg-chip is-on" : "mg-chip"}
              aria-pressed={s.oven === socket}
              onClick={() => call(WiringAction.PlugOven, { socket })}
            >
              {say(
                locale,
                socket === "none" ? WORDS.ovenOut : socket === "five" ? WORDS.oven5 : WORDS.oven15,
              )}
            </button>
          ))}
        </div>
      )}
      {(s.canFault || s.canEarth) && (
        <div class="mg-controls">
          {s.canFault &&
            ([Fault.None, Fault.Short, Fault.Leak] as const).map((f) => (
              <button
                key={f}
                type="button"
                class={s.fault === f ? "mg-chip is-on" : "mg-chip"}
                aria-pressed={s.fault === f}
                onClick={() => call(WiringAction.SetFault, { fault: f })}
              >
                {say(
                  locale,
                  f === Fault.None ? WORDS.noFault : f === Fault.Short ? WORDS.short : WORDS.leak,
                )}
              </button>
            ))}
          {s.canEarth && (
            <button
              type="button"
              class={s.hasEarth ? "mg-chip is-on" : "mg-chip"}
              aria-pressed={s.hasEarth}
              onClick={() => call(WiringAction.SetEarth, { hasEarth: !s.hasEarth })}
            >
              {say(locale, s.hasEarth ? WORDS.earthOn : WORDS.earthOff)}
            </button>
          )}
          {s.fault === Fault.Leak && (
            <button
              type="button"
              class={s.isTouching ? "mg-chip is-on" : "mg-chip"}
              aria-pressed={s.isTouching}
              onClick={() => call(WiringAction.Touch, { isTouching: !s.isTouching })}
            >
              {say(locale, s.isTouching ? WORDS.letGo : WORDS.touch)}
            </button>
          )}
        </div>
      )}
      {(s.isBlownFive || s.isBlownFifteen) && (
        <div class="mg-controls">
          {s.isBlownFive && (
            <button
              type="button"
              class="mg-button"
              onClick={() => call(WiringAction.ReplaceFuse, { circuit: Circuit.Five })}
            >
              {say(locale, WORDS.replace)} (5 A)
            </button>
          )}
          {s.isBlownFifteen && (
            <button
              type="button"
              class="mg-button"
              onClick={() => call(WiringAction.ReplaceFuse, { circuit: Circuit.Fifteen })}
            >
              {say(locale, WORDS.replace)} (15 A)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
