import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, GeneratorBulb, Turbine } from "./draw";
import {
  MAX_LEVEL,
  PlantAction,
  PlantKind,
  PlantPart,
  type PlantState,
  STAGES,
  describePlant,
  outputOf,
} from "./plant";
import { type Words, say } from "./words";

const W = 320;
const H = 190;
const GROUND = 160;

const WORDS = {
  next: { en: "Next stage →", hi: "अगला चरण →" },
  again: { en: "Start again", hi: "फिर से" },
  on: { en: "Switch on", hi: "चालू करो" },
  off: { en: "Switch off", hi: "बंद करो" },
  level: { en: "water level", hi: "जल स्तर" },
  gen: { en: "G", hi: "G" },
  turbine: { en: "turbine", hi: "टरबाइन" },
  generator: { en: "generator", hi: "जनित्र" },
  boiler: { en: "boiler", hi: "बॉयलर" },
  furnace: { en: "furnace", hi: "भट्टी" },
  dam: { en: "dam", hi: "बाँध" },
  reservoir: { en: "reservoir", hi: "जलाशय" },
  pipe: { en: "pipe", hi: "पाइप" },
  hotSpot: { en: "hot spot", hi: "तप्त स्थल" },
  water: { en: "underground water", hi: "भूमिगत जल" },
  reactor: { en: "reactor", hi: "रिएक्टर" },
  cooker: { en: "pressure cooker", hi: "प्रेशर कुकर" },
  fins: { en: "fins", hi: "पंख" },
  dynamo: { en: "dynamo", hi: "डायनेमो" },
  output: { en: "output", hi: "उत्पादन" },
} as const satisfies Record<string, Words>;

function Steam({ d, isOn }: { d: string; isOn: boolean }): JSX.Element {
  return <path class={isOn ? "en-steam is-on" : "en-steam"} d={d} />;
}

function ModelPicture({ s, locale }: { s: PlantState; locale: string }) {
  const on = s.isOn;
  return (
    <g>
      <rect class="en-ground" x={0} y={GROUND} width={W} height={H - GROUND} />
      {/* stove and pressure cooker */}
      <rect class="en-stove" x={22} y={GROUND - 14} width={64} height={14} rx={2} />
      {on && <path class="en-flame" d="M44 146 q 4 -10 10 0 q 4 -10 10 0 z" />}
      <rect class="en-metal" x={30} y={GROUND - 54} width={48} height={38} rx={8} />
      <rect class="en-metal-dark" x={48} y={GROUND - 64} width={12} height={10} rx={2} />
      <path class="en-pipe" d="M60 98 H 112" />
      <Steam d="M112 98 C 122 96 128 96 134 98" isOn={on} />
      <Turbine x={150} y={98} r={18} isTurning={on} blades={3} />
      <line class="en-axle" x1={150} y1={98} x2={204} y2={98} />
      <line class="en-stand" x1={150} y1={98} x2={150} y2={GROUND} />
      <GeneratorBulb x={222} y={98} glow={outputOf(s)} label={say(locale, WORDS.dynamo)} />
      <text class="en-tiny" x={54} y={GROUND - 70} text-anchor="middle">
        {say(locale, WORDS.cooker)}
      </text>
      <text class="en-tiny" x={150} y={68} text-anchor="middle">
        {say(locale, WORDS.fins)}
      </text>
    </g>
  );
}

