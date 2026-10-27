import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow } from "./draw";
import {
  COOKS_AT,
  CookerPart,
  MAX_CELLS,
  MAX_MINUTES,
  Sky,
  SolarAction,
  SolarMode,
  SolarPart,
  type SolarState,
  cookerTempOf,
  describeSolar,
  flaskTemps,
  voltsOf,
  wattsOf,
} from "./solar";
import { type Words, num, range, say } from "./words";

const W = 320;
const H = 190;
const GROUND = 168;
/** The thermometer's scale tops out here (°C). */
const T_MAX = 140;

const WORDS = {
  wait: { en: "Wait 15 min", hi: "15 मिनट रुको" },
  reset: { en: "Start again", hi: "फिर से" },
  min: { en: "min", hi: "मिनट" },
  black: { en: "black", hi: "काला" },
  white: { en: "white", hi: "सफ़ेद" },
  blackInside: { en: "Black inside", hi: "अंदर काला" },
  glass: { en: "Glass lid", hi: "काँच का ढक्कन" },
  mirror: { en: "Mirror", hi: "दर्पण" },
  sunny: { en: "Sunny", hi: "धूप" },
  cloudy: { en: "Cloudy", hi: "बादल" },
  night: { en: "Night", hi: "रात" },
  cooks: { en: "hot enough to cook", hi: "पकाने लायक गरम" },
  notYet: { en: "not hot enough to cook", hi: "पकाने लायक गरम नहीं" },
  cells: { en: "cells", hi: "सेल" },
  panel: { en: "solar cell panel", hi: "सौर पैनल" },
} as const satisfies Record<string, Words>;

function SkyIcon({ sky }: { sky: Sky }) {
  if (sky === Sky.Night)
    return <path class="en-moon" d="M290 18 a 12 12 0 1 0 10 18 a 10 10 0 1 1 -10 -18 Z" />;
  return (
    <g>
      <circle class="en-sun" cx={290} cy={26} r={12} />
      {sky === Sky.Cloudy && (
        <path
          class="en-cloud"
          d="M262 40 a 10 10 0 0 1 12 -12 a 13 13 0 0 1 24 4 a 9 9 0 0 1 2 18 h -36 a 8 8 0 0 1 -2 -10 Z"
        />
      )}
    </g>
  );
}

function Rays({ sky, x, y }: { sky: Sky; x: number; y: number }) {
  if (sky === Sky.Night) return null;
  return (
    <g class={sky === Sky.Cloudy ? "en-rays is-weak" : "en-rays"}>
      {range(3).map((i) => (
        <Arrow
          key={i}
          cls="en-ray"
          x1={276 - i * 6}
          y1={42 + i * 4}
          x2={x + i * 16}
          y2={y}
          head={5}
        />
      ))}
    </g>
  );
}

function Thermometer({
  x,
  y,
  h,
  t,
  label,
}: { x: number; y: number; h: number; t: number; label: string }) {
  const fill = Math.max(0, Math.min(1, t / T_MAX)) * (h - 10);
  return (
    <g data-part={SolarPart.Thermometer}>
      <rect class="en-therm" x={x - 4} y={y} width={8} height={h} rx={4} />
      <rect class="en-therm-fill" x={x - 2} y={y + h - 6 - fill} width={4} height={fill} rx={2} />
      <circle class="en-therm-fill" cx={x} cy={y + h} r={6} />
      <text class="en-tiny is-strong" x={x} y={y - 6} text-anchor="middle">
        {label}
      </text>
    </g>
  );
}

function Flask({ x, cls, t, name }: { x: number; cls: string; t: number; name: string }) {
  return (
    <g>
      <path
        class={cls}
        d={`M${x - 10} 96 V 112 L ${x - 34} ${GROUND} H ${x + 34} L ${x + 10} 112 V 96 Z`}
      />
      <Thermometer x={x} y={60} h={70} t={t} label={`${Math.round(t)} °C`} />
      <text class="en-tiny" x={x} y={GROUND + 14} text-anchor="middle">
        {name}
      </text>
    </g>
  );
}

function FlasksPicture({ s, locale }: { s: SolarState; locale: string }) {
  const t = flaskTemps(s.sky, s.minutes);
  return (
    <g>
      <Rays sky={s.sky} x={80} y={96} />
      <Flask x={90} cls="en-flask is-black" t={t.black} name={say(locale, WORDS.black)} />
      <Flask x={200} cls="en-flask is-white" t={t.white} name={say(locale, WORDS.white)} />
    </g>
  );
}

function CookerPicture({ s, locale }: { s: SolarState; locale: string }) {
  const t = cookerTempOf(s);
  return (
    <g>
      <Rays sky={s.sky} x={110} y={112} />
      {s.hasMirror && (
        <g>
          <path class="en-mirror" d="M70 112 L 46 40" />
          {s.sky !== Sky.Night && <Arrow cls="en-ray" x1={52} y1={58} x2={104} y2={118} head={5} />}
        </g>
      )}
      <path class="en-box-outer" d={`M66 ${GROUND} V 112 H 214 V ${GROUND} Z`} />
      <rect
        class={s.hasBlack ? "en-box-inner is-black" : "en-box-inner"}
        x={74}
        y={118}
        width={132}
        height={GROUND - 124}
      />
      <rect class="en-pot" x={116} y={130} width={48} height={28} rx={6} />
      {s.hasGlass && <rect class="en-glass" x={64} y={108} width={152} height={6} rx={2} />}
      <Thermometer x={246} y={84} h={74} t={t} label={`${Math.round(t)} °C`} />
      <text
        class={t >= COOKS_AT ? "en-tiny is-good" : "en-tiny"}
        x={140}
        y={GROUND + 14}
        text-anchor="middle"
      >
        {say(locale, t >= COOKS_AT ? WORDS.cooks : WORDS.notYet)}
      </text>
    </g>
  );
}

