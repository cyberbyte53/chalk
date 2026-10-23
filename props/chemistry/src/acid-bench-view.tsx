import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  ACID_BENCH,
  AcidBenchAction,
  AcidBenchKind,
  type AcidBenchState,
  describeAcidBench,
  seenSoFar,
  stepsOf,
} from "./acid-bench";
import { subscripted } from "./acid-data";
import { ActionButton, Beaker, Bubbles, Candle, Lamp, Tube, tubeFill, tubePath } from "./acid-draw";
import { type Words, range, say } from "./words";

const W = 320;
const H = 200;
const TABLE = 186;

const WORDS = {
  again: { en: "↺ Again", hi: "↺ फिर से" },
  seen: { en: "What you see", hi: "क्या दिखता है" },
  never: { en: "Never do this", hi: "ऐसा कभी मत करो" },
} as const satisfies Record<string, Words>;

/** A label on the picture, with a short leader line to (tx, ty) when given. */
function Name({
  x,
  y,
  words,
  locale,
  anchor = "middle",
  to,
}: {
  x: number;
  y: number;
  words: Words | undefined;
  locale: string;
  anchor?: "start" | "middle" | "end";
  to?: [number, number];
}): JSX.Element | null {
  if (words === undefined) return null;
  return (
    <g>
      {to !== undefined && <line class="ac-leader" x1={x} y1={y + 3} x2={to[0]} y2={to[1]} />}
      {say(locale, words)
        .split(" + ")
        .map((line, i, all) => (
          <text key={line} class="ac-label" x={x} y={y + i * 12} text-anchor={anchor}>
            {i < all.length - 1 ? `${line} +` : line}
          </text>
        ))}
    </g>
  );
}

/** Soap bubbles in a dish (filled with gas), `n` of them. */
function SoapBubbles({ x, y, n }: { x: number; y: number; n: number }): JSX.Element {
  return (
    <g class="ab-soap-bubbles">
      {range(n).map((i) => (
        <circle
          key={i}
          class="ab-soap-bubble ab-appear"
          cx={x - 18 + ((i * 11) % 36)}
          cy={y - 6 - ((i * 7) % 12)}
          r={4 + (i % 3)}
          style={{ animationDelay: `${0.4 + i * 0.15}s` } as JSX.CSSProperties}
        />
      ))}
    </g>
  );
}

/** A test tube held in a clamp on a stand. */
function Clamped({ x, top, children }: { x: number; top: number; children: JSX.Element }) {
  return (
    <g>
      <rect class="ac-stand" x={x - 46} y={TABLE - 4} width={60} height={4} rx={2} />
      <line class="ac-stand-rod" x1={x - 36} y1={TABLE - 4} x2={x - 36} y2={top - 6} />
      <line class="ac-stand-rod" x1={x - 36} y1={top + 18} x2={x - 13} y2={top + 18} />
      {children}
      <rect class="ac-clamp" x={x - 14} y={top + 14} width={28} height={8} rx={2} />
      <rect class="ab-stopper" x={x - 9} y={top - 6} width={18} height={10} rx={2} />
    </g>
  );
}

function ZincGas({
  s,
  base,
  locale,
}: { s: AcidBenchState; base: boolean; locale: string }): JSX.Element {
  const names = ACID_BENCH[s.kind].names;
  const tx = 82;
  const top = base ? 40 : 58;
  const bottom = base ? 120 : 162;
  const dish = { x: 214, y: 170 };
  const candleX = s.step >= 2 ? 248 : 290;
  return (
    <g>
      <Clamped x={tx} top={top}>
        <g>
          <Tube
            x={tx}
            top={top}
            bottom={bottom}
            fill={base ? "ac-base" : "ac-acid"}
            level={base ? 84 : 110}
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              class="ab-zinc"
              cx={tx - 6 + (i % 3) * 6}
              cy={bottom - 9 - Math.floor(i / 3) * 5}
              r={3.2}
            />
          ))}
          {s.step >= 1 && <Bubbles x={tx} y={bottom - 14} height={44} n={7} spread={6} />}
        </g>
      </Clamped>
      {base && <Lamp x={tx} table={TABLE} lit={s.step >= 1} />}
      {/* the delivery tube to the soap solution */}
      <path class="ab-pipe" d={`M${tx} ${top - 6} V22 H${dish.x} V${dish.y - 8}`} />
      <ellipse class="ab-dish" cx={dish.x} cy={dish.y + 6} rx={38} ry={9} />
      <ellipse class="ab-soap" cx={dish.x} cy={dish.y + 3} rx={33} ry={5} />
      {s.step >= 1 && <SoapBubbles x={dish.x} y={dish.y} n={7} />}
      <Candle x={candleX} table={TABLE} state={s.step >= 2 ? "pop" : "burning"} />
      {s.showNames && (
        <g>
          <Name
            x={tx + 20}
            y={base ? top + 30 : top + 44}
            words={names[0]}
            locale={locale}
            anchor="start"
          />
          <Name x={dish.x + 8} y={100} words={names[1]} locale={locale} anchor="start" />
        </g>
      )}
    </g>
  );
}

