import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { type Words, say } from "./draw";
import {
  HISTORY,
  MAX_INSULIN,
  ResponseAction,
  ResponseMode,
  ResponsePart,
  type ResponseState,
  SUGAR,
  describeResponse,
  isHigh,
  responseCaption,
} from "./response";

const W = 320;
const H = 190;

const WORDS = {
  scare: { en: "A scare!", hi: "अचानक डर!" },
  calm: { en: "Calm down", hi: "शांत हो जाओ" },
  eat: { en: "Eat", hi: "खाओ" },
  wait: { en: "Wait", hi: "रुको" },
  again: { en: "Start again", hi: "फिर से शुरू" },
  pancreasOn: { en: "Pancreas makes insulin", hi: "अग्न्याशय इंसुलिन बनाता है" },
  pancreasOff: { en: "No insulin (diabetes)", hi: "इंसुलिन नहीं (मधुमेह)" },
  heart: { en: "heartbeat", hi: "हृदय गति" },
  breath: { en: "breathing", hi: "साँस" },
  muscles: { en: "blood to muscles", hi: "पेशियों में रुधिर" },
  gut: { en: "blood to stomach, skin", hi: "पेट, त्वचा में रुधिर" },
  faster: { en: "faster", hi: "तेज़" },
  more: { en: "more", hi: "अधिक" },
  less: { en: "less", hi: "कम" },
  normal: { en: "normal", hi: "सामान्य" },
  adrenaline: { en: "adrenaline", hi: "एड्रिनलिन" },
  adrenal: { en: "adrenal glands", hi: "अधिवृक्क ग्रंथियाँ" },
  sugar: { en: "blood sugar", hi: "रुधिर शर्करा" },
  band: { en: "normal", hi: "सामान्य" },
  time: { en: "time →", hi: "समय →" },
  pancreas: { en: "pancreas", hi: "अग्न्याशय" },
  insulin: { en: "insulin", hi: "इंसुलिन" },
} as const satisfies Record<string, Words>;

function Adrenaline({ s, locale }: { s: ResponseState; locale: string }): JSX.Element {
  const scared = s.isScared;
  const rows: { name: Words; now: Words; up: boolean | null }[] = [
    { name: WORDS.heart, now: scared ? WORDS.faster : WORDS.normal, up: scared ? true : null },
    { name: WORDS.breath, now: scared ? WORDS.faster : WORDS.normal, up: scared ? true : null },
    { name: WORDS.muscles, now: scared ? WORDS.more : WORDS.normal, up: scared ? true : null },
    { name: WORDS.gut, now: scared ? WORDS.less : WORDS.normal, up: scared ? false : null },
  ];
  return (
    <g data-part={ResponsePart.Body}>
      {/* the person */}
      <g class="cto-body">
        <circle cx={70} cy={30} r={16} />
        <path d="M44 56 C 44 48, 56 46, 70 46 C 84 46, 96 48, 96 56 L 92 120 L 48 120 Z" />
        <rect x={50} y={118} width={16} height={64} rx={6} />
        <rect x={74} y={118} width={16} height={64} rx={6} />
      </g>
      <g class={scared ? "cto-lungs is-fast" : "cto-lungs"}>
        <ellipse cx={60} cy={70} rx={9} ry={14} />
        <ellipse cx={82} cy={70} rx={9} ry={14} />
      </g>
      <path
        class={scared ? "cto-heart is-fast" : "cto-heart"}
        d="M72 78 C 72 72, 80 72, 80 78 C 80 84, 72 88, 72 92 C 72 88, 64 84, 64 78 C 64 72, 72 72, 72 78 Z"
      />
      <ellipse class={scared ? "cto-gut is-less" : "cto-gut"} cx={70} cy={104} rx={14} ry={9} />
      <ellipse
        class={scared ? "cto-muscle is-more" : "cto-muscle"}
        cx={58}
        cy={146}
        rx={6}
        ry={16}
      />
      <ellipse
        class={scared ? "cto-muscle is-more" : "cto-muscle"}
        cx={82}
        cy={146}
        rx={6}
        ry={16}
      />
      <g class={scared ? "cto-adrenal is-on" : "cto-adrenal"}>
        <path d="M56 98 l 4 -6 l 4 6 z" />
        <path d="M76 98 l 4 -6 l 4 6 z" />
      </g>
      {scared && (
        <g class="cto-drops">
          {[
            [40, 64],
            [100, 80],
            [38, 112],
            [104, 132],
            [70, 168],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} />
          ))}
          <text x={110} y={20}>
            {`${say(locale, WORDS.adrenaline)} →`}
          </text>
        </g>
      )}
      {!scared && (
        <text class="cto-note" x={100} y={98}>
          {`← ${say(locale, WORDS.adrenal)}`}
        </text>
      )}
      {/* what changed */}
      {rows.map((r, i) => {
        const y = 52 + i * 34;
        return (
          <g key={r.name.en} class="cto-row">
            <text x={192} y={y}>
              {say(locale, r.name)}
            </text>
            <text
              class={r.up === null ? "cto-now" : r.up ? "cto-now is-up" : "cto-now is-down"}
              x={192}
              y={y + 16}
            >
              {`${r.up === null ? "•" : r.up ? "▲" : "▼"} ${say(locale, r.now)}`}
            </text>
          </g>
        );
      })}
    </g>
  );
}

const G = { x: 34, y: 16, w: 196, h: 150 };
const yOf = (sugar: number): number =>
  G.y + G.h - ((sugar - SUGAR.min) / (SUGAR.max - SUGAR.min)) * G.h;

