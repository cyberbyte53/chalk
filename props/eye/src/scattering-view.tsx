import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { type Vec, rad } from "./optics";
import {
  SUN_HEIGHTS,
  ScatterAction,
  ScatterKind,
  type ScatterState,
  SkyColour,
  TyndallPlace,
  describeScatter,
  pathOf,
  skyColourOf,
  sunColourNow,
} from "./scattering";
import { type Words, num, range, say } from "./words";

const W = 320;
const H = 180;

const WORDS = {
  smokeOn: { en: "add smoke", hi: "धुआँ भरो" },
  mistOn: { en: "add mist", hi: "धुंध भरो" },
  clear: { en: "clear air", hi: "साफ़ हवा" },
  withAir: { en: "with air", hi: "हवा के साथ" },
  noAir: { en: "no air", hi: "हवा नहीं" },
  start: { en: "▶ Add the acid", hi: "▶ अम्ल डालो" },
  reset: { en: "↺ Clear water", hi: "↺ साफ़ पानी" },
  sunrise: { en: "sunrise", hi: "सूर्योदय" },
  noon: { en: "noon", hi: "दोपहर" },
  hole: { en: "small hole", hi: "छोटा छेद" },
  beam: { en: "beam", hi: "किरण-पुंज" },
  sun: { en: "Sun", hi: "सूर्य" },
  you: { en: "observer", hi: "प्रेक्षक" },
  molecules: { en: "air molecules scatter blue", hi: "हवा के अणु नीला बिखेरते हैं" },
  air: { en: "air", hi: "हवा" },
  path: { en: "path through the air", hi: "हवा में रास्ता" },
  sulphur: { en: "sulphur particles", hi: "सल्फ़र के कण" },
  blueOut: { en: "blue scattered out", hi: "नीला बाहर बिखरता है" },
  water: { en: "clear water", hi: "साफ़ पानी" },
  times: { en: "× the air it crosses at noon", hi: "× उतनी हवा जितनी दोपहर में" },
  shortest: { en: "the shortest path through the air", hi: "हवा में सबसे छोटा रास्ता" },
  high: { en: "high", hi: "ऊँचा" },
} as const satisfies Record<string, Words>;

const SUN_WORDS: Record<string, Words> = {
  white: { en: "white", hi: "सफ़ेद" },
  yellow: { en: "yellow", hi: "पीला" },
  orange: { en: "orange", hi: "नारंगी" },
  red: { en: "red", hi: "लाल" },
};

function Text({
  at,
  children,
  cls = "sc-name",
  anchor = "middle",
}: {
  at: Vec;
  children: string;
  cls?: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text class={cls} x={at[0]} y={at[1]} text-anchor={anchor}>
      {children}
    </text>
  );
}

/** Fixed, scattered-looking dots inside a box (the same each time, no randomness). */
function dots(x: number, y: number, w: number, h: number, n: number): Vec[] {
  return range(n).map((i) => {
    const a = (i * 0.618034) % 1;
    const b = (i * 0.414214 + 0.37) % 1;
    return [x + a * w, y + b * h];
  });
}

