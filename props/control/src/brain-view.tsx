import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import {
  BrainAction,
  BrainPart,
  BrainRegion,
  type BrainState,
  DIVISION_OF,
  DIVISION_WORDS,
  REGION_WORDS,
  TASKS,
  describeBrain,
  isRightPart,
} from "./brain";
import { type Words, say } from "./draw";

const W = 320;
const H = 196;

const WORDS = {
  front: { en: "front", hi: "आगे" },
  back: { en: "back", hi: "पीछे" },
  tap: { en: "Tap a part of the brain.", hi: "मस्तिष्क के किसी भाग पर टैप करो।" },
  whoIs: { en: "Which part is in charge?", hi: "किस भाग का काम है?" },
  right: { en: "Yes!", hi: "हाँ!" },
  wrong: { en: "Not this one. Try again.", hi: "यह नहीं। फिर से कोशिश करो।" },
  part: { en: "part of the", hi: "भाग:" },
} as const satisfies Record<string, Words>;

/** Each part's outline, drawn front to the left, and where its name sits. */
const SHAPES: Readonly<
  Record<BrainRegion, { d: string; label: [number, number]; anchor?: "start" | "middle" | "end" }>
> = {
  [BrainRegion.Cerebrum]: {
    d: "M44 112 C 30 64, 86 14, 158 14 C 232 14, 276 52, 268 96 C 264 116, 246 122, 226 118 C 206 114, 190 118, 176 122 L 150 126 C 120 132, 84 140, 60 132 C 50 128, 46 122, 44 112 Z",
    label: [150, 64],
  },
  [BrainRegion.Hypothalamus]: {
    d: "M128 124 C 134 116, 152 116, 158 124 C 154 134, 134 136, 128 124 Z",
    label: [96, 158],
    anchor: "end",
  },
  [BrainRegion.Pituitary]: {
    d: "M138 134 L 140 146 C 132 148, 130 158, 138 160 C 146 162, 150 152, 144 146 L 144 134 Z",
    label: [126, 176],
    anchor: "end",
  },
  [BrainRegion.MidBrain]: {
    d: "M160 124 C 170 118, 184 120, 186 128 C 184 138, 166 140, 160 134 Z",
    label: [W - 6, 110],
    anchor: "end",
  },
  [BrainRegion.Pons]: {
    d: "M164 140 C 172 134, 194 134, 198 144 C 198 156, 176 162, 166 154 C 162 150, 162 144, 164 140 Z",
    label: [128, 192],
    anchor: "start",
  },
  [BrainRegion.Cerebellum]: {
    d: "M204 128 C 222 116, 266 118, 270 138 C 272 156, 248 166, 226 162 C 210 160, 200 148, 204 128 Z",
    label: [282, 178],
    anchor: "middle",
  },
  [BrainRegion.Medulla]: {
    d: "M174 158 C 182 156, 194 156, 198 160 L 196 178 L 180 178 Z",
    label: [206, 176],
    anchor: "start",
  },
  [BrainRegion.SpinalCord]: {
    d: "M180 178 L 196 178 L 194 200 L 182 200 Z",
    label: [206, 192],
    anchor: "start",
  },
};

/** Short names drawn on the picture (the card below gives the full name). */
const SHORT: Readonly<Record<BrainRegion, Words>> = {
  [BrainRegion.Cerebrum]: { en: "cerebrum", hi: "प्रमस्तिष्क" },
  [BrainRegion.Hypothalamus]: { en: "hypothalamus", hi: "हाइपोथैलेमस" },
  [BrainRegion.Pituitary]: { en: "pituitary", hi: "पीयूष ग्रंथि" },
  [BrainRegion.MidBrain]: { en: "mid-brain", hi: "मध्यमस्तिष्क" },
  [BrainRegion.Pons]: { en: "pons", hi: "पोन्स" },
  [BrainRegion.Cerebellum]: { en: "cerebellum", hi: "अनुमस्तिष्क" },
  [BrainRegion.Medulla]: { en: "medulla", hi: "मेडुला" },
  [BrainRegion.SpinalCord]: { en: "spinal cord", hi: "मेरुरज्जु" },
};

/** Where each label's leader line starts, on the part itself. */
const ANCHOR: Readonly<Record<BrainRegion, [number, number] | null>> = {
  [BrainRegion.Cerebrum]: null,
  [BrainRegion.Hypothalamus]: [134, 128],
  [BrainRegion.Pituitary]: [136, 156],
  [BrainRegion.MidBrain]: [180, 126],
  [BrainRegion.Pons]: [168, 152],
  [BrainRegion.Cerebellum]: [252, 158],
  [BrainRegion.Medulla]: [196, 170],
  [BrainRegion.SpinalCord]: [194, 190],
};

const ORDER: readonly BrainRegion[] = [
  BrainRegion.Cerebrum,
  BrainRegion.Cerebellum,
  BrainRegion.Pons,
  BrainRegion.MidBrain,
  BrainRegion.Medulla,
  BrainRegion.SpinalCord,
  BrainRegion.Hypothalamus,
  BrainRegion.Pituitary,
];