function BloodSugar({ s, locale }: { s: ResponseState; locale: string }): JSX.Element {
  const step = G.w / (HISTORY - 1);
  const pts = s.history.map((v, i) => [G.x + i * step, yOf(v)] as const);
  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const last = pts[pts.length - 1] ?? [G.x, yOf(s.sugar)];
  const high = isHigh(s.sugar);
  return (
    <g>
      <g data-part={ResponsePart.Graph}>
        <rect
          class="cto-band"
          x={G.x}
          y={yOf(SUGAR.high)}
          width={G.w}
          height={yOf(SUGAR.low) - yOf(SUGAR.high)}
        />
        <text class="cto-band-name" x={G.x + G.w - 4} y={yOf(SUGAR.low) - 4} text-anchor="end">
          {say(locale, WORDS.band)}
        </text>
        <line class="cto-axis" x1={G.x} y1={G.y} x2={G.x} y2={G.y + G.h} />
        <line class="cto-axis" x1={G.x} y1={G.y + G.h} x2={G.x + G.w} y2={G.y + G.h} />
        <text
          class="cto-axis-name"
          x={G.x - 6}
          y={G.y + G.h / 2}
          text-anchor="middle"
          transform={`rotate(-90 ${G.x - 6} ${G.y + G.h / 2})`}
        >
          {say(locale, WORDS.sugar)}
        </text>
        <text class="cto-axis-name" x={G.x + G.w} y={G.y + G.h + 14} text-anchor="end">
          {say(locale, WORDS.time)}
        </text>
        {pts.length > 1 && <path class="cto-line" d={line} />}
        {pts.map(([x, y], i) => (
          <circle key={`${i}-${x}`} class="cto-point" cx={x} cy={y} r={2.6} />
        ))}
        <circle
          class={high ? "cto-now-dot is-high" : "cto-now-dot"}
          cx={last[0]}
          cy={last[1]}
          r={5}
        />
      </g>
      <g data-part={ResponsePart.Pancreas}>
        <path
          class={s.hasInsulin ? "cto-pancreas" : "cto-pancreas is-off"}
          d="M248 132 C 262 120, 296 122, 308 132 C 296 142, 262 144, 248 132 Z"
        />
        <text class="cto-note" x={278} y={156} text-anchor="middle">
          {say(locale, WORDS.pancreas)}
        </text>
        <text class="cto-note" x={278} y={22} text-anchor="middle">
          {say(locale, WORDS.insulin)}
        </text>
        {Array.from({ length: MAX_INSULIN }, (_, i) => i).map((i) => (
          <rect
            key={`insulin-${i}`}
            class={i < s.insulin ? "cto-insulin is-on" : "cto-insulin"}
            x={264}
            y={96 - i * 22}
            width={28}
            height={16}
            rx={4}
          />
        ))}
        {s.insulin > 0 && (
          <path
            class="cto-arrow"
            d={`M262 ${88 - (s.insulin - 1) * 22} L 236 ${Math.max(24, last[1])}`}
          />
        )}
      </g>
    </g>
  );
}

export function HormoneResponseView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ResponseState;
  const k = width / W;
  const height = Math.round(H * k);
  const clip = `co-frame-${useId()}`;
  const isAdrenaline = s.mode === ResponseMode.Adrenaline;
  return (
    <div class="cto">
      <Stage
        label={describeResponse(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "cto-svg" }}
      >
        <g transform={`scale(${k})`}>
          <clipPath id={clip}>
            <rect x={0} y={0} width={W} height={H} rx={10} />
          </clipPath>
          <g clip-path={`url(#${clip})`}>
            <rect class="cto-bg" x={0} y={0} width={W} height={H} />
            {isAdrenaline ? (
              <Adrenaline s={s} locale={locale} />
            ) : (
              <BloodSugar s={s} locale={locale} />
            )}
          </g>
        </g>
      </Stage>
      <p class="ctc-caption">{say(locale, responseCaption(s))}</p>
      {s.canAct && (
        <div class="ctc-controls" data-part={ResponsePart.Buttons}>
          {isAdrenaline ? (
            <button
              type="button"
              class="ctc-button is-main"
              onClick={() => call(s.isScared ? ResponseAction.Calm : ResponseAction.Scare, {})}
            >
              {say(locale, s.isScared ? WORDS.calm : WORDS.scare)}
            </button>
          ) : (
            <>
              <button
                type="button"
                class="ctc-button is-main"
                disabled={s.sugar >= SUGAR.max}
                onClick={() => call(ResponseAction.Eat, {})}
              >
                {say(locale, WORDS.eat)}
              </button>
              <button
                type="button"
                class="ctc-button is-main"
                onClick={() => call(ResponseAction.Wait, {})}
              >
                {say(locale, WORDS.wait)}
              </button>
              {s.canSetPancreas && (
                <button
                  type="button"
                  class={s.hasInsulin ? "ctc-button is-chip" : "ctc-button is-chip is-on"}
                  aria-pressed={!s.hasInsulin}
                  onClick={() => call(ResponseAction.SetPancreas, { hasInsulin: !s.hasInsulin })}
                >
                  {say(locale, s.hasInsulin ? WORDS.pancreasOn : WORDS.pancreasOff)}
                </button>
              )}
              {s.history.length > 1 && (
                <button
                  type="button"
                  class="ctc-button"
                  onClick={() => call(ResponseAction.Reset, {})}
                >
                  {say(locale, WORDS.again)}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
