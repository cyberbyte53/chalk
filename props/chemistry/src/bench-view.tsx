import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  BENCH,
  BenchAction,
  BenchKind,
  type BenchState,
  Temperature,
  describeBench,
  mercuryOf,
} from "./bench";
import { type Words, range, say } from "./words";

const W = 320;
const H = 200;
/** The bench top. */
const TABLE = 186;

const BUTTONS = {
  start: { en: "▶ Start", hi: "▶ शुरू करो" },
  again: { en: "↺ Again", hi: "↺ फिर से" },
  seen: { en: "What you see", hi: "क्या दिखता है" },
} as const satisfies Record<string, Words>;

/** Drawn only before the reaction (fades out as it plays). */
const FROM = "rb-from";
/** Drawn once the reaction has played (fades in). */
const TO = "rb-to";

/** A test tube: open at `top`, round bottom at `bottom`, centred on x. */
function tubePath(x: number, top: number, bottom: number, w: number): string {
  const r = w / 2;
  return `M${x - r} ${top} V${bottom - r} A${r} ${r} 0 0 0 ${x + r} ${bottom - r} V${top}`;
}

/** The liquid (or solid) inside a tube, from `level` down. */
function fillPath(x: number, level: number, bottom: number, w: number): string {
  const r = w / 2 - 2;
  return `M${x - r} ${level} V${bottom - r - 2} A${r} ${r} 0 0 0 ${x + r} ${bottom - r - 2} V${level} Z`;
}

function Tube({
  x,
  top,
  bottom,
  w = 26,
  children,
}: {
  x: number;
  top: number;
  bottom: number;
  w?: number;
  children?: JSX.Element | (JSX.Element | false)[] | false;
}): JSX.Element {
  return (
    <g>
      {children}
      <path class="rb-glass" d={tubePath(x, top, bottom, w)} />
      <line class="rb-glass-rim" x1={x - w / 2 - 3} y1={top} x2={x + w / 2 + 3} y2={top} />
    </g>
  );
}

/** A spirit lamp on the table with its flame; the flame's tip is at y = TABLE − 58. */
function Lamp({ x }: { x: number }): JSX.Element {
  return (
    <g>
      <path class="rb-lamp" d={`M${x - 20} ${TABLE} q 0 -28 20 -30 q 20 2 20 30 z`} />
      <rect class="rb-lamp-neck" x={x - 5} y={TABLE - 38} width={10} height={8} rx={2} />
      <line class="rb-wick" x1={x} y1={TABLE - 38} x2={x} y2={TABLE - 42} />
      <path
        class="rb-flame rb-flicker"
        d={`M${x} ${TABLE - 64} q 9 12 6 19 q -6 6 -12 0 q -3 -7 6 -19 z`}
      />
      <path class="rb-flame-core" d={`M${x} ${TABLE - 54} q 4 6 3 9 q -3 3 -6 0 q -1 -3 3 -9 z`} />
    </g>
  );
}

/** A tripod over a lamp, with a china dish on top whose inside is filled with `fill`. */
function DishOnTripod({ x, children }: { x: number; children: JSX.Element[] }): JSX.Element {
  const top = TABLE - 74;
  return (
    <g>
      <Lamp x={x} />
      <line class="rb-stand" x1={x - 34} y1={TABLE} x2={x - 28} y2={top} />
      <line class="rb-stand" x1={x + 34} y1={TABLE} x2={x + 28} y2={top} />
      <line class="rb-stand" x1={x - 36} y1={top} x2={x + 36} y2={top} />
      <path class="rb-dish" d={`M${x - 34} ${top - 12} q 34 26 68 0 z`} />
      {children}
    </g>
  );
}