function Carbonates({ s, locale }: { s: AcidBenchState; locale: string }): JSX.Element {
  const names = ACID_BENCH[s.kind].names;
  const lime = s.step === 1 ? "ac-milky" : "ac-water";
  return (
    <g>
      {[54, 120].map((x, i) => (
        <g key={x}>
          <Tube
            x={x}
            top={70}
            bottom={170}
            fill={s.step >= 1 ? "ac-water" : undefined}
            level={124}
          />
          <path class="ab-powder" d={tubeFill(x, 156, 170, 24)} />
          {s.step >= 1 && <Bubbles x={x} y={150} height={36} n={6} spread={6} />}
          {s.showNames && <Name x={x} y={60} words={names[i]} locale={locale} />}
        </g>
      ))}
      <rect class="ab-stopper" x={111} y={64} width={18} height={10} rx={2} />
      <path class="ab-pipe" d="M120 64 V30 H236 V140" />
      <Tube x={236} top={78} bottom={176} fill={`${lime} ab-fade`} level={102} />
      {s.step >= 1 && <Bubbles x={236} y={150} height={40} n={5} spread={5} />}
      {s.showNames && (
        <Name x={268} y={120} words={names[2]} locale={locale} anchor="start" to={[249, 128]} />
      )}
    </g>
  );
}

function CopperOxide({ s, locale }: { s: AcidBenchState; locale: string }): JSX.Element {
  const names = ACID_BENCH[s.kind].names;
  const done = s.step >= 1;
  return (
    <g>
      <Beaker
        x={150}
        top={82}
        bottom={TABLE}
        w={92}
        fill={done ? "ab-cucl2 ab-fade" : "ac-water"}
        level={done ? 118 : 156}
      />
      {!done && <path class="ab-cuo" d="M118 182 q 32 -10 64 0 z" />}
      <line class="ab-rod" x1={176} y1={60} x2={152} y2={176} />
      {!done && <path class="ac-acid ab-pour" d="M222 40 q -20 6 -34 40" />}
      {!done && (
        <rect
          class="ab-bottle"
          x={214}
          y={20}
          width={22}
          height={34}
          rx={4}
          transform="rotate(30 225 37)"
        />
      )}
      {s.showNames && (
        <g>
          <Name
            x={done ? 150 : 70}
            y={done ? 76 : 150}
            words={done ? { en: "copper(II) chloride", hi: "कॉपर(II) क्लोराइड" } : names[0]}
            locale={locale}
            to={done ? [150, 116] : [120, 176]}
          />
          {!done && <Name x={262} y={70} words={names[1]} locale={locale} anchor="start" />}
        </g>
      )}
    </g>
  );
}