function Tyndall({ s, locale }: { s: ScatterState; locale: string }) {
  const room = s.place === TyndallPlace.Room;
  if (room) {
    const hole: Vec = [24, 40];
    const patch: Vec = [210, 158];
    const beam = `M${hole[0]} ${hole[1] - 4} L${patch[0] + 22} ${patch[1]} L${patch[0] - 22} ${patch[1]} L${hole[0]} ${hole[1] + 4} Z`;
    return (
      <g>
        <rect class="sc-room" x={0} y={0} width={W} height={H} />
        <rect class="sc-floor" x={0} y={158} width={W} height={22} />
        <rect class="sc-wall" x={0} y={0} width={18} height={158} />
        <rect class="sc-hole" x={14} y={hole[1] - 5} width={8} height={10} rx={2} />
        {s.hasParticles && <path class="sc-beam" d={beam} />}
        {s.hasParticles &&
          dots(30, 30, 200, 128, 70)
            .filter(([x, y]) => {
              const t = (x - hole[0]) / (patch[0] - hole[0]);
              const mid = hole[1] + t * (patch[1] - hole[1]);
              return t > 0 && t < 1 && Math.abs(y - mid) < 3 + t * 18;
            })
            .map(([x, y]) => <circle key={`${x}-${y}`} class="sc-dust" cx={x} cy={y} r={1.2} />)}
        {s.hasParticles &&
          dots(30, 14, 280, 140, 26).map(([x, y]) => (
            <circle key={`s${x}`} class="sc-smoke" cx={x} cy={y} r={1} />
          ))}
        <ellipse class="sc-patch" cx={patch[0]} cy={patch[1] + 4} rx={24} ry={5} />
        {s.showNames && (
          <g>
            <Text at={[28, 30]} anchor="start" cls="sc-name is-on-dark">
              {say(locale, WORDS.hole)}
            </Text>
            {s.hasParticles && (
              <Text at={[120, 84]} anchor="start" cls="sc-name is-on-dark">
                {say(locale, WORDS.beam)}
              </Text>
            )}
          </g>
        )}
      </g>
    );
  }
  const gaps = [70, 160, 250];
  return (
    <g>
      <rect class="sc-forest" x={0} y={0} width={W} height={H} />
      {gaps.map((x) =>
        s.hasParticles ? (
          <path
            key={x}
            class="sc-beam is-soft"
            d={`M${x - 8} 30 L${x + 30} 168 L${x + 6} 168 L${x - 20} 30 Z`}
          />
        ) : null,
      )}
      {s.hasParticles && <rect class="sc-mist" x={0} y={60} width={W} height={110} />}
      <path
        class="sc-canopy"
        d="M0 0 H320 V24 Q 300 40 280 26 Q 262 40 240 30 Q 210 44 190 28 Q 172 40 150 30 Q 120 44 100 30 Q 84 42 58 28 Q 36 42 18 30 Q 8 36 0 30 Z"
      />
      {range(7).map((i) => (
        <rect key={i} class="sc-trunk" x={20 + i * 46} y={30} width={7} height={140} />
      ))}
      <rect class="sc-forest-floor" x={0} y={168} width={W} height={12} />
    </g>
  );
}

function SkyBlue({ s, locale }: { s: ScatterState; locale: string }) {
  const sun: Vec = [34, 34];
  const eye: Vec = [256, 150];
  const molecules = dots(70, 20, 240, 110, 34);
  return (
    <g>
      <rect class={s.hasAir ? "sc-sky" : "sc-space"} x={0} y={0} width={W} height={H} />
      {!s.hasAir &&
        dots(10, 6, 300, 120, 30).map(([x, y]) => (
          <circle key={`${x}-${y}`} class="sc-star" cx={x} cy={y} r={0.9} />
        ))}
      <circle class="sc-sun is-white" cx={sun[0]} cy={sun[1]} r={14} />
      {range(3).map((i) => (
        <line
          key={i}
          class="sc-sunlight"
          x1={sun[0] + 16}
          y1={sun[1] + i * 10 - 6}
          x2={W}
          y2={sun[1] + i * 26 + 4}
        />
      ))}
      {s.hasAir &&
        molecules.map(([x, y]) => (
          <circle key={`${x}-${y}`} class="sc-molecule" cx={x} cy={y} r={1.6} />
        ))}
      {s.hasAir &&
        (
          [
            [110, 40],
            [170, 30],
            [220, 56],
            [130, 84],
            [290, 40],
          ] as Vec[]
        ).map((m) => {
          const to: Vec = [eye[0], eye[1] - 30];
          const d = [to[0] - m[0], to[1] - m[1]];
          const len = Math.hypot(d[0] as number, d[1] as number);
          const u: Vec = [(d[0] as number) / len, (d[1] as number) / len];
          const end: Vec = [to[0] - u[0] * 8, to[1] - u[1] * 8];
          const back: Vec = [end[0] - u[0] * 6, end[1] - u[1] * 6];
          const side: Vec = [-u[1] * 3, u[0] * 3];
          return (
            <g key={`b${m[0]}`} class="sc-scattered">
              <circle class="sc-hit" cx={m[0]} cy={m[1]} r={2.6} />
              <line x1={m[0]} y1={m[1]} x2={back[0]} y2={back[1]} />
              <path
                d={`M${end[0]} ${end[1]} L${back[0] + side[0]} ${back[1] + side[1]} L${back[0] - side[0]} ${back[1] - side[1]} Z`}
              />
            </g>
          );
        })}
      <rect class="sc-ground" x={0} y={150} width={W} height={30} />
      <g class="sc-watcher" transform={`translate(${eye[0]} ${eye[1]})`}>
        <rect x={-4} y={-22} width={8} height={14} rx={3} />
        <circle cx={0} cy={-27} r={5} />
      </g>
      {s.showNames && (
        <g>
          <Text
            at={[sun[0] + 20, sun[1] - 14]}
            anchor="start"
            cls={s.hasAir ? "sc-name" : "sc-name is-on-dark"}
          >
            {say(locale, WORDS.sun)}
          </Text>
          {s.hasAir && <Text at={[150, 138]}>{say(locale, WORDS.molecules)}</Text>}
          <Text at={[eye[0], 172]} cls="sc-name is-on-ground">
            {say(locale, WORDS.you)}
          </Text>
        </g>
      )}
    </g>
  );
}