function Thermometer({ s }: { s: BenchState }): JSX.Element {
  const x = 292;
  const top = 26;
  const bottom = 160;
  const len = bottom - top - 8;
  const from = mercuryOf({ kind: s.kind, isStarted: false });
  const to = mercuryOf(s);
  const style = { "--m0": `${from}`, "--m1": `${to}` } as JSX.CSSProperties;
  return (
    <g data-part="thermometer">
      <rect class="rb-thermo" x={x - 5} y={top} width={10} height={bottom - top} rx={5} />
      <circle class="rb-thermo" cx={x} cy={bottom + 6} r={9} />
      <circle class="rb-mercury" cx={x} cy={bottom + 6} r={6} />
      <rect
        class={
          s.isStarted ? "rb-mercury rb-mercury-column is-moving" : "rb-mercury rb-mercury-column"
        }
        x={x - 2.2}
        y={bottom - len}
        width={4.4}
        height={len + 4}
        style={style}
      />
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          class="rb-tick"
          x1={x + 5}
          y1={bottom - len * f}
          x2={x + 10}
          y2={bottom - len * f}
        />
      ))}
    </g>
  );
}

/** A label on the picture, with a halo so it reads over glass and liquid. */
function Label({
  x,
  y,
  words,
  locale,
  anchor = "middle",
}: { x: number; y: number; words: Words; locale: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <text class="rb-label" x={x} y={y} text-anchor={anchor}>
      {say(locale, words)}
    </text>
  );
}

function Bubbles({
  x,
  from,
  to,
  n = 6,
  spread = 7,
}: { x: number; from: number; to: number; n?: number; spread?: number }) {
  return (
    <g class={TO}>
      {range(n).map((i) => {
        const dx = ((i * 37) % (2 * spread)) - spread;
        const style = {
          "--rise": `${to - from}px`,
          animationDelay: `${(i * 0.27).toFixed(2)}s`,
        } as JSX.CSSProperties;
        return (
          <circle
            key={i}
            class="rb-bubble"
            cx={x + dx}
            cy={from - ((i * 13) % (from - to))}
            r={1.6 + (i % 3) * 0.6}
            style={style}
          />
        );
      })}
    </g>
  );
}

function Fumes({ x, y, kind }: { x: number; y: number; kind: "brown" | "grey" | "steam" }) {
  return (
    <g class={TO}>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          class={`rb-fume rb-fume-${kind}`}
          style={{ animationDelay: `${0.6 + i * 0.5}s` } as JSX.CSSProperties}
          d={`M${x - 6 + i * 6} ${y} q -8 -12 0 -22 q 8 -10 0 -22`}
        />
      ))}
    </g>
  );
}

/** Lumps of a solid in a heap, centred at x on y. */
function Heap({ x, y, w, cls }: { x: number; y: number; w: number; cls: string }) {
  const n = Math.max(3, Math.round(w / 6));
  return (
    <g class={cls}>
      {range(n).map((i) => {
        const t = i / (n - 1) - 0.5;
        return (
          <circle key={i} cx={x + t * w} cy={y - 3 - (1 - Math.abs(t) * 2) * 3 - (i % 2)} r={4.2} />
        );
      })}
    </g>
  );
}

function Nail({
  x,
  top,
  len,
  rusty,
  cls,
}: { x: number; top: number; len: number; rusty?: boolean; cls?: string }) {
  return (
    <g class={cls}>
      <line class={rusty ? "rb-nail is-rusty" : "rb-nail"} x1={x} y1={top} x2={x} y2={top + len} />
      <line
        class={rusty ? "rb-nail-head is-rusty" : "rb-nail-head"}
        x1={x - 4}
        y1={top}
        x2={x + 4}
        y2={top}
      />
    </g>
  );
}