function DryWet({ s, locale }: { s: AcidBenchState; locale: string }): JSX.Element {
  const names = ACID_BENCH[s.kind].names;
  return (
    <g>
      <Clamped x={86} top={76}>
        <g>
          <Tube x={86} top={76} bottom={170} fill="ab-powder" level={150} />
          <path class="ac-acid" d={tubeFill(86, 138, 152, 24)} />
        </g>
      </Clamped>
      <path class="ab-pipe" d="M86 70 V40 H206" />
      {s.step >= 1 && <path class="ab-gas ab-appear" d="M210 40 q 10 -4 18 0 q 8 4 16 0" />}
      {/* the litmus strips held at the end of the tube */}
      {s.step >= 1 && (
        <g class="ab-appear">
          <rect class="ac-hue-blue" x={222} y={48} width={10} height={36} rx={1.5} />
          <rect class="ai-strip-edge" x={222} y={48} width={10} height={36} rx={1.5} />
          <text class="ac-label" x={227} y={98} text-anchor="middle">
            {say(locale, { en: "dry", hi: "सूखा" })}
          </text>
        </g>
      )}
      {s.step >= 2 && (
        <g class="ab-appear">
          <rect class="ac-hue-red" x={258} y={48} width={10} height={36} rx={1.5} />
          <rect class="ai-strip-edge" x={258} y={48} width={10} height={36} rx={1.5} />
          <path class="ac-water ab-drop" d="M263 30 q 4 6 0 9 q -4 -3 0 -9 z" />
          <text class="ac-label" x={263} y={98} text-anchor="middle">
            {say(locale, { en: "wet", hi: "गीला" })}
          </text>
        </g>
      )}
      {s.showNames && (
        <g>
          <Name x={116} y={150} words={names[0]} locale={locale} anchor="start" />
          <Name x={150} y={30} words={names[1]} locale={locale} />
        </g>
      )}
    </g>
  );
}

function Mixing({
  s,
  intoWater,
  locale,
}: { s: AcidBenchState; intoWater: boolean; locale: string }): JSX.Element {
  const names = ACID_BENCH[s.kind].names;
  const done = s.step >= 1;
  return (
    <g>
      <Beaker
        x={140}
        top={84}
        bottom={TABLE}
        w={96}
        fill={intoWater ? "ac-water" : "ac-acid"}
        level={130}
      />
      {/* the bottle pouring, and the stream */}
      <rect
        class={intoWater ? "ab-bottle" : "ab-bottle is-water"}
        x={196}
        y={28}
        width={24}
        height={36}
        rx={4}
        transform="rotate(-40 208 46)"
      />
      <path
        class={intoWater ? "ac-acid ab-stream" : "ac-water ab-stream is-thick"}
        d="M188 66 q -10 10 -20 58"
      />
      {intoWater && <line class="ab-rod" x1={100} y1={70} x2={126} y2={176} />}
      {done && intoWater && (
        <g class="ab-appear">
          <path
            class="ab-heat"
            d="M104 150 q 4 -6 0 -12 M140 152 q 4 -6 0 -12 M176 150 q 4 -6 0 -12"
          />
          <rect class="ab-thermo" x={262} y={60} width={10} height={100} rx={5} />
          <rect class="ab-mercury ab-rise" x={265} y={92} width={4} height={66} />
          <circle class="ab-mercury" cx={267} cy={164} r={7} />
        </g>
      )}
      {done && !intoWater && (
        <g class="ab-appear">
          {[
            [-30, -30],
            [-12, -46],
            [12, -40],
            [30, -26],
            [-40, -12],
            [42, -10],
          ].map(([dx, dy]) => (
            <circle
              key={`${dx}${dy}`}
              class="ac-acid ab-splash"
              cx={140 + (dx ?? 0)}
              cy={124 + (dy ?? 0)}
              r={3}
            />
          ))}
          <path class="ab-crack" d="M110 150 l 8 8 l -4 8 l 7 9" />
          <g class="ab-warning" transform="translate(262 72)">
            <path d="M0 -26 L24 16 H-24 Z" />
            <text x={0} y={10} text-anchor="middle">
              !
            </text>
          </g>
          <text class="ab-never" x={262} y={110} text-anchor="middle">
            {say(locale, WORDS.never)}
          </text>
        </g>
      )}
      {s.showNames && (
        <g>
          <Name x={10} y={70} words={names[0]} locale={locale} anchor="start" to={[100, 140]} />
          <Name x={246} y={22} words={names[1]} locale={locale} anchor="end" />
        </g>
      )}
    </g>
  );
}

function StrongWeak({ s, locale }: { s: AcidBenchState; locale: string }): JSX.Element {
  const names = ACID_BENCH[s.kind].names;
  return (
    <g>
      {[110, 210].map((x, i) => (
        <g key={x}>
          <Tube x={x} top={60} bottom={176} fill="ac-acid" level={100} />
          {s.step >= 1 ? (
            <rect class="ab-ribbon" x={x - 2} y={128} width={4} height={36} rx={1} />
          ) : (
            <rect class="ab-ribbon" x={x + 20} y={TABLE - 4} width={36} height={4} rx={1} />
          )}
          {s.step >= 1 && <Bubbles x={x} y={160} height={58} n={i === 0 ? 14 : 3} spread={7} />}
          {s.showNames && <Name x={x} y={46} words={names[i]} locale={locale} />}
        </g>
      ))}
    </g>
  );
}

