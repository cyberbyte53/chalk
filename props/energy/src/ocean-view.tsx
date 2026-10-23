import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, GeneratorBulb, Turbine } from "./draw";
import {
  Flow,
  Level,
  MAX_WAVE,
  MIN_DIFFERENCE,
  OceanAction,
  OceanKind,
  OceanPart,
  type OceanState,
  describeOcean,
  differenceOf,
  flowOf,
  oceanOutputOf,
  worksOf,
} from "./ocean";
import { type Words, range, say } from "./words";

const W = 320;
const H = 180;

const WORDS = {
  sea: { en: "sea", hi: "समुद्र" },
  basin: { en: "basin", hi: "बेसिन" },
  dam: { en: "dam", hi: "बाँध" },
  high: { en: "high tide", hi: "ज्वार" },
  low: { en: "low tide", hi: "भाटा" },
  open: { en: "Open the gate", hi: "द्वार खोलो" },
  tide: { en: "Tide turns", hi: "ज्वार बदलो" },
  waves: { en: "waves", hi: "तरंगें" },
  surface: { en: "surface", hi: "सतह" },
  deep: { en: "2 km deep", hi: "2 km गहराई" },
  difference: { en: "difference", hi: "अंतर" },
  works: { en: "making electricity", hi: "बिजली बन रही है" },
  fails: { en: "not working", hi: "काम नहीं कर रहा" },
  ammonia: { en: "ammonia boils", hi: "अमोनिया उबलता है" },
  condense: { en: "cold water condenses it", hi: "ठंडा पानी इसे द्रवित करता है" },
  need: { en: "needs 20 °C or more", hi: "20 °C या अधिक चाहिए" },
  gen: { en: "G", hi: "G" },
} as const satisfies Record<string, Words>;

function Stepper({
  label,
  value,
  onDown,
  onUp,
  canDown,
  canUp,
}: {
  label: string;
  value: string;
  onDown: () => void;
  onUp: () => void;
  canDown: boolean;
  canUp: boolean;
}) {
  return (
    <span class="en-stepper">
      <button type="button" class="en-button is-small" disabled={!canDown} onClick={onDown}>
        −
      </button>
      <span class="en-stepper-value">
        {label} {value}
      </span>
      <button type="button" class="en-button is-small" disabled={!canUp} onClick={onUp}>
        +
      </button>
    </span>
  );
}

function TidalPicture({ s, locale }: { s: OceanState; locale: string }) {
  const y = (l: Level) => (l === Level.High ? 80 : 120);
  const flow = s.isFlowing;
  return (
    <g>
      <rect class="en-seabed" x={0} y={160} width={W} height={20} />
      <rect class="en-water" x={0} y={y(s.basin)} width={140} height={160 - y(s.basin)} />
      <rect class="en-water is-sea" x={180} y={y(s.sea)} width={140} height={160 - y(s.sea)} />
      <rect class="en-concrete" x={140} y={60} width={40} height={100} />
      <Turbine x={160} y={142} r={11} isTurning={flow} />
      <text class="en-tiny" x={70} y={y(s.basin) - 6} text-anchor="middle">
        {say(locale, WORDS.basin)}
      </text>
      <text class="en-tiny" x={250} y={y(s.sea) - 6} text-anchor="middle">
        {say(locale, WORDS.sea)}: {say(locale, s.sea === Level.High ? WORDS.high : WORDS.low)}
      </text>
      <text class="en-tiny" x={160} y={112} text-anchor="middle">
        {say(locale, WORDS.dam)}
      </text>
      {flow && (
        <Arrow
          cls="en-flow-arrow"
          x1={s.basin === Level.High ? 200 : 120}
          y1={150}
          x2={s.basin === Level.High ? 124 : 196}
          y2={150}
          head={7}
        />
      )}
      <GeneratorBulb x={160} y={74} glow={flow ? 1 : 0} label="" />
    </g>
  );
}

function WavePicture({ s, locale }: { s: OceanState; locale: string }) {
  const a = 3 + s.wave * 6;
  const wave = `M0 100 ${range(8)
    .map((i) => `Q ${i * 40 + 10} ${100 - a} ${i * 40 + 20} 100 T ${i * 40 + 40} 100`)
    .join(" ")} V 180 H 0 Z`;
  return (
    <g>
      <path class={s.wave > 0 ? "en-water is-sea is-waving" : "en-water is-sea"} d={wave} />
      <rect class="en-sand" x={250} y={90} width={70} height={90} />
      <rect class="en-buoy" x={150} y={100 - a - 6} width={26} height={12} rx={4} />
      <line class="en-pipe" x1={176} y1={100 - a} x2={262} y2={80} />
      <Turbine x={270} y={70} r={10} isTurning={worksOf(s)} />
      <text class="en-tiny" x={60} y={78} text-anchor="middle">
        {say(locale, WORDS.waves)} {s.wave}/{MAX_WAVE}
      </text>
    </g>
  );
}

