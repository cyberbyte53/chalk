import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { EYE_PICTURE, EyeSceneKind, type EyeSceneState, describeEyeScene } from "./scene";
import { type Words, range, say } from "./words";

const W = EYE_PICTURE.width;
const H = EYE_PICTURE.height;

type Who = "riya" | "kabir" | "grandpa" | "mom" | "doctor";

const WORDS = {
  why: { en: "Why?", hi: "क्यों?" },
  pledge: { en: "Eye donation pledge", hi: "नेत्रदान संकल्प" },
  four: { en: "1 pair of eyes → sight for 4", hi: "1 जोड़ी आँखें → 4 को रोशनी" },
  news: { en: "NEWS", hi: "समाचार" },
  far: { en: "far", hi: "दूर" },
  near: { en: "near", hi: "पास" },
} as const satisfies Record<string, Words>;

/** A person in the family's look (the light chapter's): feet at (x, y), `s` the scale. */
function Person({
  who,
  x,
  y,
  s = 1,
  back = false,
  point,
  squint = false,
  glasses = false,
  noSpecs = false,
}: {
  who: Who;
  x: number;
  y: number;
  s?: number;
  back?: boolean;
  point?: [number, number];
  squint?: boolean;
  glasses?: boolean;
  /** Grandpa without his glasses on his nose. */
  noSpecs?: boolean;
}): JSX.Element {
  const isChild = who === "kabir";
  const h = isChild ? 34 : 44;
  const headR = isChild ? 7.5 : 7;
  const bodyW = isChild ? 15 : 17;
  const neck = h - 2 * headR;
  const shirt = `es-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="es-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`es-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="es-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="es-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="es-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom" || who === "doctor") && (
        <path
          class="es-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -3 -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="es-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="es-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="es-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom" || who === "doctor") && (
        <circle class="es-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="es-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="es-face">
          {squint ? (
            <>
              <path d={`M-4 ${headY + 0.5} h 2.6`} />
              <path d={`M1.4 ${headY + 0.5} h 2.6`} />
            </>
          ) : (
            <>
              <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
              <circle cx={2.6} cy={headY + 0.5} r={0.9} />
            </>
          )}
          <path
            d={squint ? `M-2 ${headY + 4} h 4` : `M-2 ${headY + 3.4} q 2 1.6 4 0`}
            fill="none"
          />
        </g>
      )}
      {!back && ((who === "grandpa" && !noSpecs) || glasses) && (
        <g class="es-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

/** Fixed scattered points in a box (no randomness, so the picture never changes). */
function spots(x: number, y: number, w: number, h: number, n: number): [number, number][] {
  return range(n).map((i) => [x + ((i * 0.618034) % 1) * w, y + ((i * 0.414214 + 0.37) % 1) * h]);
}

function Sofa({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect class="es-sofa" x={x} y={y - 26} width={w} height={22} rx={8} />
      <rect class="es-sofa-front" x={x - 6} y={y - 12} width={w + 12} height={20} rx={8} />
    </g>
  );
}

function Rocket({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path class="es-rocket" d="M0 -16 q 7 8 6 20 h -12 q -1 -12 6 -20 z" />
      <circle class="es-window" cx={0} cy={-4} r={2.4} />
      <path class="es-flame" d="M-4 4 q 4 10 8 0 z" />
    </g>
  );
}

function MovieEye() {
  return (
    <g>
      <rect class="es-night" x={0} y={0} width={W} height={H} />
      <path class="es-beam" d="M286 108 L196 14 L196 82 Z" />
      <rect class="es-screen" x={110} y={14} width={86} height={68} rx={3} />
      <Rocket x={153} y={50} s={1.6} />
      <rect class="es-box" x={280} y={100} width={30} height={16} rx={2} />
      <Sofa x={120} y={170} w={150} />
      <Person who="riya" x={160} y={160} back />
      <Person who="kabir" x={200} y={160} back s={1.05} />
      {/* Riya's thought: her own eye, a lens at the front, the picture upside down at the back. */}
      <g class="es-thought">
        <circle cx={120} cy={118} r={2.5} />
        <circle cx={110} cy={110} r={3.5} />
        <ellipse cx={56} cy={92} rx={50} ry={34} />
        <circle class="es-eyeball" cx={60} cy={92} r={24} />
        <ellipse class="es-eyelens" cx={40} cy={92} rx={3} ry={10} />
        <path class="es-eyerays" d="M8 84 L40 84 L83 98 M8 100 L40 100 L83 86" />
        <line class="es-upside" x1={82} y1={84} x2={82} y2={100} />
        <path class="es-upside-head" d="M79 97 L82 102 L85 97 Z" />
      </g>
    </g>
  );
}

function Blackboard({ id }: { id: string }) {
  return (
    <g>
      <rect class="es-classroom" x={0} y={0} width={W} height={H} />
      <rect class="es-board" x={70} y={16} width={180} height={64} rx={3} />
      <filter id={`${id}-blur`} x="-10%" y="-30%" width="120%" height="160%">
        <feGaussianBlur stdDeviation={2.2} />
      </filter>
      <g class="es-chalk" filter={`url(#${id}-blur)`}>
        <path d="M84 34 h 60 M154 34 h 40 M84 48 h 90 M184 48 h 50 M84 62 h 40 M134 62 h 70" />
      </g>
      {/* Desks, rows going back. */}
      {range(3).map((row) => (
        <g key={row}>
          <rect
            class="es-desk"
            x={40 - row * 10}
            y={110 + row * 22}
            width={240 + row * 20}
            height={8}
            rx={2}
          />
        </g>
      ))}
      <Person who="kabir" x={110} y={112} back s={0.8} />
      <Person who="mom" x={200} y={112} back s={0.75} />
      <Person who="riya" x={256} y={170} s={1.1} squint />
      <g class="es-squiggle">
        <path d="M272 112 q 4 -4 8 0 q 4 4 8 0" />
      </g>
    </g>
  );
}

function GrandpaPaper({ locale }: { locale: string }) {
  return (
    <g>
      <rect class="es-room" x={0} y={0} width={W} height={H} />
      <rect class="es-window-frame" x={22} y={18} width={58} height={50} rx={3} />
      <Sofa x={100} y={170} w={140} />
      <Person who="grandpa" x={150} y={158} s={1.25} squint noSpecs point={[30, -10]} />
      <g transform="translate(196 104) rotate(-8)">
        <rect class="es-paper" x={0} y={0} width={44} height={32} rx={2} />
        <text class="es-paper-title" x={22} y={10} text-anchor="middle">
          {say(locale, WORDS.news)}
        </text>
        <path class="es-print" d="M5 16 h 34 M5 21 h 34 M5 26 h 24" />
      </g>
      <g class="es-specs-up" transform="translate(150 104)">
        <circle cx={-3} cy={0} r={2.6} />
        <circle cx={3} cy={0} r={2.6} />
      </g>
      <Person who="kabir" x={74} y={170} s={1.05} />
    </g>
  );
}

function BrightToDim() {
  return (
    <g>
      <rect class="es-sunny" x={0} y={0} width={140} height={H} />
      <circle class="es-sun" cx={30} cy={30} r={14} />
      <rect class="es-dim-room" x={140} y={0} width={W - 140} height={H} />
      <rect class="es-door" x={136} y={40} width={10} height={140} />
      {/* Things in the storeroom, there but hard to make out. */}
      <g class="es-shadowy">
        <rect x={200} y={100} width={40} height={60} rx={2} />
        <rect x={250} y={70} width={50} height={14} rx={2} />
        <rect x={250} y={120} width={50} height={40} rx={2} />
        <circle cx={220} cy={84} r={10} />
      </g>
      <Person who="riya" x={156} y={170} s={1.2} squint />
    </g>
  );
}

function EyeTest() {
  const rows: [number, string][] = [
    [18, "E"],
    [11, "F P"],
    [8, "T O Z"],
    [6, "L P E D"],
    [5, "P E C F D"],
  ];
  return (
    <g>
      <rect class="es-clinic" x={0} y={0} width={W} height={H} />
      <rect class="es-chart" x={22} y={14} width={64} height={96} rx={3} />
      {rows.map(([size, text], i) => (
        <text
          key={text}
          class="es-chart-text"
          x={54}
          y={34 + rows.slice(0, i).reduce((a, [sz]) => a + sz + 4, 0)}
          font-size={size}
          text-anchor="middle"
        >
          {text}
        </text>
      ))}
      <rect class="es-chair" x={196} y={128} width={44} height={10} rx={3} />
      <rect class="es-chair" x={232} y={98} width={8} height={40} rx={3} />
      <Person who="riya" x={214} y={150} s={1.15} glasses />
      <g class="es-trial" transform="translate(214 104)">
        <rect x={-10} y={-4} width={20} height={6} rx={3} />
      </g>
      <Person who="doctor" x={262} y={168} s={1.2} point={[-30, -8]} />
      <Person who="mom" x={142} y={168} s={1.1} />
      <path class="es-sight" d="M204 106 L86 60" />
    </g>
  );
}

function Bifocals({ locale }: { locale: string }) {
  return (
    <g>
      <rect class="es-room" x={0} y={0} width={W} height={H} />
      <rect class="es-tv" x={24} y={30} width={60} height={40} rx={3} />
      <rect class="es-tv-stand" x={46} y={70} width={16} height={8} />
      <Sofa x={150} y={170} w={130} />
      <Person who="grandpa" x={210} y={158} s={1.3} point={[-6, 18]} />
      <rect class="es-paper" x={186} y={140} width={30} height={20} rx={2} />
      <path class="es-sight" d="M200 98 L84 50" />
      <path class="es-sight is-down" d="M200 100 L200 140" />
      {/* The bifocal lens, drawn big: concave on top for far, convex below for near. */}
      <g class="es-bifocal" transform="translate(272 46)">
        <ellipse class="es-bifocal-lens" cx={0} cy={0} rx={30} ry={28} />
        <line class="es-bifocal-split" x1={-30} y1={4} x2={30} y2={4} />
        <text class="es-bifocal-word" x={0} y={-8} text-anchor="middle">
          {`↑ ${say(locale, WORDS.far)}`}
        </text>
        <text class="es-bifocal-word" x={0} y={19} text-anchor="middle">
          {`↓ ${say(locale, WORDS.near)}`}
        </text>
      </g>
    </g>
  );
}

function EyePledge({ locale }: { locale: string }) {
  return (
    <g>
      <rect class="es-clinic" x={0} y={0} width={W} height={H} />
      <rect class="es-poster" x={198} y={16} width={104} height={60} rx={4} />
      <circle class="es-poster-eye" cx={226} cy={46} r={12} />
      <circle class="es-poster-pupil" cx={226} cy={46} r={5} />
      <text class="es-poster-text" x={276} y={40} text-anchor="middle">
        1 → 4
      </text>
      <text class="es-poster-small" x={250} y={68} text-anchor="middle">
        {say(locale, WORDS.four)}
      </text>
      <rect class="es-desk" x={30} y={120} width={180} height={10} rx={2} />
      <rect class="es-desk" x={40} y={130} width={8} height={40} />
      <rect class="es-desk" x={192} y={130} width={8} height={40} />
      <g transform="translate(86 92) rotate(-4)">
        <rect class="es-card" x={0} y={0} width={100} height={28} rx={2} />
        <text class="es-card-text" x={50} y={12} text-anchor="middle">
          {say(locale, WORDS.pledge)}
        </text>
        <path class="es-print" d="M8 20 h 56" />
      </g>
      <Person who="mom" x={70} y={170} s={1.3} point={[28, -4]} />
      <Person who="riya" x={244} y={170} s={1.15} glasses />
    </g>
  );
}

function HillDrive({ locale }: { locale: string }) {
  return (
    <g>
      <rect class="es-dawn-sky" x={0} y={0} width={W} height={H} />
      <path class="es-hill-far" d="M0 90 L60 50 L120 84 L190 40 L260 80 L320 56 V180 H0 Z" />
      <path class="es-hill-near" d="M0 130 Q 80 96 170 120 T 320 110 V180 H0 Z" />
      <path class="es-road" d="M0 168 Q 90 130 180 150 T 320 140" />
      <g transform="translate(150 140)">
        <rect class="es-car" x={-34} y={-18} width={68} height={20} rx={7} />
        <path class="es-car-top" d="M-20 -18 L-12 -32 H14 L22 -18 Z" />
        <circle class="es-wheel" cx={-20} cy={3} r={6} />
        <circle class="es-wheel" cx={20} cy={3} r={6} />
      </g>
      {/* Kabir's notebook, held up. */}
      <g transform="translate(232 54) rotate(6)">
        <rect class="es-notebook" x={0} y={0} width={58} height={44} rx={3} />
        <text class="es-notebook-title" x={29} y={18} text-anchor="middle">
          {say(locale, WORDS.why)}
        </text>
        <path class="es-print" d="M8 26 h 42 M8 32 h 42 M8 38 h 30" />
      </g>
      <Person who="kabir" x={212} y={120} s={1.05} point={[16, -24]} />
    </g>
  );
}

function Waterfall() {
  return (
    <g>
      <rect class="es-day-sky" x={0} y={0} width={W} height={H} />
      {/* No Sun in the picture: it is low behind the family (and the viewer), opposite the bow. */}
      <path class="es-cliff" d="M0 0 H130 V110 H0 Z" />
      <path class="es-cliff" d="M170 40 H210 V110 H170 Z" />
      <rect class="es-falls" x={130} y={20} width={40} height={110} />
      <ellipse class="es-spray" cx={150} cy={128} rx={60} ry={14} />
      {/* The rainbow in the spray, red outside, violet inside. */}
      {(["red", "orange", "yellow", "green", "blue", "indigo", "violet"] as const).map((c, i) => (
        <path
          key={c}
          class={`es-bow ey-c-${c}`}
          d={`M${80 + i * 3} 130 A ${70 - i * 3} ${70 - i * 3} 0 0 1 ${220 - i * 3} 130`}
        />
      ))}
      <rect class="es-pool" x={0} y={130} width={W} height={50} />
      {/* Their shadows fall forwards, towards the falls: the Sun is behind them. */}
      <path class="es-cast-shadow" d="M214 172 L222 140 L232 140 L238 172 Z" />
      <path class="es-cast-shadow" d="M238 172 L246 142 L256 142 L262 172 Z" />
      <path class="es-cast-shadow" d="M264 172 L270 148 L278 148 L284 172 Z" />
      <Person who="riya" x={250} y={170} back s={1.05} />
      <Person who="kabir" x={274} y={170} back />
      <Person who="mom" x={226} y={170} back s={1.05} />
    </g>
  );
}

function StarryNight() {
  return (
    <g>
      <rect class="es-night" x={0} y={0} width={W} height={H} />
      {spots(6, 6, 308, 100, 40).map(([x, y], i) => (
        <circle
          key={`${x}-${y}`}
          class={i % 3 === 0 ? "es-star is-twinkling" : "es-star"}
          style={{ animationDelay: `${(i % 7) * 0.3}s` } as JSX.CSSProperties}
          cx={x}
          cy={y}
          r={i % 5 === 0 ? 1.4 : 0.9}
        />
      ))}
      <circle class="es-planet" cx={40} cy={88} r={3.2} />
      <path class="es-hill-night" d="M0 120 L70 96 L150 118 L230 92 L320 116 V180 H0 Z" />
      <rect class="es-dhaba" x={196} y={112} width={86} height={48} rx={3} />
      <path class="es-dhaba-roof" d="M188 114 L239 92 L290 114 Z" />
      <rect class="es-stove" x={154} y={146} width={26} height={12} rx={2} />
      <path class="es-flame" d="M162 146 q 5 -10 10 0 z" />
      <Person who="grandpa" x={130} y={172} s={1.15} point={[22, -6]} />
      <Person who="kabir" x={90} y={172} point={[-22, -40]} />
    </g>
  );
}

function MistyForest() {
  return (
    <g>
      <rect class="es-forest" x={0} y={0} width={W} height={H} />
      {[60, 150, 240].map((x) => (
        <path
          key={x}
          class="es-sunbeam"
          d={`M${x} 0 L${x + 40} 170 L${x + 16} 170 L${x - 18} 0 Z`}
        />
      ))}
      <rect class="es-mist" x={0} y={50} width={W} height={130} />
      {range(8).map((i) => (
        <g key={i} transform={`translate(${12 + i * 42} 0)`}>
          <path class="es-pine" d="M0 20 L-16 70 H16 Z M0 50 L-20 110 H20 Z" />
          <rect class="es-trunk" x={-2.5} y={110} width={5} height={60} />
        </g>
      ))}
      <path class="es-path" d="M120 180 Q 150 150 200 140 L 214 140 Q 180 154 170 180 Z" />
      <Person who="mom" x={170} y={164} back s={0.95} />
      <Person who="riya" x={190} y={160} back s={0.9} />
      <Person who="kabir" x={206} y={156} back s={0.85} />
    </g>
  );
}

function SunrisePoint() {
  return (
    <g>
      <rect class="es-dawn" x={0} y={0} width={W} height={H} />
      <rect class="es-dawn-glow" x={0} y={70} width={W} height={60} />
      <ellipse class="es-red-sun" cx={110} cy={106} rx={20} ry={18} />
      <path class="es-hill-far" d="M0 112 L50 98 L110 110 L170 94 L240 108 L320 96 V180 H0 Z" />
      <path class="es-ridge" d="M140 180 L200 140 L320 132 V180 Z" />
      <Person who="grandpa" x={226} y={142} back s={1.05} />
      <Person who="mom" x={248} y={140} back />
      <Person who="riya" x={268} y={139} back s={0.98} />
      <Person who="kabir" x={288} y={138} back point={[-12, -26]} />
    </g>
  );
}

export function EyeSceneView({ view, width, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as EyeSceneState;
  const id = useId().replace(/:/g, "");
  const k = width / W;
  const height = Math.round(H * k);
  const picture = (() => {
    switch (s.scene) {
      case EyeSceneKind.MovieEye:
        return <MovieEye />;
      case EyeSceneKind.Blackboard:
        return <Blackboard id={id} />;
      case EyeSceneKind.GrandpaPaper:
        return <GrandpaPaper locale={locale} />;
      case EyeSceneKind.BrightToDim:
        return <BrightToDim />;
      case EyeSceneKind.EyeTest:
        return <EyeTest />;
      case EyeSceneKind.Bifocals:
        return <Bifocals locale={locale} />;
      case EyeSceneKind.EyePledge:
        return <EyePledge locale={locale} />;
      case EyeSceneKind.HillDrive:
        return <HillDrive locale={locale} />;
      case EyeSceneKind.Waterfall:
        return <Waterfall />;
      case EyeSceneKind.StarryNight:
        return <StarryNight />;
      case EyeSceneKind.MistyForest:
        return <MistyForest />;
      case EyeSceneKind.SunrisePoint:
        return <SunrisePoint />;
    }
  })();
  return (
    <div class="es">
      <Stage
        label={describeEyeScene(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "es-svg" }}
      >
        <clipPath id={`${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#${id}-frame)`} data-part="picture">
          {picture}
        </g>
      </Stage>
    </div>
  );
}