function ThermalPicture({ s, locale }: { s: PlantState; locale: string }) {
  const on = s.isOn;
  return (
    <g>
      <rect class="en-ground" x={0} y={GROUND} width={W} height={H - GROUND} />
      <rect class="en-brick" x={16} y={GROUND - 60} width={70} height={60} rx={3} />
      <rect class="en-brick" x={30} y={20} width={16} height={84} />
      {on && <circle class="en-smoke" cx={40} cy={14} r={9} />}
      <path class="en-coal" d="M24 154 l 10 -10 l 12 4 l 12 -6 l 14 8 l 6 4 z" />
      {on && <path class="en-flame" d="M34 140 q 6 -16 12 0 q 6 -16 12 0 q 6 -14 12 0 z" />}
      <rect class="en-metal" x={92} y={GROUND - 70} width={46} height={56} rx={12} />
      <text class="en-tiny is-light" x={115} y={GROUND - 38} text-anchor="middle">
        {say(locale, WORDS.boiler)}
      </text>
      <text class="en-tiny" x={51} y={GROUND + 14} text-anchor="middle">
        {say(locale, WORDS.furnace)}
      </text>
      <path class="en-pipe" d="M138 104 H 176" />
      <Steam d="M150 100 H 176" isOn={on} />
      <Turbine x={192} y={104} r={16} isTurning={on} />
      <line class="en-axle" x1={192} y1={104} x2={240} y2={104} />
      <GeneratorBulb x={258} y={104} glow={outputOf(s)} label={say(locale, WORDS.gen)} />
      <text class="en-tiny" x={192} y={134} text-anchor="middle">
        {say(locale, WORDS.turbine)}
      </text>
    </g>
  );
}

function HydroPicture({ s, locale }: { s: PlantState; locale: string }) {
  const on = s.isOn;
  const top = GROUND - 14 - (s.level / MAX_LEVEL) * 100;
  return (
    <g>
      <path class="en-hill" d="M0 40 L 40 30 L 70 160 L 0 160 Z" />
      <rect class="en-ground" x={0} y={GROUND} width={W} height={H - GROUND} />
      {s.level > 0 && <rect class="en-water" x={36} y={top} width={92} height={GROUND - top} />}
      <path class="en-concrete" d="M128 36 L 148 36 L 168 160 L 128 160 Z" />
      <text class="en-tiny" x={80} y={30} text-anchor="middle">
        {say(locale, WORDS.reservoir)}
      </text>
      <text class="en-tiny" x={148} y={30} text-anchor="middle">
        {say(locale, WORDS.dam)}
      </text>
      <path class="en-pipe is-thick" d="M120 150 H 184" />
      {on && s.level > 0 && <path class="en-flow" d="M120 150 H 184" />}
      <Turbine x={198} y={150} r={13} isTurning={on && s.level > 0} />
      <line class="en-axle" x1={198} y1={150} x2={236} y2={150} />
      <GeneratorBulb x={252} y={146} glow={outputOf(s)} label={say(locale, WORDS.gen)} />
      <path class="en-river" d="M210 172 Q 260 166 320 174 L 320 180 L 210 180 Z" />
      {s.level > 0 && (
        <g>
          <line class="en-level" x1={30} y1={top} x2={30} y2={GROUND} />
          <text class="en-tiny is-strong" x={22} y={(top + GROUND) / 2} text-anchor="end">
            h
          </text>
        </g>
      )}
    </g>
  );
}

function GeothermalPicture({ s, locale }: { s: PlantState; locale: string }) {
  const on = s.isOn;
  return (
    <g>
      <rect class="en-sky" x={0} y={0} width={W} height={60} />
      <rect class="en-earth" x={0} y={60} width={W} height={H - 60} />
      <rect class="en-water-ground" x={0} y={110} width={W} height={26} />
      <path class="en-magma" d="M40 190 Q 90 140 150 150 Q 210 140 270 190 Z" />
      <text class="en-tiny is-light" x={155} y={176} text-anchor="middle">
        {say(locale, WORDS.hotSpot)}
      </text>
      <text class="en-tiny" x={300} y={126} text-anchor="end">
        {say(locale, WORDS.water)}
      </text>
      <path class="en-pipe" d="M110 140 V 48 H 154" />
      <Steam d="M110 130 V 52" isOn={on} />
      <Turbine x={170} y={44} r={14} isTurning={on} />
      <line class="en-axle" x1={170} y1={44} x2={212} y2={44} />
      <GeneratorBulb x={228} y={44} glow={outputOf(s)} label={say(locale, WORDS.gen)} />
      {on && <circle class="en-steam-cloud" cx={110} cy={36} r={8} />}
    </g>
  );
}

