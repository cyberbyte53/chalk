import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Crossing, Pole } from "./draw";
import {
  MAX_ROD_CURRENT,
  RodAction,
  type RodState,
  describeRod,
  forceOf,
  pushOf,
  swingOf,
} from "./rod";
import { type Words, say } from "./words";

const W = 320;
const H = 220;
const PIVOT = { x: 150, y: 16 } as const;
const ROD_Y = 112;

const WORDS = {
  close: { en: "Close key", hi: "कुंजी बंद करो" },
  open: { en: "Open key", hi: "कुंजी खोलो" },
  less: { en: "−", hi: "−" },
  more: { en: "+", hi: "+" },
  current: { en: "current", hi: "धारा" },
  reverse: { en: "Reverse current", hi: "धारा उलटो" },
  flip: { en: "Turn magnet over", hi: "चुंबक पलटो" },
  strong: { en: "Stronger magnet", hi: "प्रबल चुंबक" },
  normal: { en: "Usual magnet", hi: "सामान्य चुंबक" },
  long: { en: "Longer rod", hi: "लंबी छड़" },
  short: { en: "Shorter rod", hi: "छोटी छड़" },
  bToA: { en: "B → A: out of the page", hi: "B → A: पृष्ठ से बाहर" },
  aToB: { en: "A → B: into the page", hi: "A → B: पृष्ठ के अंदर" },
  off: { en: "key open: no current", hi: "कुंजी खुली: कोई धारा नहीं" },
  endA: { en: "rod AB, end A towards you", hi: "छड़ AB, सिरा A तुम्हारी ओर" },
  field: { en: "field", hi: "क्षेत्र" },
  force: { en: "force", hi: "बल" },
} as const satisfies Record<string, Words>;

function Magnet({ s }: { s: RodState }): JSX.Element {
  const top = s.isFieldUp ? "S" : "N";
  const bottom = s.isFieldUp ? "N" : "S";
  const strong = s.isStrongMagnet;
  return (
    <g class={strong ? "mg-horseshoe is-strong" : "mg-horseshoe"} data-part="magnet">
      <path class="mg-horseshoe-back" d={"M 236 46 H 268 V 182 H 236"} />
      <Pole x={70} y={34} w={170} h={26} name={top} />
      <Pole x={70} y={168} w={170} h={26} name={bottom} />
    </g>
  );
}

function FieldArrows({ s, locale }: { s: RodState; locale: string }): JSX.Element {
  const xs = [96, 124, 190, 218];
  const up = s.isFieldUp;
  return (
    <g class={s.isStrongMagnet ? "mg-field-arrows is-strong" : "mg-field-arrows"}>
      {xs.map((x) => (
        <Arrow key={x} x1={x} y1={up ? 160 : 68} x2={x} y2={up ? 68 : 160} head={6} />
      ))}
      <text class="mg-small" x={66} y={150} text-anchor="end">
        {say(locale, WORDS.field)}
      </text>
    </g>
  );
}

export function RodView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as RodState;
  const k = width / W;
  const swing = swingOf(s);
  const force = forceOf(s);
  const push = pushOf(s);
  const flowing = s.isKeyClosed && s.current > 0;
  const len = ROD_Y - PIVOT.y;
  const rx = PIVOT.x + len * Math.sin((swing * Math.PI) / 180);
  const ry = PIVOT.y + len * Math.cos((swing * Math.PI) / 180);
  const rodR = s.isLongRod ? 13 : 10;
  return (
    <div class="mg-fr">
      <Stage
        label={describeRod(s)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "mg-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="mg-bg" x={0} y={0} width={W} height={H} rx={12} />
          <Magnet s={s} />
          {s.showField && <FieldArrows s={s} locale={locale} />}
          <rect class="mg-stand" x={PIVOT.x - 50} y={PIVOT.y - 8} width={100} height={6} rx={2} />
          <g data-part="rod">
            <line class="mg-thread" x1={PIVOT.x} y1={PIVOT.y} x2={rx} y2={ry} />
            <Crossing
              x={rx}
              y={ry}
              r={rodR}
              current={flowing ? (s.isFromBToA ? "out" : "in") : "none"}
            />
          </g>
          {s.showForce && force > 0 && push !== null && (
            <g data-part="force">
              <Arrow
                cls="mg-force"
                x1={rx + (push === "left" ? -rodR - 2 : rodR + 2)}
                y1={ry}
                x2={rx + (push === "left" ? -1 : 1) * (rodR + 14 + force * 6)}
                y2={ry}
                head={8}
              />
              <text
                class="mg-force-name"
                x={rx + (push === "left" ? -1 : 1) * (rodR + 8)}
                y={ry - 12}
                text-anchor={push === "left" ? "end" : "start"}
              >
                {say(locale, WORDS.force)}
              </text>
            </g>
          )}
          <text class="mg-caption" x={W / 2} y={H - 8} text-anchor="middle">
            {say(locale, WORDS.endA)} ·{" "}
            {say(locale, flowing ? (s.isFromBToA ? WORDS.bToA : WORDS.aToB) : WORDS.off)}
          </text>
        </g>
      </Stage>
      <div class="mg-controls" data-part="controls">
        <button
          type="button"
          class={s.isKeyClosed ? "mg-button is-on" : "mg-button is-primary"}
          aria-pressed={s.isKeyClosed}
          onClick={() => call(RodAction.SetKey, { isClosed: !s.isKeyClosed })}
        >
          {say(locale, s.isKeyClosed ? WORDS.open : WORDS.close)}
        </button>
        {s.canSetCurrent && (
          <>
            <span class="mg-stepper">
              <button
                type="button"
                class="mg-button is-small"
                disabled={s.current <= 0}
                onClick={() =>
                  call(RodAction.SetCurrent, { current: s.current - 1, isFromBToA: s.isFromBToA })
                }
              >
                {WORDS.less.en}
              </button>
              <span class="mg-stepper-value">
                {say(locale, WORDS.current)} {s.current}
              </span>
              <button
                type="button"
                class="mg-button is-small"
                disabled={s.current >= MAX_ROD_CURRENT}
                onClick={() =>
                  call(RodAction.SetCurrent, { current: s.current + 1, isFromBToA: s.isFromBToA })
                }
              >
                {WORDS.more.en}
              </button>
            </span>
            <button
              type="button"
              class="mg-button"
              onClick={() =>
                call(RodAction.SetCurrent, { current: s.current, isFromBToA: !s.isFromBToA })
              }
            >
              {say(locale, WORDS.reverse)}
            </button>
          </>
        )}
        {s.canFlip && (
          <button type="button" class="mg-button" onClick={() => call(RodAction.FlipMagnet, {})}>
            {say(locale, WORDS.flip)}
          </button>
        )}
        {s.canSetMagnet && (
          <button
            type="button"
            class={s.isStrongMagnet ? "mg-button is-on" : "mg-button"}
            aria-pressed={s.isStrongMagnet}
            onClick={() => call(RodAction.SetMagnet, { isStrong: !s.isStrongMagnet })}
          >
            {say(locale, s.isStrongMagnet ? WORDS.normal : WORDS.strong)}
          </button>
        )}
        {s.canSetLength && (
          <button
            type="button"
            class={s.isLongRod ? "mg-button is-on" : "mg-button"}
            aria-pressed={s.isLongRod}
            onClick={() => call(RodAction.SetLength, { isLong: !s.isLongRod })}
          >
            {say(locale, s.isLongRod ? WORDS.short : WORDS.long)}
          </button>
        )}
      </div>
    </div>
  );
}
