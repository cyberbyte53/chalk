import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { APPLIANCE_WORDS, ApplianceIcon, WATTS } from "./appliances";
import {
  AMP_STEPS,
  CORD_AMPS,
  CORD_OHMS,
  ELEMENT_OHMS,
  FUSE_APPLIANCES,
  FUSE_RATINGS,
  HeatAction,
  HeatMode,
  type HeatState,
  MAINS_VOLTS,
  OHM_STEPS,
  SECOND_STEPS,
  WATER_J_PER_C,
  cordWatts,
  describeHeat,
  elementWatts,
  heatOf,
  heatSoFarOf,
  lineCurrentOf,
  powerOf,
} from "./heating";
import { type Words, num, say } from "./words";

const W = 320;

const WORDS = {
  run: { en: "Pass the current", hi: "धारा प्रवाहित करो" },
  running: { en: "Heating…", hi: "गर्म हो रहा है…" },
  again: { en: "Again", hi: "फिर से" },
  water: { en: "water", hi: "पानी" },
  warmer: { en: "warmer by", hi: "इतना गर्म" },
  cord: { en: "copper cord", hi: "ताँबे का तार" },
  element: { en: "nichrome element", hi: "नाइक्रोम तत्व" },
  cool: { en: "stays cool", hi: "ठंडा रहता है" },
  glows: { en: "glows red hot", hi: "लाल-गर्म चमकता है" },
  each: { en: "J each second", hi: "J हर सेकंड" },
  mains: { en: "220 V mains", hi: "220 V मेन्स" },
  fuse: { en: "fuse", hi: "फ़्यूज़" },
  melted: { en: "fuse melted!", hi: "फ़्यूज़ पिघल गया!" },
  rating: { en: "Fuse rating:", hi: "फ़्यूज़ की क्षमता:" },
  replace: { en: "Switch off and fit a new fuse wire", hi: "सब बंद करो और नया फ़्यूज़ तार लगाओ" },
  drawn: { en: "Current drawn", hi: "ली गई धारा" },
  noCurrent: {
    en: "The fuse wire has melted: the circuit is broken, no current flows.",
    hi: "फ़्यूज़ तार पिघल गया: परिपथ टूट गया, कोई धारा नहीं बहती।",
  },
  sameCurrent: { en: "the same current through both", hi: "दोनों में एक ही धारा" },
} as const satisfies Record<string, Words>;

function Stepper({
  label,
  values,
  value,
  unit,
  disabled,
  onSet,
}: {
  label: string;
  values: readonly number[];
  value: number;
  unit: string;
  disabled: boolean;
  onSet: (v: number) => void;
}): JSX.Element {
  const i = values.indexOf(value);
  const down = i > 0 ? values[i - 1] : i === -1 ? values.filter((v) => v < value).pop() : undefined;
  const up = i >= 0 ? values[i + 1] : values.find((v) => v > value);
  return (
    <div class="el-stepper">
      <button
        type="button"
        class="el-button"
        aria-label="−"
        disabled={disabled || down === undefined}
        onClick={() => down !== undefined && onSet(down)}
      >
        −
      </button>
      <span class="el-stepper-value">
        {label} = {num(value)} {unit}
      </span>
      <button
        type="button"
        class="el-button"
        aria-label="+"
        disabled={disabled || up === undefined}
        onClick={() => up !== undefined && onSet(up)}
      >
        +
      </button>
    </div>
  );
}