const EARTH_C: Vec = [160, 610];
const EARTH_R = 480;
const AIR_R = 516;
const OBS: Vec = [160, EARTH_C[1] - EARTH_R];

function SunPath({ s, locale }: { s: ScatterState; locale: string }) {
  const h = rad(s.sunHeight);
  const sun: Vec = [OBS[0] - Math.cos(h) * 118, OBS[1] - Math.sin(h) * 118];
  // Where the line from the observer towards the Sun leaves the (thickened) air.
  const d: Vec = [-Math.cos(h), -Math.sin(h)];
  const o: Vec = [OBS[0] - EARTH_C[0], OBS[1] - EARTH_C[1]];
  const b = 2 * (o[0] * d[0] + o[1] * d[1]);
  const c = o[0] * o[0] + o[1] * o[1] - AIR_R * AIR_R;
  const t = (-b + Math.sqrt(b * b - 4 * c)) / 2;
  const top: Vec = [OBS[0] + d[0] * t, OBS[1] + d[1] * t];
  const sky = skyColourOf(s);
  const colour = sunColourNow(s);
  return (
    <g>
      <rect
        class={sky === SkyColour.Orange ? "sc-sky is-dusk" : "sc-sky"}
        x={0}
        y={0}
        width={W}
        height={H}
      />
      <circle class="sc-air" cx={EARTH_C[0]} cy={EARTH_C[1]} r={AIR_R} />
      <circle class="sc-earth" cx={EARTH_C[0]} cy={EARTH_C[1]} r={EARTH_R} />
      <line class="sc-ray" x1={sun[0]} y1={sun[1]} x2={OBS[0]} y2={OBS[1] - 6} />
      <line class="sc-ray-in-air" x1={top[0]} y1={top[1]} x2={OBS[0]} y2={OBS[1] - 6} />
      <circle class={`sc-sun is-${colour}`} cx={sun[0]} cy={sun[1]} r={11} />
      <g class="sc-watcher" transform={`translate(${OBS[0]} ${OBS[1]})`}>
        <rect x={-3} y={-14} width={6} height={10} rx={2} />
        <circle cx={0} cy={-18} r={3.6} />
      </g>
      {s.showNames && (
        <g>
          <Text
            at={[(top[0] + OBS[0]) / 2 + 4, (top[1] + OBS[1]) / 2 + (s.sunHeight > 40 ? 0 : -8)]}
            anchor="start"
          >
            {say(locale, WORDS.path)}
          </Text>
          <Text at={[300, EARTH_C[1] - AIR_R + 12]} anchor="end">
            {say(locale, WORDS.air)}
          </Text>
        </g>
      )}
    </g>
  );
}

function HypoTank({ s, locale }: { s: ScatterState; locale: string }) {
  const axis = 92;
  const on = s.isStarted;
  return (
    <g>
      <rect class="sc-lab" x={0} y={0} width={W} height={H} />
      {/* Lamp S, lens L1, the tank T, the card with the hole c, lens L2, screen MN. */}
      <circle class="sc-lamp" cx={16} cy={axis} r={7} />
      <path
        class="sc-light"
        d={`M22 ${axis - 3} L46 ${axis - 16} L46 ${axis + 16} L22 ${axis + 3} Z`}
      />
      <rect class="sc-light" x={50} y={axis - 16} width={152} height={32} />
      <ellipse class="sc-lens" cx={48} cy={axis} rx={4} ry={22} />
      <rect
        class={on ? "sc-tank is-cloudy" : "sc-tank"}
        x={78}
        y={axis - 40}
        width={100}
        height={78}
        rx={3}
      />
      {on &&
        dots(82, axis - 34, 92, 66, 60).map(([x, y], i) => (
          <circle
            key={`${x}-${y}`}
            class="sc-sulphur"
            style={{ animationDelay: `${(i % 10) * 0.25}s` } as JSX.CSSProperties}
            cx={x}
            cy={y}
            r={1.1}
          />
        ))}
      {on &&
        [96, 128, 160].map((x) => (
          <g key={x} class="sc-blue-out">
            <line x1={x} y1={axis - 42} x2={x - 4} y2={axis - 62} />
            <line x1={x} y1={axis + 40} x2={x - 4} y2={axis + 60} />
          </g>
        ))}
      <rect class="sc-card" x={204} y={axis - 34} width={5} height={68} />
      <rect class="sc-hole-gap" x={204} y={axis - 4} width={5} height={8} />
      <path
        class={on ? "sc-light is-red" : "sc-light"}
        d={`M209 ${axis - 4} L236 ${axis - 14} L236 ${axis + 14} L209 ${axis + 4} Z`}
      />
      <path
        class={on ? "sc-light is-red" : "sc-light"}
        d={`M240 ${axis - 14} L292 ${axis - 6} L292 ${axis + 6} L240 ${axis + 14} Z`}
      />
      <ellipse class="sc-lens" cx={238} cy={axis} rx={4} ry={20} />
      <rect class="sc-screen" x={293} y={axis - 40} width={8} height={80} rx={2} />
      <ellipse class={on ? "sc-spot is-started" : "sc-spot"} cx={295} cy={axis} rx={3} ry={7} />
      {s.showNames && (
        <g>
          <Text at={[16, axis + 24]}>S</Text>
          <Text at={[48, axis + 34]}>L₁</Text>
          <Text at={[128, axis + 54]}>
            {on ? say(locale, WORDS.sulphur) : say(locale, WORDS.water)}
          </Text>
          <Text at={[206, axis + 46]}>c</Text>
          <Text at={[238, axis + 32]}>L₂</Text>
          <Text at={[297, axis + 52]}>MN</Text>
          {on && (
            <Text at={[128, 16]} cls="sc-name is-blue">
              {say(locale, WORDS.blueOut)}
            </Text>
          )}
        </g>
      )}
    </g>
  );
}