function NuclearPicture({ s, locale }: { s: PlantState; locale: string }) {
  const on = s.isOn;
  return (
    <g>
      <rect class="en-ground" x={0} y={GROUND} width={W} height={H - GROUND} />
      <path class="en-concrete" d="M20 160 V 90 A 46 46 0 0 1 112 90 V 160 Z" />
      <text class="en-tiny" x={66} y={70} text-anchor="middle">
        {say(locale, WORDS.reactor)}
      </text>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          class={on ? "en-rod is-hot" : "en-rod"}
          x={44 + i * 12}
          y={104}
          width={6}
          height={40}
          rx={2}
        />
      ))}
      <path class="en-pipe" d="M112 110 H 172" />
      <Steam d="M118 106 H 172" isOn={on} />
      <Turbine x={188} y={110} r={15} isTurning={on} />
      <line class="en-axle" x1={188} y1={110} x2={232} y2={110} />
      <GeneratorBulb x={250} y={110} glow={outputOf(s)} label={say(locale, WORDS.gen)} />
      <path class="en-concrete" d="M276 160 Q 286 120 280 90 H 312 Q 306 120 316 160 Z" />
      {on && <circle class="en-steam-cloud" cx={296} cy={80} r={10} />}
    </g>
  );
}

export function PlantView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as PlantState;
  const k = width / W;
  const chain = STAGES[s.kind];
  const picture = {
    model: <ModelPicture s={s} locale={locale} />,
    thermal: <ThermalPicture s={s} locale={locale} />,
    hydro: <HydroPicture s={s} locale={locale} />,
    geothermal: <GeothermalPicture s={s} locale={locale} />,
    nuclear: <NuclearPicture s={s} locale={locale} />,
  }[s.kind];
  const out = outputOf(s);
  return (
    <div class="en-pp">
      <Stage
        label={describePlant(s)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "en-svg" }}
      >
        <g transform={`scale(${k})`} data-part={PlantPart.Picture}>
          <rect class="en-bg" x={0} y={0} width={W} height={H} rx={12} />
          {picture}
          {s.isOn && (
            <text class="en-tiny is-strong" x={W - 10} y={16} text-anchor="end">
              {say(locale, WORDS.output)} {Math.round(out * 100)}%
            </text>
          )}
          {s.kind === PlantKind.Hydro && s.isOn && s.level > 0 && (
            <Arrow cls="en-flow-arrow" x1={60} y1={GROUND - 4} x2={110} y2={GROUND - 4} head={6} />
          )}
        </g>
      </Stage>
      {s.showChain && (
        <ol class="en-chain" data-part={PlantPart.Chain}>
          {chain.map((st, i) => (
            <li key={st.what.en} class={i < s.step ? "is-shown" : "is-hidden"}>
              {i < s.step ? (
                <>
                  <span class="en-chain-what">{say(locale, st.what)}</span>
                  <span class="en-chain-form">{say(locale, st.form)}</span>
                </>
              ) : (
                <span class="en-chain-what">?</span>
              )}
            </li>
          ))}
        </ol>
      )}
      <div class="en-controls" data-part={PlantPart.Controls}>
        {s.canStep &&
          (s.step < chain.length ? (
            <button
              type="button"
              class="en-button is-primary"
              onClick={() => call(PlantAction.Next, {})}
            >
              {say(locale, WORDS.next)}
            </button>
          ) : (
            <button type="button" class="en-button" onClick={() => call(PlantAction.Reset, {})}>
              {say(locale, WORDS.again)}
            </button>
          ))}
        {s.canSwitch && (
          <button
            type="button"
            class={s.isOn ? "en-button is-on" : "en-button"}
            aria-pressed={s.isOn}
            onClick={() => call(PlantAction.Switch, { isOn: !s.isOn })}
          >
            {say(locale, s.isOn ? WORDS.off : WORDS.on)}
          </button>
        )}
        {s.canSetLevel && s.kind === PlantKind.Hydro && (
          <span class="en-stepper">
            <button
              type="button"
              class="en-button is-small"
              disabled={s.level <= 0}
              onClick={() => call(PlantAction.SetLevel, { level: s.level - 1 })}
            >
              −
            </button>
            <span class="en-stepper-value">
              {say(locale, WORDS.level)} {s.level}/{MAX_LEVEL}
            </span>
            <button
              type="button"
              class="en-button is-small"
              disabled={s.level >= MAX_LEVEL}
              onClick={() => call(PlantAction.SetLevel, { level: s.level + 1 })}
            >
              +
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
