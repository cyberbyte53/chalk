import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { SUBSTANCES, natureOfPh, strengthOfPh } from "./acid-data";
import { Chips, phClass } from "./acid-draw";
import {
  LIFE_BANDS,
  PhAction,
  type PhState,
  describePh,
  hydrogenWords,
  readingOf,
} from "./ph-scale";
import { type Words, range, say } from "./words";

const W = 320;
const LEFT = 18;
const RIGHT = 302;
const STRIP_Y = 58;
const STRIP_H = 24;
const cell = (RIGHT - LEFT) / 15;
/** The x of a pH value (the middle of its band). */
const xOf = (pH: number) => LEFT + cell * (Math.max(0, Math.min(14, pH)) + 0.5);

const WORDS = {
  acidic: { en: "acidic", hi: "अम्लीय" },
  neutral: { en: "neutral", hi: "उदासीन" },
  basic: { en: "basic", hi: "क्षारीय" },
  moreAcid: { en: "more acidic", hi: "अधिक अम्लीय" },
  moreBase: { en: "more basic", hi: "अधिक क्षारीय" },
  hIons: { en: "H⁺ ions", hi: "H⁺ आयन" },
  ohIons: { en: "OH⁻ ions", hi: "OH⁻ आयन" },
  test: { en: "Test with universal indicator paper", hi: "सार्वत्रिक सूचक पत्र से जाँचो" },
  probe: { en: "Slide to a pH", hi: "किसी pH तक खिसकाओ" },
} as const satisfies Record<string, Words>;

