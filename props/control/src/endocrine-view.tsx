import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { type Words, say } from "./draw";
import {
  Body,
  EndocrineAction,
  EndocrinePart,
  type EndocrineState,
  GLANDS,
  Gland,
  describeEndocrine,
  glandsOf,
} from "./endocrine";

const W = 320;
const H = 236;
const X = 160;
/** Names line up in a column either side of the body. */
const LEFT_COL = 98;
const RIGHT_COL = 222;

const WORDS = {
  male: { en: "Male", hi: "पुरुष" },
  female: { en: "Female", hi: "स्त्री" },
  tap: { en: "Tap a gland to see its hormone.", hi: "कोई ग्रंथि टैप करो और उसका हॉर्मोन देखो।" },
  hormone: { en: "Hormone:", hi: "हॉर्मोन:" },
  notInText: { en: "not in the chapter", hi: "अध्याय में नहीं" },
} as const satisfies Record<string, Words>;

/** Each gland's mark on the body, and where its name sits (left or right of the body). */
const PLACE: Readonly<
  Record<
    Gland,
    { shape: JSX.Element; at: [number, number]; label: [number, number]; side: "left" | "right" }
  >
> = {
  [Gland.Pineal]: {
    shape: <circle cx={X + 7} cy={22} r={3} />,
    at: [X + 7, 22],
    label: [W - 8, 14],
    side: "right",
  },
  [Gland.Hypothalamus]: {
    shape: <ellipse cx={X - 2} cy={28} rx={5} ry={3} />,
    at: [X - 2, 28],
    label: [8, 18],
    side: "left",
  },
  [Gland.Pituitary]: {
    shape: <circle cx={X - 1} cy={36} r={3.4} />,
    at: [X - 1, 36],
    label: [8, 40],
    side: "left",
  },
  [Gland.Thyroid]: {
    shape: (
      <path
        d={`M${X - 9} 66 C ${X - 9} 58, ${X - 2} 58, ${X} 63 C ${X + 2} 58, ${X + 9} 58, ${X + 9} 66 C ${X + 9} 72, ${X + 2} 72, ${X} 68 C ${X - 2} 72, ${X - 9} 72, ${X - 9} 66 Z`}
      />
    ),
    at: [X - 6, 66],
    label: [8, 64],
    side: "left",
  },
  [Gland.Parathyroid]: {
    shape: (
      <g>
        <circle cx={X - 6} cy={62} r={1.6} />
        <circle cx={X + 6} cy={62} r={1.6} />
        <circle cx={X - 6} cy={70} r={1.6} />
        <circle cx={X + 6} cy={70} r={1.6} />
      </g>
    ),
    at: [X + 7, 70],
    label: [W - 8, 62],
    side: "right",
  },
  [Gland.Thymus]: {
    shape: (
      <path
        d={`M${X - 8} 86 C ${X - 10} 96, ${X - 4} 104, ${X} 100 C ${X + 4} 104, ${X + 10} 96, ${X + 8} 86 Z`}
      />
    ),
    at: [X - 6, 94],
    label: [8, 96],
    side: "left",
  },
  [Gland.Adrenal]: {
    shape: (
      <g>
        <path d={`M${X - 26} 128 l 6 -8 l 6 8 z`} />
        <path d={`M${X + 14} 128 l 6 -8 l 6 8 z`} />
      </g>
    ),
    at: [X + 23, 124],
    label: [W - 8, 116],
    side: "right",
  },
  [Gland.Pancreas]: {
    shape: (
      <path
        d={`M${X - 16} 146 C ${X - 4} 138, ${X + 14} 140, ${X + 24} 144 C ${X + 14} 150, ${X - 4} 152, ${X - 16} 146 Z`}
      />
    ),
    at: [X - 12, 146],
    label: [8, 150],
    side: "left",
  },
  [Gland.Testes]: {
    shape: (
      <g>
        <ellipse cx={X - 6} cy={188} rx={4.5} ry={6} />
        <ellipse cx={X + 6} cy={188} rx={4.5} ry={6} />
      </g>
    ),
    at: [X - 9, 190],
    label: [8, 196],
    side: "left",
  },
  [Gland.Ovaries]: {
    shape: (
      <g>
        <ellipse cx={X - 18} cy={170} rx={5} ry={3.6} />
        <ellipse cx={X + 18} cy={170} rx={5} ry={3.6} />
      </g>
    ),
    at: [X - 22, 170],
    label: [8, 180],
    side: "left",
  },
};

