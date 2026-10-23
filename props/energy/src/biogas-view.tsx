import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  BIOGAS_STEPS,
  BiogasAction,
  BiogasPart,
  type BiogasState,
  GASES,
  LAST_STEP,
  describeBiogas,
  gasOf,
} from "./biogas";
import { Arrow } from "./draw";
import { type Words, range, say } from "./words";

const W = 320;
const H = 200;
const GROUND = 70;

const WORDS = {
  mixing: { en: "mixing tank", hi: "मिश्रण टंकी" },
  digester: { en: "digester (no oxygen)", hi: "पाचक (ऑक्सीजन नहीं)" },
  gasTank: { en: "gas tank", hi: "गैस टंकी" },
  stove: { en: "to the stove", hi: "चूल्हे तक" },
  manure: { en: "manure", hi: "खाद" },
  leak: { en: "air leaks in!", hi: "हवा अंदर जा रही है!" },
  next: { en: "Next →", hi: "आगे →" },
  back: { en: "← Back", hi: "← पीछे" },
  again: { en: "Start again", hi: "फिर से" },
  addLeak: { en: "Let air in", hi: "हवा जाने दो" },
  seal: { en: "Seal the digester", hi: "पाचक बंद करो" },
  step: { en: "Step", hi: "चरण" },
  gases: { en: "Bio-gas is", hi: "बायोगैस में है" },
} as const satisfies Record<string, Words>;

export function BiogasView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as BiogasState;
  const k = width / W;
  const gas = gasOf(s);
  const hasSlurry = s.step >= 1;
  const inDigester = s.step >= 1;
  const digesting = s.step >= 2 && !s.hasLeak;
  const burning = s.step >= 4 && gas > 0;
  const manure = s.step >= LAST_STEP;
  const hl = (on: boolean) => (on ? " is-active" : "");
  return (
    <div class="en-bg-plant">
      <Stage
        label={describeBiogas(s)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "en-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="en-bg" x={0} y={0} width={W} height={H} rx={12} />
          <rect class="en-earth" x={0} y={GROUND} width={W} height={H - GROUND} />
          {/* mixing tank, above ground on the left */}
          <g data-part={BiogasPart.MixingTank} class={`en-bp-part${hl(s.step === 0)}`}>
            <path class="en-brick" d="M14 34 H 70 V 70 H 14 Z" />
            {hasSlurry && <rect class="en-slurry" x={18} y={46} width={48} height={22} />}
            {s.showNames && (
              <text class="en-tiny" x={42} y={28} text-anchor="middle">
                {say(locale, WORDS.mixing)}
              </text>
            )}
          </g>
          <path class="en-pipe is-thick" d="M58 70 L 92 150" />
          {/* digester: an underground chamber with a dome */}
          <g
            data-part={BiogasPart.Digester}
            class={`en-bp-part${hl(s.step === 1 || s.step === 2)}`}
          >
            <path class="en-brick" d="M84 186 V 120 A 76 50 0 0 1 236 120 V 186 Z" />
            {inDigester && <rect class="en-slurry" x={90} y={128} width={140} height={54} />}
            {digesting &&
              range(7).map((i) => (
                <circle
                  key={i}
                  class="en-bubble"
                  cx={102 + i * 19}
                  cy={150 - (i % 3) * 8}
                  r={2.6 + (i % 2)}
                  style={{ animationDelay: `${(i * 0.3).toFixed(1)}s` }}
                />
              ))}
            {s.hasLeak && (
              <g>
                <Arrow cls="en-air" x1={112} y1={36} x2={136} y2={76} head={6} />
                <text class="en-tiny is-wrong" x={100} y={28} text-anchor="middle">
                  {say(locale, WORDS.leak)}
                </text>
              </g>
            )}
            {s.showNames && (
              <text class="en-tiny" x={160} y={196} text-anchor="middle">
                {say(locale, WORDS.digester)}
              </text>
            )}
          </g>
          {/* gas tank: the space under the dome */}
          <g data-part={BiogasPart.GasTank} class={`en-bp-part${hl(s.step === 3)}`}>
            <path
              class="en-gas-space"
              d="M92 126 A 68 42 0 0 1 228 126 Z"
              style={{ opacity: 0.15 + 0.7 * gas }}
            />
            {s.showNames && (
              <text class="en-tiny" x={160} y={112} text-anchor="middle">
                {say(locale, WORDS.gasTank)} {Math.round(gas * 100)}%
              </text>
            )}
          </g>
          {/* gas outlet to the stove */}
          <g data-part={BiogasPart.Stove} class={`en-bp-part${hl(s.step === 4)}`}>
            <path class="en-pipe" d="M160 72 V 46 H 214" />
            <rect class="en-stove" x={212} y={40} width={40} height={10} rx={2} />
            {burning && (
              <path class="en-flame is-blue" d="M222 40 q 4 -12 8 0 q 4 -12 8 0 q 4 -12 8 0 z" />
            )}
            {s.showNames && (
              <text class="en-tiny" x={232} y={30} text-anchor="middle">
                {say(locale, WORDS.stove)}
              </text>
            )}
          </g>
          {/* outlet tank for spent slurry, right */}
          <g data-part={BiogasPart.Manure} class={`en-bp-part${hl(manure)}`}>
            <path class="en-pipe is-thick" d="M236 160 L 274 70" />
            <path class="en-brick" d="M258 40 H 310 V 70 H 258 Z" />
            {manure && <rect class="en-manure" x={262} y={52} width={44} height={16} />}
            {s.showNames && (
              <text class="en-tiny" x={284} y={34} text-anchor="middle">
                {say(locale, WORDS.manure)}
              </text>
            )}
          </g>
        </g>
      </Stage>
      <p class="en-steptext" data-part={BiogasPart.Steps}>
        <strong>
          {say(locale, WORDS.step)} {s.step + 1}/{BIOGAS_STEPS.length}:
        </strong>{" "}
        {say(locale, BIOGAS_STEPS[s.step] ?? BIOGAS_STEPS[0] ?? { en: "", hi: "" })}
      </p>
      {s.showGases && s.step >= 3 && !s.hasLeak && (
        <p class="en-note">
          {say(locale, WORDS.gases)}:{" "}
          {GASES.map((g) => `${g.formula} ${say(locale, g.name)}`).join(", ")}
        </p>
      )}
      <div class="en-controls" data-part={BiogasPart.Controls}>
        {s.canStep && (
          <>
            <button
              type="button"
              class="en-button"
              disabled={s.step <= 0}
              onClick={() => call(BiogasAction.Back, {})}
            >
              {say(locale, WORDS.back)}
            </button>
            {s.step < LAST_STEP ? (
              <button
                type="button"
                class="en-button is-primary"
                onClick={() => call(BiogasAction.Next, {})}
              >
                {say(locale, WORDS.next)}
              </button>
            ) : (
              <button type="button" class="en-button" onClick={() => call(BiogasAction.Reset, {})}>
                {say(locale, WORDS.again)}
              </button>
            )}
          </>
        )}
        {s.canLeak && (
          <button
            type="button"
            class={s.hasLeak ? "en-button is-on" : "en-button"}
            aria-pressed={s.hasLeak}
            onClick={() => call(BiogasAction.SetLeak, { hasLeak: !s.hasLeak })}
          >
            {say(locale, s.hasLeak ? WORDS.seal : WORDS.addLeak)}
          </button>
        )}
      </div>
    </div>
  );
}