/** The pH strip, its pointer, ion wedges and life band; substance chips and a probe slider. */
export function PhScaleView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as PhState;
  const k = width / W;
  const pH = readingOf(s);
  const ionsTop = STRIP_Y + STRIP_H + (s.showRegions ? 40 : 24);
  const H = s.showIons ? ionsTop + 52 : STRIP_Y + STRIP_H + (s.showRegions ? 44 : 28);
  const height = Math.round(H * k);
  const label = s.picked !== null ? say(locale, SUBSTANCES[s.picked].name) : null;
  const pointerX = pH === null ? 0 : xOf(pH);
  // Keep the pointer's words inside the picture.
  const anchor: "start" | "middle" | "end" =
    pointerX < 70 ? "start" : pointerX > W - 70 ? "end" : "middle";
  const textX =
    anchor === "start"
      ? Math.max(6, pointerX - 10)
      : anchor === "end"
        ? Math.min(W - 6, pointerX + 10)
        : pointerX;
  return (
    <div class="ph ac">
      <Stage
        label={describePh(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "ph-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="ac-bg" x={0} y={0} width={W} height={H} rx={12} />
          {s.band !== null && (
            <g data-part="band" class="ph-band">
              <rect
                x={xOf(LIFE_BANDS[s.band].from) - (LIFE_BANDS[s.band].from === 0 ? cell / 2 : 0)}
                y={STRIP_Y - 6}
                width={
                  xOf(LIFE_BANDS[s.band].to) -
                  xOf(LIFE_BANDS[s.band].from) +
                  (LIFE_BANDS[s.band].from === 0 ? cell / 2 : 0)
                }
                height={STRIP_H + 12}
                rx={4}
              />
              <text
                x={Math.min(
                  W - 10,
                  Math.max(10, (xOf(LIFE_BANDS[s.band].from) + xOf(LIFE_BANDS[s.band].to)) / 2),
                )}
                y={pH === null ? STRIP_Y - 12 : 14}
                text-anchor="middle"
              >
                {say(locale, LIFE_BANDS[s.band].words)}
              </text>
            </g>
          )}
          <g data-part="strip">
            {range(15).map((i) => (
              <g key={i} class="ph-cell">
                <rect
                  class={s.showColours ? phClass(i) : "ph-plain"}
                  x={LEFT + i * cell}
                  y={STRIP_Y}
                  width={cell + 0.4}
                  height={STRIP_H}
                />
                <text
                  class="ph-number"
                  x={LEFT + (i + 0.5) * cell}
                  y={STRIP_Y + STRIP_H + 12}
                  text-anchor="middle"
                >
                  {i}
                </text>
              </g>
            ))}
            <rect
              class="ph-strip-edge"
              x={LEFT}
              y={STRIP_Y}
              width={RIGHT - LEFT}
              height={STRIP_H}
              rx={3}
            />
            <line
              class="ph-seven"
              x1={xOf(7)}
              y1={STRIP_Y - 3}
              x2={xOf(7)}
              y2={STRIP_Y + STRIP_H + 3}
            />
          </g>
          {s.showRegions && (
            <g class="ph-regions">
              <text x={(xOf(0) + xOf(6)) / 2} y={STRIP_Y + STRIP_H + 30} text-anchor="middle">
                ← {say(locale, WORDS.acidic)}
              </text>
              <text
                class="ph-region-neutral"
                x={xOf(7)}
                y={STRIP_Y + STRIP_H + 30}
                text-anchor="middle"
              >
                {say(locale, WORDS.neutral)}
              </text>
              <text x={(xOf(8) + xOf(14)) / 2} y={STRIP_Y + STRIP_H + 30} text-anchor="middle">
                {say(locale, WORDS.basic)} →
              </text>
            </g>
          )}
          {s.showTested &&
            s.tested
              .filter((x) => x !== s.picked)
              .map((x) => (
                <circle
                  key={x}
                  class="ph-tested"
                  cx={xOf(SUBSTANCES[x].pH)}
                  cy={STRIP_Y - 4}
                  r={2.6}
                />
              ))}
          {pH !== null && (
            <g data-part="pointer" class="ph-pointer">
              <path d={`M${pointerX} ${STRIP_Y - 2} l -6 -9 h 12 z`} />
              <line x1={pointerX} y1={STRIP_Y} x2={pointerX} y2={STRIP_Y + STRIP_H} />
              <text class="ph-reading" x={textX} y={STRIP_Y - 30} text-anchor={anchor}>
                {label !== null ? `${label}: ` : ""}pH {pH}
              </text>
              <text class="ph-reading-sub" x={textX} y={STRIP_Y - 16} text-anchor={anchor}>
                {say(locale, strengthOfPh(pH))}
              </text>
            </g>
          )}
          {s.showIons && (
            <g data-part="ions" class="ph-ions">
              <path
                class="ph-wedge-h"
                d={`M${LEFT} ${ionsTop} H${RIGHT} L${LEFT} ${ionsTop + 16} Z`}
              />
              <path
                class="ph-wedge-oh"
                d={`M${LEFT} ${ionsTop + 34} H${RIGHT} V${ionsTop + 18} Z`}
              />
              <text x={LEFT + 4} y={ionsTop + 11}>
                {say(locale, WORDS.hIons)}
              </text>
              <text x={RIGHT - 4} y={ionsTop + 30} text-anchor="end">
                {say(locale, WORDS.ohIons)}
              </text>
              <text class="ph-ions-note" x={W / 2} y={ionsTop + 48} text-anchor="middle">
                {pH !== null ? say(locale, hydrogenWords(pH)) : ""}
              </text>
            </g>
          )}
        </g>
      </Stage>
      {s.canPick && s.substances.length > 0 && (
        <Chips
          options={s.substances.map((id) => ({ id, words: SUBSTANCES[id].name }))}
          chosen={s.picked}
          label={WORDS.test}
          onChoose={(substance) => call(PhAction.Pick, { substance })}
          locale={locale}
          part="substances"
        />
      )}
      {s.canProbe && (
        <label class="ph-probe">
          <span>{say(locale, WORDS.probe)}</span>
          <input
            type="range"
            min={0}
            max={14}
            step={0.5}
            value={s.probe ?? 7}
            aria-valuetext={pH === null ? "" : `pH ${pH}, ${say(locale, strengthOfPh(pH))}`}
            onInput={(e) =>
              call(PhAction.Probe, { pH: Number((e.target as HTMLInputElement).value) })
            }
          />
          <span class={`ph-probe-value is-${pH === null ? "none" : natureOfPh(pH)}`}>
            {pH === null ? "–" : `pH ${pH}`}
          </span>
        </label>
      )}
    </div>
  );
}