function CopperSulphate({ s, locale }: { s: AcidBenchState; locale: string }): JSX.Element {
  const names = ACID_BENCH[s.kind].names;
  const heated = s.step >= 1;
  const wetted = s.step >= 2;
  const crystals = heated && !wetted ? "ab-cuso4-white" : "ab-cuso4-blue";
  return (
    <g>
      <Lamp x={176} table={TABLE} lit={heated && !wetted} />
      <g transform="rotate(-62 130 120)">
        <path class={`${crystals} ab-fade`} d={tubeFill(130, 150, 172, 26)} />
        <path class="ac-glass" d={tubePath(130, 50, 172, 26)} />
        {heated && (
          <g class="ab-appear">
            {[64, 74, 84].map((y, i) => (
              <circle
                key={y}
                class="ac-water ab-droplet"
                cx={130 + (i % 2 ? 6 : -6)}
                cy={y}
                r={2.4}
              />
            ))}
          </g>
        )}
      </g>
      <rect
        class="ac-clamp"
        x={160}
        y={92}
        width={12}
        height={22}
        rx={2}
        transform="rotate(28 166 103)"
      />
      {wetted && (
        <g class="ab-appear">
          <rect class="ai-dropper" x={186} y={84} width={6} height={22} rx={2} />
          <ellipse class="ai-bulb" cx={189} cy={82} rx={5} ry={4} />
          <path class="ac-water ab-drop" d="M189 112 q 4 6 0 9 q -4 -3 0 -9 z" />
        </g>
      )}
      {s.showNames && <Name x={40} y={60} words={names[0]} locale={locale} anchor="start" />}
    </g>
  );
}

function Gypsum({ s, locale }: { s: AcidBenchState; locale: string }): JSX.Element {
  const names = ACID_BENCH[s.kind].names;
  const heated = s.step >= 1;
  const set = s.step >= 2;
  const top = TABLE - 70;
  return (
    <g>
      <Lamp x={110} table={TABLE} lit={heated && !set} />
      <line class="ac-stand-rod" x1={78} y1={TABLE} x2={84} y2={top} />
      <line class="ac-stand-rod" x1={142} y1={TABLE} x2={136} y2={top} />
      <line class="ac-stand-rod" x1={76} y1={top} x2={144} y2={top} />
      <path class="ab-dish-china" d={`M78 ${top - 12} q 32 26 64 0 z`} />
      {!heated &&
        [0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            class="ab-gypsum"
            x={90 + i * 10}
            y={top - 12}
            width={8}
            height={6}
            rx={1.5}
          />
        ))}
      {heated && !set && (
        <path class="ab-powder ab-appear" d={`M86 ${top - 8} q 24 12 48 0 q -24 -5 -48 0 z`} />
      )}
      {heated && !set && (
        <path
          class="ab-steam ab-appear"
          d={`M100 ${top - 18} q 4 -8 0 -16 M118 ${top - 18} q 4 -8 0 -16`}
        />
      )}
      {set && (
        <g class="ab-appear">
          <rect class="ab-block" x={198} y={TABLE - 46} width={78} height={46} rx={4} />
          <path
            class="ab-hand"
            d={`M222 ${TABLE - 10} v -18 m 6 18 v -24 m 6 24 v -24 m 6 24 v -20 m 6 20 q 4 -10 8 -12`}
          />
          <text class="ac-label" x={237} y={TABLE - 54} text-anchor="middle">
            {say(locale, { en: "set hard", hi: "सख़्त" })}
          </text>
        </g>
      )}
      {s.showNames && (
        <Name
          x={110}
          y={top - 30}
          words={heated ? { en: "plaster of Paris", hi: "प्लास्टर ऑफ़ पेरिस" } : names[0]}
          locale={locale}
        />
      )}
    </g>
  );
}