function Apparatus({ s, locale }: { s: BenchState; locale: string }): JSX.Element {
  const names = BENCH[s.kind].names;
  const name = (i: number, x: number, y: number, anchor: "start" | "middle" | "end" = "middle") => {
    const w = names[i];
    return s.showNames && w !== undefined ? (
      <Label x={x} y={y} words={w} locale={locale} anchor={anchor} />
    ) : (
      false
    );
  };
  switch (s.kind) {
    case BenchKind.MagnesiumBurns:
      return (
        <g>
          <Lamp x={150} />
          <path class="rb-dish" d={`M50 ${TABLE - 6} q 30 12 60 0 z`} />
          <Heap x={80} y={TABLE - 4} w={30} cls={`rb-ash ${TO}`} />
          <line class="rb-tongs" x1={268} y1={58} x2={198} y2={106} />
          <line class="rb-tongs" x1={272} y1={64} x2={200} y2={110} />
          <line class={`rb-ribbon ${FROM}`} x1={200} y1={108} x2={150} y2={136} />
          <line class={`rb-ribbon ${TO}`} x1={200} y1={108} x2={176} y2={122} />
          <g class={`${TO} rb-dazzle`}>
            <circle class="rb-glow" cx={172} cy={124} r={26} />
            <circle class="rb-white-flame" cx={172} cy={124} r={11} />
          </g>
          {name(0, 228, 168)}
          {name(1, 80, TABLE - 22)}
        </g>
      );
    case BenchKind.LeadIodide:
      return (
        <g>
          <Tube x={140} top={52} bottom={172}>
            <path class={`rb-liquid-clear ${FROM}`} d={fillPath(140, 104, 172, 26)} />
            <path class={`rb-liquid-yellowish ${TO}`} d={fillPath(140, 98, 172, 26)} />
            <path class={`rb-ppt-yellow ${TO}`} d={fillPath(140, 146, 172, 26)} />
          </Tube>
          <rect class="rb-dropper-bulb" x={133} y={8} width={14} height={14} rx={6} />
          <path class="rb-glass" d="M137 22 V42 l 3 6 l 3 -6 V22" />
          <circle class={`rb-drop ${TO}`} cx={140} cy={58} r={2.5} />
          {name(0, 162, 128, "start")}
          {name(1, 152, 20, "start")}
        </g>
      );
    case BenchKind.ZincAcid:
      return (
        <g>
          <Tube x={140} top={44} bottom={172}>
            <path class="rb-liquid-clear" d={fillPath(140, 96, 172, 28)} />
            <Heap x={140} y={168} w={14} cls="rb-zinc" />
            <Bubbles x={140} from={160} to={100} n={8} spread={8} />
          </Tube>
          {name(0, 162, 160, "start")}
          {name(1, 162, 112, "start")}
        </g>
      );
    case BenchKind.QuickLime:
      return (
        <g>
          <path
            class={`rb-liquid-clear ${TO}`}
            d={`M104 112 V${TABLE - 6} q 0 4 4 4 h64 q 4 0 4 -4 V112 Z`}
          />
          <path
            class={`rb-liquid-milky ${TO}`}
            d={`M104 140 V${TABLE - 6} q 0 4 4 4 h64 q 4 0 4 -4 V140 Z`}
          />
          <Heap x={140} y={TABLE - 4} w={46} cls={`rb-lime ${FROM}`} />
          <path class="rb-glass" d={`M100 92 l 4 4 V${TABLE - 4} q 0 4 4 4 h64 q 4 0 4 -4 V92`} />
          <Fumes x={140} y={100} kind="steam" />
          <Bubbles x={140} from={TABLE - 12} to={118} n={7} spread={22} />
          {name(0, 186, TABLE - 8, "start")}
          {name(1, 186, 124, "start")}
        </g>
      );
    case BenchKind.FerrousSulphateHeat:
    case BenchKind.LeadNitrateHeat: {
      const isIron = s.kind === BenchKind.FerrousSulphateHeat;
      return (
        <g>
          <Lamp x={150} />
          <line class="rb-tongs" x1={238} y1={70} x2={162} y2={78} />
          <line class="rb-tongs" x1={240} y1={76} x2={163} y2={84} />
          <Tube x={150} top={46} bottom={118} w={24}>
            <path
              class={`${isIron ? "rb-crystal-green" : "rb-powder-white"} ${FROM}`}
              d={fillPath(150, 100, 118, 24)}
            />
            <path
              class={`${isIron ? "rb-crystal-brown" : "rb-powder-yellowish"} ${TO}`}
              d={fillPath(150, 102, 118, 24)}
            />
          </Tube>
          <Fumes x={150} y={42} kind={isIron ? "grey" : "brown"} />
          {name(0, 172, 112, "start")}
        </g>
      );
    }
    case BenchKind.SilverChlorideSun:
      return (
        <g>
          <g class="rb-sun">
            <circle cx={40} cy={38} r={14} />
            {range(8).map((i) => {
              const a = (i * Math.PI) / 4;
              return (
                <line
                  key={i}
                  x1={40 + Math.cos(a) * 19}
                  y1={38 + Math.sin(a) * 19}
                  x2={40 + Math.cos(a) * 26}
                  y2={38 + Math.sin(a) * 26}
                />
              );
            })}
          </g>
          <line class="rb-sunbeam" x1={58} y1={52} x2={140} y2={150} />
          <line class="rb-sunbeam" x1={52} y1={58} x2={124} y2={156} />
          <path class="rb-dish" d={`M100 ${TABLE - 26} q 50 40 100 0 z`} />
          <path
            class={`rb-powder-white ${FROM}`}
            d={`M116 ${TABLE - 22} q 34 18 68 0 q -34 -8 -68 0 z`}
          />
          <path
            class={`rb-powder-grey ${TO}`}
            d={`M116 ${TABLE - 22} q 34 18 68 0 q -34 -8 -68 0 z`}
          />
          {name(0, 150, TABLE - 34)}
        </g>
      );
    case BenchKind.IronNailCopperSulphate:
      return (
        <g>
          <rect class="rb-rack" x={78} y={128} width={140} height={8} rx={2} />
          <Tube x={110} top={44} bottom={172}>
            <path class="rb-liquid-blue" d={fillPath(110, 92, 172, 26)} />
          </Tube>
          <Tube x={186} top={44} bottom={172}>
            <path class={`rb-liquid-blue ${FROM}`} d={fillPath(186, 92, 172, 26)} />
            <path class={`rb-liquid-faded ${TO}`} d={fillPath(186, 92, 172, 26)} />
            <line class="rb-thread" x1={186} y1={30} x2={186} y2={74} />
            <Nail x={182} top={74} len={74} />
            <Nail x={190} top={74} len={74} />
            <Nail x={182} top={74} len={74} rusty cls={TO} />
            <Nail x={190} top={74} len={74} rusty cls={TO} />
          </Tube>
          <line class="rb-glass" x1={170} y1={30} x2={202} y2={30} />
          <g transform={`rotate(-80 246 ${TABLE - 4})`}>
            <Nail x={246} top={TABLE - 40} len={36} />
          </g>
          {name(0, 110, 36)}
          {name(1, 214, 40, "start")}
          {name(2, 238, TABLE - 16)}
        </g>
      );
    case BenchKind.BariumSulphatePrecipitate:
      return (
        <g>
          <Tube x={130} top={56} bottom={174}>
            <path class={`rb-liquid-clear ${FROM}`} d={fillPath(130, 116, 174, 26)} />
            <path class={`rb-liquid-cloudy ${TO}`} d={fillPath(130, 96, 174, 26)} />
            <path class={`rb-ppt-white ${TO}`} d={fillPath(130, 150, 174, 26)} />
          </Tube>
          <g transform="rotate(-38 196 70)">
            <Tube x={196} top={30} bottom={130} w={22}>
              <path class={`rb-liquid-clear ${FROM}`} d={fillPath(196, 76, 130, 22)} />
            </Tube>
          </g>
          <path class={`rb-pour ${TO}`} d="M150 52 q -10 10 -18 24" />
          {name(0, 104, 140, "end")}
          {name(1, 196, 18)}
        </g>
      );
    case BenchKind.CopperHeated:
    case BenchKind.CopperReduced: {
      const heated = s.kind === BenchKind.CopperHeated;
      const top = TABLE - 74;
      const bed = `M${150 - 26} ${top - 8} q 26 16 52 0 q -26 -6 -52 0 z`;
      return (
        <g>
          <DishOnTripod x={150}>
            <path class={`${heated ? "rb-copper" : "rb-black"} ${FROM}`} d={bed} />
            <path class={`${heated ? "rb-black" : "rb-copper"} ${TO}`} d={bed} />
          </DishOnTripod>
          {!heated && (
            <g>
              <path class="rb-pipe" d={`M290 ${top - 40} H200 l -14 16`} />
              <path class={`rb-gas-stream ${TO}`} d={`M196 ${top - 22} q -14 8 -26 10`} />
            </g>
          )}
          {name(0, heated ? 196 : 104, top - 22, heated ? "start" : "end")}
          {!heated && name(1, 236, top - 48)}
        </g>
      );
    }
    case BenchKind.BariumHydroxideCold:
      return (
        <g>
          <Tube x={140} top={52} bottom={172}>
            <path class="rb-powder-white" d={fillPath(140, 136, 172, 26)} />
          </Tube>
          <line class="rb-rod" x1={152} y1={30} x2={140} y2={150} />
          <g class={`rb-frost ${TO}`}>
            {[112, 130, 148].map((y, i) => {
              const x = i % 2 ? 160 : 120;
              return (
                <path
                  key={y}
                  d={`M${x - 4} ${y} h8 M${x - 2} ${y - 3.5} l4 7 M${x + 2} ${y - 3.5} l-4 7`}
                />
              );
            })}
          </g>
          {name(0, 116, 150, "end")}
          {name(1, 164, 160, "start")}
        </g>
      );
  }
}