export function BrainMapView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as BrainState;
  const k = width / W;
  const height = Math.round(H * k);
  const clip = `cb-frame-${useId()}`;
  const tap = (region: BrainRegion) => {
    if (s.canTap) call(BrainAction.Tap, { region });
  };
  const judged = s.ask !== null && s.selected !== null ? isRightPart(s.ask, s.selected) : null;
  return (
    <div class="ctb">
      {s.ask !== null && (
        <p class="ctb-ask">
          <span>{say(locale, WORDS.whoIs)}</span> <b>{say(locale, TASKS[s.ask].words)}</b>
        </p>
      )}
      <Stage
        label={describeBrain(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "ctb-svg" }}
      >
        <g transform={`scale(${k})`} data-part={BrainPart.Map}>
          <clipPath id={clip}>
            <rect x={0} y={0} width={W} height={H} rx={10} />
          </clipPath>
          <g clip-path={`url(#${clip})`}>
            <rect class="ctb-bg" x={0} y={0} width={W} height={H} />
            {ORDER.map((region) => {
              const shape = SHAPES[region];
              const division = DIVISION_OF[region];
              const isSelected = s.selected === region;
              const cls = [
                "ctb-region",
                s.showDivisions ? `is-${division}` : "",
                isSelected ? "is-selected" : "",
                isSelected && judged === true ? "is-right" : "",
                isSelected && judged === false ? "is-wrong" : "",
              ]
                .filter((c) => c !== "")
                .join(" ");
              return (
                <path
                  key={region}
                  class={cls}
                  d={shape.d}
                  role="button"
                  tabIndex={s.canTap ? 0 : -1}
                  aria-label={say(locale, REGION_WORDS[region].name)}
                  data-part={region}
                  onClick={() => tap(region)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      tap(region);
                    }
                  }}
                />
              );
            })}
            {/* folds on the cerebrum and stripes on the cerebellum, for look only */}
            <g class="ctb-folds">
              <path d="M70 92 C 90 70, 110 96, 130 74 M120 40 C 140 56, 150 30, 176 44 M190 70 C 206 54, 226 76, 246 62 M90 116 C 110 104, 128 118, 146 108 M200 96 C 214 88, 230 102, 248 94" />
            </g>
            <g class="ctb-folds">
              <path d="M210 138 C 230 130, 252 132, 266 140 M210 148 C 230 142, 252 144, 264 150" />
            </g>
            {s.showNames &&
              ORDER.map((region) => {
                const shape = SHAPES[region];
                const from = ANCHOR[region];
                return (
                  <g
                    key={`n-${region}`}
                    class={s.selected === region ? "ctb-name is-selected" : "ctb-name"}
                  >
                    {from !== null && (
                      <line
                        x1={from[0]}
                        y1={from[1]}
                        x2={
                          shape.label[0] +
                          (shape.anchor === "end" ? 2 : shape.anchor === "start" ? -2 : 0)
                        }
                        y2={shape.label[1] - 4}
                      />
                    )}
                    <text
                      x={shape.label[0]}
                      y={shape.label[1]}
                      text-anchor={shape.anchor ?? "middle"}
                    >
                      {say(locale, SHORT[region])}
                    </text>
                  </g>
                );
              })}
            {s.showDivisions && (
              <g class="ctb-legend">
                {(["fore", "mid", "hind"] as const).map((d, i) => (
                  <g key={d} transform={`translate(10 ${10 + i * 14})`}>
                    <rect class={`ctb-region is-${d}`} width={10} height={10} rx={2} />
                    <text x={14} y={9}>
                      {say(locale, DIVISION_WORDS[d])}
                    </text>
                  </g>
                ))}
              </g>
            )}
            <text class="ctb-dir" x={10} y={H - 8}>
              {`← ${say(locale, WORDS.front)}`}
            </text>
            <text class="ctb-dir" x={W - 10} y={16} text-anchor="end">
              {`${say(locale, WORDS.back)} →`}
            </text>
          </g>
        </g>
      </Stage>
      <div
        class={
          judged === true ? "ctc-card is-right" : judged === false ? "ctc-card is-wrong" : "ctc-card"
        }
        data-part={BrainPart.Card}
        aria-live="polite"
      >
        {s.selected === null ? (
          <span>{say(locale, WORDS.tap)}</span>
        ) : (
          <span>
            {judged !== null && <b>{say(locale, judged ? WORDS.right : WORDS.wrong)} </b>}
            <b>{say(locale, REGION_WORDS[s.selected].name)}</b>
            {s.showDivisions && (
              <span class="ctb-division">{` · ${say(locale, DIVISION_WORDS[DIVISION_OF[s.selected]])}`}</span>
            )}
            <br />
            {say(locale, REGION_WORDS[s.selected].job)}
          </span>
        )}
      </div>
    </div>
  );
}