export function ScatteringView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ScatterState;
  const id = useId().replace(/:/g, "");
  const k = width / W;
  const height = Math.round(H * k);
  const picture = (() => {
    switch (s.kind) {
      case ScatterKind.Tyndall:
        return <Tyndall s={s} locale={locale} />;
      case ScatterKind.SkyBlue:
        return <SkyBlue s={s} locale={locale} />;
      case ScatterKind.SunPath:
        return <SunPath s={s} locale={locale} />;
      case ScatterKind.HypoTank:
        return <HypoTank s={s} locale={locale} />;
    }
  })();
  const times = pathOf(s) / pathOf({ sunHeight: 90 });
  const choice = (label: Words, on: boolean, go: () => void) => (
    <button
      key={label.en}
      type="button"
      class={on ? "ey-button is-on" : "ey-button"}
      aria-pressed={on}
      onClick={go}
    >
      {say(locale, label)}
    </button>
  );
  return (
    <div class="sc">
      <Stage
        label={describeScatter(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "sc-svg" }}
      >
        <clipPath id={`${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#${id}-frame)`} data-part="picture">
          {picture}
        </g>
      </Stage>
      {s.kind === ScatterKind.SunPath && (
        <p class="sc-readout" data-part="readout">
          {`${say(locale, WORDS.sun)} ${num(s.sunHeight, 0)}° ${say(locale, WORDS.high)}: ${say(locale, SUN_WORDS[sunColourNow(s)] as Words)} · ${s.sunHeight >= 90 ? say(locale, WORDS.shortest) : `${num(times, 1)}${say(locale, WORDS.times)}`}`}
        </p>
      )}
      {s.canChange && (
        <div class="sc-controls" data-part="controls">
          {s.kind === ScatterKind.Tyndall && (
            <>
              {choice(
                s.place === TyndallPlace.Room ? WORDS.smokeOn : WORDS.mistOn,
                s.hasParticles,
                () => call(ScatterAction.SetParticles, { on: true }),
              )}
              {choice(WORDS.clear, !s.hasParticles, () =>
                call(ScatterAction.SetParticles, { on: false }),
              )}
            </>
          )}
          {s.kind === ScatterKind.SkyBlue && (
            <>
              {choice(WORDS.withAir, s.hasAir, () => call(ScatterAction.SetAir, { on: true }))}
              {choice(WORDS.noAir, !s.hasAir, () => call(ScatterAction.SetAir, { on: false }))}
            </>
          )}
          {s.kind === ScatterKind.SunPath &&
            SUN_HEIGHTS.map((deg) =>
              choice(
                deg === 0
                  ? WORDS.sunrise
                  : deg === 90
                    ? WORDS.noon
                    : { en: `${deg}°`, hi: `${deg}°` },
                s.sunHeight === deg,
                () => call(ScatterAction.SetSunHeight, { deg }),
              ),
            )}
          {s.kind === ScatterKind.HypoTank &&
            (s.isStarted
              ? choice(WORDS.reset, false, () => call(ScatterAction.Reset, {}))
              : choice(WORDS.start, true, () => call(ScatterAction.Start, {})))}
        </div>
      )}
    </div>
  );
}