/** An experiment on the bench, a start button, and what is seen once it has played. */
export function BenchView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as BenchState;
  const k = width / W;
  const height = Math.round(H * k);
  const info = BENCH[s.kind];
  const temperatureWords: Record<Temperature, Words> = {
    [Temperature.Rises]: { en: "thermometer rises", hi: "थर्मामीटर चढ़ता है" },
    [Temperature.Falls]: { en: "thermometer falls", hi: "थर्मामीटर गिरता है" },
    [Temperature.Same]: { en: "", hi: "" },
  };
  const seen = [
    ...info.seen.map((x) => x.words),
    ...(s.showThermometer && info.temperature !== Temperature.Same
      ? [temperatureWords[info.temperature]]
      : []),
  ];
  return (
    <div class="rb">
      <Stage
        label={describeBench(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "rb-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="rb-bg" x={0} y={0} width={W} height={H} rx={12} />
          <rect class="rb-table" x={0} y={TABLE} width={W} height={H - TABLE} />
          <g
            key={String(s.isStarted)}
            class={s.isStarted ? "rb-scene is-started" : "rb-scene"}
            data-part="apparatus"
          >
            <Apparatus s={s} locale={locale} />
            {s.showThermometer && <Thermometer s={s} />}
          </g>
        </g>
      </Stage>
      <div class="rb-under">
        {s.canStart && (
          <button
            type="button"
            class={s.isStarted ? "rb-button is-again" : "rb-button"}
            data-part="start"
            onClick={() => call(s.isStarted ? BenchAction.Reset : BenchAction.Start, {})}
          >
            {say(locale, s.isStarted ? BUTTONS.again : BUTTONS.start)}
          </button>
        )}
        {s.isStarted && s.showObservations && (
          <ul class="rb-seen" data-part="observations" aria-label={say(locale, BUTTONS.seen)}>
            {seen.map((w, i) => (
              <li key={w.en} style={{ animationDelay: `${1.4 + i * 0.4}s` } as JSX.CSSProperties}>
                {say(locale, w)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