function PanelPicture({ s, locale }: { s: SolarState; locale: string }) {
  const cols = s.cells <= 4 ? s.cells : s.cells <= 12 ? 6 : s.cells <= 24 ? 8 : 9;
  const rows = Math.ceil(s.cells / cols);
  const cw = Math.min(26, 168 / cols);
  const ch = Math.min(20, 74 / rows);
  const w = wattsOf(s);
  return (
    <g>
      <Rays sky={s.sky} x={80} y={96} />
      <g transform="translate(36 70) skewX(-12)">
        {range(s.cells).map((i) => (
          <rect
            key={i}
            class="en-cell"
            x={(i % cols) * cw}
            y={Math.floor(i / cols) * ch}
            width={cw - 2}
            height={ch - 2}
            rx={1.5}
          />
        ))}
      </g>
      <line class="en-stand" x1={110} y1={150} x2={110} y2={GROUND} />
      <text class="en-tiny" x={110} y={GROUND + 14} text-anchor="middle">
        {say(locale, WORDS.panel)}
      </text>
      <path class="en-wire" d="M200 120 H 246 V 100" />
      {w > 0 && (
        <circle
          class="en-glow"
          cx={246}
          cy={88}
          r={8 + Math.min(16, w)}
          style={{ opacity: Math.min(1, w / 10) }}
        />
      )}
      <circle class={w > 0 ? "en-bulb is-on" : "en-bulb"} cx={246} cy={88} r={9} />
      <text class="en-small" x={246} y={146} text-anchor="middle">
        {num(voltsOf(s), 1)} V · {num(w, 1)} W
      </text>
    </g>
  );
}

export function SolarView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as SolarState;
  const k = width / W;
  const picture = {
    flasks: <FlasksPicture s={s} locale={locale} />,
    cooker: <CookerPicture s={s} locale={locale} />,
    panel: <PanelPicture s={s} locale={locale} />,
  }[s.mode];
  const timed = s.mode !== SolarMode.Panel;
  const parts: { part: CookerPart; has: boolean; name: Words }[] = [
    { part: CookerPart.Black, has: s.hasBlack, name: WORDS.blackInside },
    { part: CookerPart.Glass, has: s.hasGlass, name: WORDS.glass },
    { part: CookerPart.Mirror, has: s.hasMirror, name: WORDS.mirror },
  ];
  return (
    <div class="en-sl">
      <Stage
        label={describeSolar(s)}
        x={[0, W]}
        width={width}
        height={Math.round((H + 18) * k)}
        svg={{ class: "en-svg" }}
      >
        <g transform={`scale(${k})`} data-part={SolarPart.Picture}>
          <rect
            class={s.sky === Sky.Night ? "en-night" : "en-bg"}
            x={0}
            y={0}
            width={W}
            height={H + 18}
            rx={12}
          />
          <SkyIcon sky={s.sky} />
          {timed && (
            <text class="en-small" x={12} y={22}>
              {s.minutes} {say(locale, WORDS.min)}
            </text>
          )}
          {picture}
        </g>
      </Stage>
      <div class="en-controls" data-part={SolarPart.Controls}>
        {timed && s.canWait && (
          <>
            <button
              type="button"
              class="en-button is-primary"
              disabled={s.minutes >= MAX_MINUTES}
              onClick={() => call(SolarAction.Wait, {})}
            >
              {say(locale, WORDS.wait)}
            </button>
            <button
              type="button"
              class="en-button"
              disabled={s.minutes === 0}
              onClick={() => call(SolarAction.Reset, {})}
            >
              {say(locale, WORDS.reset)}
            </button>
          </>
        )}
        {s.mode === SolarMode.Cooker &&
          s.canSetParts &&
          parts.map((p) => (
            <button
              key={p.part}
              type="button"
              class={p.has ? "en-chip is-on" : "en-chip"}
              aria-pressed={p.has}
              onClick={() => call(SolarAction.SetPart, { part: p.part, has: !p.has })}
            >
              {p.has ? "✓ " : ""}
              {say(locale, p.name)}
            </button>
          ))}
        {s.mode === SolarMode.Panel && s.canSetCells && (
          <span class="en-stepper">
            <button
              type="button"
              class="en-button is-small"
              disabled={s.cells <= 1}
              onClick={() => call(SolarAction.SetCells, { cells: s.cells - 1 })}
            >
              −
            </button>
            <span class="en-stepper-value">
              {s.cells} {say(locale, WORDS.cells)}
            </span>
            <button
              type="button"
              class="en-button is-small"
              disabled={s.cells >= MAX_CELLS}
              onClick={() => call(SolarAction.SetCells, { cells: s.cells + 1 })}
            >
              +
            </button>
          </span>
        )}
        {s.canSetSky &&
          [Sky.Sunny, Sky.Cloudy, Sky.Night].map((sky) => (
            <button
              key={sky}
              type="button"
              class={s.sky === sky ? "en-chip is-on" : "en-chip"}
              aria-pressed={s.sky === sky}
              onClick={() => call(SolarAction.SetSky, { sky })}
            >
              {say(locale, WORDS[sky])}
            </button>
          ))}
      </div>
    </div>
  );
}