export function EndocrineMapView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as EndocrineState;
  const k = width / W;
  const height = Math.round(H * k);
  const clip = `ce-frame-${useId()}`;
  const glands = glandsOf(s.body);
  const tap = (gland: Gland) => {
    if (s.canTap) call(EndocrineAction.Tap, { gland });
  };
  const picked = s.selected === null ? null : GLANDS[s.selected];
  const isFemale = s.body === Body.Female;
  return (
    <div class="ce">
      <Stage
        label={describeEndocrine(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "ce-svg" }}
      >
        <g transform={`scale(${k})`} data-part={EndocrinePart.Body}>
          <clipPath id={clip}>
            <rect x={0} y={0} width={W} height={H} rx={10} />
          </clipPath>
          <g clip-path={`url(#${clip})`}>
            <rect class="ce-bg" x={0} y={0} width={W} height={H} />
            {/* the body outline */}
            <g class="ce-body">
              <circle cx={X} cy={28} r={22} />
              <rect x={X - 8} y={46} width={16} height={18} />
              <path
                d={
                  isFemale
                    ? `M${X - 34} 76 C ${X - 34} 64, ${X - 20} 62, ${X} 62 C ${X + 20} 62, ${X + 34} 64, ${X + 34} 76 L ${X + 28} 130 C ${X + 38} 156, ${X + 38} 180, ${X + 30} 196 L ${X - 30} 196 C ${X - 38} 180, ${X - 38} 156, ${X - 28} 130 Z`
                    : `M${X - 38} 76 C ${X - 38} 64, ${X - 22} 62, ${X} 62 C ${X + 22} 62, ${X + 38} 64, ${X + 38} 76 L ${X + 32} 170 C ${X + 32} 186, ${X + 26} 196, ${X + 20} 196 L ${X - 20} 196 C ${X - 26} 196, ${X - 32} 186, ${X - 32} 170 Z`
                }
              />
              <path d={`M${X - 36} 74 L ${X - 54} 150 L ${X - 46} 152 L ${X - 30} 100`} />
              <path d={`M${X + 36} 74 L ${X + 54} 150 L ${X + 46} 152 L ${X + 30} 100`} />
              <rect x={X - 24} y={194} width={18} height={44} rx={6} />
              <rect x={X + 6} y={194} width={18} height={44} rx={6} />
            </g>
            {/* kidneys, under the adrenal glands, for reference */}
            <ellipse class="ce-kidney" cx={X - 20} cy={136} rx={6} ry={9} />
            <ellipse class="ce-kidney" cx={X + 20} cy={136} rx={6} ry={9} />
            {glands.map((g) => {
              const place = PLACE[g];
              const isOn = s.selected === g;
              return (
                <g
                  key={g}
                  class={
                    isOn ? "ce-gland is-on" : GLANDS[g].inText ? "ce-gland" : "ce-gland is-extra"
                  }
                  // biome-ignore lint/a11y/useSemanticElements: a <button> can't live inside SVG
                  role="button"
                  tabIndex={s.canTap ? 0 : -1}
                  aria-label={say(locale, GLANDS[g].name)}
                  data-part={g}
                  onClick={() => tap(g)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      tap(g);
                    }
                  }}
                >
                  <circle class="ce-hit" cx={place.at[0]} cy={place.at[1]} r={10} />
                  {place.shape}
                  {s.showNames && (
                    <g class="ce-name">
                      <line
                        x1={place.at[0]}
                        y1={place.at[1]}
                        x2={place.side === "left" ? LEFT_COL + 3 : RIGHT_COL - 3}
                        y2={place.label[1] - 4}
                      />
                      <text
                        x={place.side === "left" ? LEFT_COL : RIGHT_COL}
                        y={place.label[1]}
                        text-anchor={place.side === "left" ? "end" : "start"}
                      >
                        {say(locale, GLANDS[g].name)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </Stage>
      {s.canSetBody && (
        <div class="ctc-controls" data-part={EndocrinePart.Toggle}>
          <div class="ctc-toggle">
            {[Body.Male, Body.Female].map((b) => (
              <button
                key={b}
                type="button"
                class={s.body === b ? "ctc-button is-chip is-on" : "ctc-button is-chip"}
                aria-pressed={s.body === b}
                onClick={() => call(EndocrineAction.SetBody, { body: b })}
              >
                {say(locale, b === Body.Female ? WORDS.female : WORDS.male)}
              </button>
            ))}
          </div>
        </div>
      )}
      <div class="ctc-card" data-part={EndocrinePart.Card} aria-live="polite">
        {picked === null ? (
          <span>{say(locale, WORDS.tap)}</span>
        ) : (
          <span>
            <b>{say(locale, picked.name)}</b>
            {!picked.inText && <span class="ce-extra">{` · ${say(locale, WORDS.notInText)}`}</span>}
            <br />
            {`${say(locale, WORDS.hormone)} `}
            <b>{say(locale, picked.hormone)}</b>
            <br />
            {say(locale, picked.job)}
          </span>
        )}
      </div>
    </div>
  );
}