function Coil({ s, locale }: { s: HeatState; locale: string }): JSX.Element {
  const rise = heatSoFarOf(s) / WATER_J_PER_C;
  const glow = s.isRunning || s.elapsed > 0 ? Math.min(1, powerOf(s) / 800) : 0;
  const colTop = 136 - Math.min(110, (rise / 50) * 110);
  const zig = Array.from({ length: 13 }, (_, i) => `${62 + i * 6},${i % 2 === 0 ? 112 : 102}`).join(
    " ",
  );
  return (
    <g>
      <rect class="el-bg" x={0} y={0} width={W} height={168} rx={12} />
      <rect class="el-ground" x={0} y={150} width={W} height={18} />
      {/* leads from the coil up out of the beaker */}
      <path class="el-wire is-on" d="M62 112 V 26 H 30" />
      <path class="el-wire is-on" d="M134 112 V 20 H 30" />
      <text class="el-small" x={36} y={14}>
        I = {num(s.amps)} A
      </text>
      <g data-part="water">
        <rect class="el-water" x={44} y={56} width={112} height={92} rx={4} />
        <path class="el-beaker" d="M40 44 V 148 Q 40 152 44 152 H 156 Q 160 152 160 148 V 44" />
        <text class="el-small" x={100} y={74} text-anchor="middle">
          {say(locale, WORDS.water)}
        </text>
      </g>
      <g data-part="coil">
        {glow > 0 && <polyline class="el-coil-glow" points={zig} opacity={glow} />}
        <polyline class={glow > 0 ? "el-coil is-hot" : "el-coil"} points={zig} />
        <text class="el-small" x={100} y={128} text-anchor="middle">
          R = {num(s.ohms)} Ω
        </text>
      </g>
      {/* thermometer */}
      <g data-part="thermometer">
        <rect class="el-thermo" x={214} y={18} width={12} height={124} rx={6} />
        <circle class="el-thermo" cx={220} cy={146} r={10} />
        <rect class="el-thermo-col" x={217} y={colTop} width={6} height={146 - colTop} />
        <circle class="el-thermo-col" cx={220} cy={146} r={7} />
        {[0, 10, 20, 30, 40, 50].map((t) => (
          <g key={t}>
            <line
              class="el-dial-tick"
              x1={228}
              y1={136 - (t / 50) * 110}
              x2={233}
              y2={136 - (t / 50) * 110}
            />
            <text class="el-axis-num" x={236} y={139 - (t / 50) * 110}>
              +{t}
            </text>
          </g>
        ))}
        <text class="el-reading" x={262} y={86}>
          +{num(rise, 1)} °C
        </text>
      </g>
    </g>
  );
}

function Cord({ locale }: { locale: string }): JSX.Element {
  return (
    <g>
      <rect class="el-bg" x={0} y={0} width={W} height={132} rx={12} />
      <rect class="el-plug" x={14} y={54} width={22} height={22} rx={4} />
      <line class="el-plug-pin" x1={8} y1={60} x2={14} y2={60} />
      <line class="el-plug-pin" x1={8} y1={70} x2={14} y2={70} />
      <path class="el-cord" d="M36 65 C 70 65 80 95 120 95 S 160 65 182 65" data-part="cord" />
      <text class="el-small" x={100} y={118} text-anchor="middle">
        {say(locale, WORDS.cord)}, {CORD_OHMS} Ω
      </text>
      <text class="el-value" x={100} y={46} text-anchor="middle">
        {num(cordWatts(), 1)} {say(locale, WORDS.each)}: {say(locale, WORDS.cool)}
      </text>
      <g data-part="element">
        <rect class="el-heater" x={182} y={30} width={124} height={72} rx={6} />
        {[46, 62, 78].map((y) => (
          <g key={y}>
            <line class="el-coil-glow" x1={194} y1={y} x2={294} y2={y} opacity={0.9} />
            <line class="el-coil is-hot" x1={194} y1={y} x2={294} y2={y} />
          </g>
        ))}
        <text class="el-small" x={244} y={118} text-anchor="middle">
          {say(locale, WORDS.element)}, {ELEMENT_OHMS} Ω
        </text>
        <text class="el-value" x={244} y={22} text-anchor="middle">
          {num(elementWatts(), 0)} {say(locale, WORDS.each)}: {say(locale, WORDS.glows)}
        </text>
      </g>
    </g>
  );
}

