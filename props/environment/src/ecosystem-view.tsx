import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Button, Controls, Frame, Label, Stepper, type Words, say } from "./draw";
import {
  EcoAction,
  EcoPart,
  EcoProblem,
  type EcoState,
  EcoThing,
  FISH_LIMIT,
  MAX_FISH,
  MAX_SNAILS,
  describeEcosystem,
  problemsOf,
} from "./ecosystem";

const W = 320;
const H = 200;

const WORDS = {
  producer: { en: "producer", hi: "उत्पादक" },
  consumer: { en: "consumer", hi: "उपभोक्ता" },
  decomposer: { en: "decomposer", hi: "अपघटक" },
  needs: { en: "The jar needs", hi: "जार को चाहिए" },
  sun: { en: "sunlight", hi: "सूर्य का प्रकाश" },
  producers: { en: "producers", hi: "उत्पादक" },
  consumers: { en: "consumers", hi: "उपभोक्ता" },
  decomposers: { en: "decomposers", hi: "अपघटक" },
  fewFish: { en: `≤ ${FISH_LIMIT} fish`, hi: `≤ ${FISH_LIMIT} मछलियाँ` },
  ok: { en: "keeps itself going", hi: "अपने आप चलता है" },
  bad: { en: "won't last", hi: "टिकेगा नहीं" },
  sunBtn: { en: "Sunlight", hi: "धूप" },
  plantsBtn: { en: "Water plants", hi: "जलीय पौधे" },
  decBtn: { en: "Bacteria & fungi", hi: "जीवाणु व कवक" },
  pumpBtn: { en: "Air pump", hi: "वायु पंप" },
  fish: { en: "Fish", hi: "मछली" },
  snails: { en: "Snails", hi: "घोंघे" },
} as const satisfies Record<string, Words>;

/** The jar's inside: x from JX to JX + JW, water from WY down to BY. */
const JX = 30;
const JW = 140;
const WY = 46;
const BY = 182;

const FISH_AT: readonly [number, number][] = [
  [62, 86],
  [120, 104],
  [80, 130],
  [138, 70],
  [58, 112],
  [128, 142],
];
const SNAIL_AT: readonly [number, number][] = [
  [52, 176],
  [150, 176],
  [168, 120],
  [100, 177],
];

function Fish({ x, y, flip }: { x: number; y: number; flip: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} class="ev-eco-fish">
      <ellipse cx={0} cy={0} rx={9} ry={4.5} />
      <path d="M8 0 L15 -5 L15 5 Z" />
      <circle class="ev-eco-eye" cx={-5} cy={-1} r={1} />
    </g>
  );
}

function Snail({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} class="ev-eco-snail">
      <ellipse class="ev-eco-snail-body" cx={2} cy={0} rx={8} ry={2.5} />
      <circle cx={0} cy={-4} r={5} />
      <path class="ev-eco-spiral" d="M0 -4 m -2 0 a 2 2 0 1 1 2 2" />
    </g>
  );
}

function Plant({ x, h }: { x: number; h: number }) {
  const top = BY - h;
  return (
    <g class="ev-eco-plant">
      <path d={`M${x} ${BY} C ${x - 8} ${BY - h / 3}, ${x + 8} ${BY - (2 * h) / 3}, ${x} ${top}`} />
      {[0.3, 0.55, 0.8].map((f, i) => (
        <ellipse
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed drawing
          key={i}
          cx={x + (i % 2 === 0 ? 6 : -6)}
          cy={BY - h * f}
          rx={6}
          ry={2.5}
          transform={`rotate(${i % 2 === 0 ? -30 : 30} ${x + (i % 2 === 0 ? 6 : -6)} ${BY - h * f})`}
        />
      ))}
    </g>
  );
}