function ThermalPicture({ s, locale }: { s: OceanState; locale: string }) {
  const works = worksOf(s);
  return (
    <g>
      <rect class="en-water is-warm" x={0} y={40} width={W} height={24} />
      <rect class="en-water is-cold" x={0} y={64} width={W} height={116} />
      <rect class="en-platform" x={110} y={20} width={110} height={18} rx={3} />
      <path class="en-pipe" d="M124 38 V 54" />
      <path class="en-pipe" d="M206 38 V 168" />
      <Turbine x={165} y={14} r={9} isTurning={works} />
      <text class="en-tiny is-strong" x={10} y={56}>
        {say(locale, WORDS.surface)} {s.surface} °C
      </text>
      <text class="en-tiny is-light" x={10} y={172}>
        {say(locale, WORDS.deep)} {s.deep} °C
      </text>
      <text class="en-tiny" x={200} y={110} text-anchor="end">
        {say(locale, WORDS.condense)}
      </text>
      {works && (
        <text class="en-tiny" x={132} y={52}>
          {say(locale, WORDS.ammonia)}
        </text>
      )}
    </g>
  );
}

export function OceanView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as OceanState;
  const k = width / W;
  const works = worksOf(s);
  const picture = {
    tidal: <TidalPicture s={s} locale={locale} />,
    wave: <WavePicture s={s} locale={locale} />,
    thermal: <ThermalPicture s={s} locale={locale} />,
  }[s.kind];
  return (
    <div class="en-oc">
      <Stage
        label={describeOcean(s)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "en-svg" }}
      >
        <g transform={`scale(${k})`} data-part={OceanPart.Picture}>
          <rect class="en-sky" x={0} y={0} width={W} height={H} rx={12} />
          {picture}
        </g>
      </Stage>
      <div class="en-readout" data-part={OceanPart.Readout}>
        <span class={works ? "is-good" : "is-wrong"}>
          {say(locale, works ? WORDS.works : WORDS.fails)}
          {s.kind === OceanKind.Wave && works ? ` · ${Math.round(oceanOutputOf(s) * 100)}%` : ""}
        </span>
        {s.kind === OceanKind.Thermal && (
          <span>
            {say(locale, WORDS.difference)} <strong>{differenceOf(s)} °C</strong>
            {differenceOf(s) < MIN_DIFFERENCE ? ` · ${say(locale, WORDS.need)}` : ""}
          </span>
        )}
      </div>
      {s.canAct && (
        <div class="en-controls" data-part={OceanPart.Controls}>
          {s.kind === OceanKind.Tidal && (
            <>
              <button
                type="button"
                class="en-button is-primary"
                disabled={flowOf(s) === Flow.None}
                onClick={() => call(OceanAction.OpenGate, {})}
              >
                {say(locale, WORDS.open)}
              </button>
              <button
                type="button"
                class="en-button"
                onClick={() => call(OceanAction.NextTide, {})}
              >
                {say(locale, WORDS.tide)}
              </button>
            </>
          )}
          {s.kind === OceanKind.Wave && (
            <Stepper
              label={say(locale, WORDS.waves)}
              value={`${s.wave}/${MAX_WAVE}`}
              canDown={s.wave > 0}
              canUp={s.wave < MAX_WAVE}
              onDown={() => call(OceanAction.SetWave, { wave: s.wave - 1 })}
              onUp={() => call(OceanAction.SetWave, { wave: s.wave + 1 })}
            />
          )}
          {s.kind === OceanKind.Thermal && (
            <>
              <Stepper
                label={say(locale, WORDS.surface)}
                value={`${s.surface} °C`}
                canDown={s.surface > 10}
                canUp={s.surface < 35}
                onDown={() => call(OceanAction.SetSurface, { surface: s.surface - 1 })}
                onUp={() => call(OceanAction.SetSurface, { surface: s.surface + 1 })}
              />
              <Stepper
                label={say(locale, WORDS.deep)}
                value={`${s.deep} °C`}
                canDown={s.deep > 2}
                canUp={s.deep < 20}
                onDown={() => call(OceanAction.SetDeep, { deep: s.deep - 1 })}
                onUp={() => call(OceanAction.SetDeep, { deep: s.deep + 1 })}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