function FuseBoard({
  s,
  locale,
  call,
}: { s: HeatState; locale: string; call: PropViewProps["call"] }) {
  const top = 34;
  const bottom = 136;
  const xs = FUSE_APPLIANCES.map((_, i) => 96 + i * 40);
  const live = !s.isBlown;
  return (
    <g>
      <rect class="el-bg" x={0} y={0} width={W} height={160} rx={12} />
      <text class="el-small" x={12} y={18}>
        {say(locale, WORDS.mains)}
      </text>
      <line class="el-wire" x1={12} y1={top} x2={20} y2={top} />
      <line class="el-wire" x1={12} y1={bottom} x2={xs[xs.length - 1] as number} y2={bottom} />
      <line class="el-wire" x1={12} y1={top} x2={12} y2={bottom} />
      {/* the fuse, in series in the live wire */}
      <g data-part="fuse">
        <rect class="el-fuse-case" x={20} y={top - 9} width={44} height={18} rx={5} />
        {s.isBlown ? (
          <g>
            <line class="el-fuse-wire" x1={24} y1={top} x2={36} y2={top} />
            <line class="el-fuse-wire" x1={48} y1={top} x2={60} y2={top} />
            <circle class="el-fuse-blob" cx={37} cy={top + 1} r={2} />
            <circle class="el-fuse-blob" cx={47} cy={top + 1} r={2} />
          </g>
        ) : (
          <line class="el-fuse-wire" x1={24} y1={top} x2={60} y2={top} />
        )}
        <text class={s.isBlown ? "el-warn" : "el-small"} x={42} y={top + 24} text-anchor="middle">
          {s.isBlown ? say(locale, WORDS.melted) : `${say(locale, WORDS.fuse)} ${num(s.rating)} A`}
        </text>
      </g>
      <line
        class={live ? "el-wire is-on" : "el-wire"}
        x1={64}
        y1={top}
        x2={xs[xs.length - 1] as number}
        y2={top}
      />
      {FUSE_APPLIANCES.map((a, i) => {
        const x = xs[i] as number;
        const isOn = s.on.includes(a) && live;
        return (
          <g key={a} data-part={a}>
            <line class={isOn ? "el-wire is-on" : "el-wire"} x1={x} y1={top} x2={x} y2={70} />
            <line class={isOn ? "el-wire is-on" : "el-wire"} x1={x} y1={104} x2={x} y2={bottom} />
            <circle class="el-joint" cx={x} cy={top} r={2.5} />
            <circle class="el-joint" cx={x} cy={bottom} r={2.5} />
            <g transform={`translate(${x} 87)`}>
              <rect class="el-gapfill" x={-17} y={-17} width={34} height={34} rx={6} />
              <ApplianceIcon appliance={a} on={isOn} />
            </g>
            <text class="el-tiny" x={x} y={bottom + 14} text-anchor="middle">
              {WATTS[a]} W
            </text>
            {s.canSwitch && (
              <rect
                class="el-hit"
                x={x - 19}
                y={66}
                width={38}
                height={42}
                rx={8}
                role="switch"
                aria-checked={s.on.includes(a)}
                aria-label={say(locale, APPLIANCE_WORDS[a])}
                tabIndex={0}
                onClick={() => call(HeatAction.Toggle, { appliance: a })}
                onKeyDown={(e: JSX.TargetedKeyboardEvent<SVGRectElement>) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    call(HeatAction.Toggle, { appliance: a });
                  }
                }}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

export function HeatingView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as HeatState;
  const k = width / W;
  const H = s.mode === HeatMode.Coil ? 168 : s.mode === HeatMode.Cord ? 132 : 160;
  const sofar = heatSoFarOf(s);
  return (
    <div class="el-jh">
      <Stage
        label={describeHeat(s)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "el-svg" }}
      >
        <g transform={`scale(${k})`}>
          {s.mode === HeatMode.Coil && <Coil s={s} locale={locale} />}
          {s.mode === HeatMode.Cord && <Cord locale={locale} />}
          {s.mode === HeatMode.Fuse && <FuseBoard s={s} locale={locale} call={call} />}
        </g>
      </Stage>
      {s.mode === HeatMode.Coil && s.showWorking && (
        <div class="el-readout" data-part="readout">
          <span class="el-readout-main">
            H = I²Rt = {num(s.amps)}² × {num(s.ohms)} ×{" "}
            {num(s.elapsed > 0 ? s.elapsed : s.seconds, 1)} ={" "}
            {num(s.elapsed > 0 ? sofar : heatOf(s), 0)} J
          </span>
          <span>
            V = IR = {num(s.amps * s.ohms)} V · P = I²R = {num(powerOf(s))} W ·{" "}
            {say(locale, WORDS.warmer)} {num(sofar / WATER_J_PER_C, 1)} °C
          </span>
        </div>
      )}
      {s.mode === HeatMode.Cord && s.showWorking && (
        <div class="el-readout" data-part="readout">
          <span class="el-readout-main">
            I = 220 V ÷ ({CORD_OHMS} + {ELEMENT_OHMS}) Ω = {num(CORD_AMPS, 2)} A:{" "}
            {say(locale, WORDS.sameCurrent)}
          </span>
          <span>
            H/t = I²R: {num(cordWatts(), 1)} J vs {num(elementWatts(), 0)} J
          </span>
        </div>
      )}
      {s.mode === HeatMode.Fuse && (
        <div class="el-readout" data-part="readout">
          <span class="el-readout-main">
            {s.isBlown
              ? say(locale, WORDS.noCurrent)
              : `${say(locale, WORDS.drawn)}: I = P ÷ V = ${num(lineCurrentOf(s.on) * MAINS_VOLTS, 0)} W ÷ 220 V = ${num(lineCurrentOf(s.on), 2)} A`}
          </span>
        </div>
      )}

      {s.mode === HeatMode.Coil && (
        <div class="el-controls" data-part="controls">
          {s.canSetAmps && (
            <Stepper
              label="I"
              values={AMP_STEPS}
              value={s.amps}
              unit="A"
              disabled={s.isRunning}
              onSet={(v) => call(HeatAction.SetAmps, { amps: v })}
            />
          )}
          {s.canSetOhms && (
            <Stepper
              label="R"
              values={OHM_STEPS}
              value={s.ohms}
              unit="Ω"
              disabled={s.isRunning}
              onSet={(v) => call(HeatAction.SetOhms, { ohms: v })}
            />
          )}
          {s.canSetSeconds && (
            <Stepper
              label="t"
              values={SECOND_STEPS}
              value={s.seconds}
              unit="s"
              disabled={s.isRunning}
              onSet={(v) => call(HeatAction.SetSeconds, { seconds: v })}
            />
          )}
          <button
            type="button"
            class="el-button is-primary"
            disabled={s.isRunning}
            onClick={() => call(HeatAction.Run, {})}
          >
            {say(locale, s.isRunning ? WORDS.running : s.elapsed > 0 ? WORDS.again : WORDS.run)}
          </button>
        </div>
      )}
      {s.mode === HeatMode.Fuse && (
        <div class="el-controls" data-part="controls">
          {s.isBlown ? (
            <button
              type="button"
              class="el-button is-primary"
              onClick={() => call(HeatAction.ReplaceFuse, {})}
            >
              {say(locale, WORDS.replace)}
            </button>
          ) : (
            s.canSetRating && (
              <div class="el-choices">
                <span class="el-choices-label">{say(locale, WORDS.rating)}</span>
                {FUSE_RATINGS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    class={s.rating === r ? "el-chip is-on" : "el-chip"}
                    aria-pressed={s.rating === r}
                    onClick={() => call(HeatAction.SetRating, { rating: r })}
                  >
                    {r} A
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