function Extinguisher({ s, locale }: { s: AcidBenchState; locale: string }): JSX.Element {
  const names = ACID_BENCH[s.kind].names;
  const tilted = s.step >= 1;
  return (
    <g>
      <g transform={tilted ? "rotate(28 100 150)" : undefined} class="ab-tilt">
        <path
          class="ac-water"
          d="M68 128 q 0 -10 10 -10 h 44 q 10 0 10 10 v 46 q 0 8 -8 8 h -48 q -8 0 -8 -8 z"
        />
        <path
          class="ac-glass"
          d="M64 186 q -6 0 -6 -8 v -52 q 0 -16 16 -18 h 8 v -24 h 36 v 24 h 8 q 16 2 16 18 v 52 q 0 8 -6 8 z"
        />
        <path class="ab-pipe" d="M100 76 V60 h 46" />
        <rect class="ac-acid" x={95} y={88} width={10} height={30} rx={4} />
        <path class="ac-glass" d="M95 82 v 34 q 5 6 10 0 v -34" />
        {tilted && <Bubbles x={100} y={170} height={40} n={8} spread={16} />}
      </g>
      {tilted && (
        <path
          class="ab-spray ab-appear"
          d="M184 92 q 44 0 74 34 M186 86 q 48 2 78 38 M182 98 q 40 4 70 32"
        />
      )}
      <Candle x={262} table={TABLE} state={s.step >= 2 ? "out" : "burning"} />
      {s.showNames && (
        <g>
          <Name x={14} y={30} words={names[0]} locale={locale} anchor="start" />
          {!tilted && (
            <Name x={160} y={110} words={names[1]} locale={locale} anchor="start" to={[106, 100]} />
          )}
        </g>
      )}
    </g>
  );
}

function Apparatus({ s, locale }: { s: AcidBenchState; locale: string }): JSX.Element {
  switch (s.kind) {
    case AcidBenchKind.ZincAcid:
      return <ZincGas s={s} base={false} locale={locale} />;
    case AcidBenchKind.ZincBase:
      return <ZincGas s={s} base={true} locale={locale} />;
    case AcidBenchKind.CarbonateAcid:
      return <Carbonates s={s} locale={locale} />;
    case AcidBenchKind.CopperOxideAcid:
      return <CopperOxide s={s} locale={locale} />;
    case AcidBenchKind.DryWetHcl:
      return <DryWet s={s} locale={locale} />;
    case AcidBenchKind.AcidIntoWater:
      return <Mixing s={s} intoWater={true} locale={locale} />;
    case AcidBenchKind.WaterIntoAcid:
      return <Mixing s={s} intoWater={false} locale={locale} />;
    case AcidBenchKind.MagnesiumStrongWeak:
      return <StrongWeak s={s} locale={locale} />;
    case AcidBenchKind.CopperSulphateHeat:
      return <CopperSulphate s={s} locale={locale} />;
    case AcidBenchKind.GypsumHeat:
      return <Gypsum s={s} locale={locale} />;
    case AcidBenchKind.SodaAcidExtinguisher:
      return <Extinguisher s={s} locale={locale} />;
  }
}

/** One experiment from the chapter, a button for its next step, what is seen and its equation. */
export function AcidBenchView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as AcidBenchState;
  const k = width / W;
  const height = Math.round(H * k);
  const info = ACID_BENCH[s.kind];
  const next = info.steps[s.step];
  const done = s.step >= stepsOf(s.kind);
  return (
    <div class="ab ac">
      <Stage
        label={describeAcidBench(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "ab-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="ac-bg" x={0} y={0} width={W} height={H} rx={12} />
          <rect class="ac-table" x={0} y={TABLE} width={W} height={H - TABLE} />
          <g key={`${s.kind}-${s.step}`} class={`ab-scene is-step-${s.step}`} data-part="apparatus">
            <Apparatus s={s} locale={locale} />
          </g>
        </g>
      </Stage>
      <div class="ac-under">
        {s.canStep && (
          <ActionButton
            part="next"
            words={next === undefined ? WORDS.again : next.button}
            onPress={() => call(done ? AcidBenchAction.Reset : AcidBenchAction.Next, {})}
            locale={locale}
            isMain={!done}
          />
        )}
        {s.step > 0 && s.showObservations && (
          <ul class="ac-seen" data-part="observations" aria-label={say(locale, WORDS.seen)}>
            {seenSoFar(s).map((x) => (
              <li key={x.en}>{say(locale, x)}</li>
            ))}
          </ul>
        )}
      </div>
      {done && s.showEquation && info.equation !== "" && (
        <p class="ac-equation">{subscripted(info.equation.split(".").join("·"))}</p>
      )}
    </div>
  );
}
