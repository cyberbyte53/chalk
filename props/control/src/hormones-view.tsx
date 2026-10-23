import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { type Words, say } from "./draw";
import {
  Effect,
  HORMONES,
  HormoneAction,
  HormonePart,
  type HormoneState,
  PlantHormone,
  Spot,
  describeHormones,
} from "./hormones";

const W = 320;
const H = 180;

const WORDS = {
  promotes: { en: "promotes growth", hi: "वृद्धि बढ़ाता है" },
  inhibits: { en: "stops growth", hi: "वृद्धि रोकता है" },
  tap: {
    en: "Tap a hormone to see where it works.",
    hi: "कोई हॉर्मोन टैप करो और देखो वह कहाँ काम करता है।",
  },
  tip: { en: "shoot tip", hi: "प्ररोह का सिरा" },
  stem: { en: "stem", hi: "तना" },
  fruit: { en: "fruit and seeds", hi: "फल और बीज" },
  leaf: { en: "wilting leaf", hi: "मुरझाती पत्ती" },
} as const satisfies Record<string, Words>;

const SPOT_AT: Readonly<
  Record<
    Spot,
    {
      x: number;
      y: number;
      r: number;
      label: Words;
      lx: number;
      ly: number;
      anchor: "start" | "middle" | "end";
    }
  >
> = {
  [Spot.ShootTip]: { x: 160, y: 24, r: 14, label: WORDS.tip, lx: 180, ly: 22, anchor: "start" },
  [Spot.Stem]: { x: 160, y: 96, r: 30, label: WORDS.stem, lx: 130, ly: 70, anchor: "end" },
  [Spot.Fruit]: { x: 232, y: 108, r: 20, label: WORDS.fruit, lx: 236, ly: 144, anchor: "middle" },
  [Spot.Leaf]: { x: 96, y: 128, r: 20, label: WORDS.leaf, lx: 70, ly: 104, anchor: "end" },
};

export function PlantHormonesView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as HormoneState;
  const k = width / W;
  const height = Math.round(H * k);
  const clip = `ch-frame-${useId()}`;
  const picked = s.selected === null ? null : HORMONES[s.selected];
  const spot = picked === null ? null : SPOT_AT[picked.spot];
  return (
    <div class="ch">
      <Stage
        label={describeHormones(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "ch-svg" }}
      >
        <g transform={`scale(${k})`} data-part={HormonePart.Plant}>
          <clipPath id={clip}>
            <rect x={0} y={0} width={W} height={H} rx={10} />
          </clipPath>
          <g clip-path={`url(#${clip})`}>
            <rect class="ch-bg" x={0} y={0} width={W} height={H} />
            {spot !== null && picked !== null && (
              <circle
                class={picked.effect === Effect.Promotes ? "ch-halo" : "ch-halo is-stop"}
                cx={spot.x}
                cy={spot.y}
                r={spot.r + 6}
              />
            )}
            <path class="ch-pot" d="M128 160 L 192 160 L 186 180 L 134 180 Z" />
            <path
              class="ch-stem"
              d="M160 160 C 158 130, 162 100, 160 70 C 158 50, 161 36, 160 26"
            />
            {/* leaves */}
            <ellipse
              class="ch-leaf"
              cx={180}
              cy={130}
              rx={16}
              ry={6}
              transform="rotate(-20 180 130)"
            />
            <ellipse
              class="ch-leaf"
              cx={142}
              cy={86}
              rx={15}
              ry={6}
              transform="rotate(20 142 86)"
            />
            <ellipse
              class="ch-leaf"
              cx={178}
              cy={56}
              rx={13}
              ry={5}
              transform="rotate(-25 178 56)"
            />
            {/* the wilting leaf, drooping on a limp stalk */}
            <path class="ch-twig" d="M160 120 C 140 116, 116 112, 106 120" />
            <path
              class="ch-wilt"
              d="M106 120 C 90 120, 82 132, 86 146 C 96 140, 104 132, 106 120 Z"
            />
            {/* the fruit with its seeds */}
            <path class="ch-twig" d="M161 100 C 190 96, 214 96, 222 100" />
            <ellipse class="ch-fruit" cx={232} cy={108} rx={16} ry={13} />
            {[
              [226, 104],
              [236, 104],
              [231, 112],
              [240, 112],
            ].map(([x, y]) => (
              <ellipse key={`${x}-${y}`} class="ch-seed" cx={x} cy={y} rx={2} ry={1.4} />
            ))}
            {/* the shoot tip's bud */}
            <path class="ch-bud" d="M160 14 C 154 20, 154 26, 160 28 C 166 26, 166 20, 160 14 Z" />
            {(Object.values(Spot) as Spot[]).map((key) => {
              const at = SPOT_AT[key];
              const isOn = spot !== null && picked?.spot === key;
              return (
                <text
                  key={key}
                  class={isOn ? "ch-name is-on" : "ch-name"}
                  x={at.lx}
                  y={at.ly}
                  text-anchor={at.anchor}
                >
                  {say(locale, at.label)}
                </text>
              );
            })}
          </g>
        </g>
      </Stage>
      <div class="ctc-controls" data-part={HormonePart.Chips}>
        {(Object.values(PlantHormone) as PlantHormone[]).map((h) => {
          const info = HORMONES[h];
          const showEffect = s.showEffects || s.selected === h;
          return (
            <button
              key={h}
              type="button"
              class={s.selected === h ? "ctc-button is-chip is-on" : "ctc-button is-chip"}
              aria-pressed={s.selected === h}
              disabled={!s.canPick}
              onClick={() => call(HormoneAction.Pick, { hormone: h })}
            >
              {say(locale, info.name)}
              {showEffect && (
                <span class={info.effect === Effect.Promotes ? "ch-tag" : "ch-tag is-stop"}>
                  {info.effect === Effect.Promotes ? " ↑" : " ✕"}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div class="ctc-card" data-part={HormonePart.Card} aria-live="polite">
        {picked === null ? (
          <span>{say(locale, WORDS.tap)}</span>
        ) : (
          <span>
            <b>{say(locale, picked.name)}</b>
            <span class={picked.effect === Effect.Promotes ? "ch-effect" : "ch-effect is-stop"}>
              {` · ${say(locale, picked.effect === Effect.Promotes ? WORDS.promotes : WORDS.inhibits)}`}
            </span>
            <br />
            {say(locale, picked.job)}
          </span>
        )}
      </div>
    </div>
  );
}