export function EcosystemView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as EcoState;
  const problems = problemsOf(s);
  const ok = problems.length === 0;
  const isFoul =
    problems.includes(EcoProblem.NoDecomposers) || problems.includes(EcoProblem.TooManyFish);
  const hasRemains = !s.hasDecomposers && (s.fish + s.snails > 0 || s.hasPlants);
  const checks: [Words, boolean][] = [
    [WORDS.sun, s.isSunny],
    [WORDS.producers, s.hasPlants],
    [WORDS.consumers, s.fish + s.snails > 0],
    [WORDS.decomposers, s.hasDecomposers],
    [WORDS.fewFish, s.fish <= FISH_LIMIT],
  ];
  const toggle = (thing: EcoThing, on: boolean) => call(EcoAction.Toggle, { thing, on });
  return (
    <div class="ev ev-eco">
      <Frame w={W} h={H} width={width} label={describeEcosystem(s)} cls="ev-eco-svg">
        <rect class={s.isSunny ? "ev-eco-day" : "ev-eco-night"} x={0} y={0} width={W} height={H} />
        {s.isSunny && (
          <g class="ev-eco-sun">
            <circle cx={22} cy={20} r={11} />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const a = (i * Math.PI) / 4;
              return (
                <line
                  key={i}
                  x1={22 + 15 * Math.cos(a)}
                  y1={20 + 15 * Math.sin(a)}
                  x2={22 + 20 * Math.cos(a)}
                  y2={20 + 20 * Math.sin(a)}
                />
              );
            })}
          </g>
        )}
        <g data-part={EcoPart.Jar}>
          {/* the jar: a neck and a body */}
          <rect class="ev-eco-lid" x={JX + 34} y={18} width={JW - 68} height={10} rx={3} />
          <path
            class="ev-eco-glass"
            d={`M${JX + 38} 28 L${JX + 38} 38 Q ${JX} 40 ${JX} 60 L${JX} ${BY - 4} Q ${JX} ${BY + 4} ${JX + 10} ${BY + 4} L${JX + JW - 10} ${BY + 4} Q ${JX + JW} ${BY + 4} ${JX + JW} ${BY - 4} L${JX + JW} 60 Q ${JX + JW} 40 ${JX + JW - 38} 38 L${JX + JW - 38} 28 Z`}
          />
          <path
            class={isFoul ? "ev-eco-water is-foul" : "ev-eco-water"}
            d={`M${JX + 2} ${WY} L${JX + JW - 2} ${WY} L${JX + JW - 2} ${BY - 4} Q ${JX + JW - 2} ${BY + 2} ${JX + JW - 10} ${BY + 2} L${JX + 10} ${BY + 2} Q ${JX + 2} ${BY + 2} ${JX + 2} ${BY - 4} Z`}
          />
          <rect class="ev-eco-sand" x={JX + 3} y={BY - 6} width={JW - 6} height={8} rx={3} />
          {s.hasPlants && (
            <g class={s.isSunny ? "" : "is-dim"}>
              <Plant x={JX + 22} h={90} />
              <Plant x={JX + 44} h={64} />
              <Plant x={JX + JW - 24} h={100} />
            </g>
          )}
          {hasRemains && (
            <g class="ev-eco-remains">
              <ellipse cx={JX + 60} cy={BY - 6} rx={9} ry={3} />
              <ellipse cx={JX + 92} cy={BY - 5} rx={7} ry={2.5} />
              <ellipse cx={JX + 112} cy={BY - 7} rx={5} ry={2} />
            </g>
          )}
          {s.hasDecomposers && (
            <g class="ev-eco-microbes">
              {[40, 58, 76, 94, 112, 130, 148].map((x, i) => (
                <rect
                  key={x}
                  x={JX + x - 26}
                  y={BY - 9 - (i % 2) * 3}
                  width={4}
                  height={1.8}
                  rx={0.9}
                  transform={`rotate(${(i * 37) % 90} ${JX + x - 24} ${BY - 8})`}
                />
              ))}
            </g>
          )}
          {s.hasPump && (
            <g class="ev-eco-pump">
              <path d={`M${JX + JW + 22} 30 L${JX + JW - 30} 30 L${JX + JW - 30} ${BY - 12}`} />
              <rect x={JX + JW + 16} y={22} width={14} height={16} rx={3} />
              {[0, 1, 2, 3, 4].map((i) => (
                <circle
                  key={i}
                  class="ev-eco-bubble"
                  cx={JX + JW - 30 + (i % 2 === 0 ? 3 : -3)}
                  cy={BY - 22 - i * 24}
                  r={2.4}
                />
              ))}
            </g>
          )}
          {SNAIL_AT.slice(0, s.snails).map(([x, y]) => (
            <Snail key={`${x}-${y}`} x={x} y={y} />
          ))}
          {FISH_AT.slice(0, s.fish).map(([x, y], i) => (
            <Fish key={`${x}-${y}`} x={x} y={y} flip={i % 2 === 1} />
          ))}
          {s.showRoles && (
            <g>
              {s.hasPlants && (
                <Label
                  x={JX + JW - 24}
                  y={WY + 2 + 12}
                  text={say(locale, WORDS.producer)}
                  anchor="middle"
                />
              )}
              {s.fish + s.snails > 0 && (
                <Label
                  x={s.fish > 0 ? 62 : 52}
                  y={s.fish > 0 ? 77 : 165}
                  text={say(locale, WORDS.consumer)}
                  anchor="middle"
                />
              )}
              {s.hasDecomposers && (
                <Label
                  x={JX + JW / 2}
                  y={BY - 16}
                  text={say(locale, WORDS.decomposer)}
                  anchor="middle"
                  cls="is-dim"
                />
              )}
            </g>
          )}
        </g>
        {s.showChecklist && (
          <g data-part={EcoPart.Checklist}>
            <rect class="ev-eco-card" x={194} y={44} width={118} height={140} rx={8} />
            <Label x={204} y={62} text={say(locale, WORDS.needs)} />
            {checks.map(([w, isMet], i) => (
              <g key={w.en}>
                <text class={isMet ? "ev-tick is-good" : "ev-tick is-bad"} x={206} y={82 + i * 17}>
                  {isMet ? "✓" : "✗"}
                </text>
                <Label x={220} y={82 + i * 17} text={say(locale, w)} />
              </g>
            ))}
            <Label
              x={253}
              y={175}
              text={say(locale, ok ? WORDS.ok : WORDS.bad)}
              anchor="middle"
              cls={ok ? "is-big is-good" : "is-big is-bad"}
            />
          </g>
        )}
      </Frame>
      {(s.canToggle || s.canSetAnimals) && (
        <Controls>
          <span class="ev-row" data-part={EcoPart.Controls}>
            {s.canToggle && (
              <>
                <Button
                  label={say(locale, WORDS.sunBtn)}
                  isOn={s.isSunny}
                  onClick={() => toggle(EcoThing.Sun, !s.isSunny)}
                />
                <Button
                  label={say(locale, WORDS.plantsBtn)}
                  isOn={s.hasPlants}
                  onClick={() => toggle(EcoThing.Plants, !s.hasPlants)}
                />
                <Button
                  label={say(locale, WORDS.decBtn)}
                  isOn={s.hasDecomposers}
                  onClick={() => toggle(EcoThing.Decomposers, !s.hasDecomposers)}
                />
                <Button
                  label={say(locale, WORDS.pumpBtn)}
                  isOn={s.hasPump}
                  onClick={() => toggle(EcoThing.Pump, !s.hasPump)}
                />
              </>
            )}
            {s.canSetAnimals && (
              <>
                <Stepper
                  label={say(locale, WORDS.fish)}
                  value={s.fish}
                  max={MAX_FISH}
                  onSet={(n) => call(EcoAction.SetFish, { n })}
                />
                <Stepper
                  label={say(locale, WORDS.snails)}
                  value={s.snails}
                  max={MAX_SNAILS}
                  onSet={(n) => call(EcoAction.SetSnails, { n })}
                />
              </>
            )}
          </span>
        </Controls>
      )}
    </div>
  );
}
