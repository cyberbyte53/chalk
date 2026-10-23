import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import {
  ATMOSPHERE_STEPS,
  AtmosphereAction,
  AtmosphereKind,
  type AtmosphereState,
  SkySource,
  describeAtmosphere,
  stepOf,
} from "./atmosphere";
import {
  COLOURS,
  type Vec,
  WATER_INDEX,
  add,
  dot,
  reflect,
  refract,
  scale,
  sub,
  unit,
} from "./optics";
import { type Words, range, say } from "./words";

const W = 320;
const H = 180;

const WORDS = {
  next: { en: "Next →", hi: "आगे →" },
  again: { en: "↺ Again", hi: "↺ फिर से" },
  star: { en: "a star", hi: "एक तारा" },
  planet: { en: "a planet", hi: "एक ग्रह" },
  stoveOn: { en: "stove on", hi: "चूल्हा जलाओ" },
  stoveOff: { en: "stove off", hi: "चूल्हा बुझाओ" },
  actual: { en: "actual position", hi: "वास्तविक स्थिति" },
  apparent: { en: "where it is seen", hi: "जहाँ दिखता है" },
  hotAir: { en: "hot air rising", hi: "ऊपर उठती गरम हवा" },
  denser: { en: "denser air", hi: "अधिक सघन हवा" },
  thinner: { en: "thinner air", hi: "कम सघन हवा" },
  horizon: { en: "horizon", hi: "क्षितिज" },
  actualSun: { en: "actual Sun", hi: "वास्तविक सूर्य" },
  seenSun: { en: "Sun seen", hi: "दिखता सूर्य" },
  early: { en: "seen about 2 minutes early", hi: "लगभग 2 मिनट पहले दिखता है" },
  notYet: { en: "not seen yet", hi: "अभी नहीं दिखता" },
  sunlight: { en: "white sunlight", hi: "श्वेत सूर्य का प्रकाश" },
  drop: { en: "raindrop", hi: "वर्षा की बूँद" },
  split: { en: "splits", hi: "बँटता है" },
  reflects: { en: "reflects inside", hi: "अंदर परावर्तन" },
  toEye: { en: "to the observer", hi: "प्रेक्षक की ओर" },
  you: { en: "you", hi: "तुम" },
} as const satisfies Record<string, Words>;

function Text({
  at,
  children,
  cls = "at-name",
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

/** A little person standing at (x, y), looking left. */
function Watcher({ x, y }: { x: number; y: number }) {
  return (
    <g class="at-watcher" transform={`translate(${x} ${y})`}>
      <rect x={-4} y={-22} width={8} height={14} rx={3} />
      <rect class="at-legs" x={-3} y={-9} width={6} height={9} rx={1.5} />
      <circle cx={0} cy={-27} r={5} />
    </g>
  );
}

function HotAir({ isHot, locale, names }: { isHot: boolean; locale: string; names: boolean }) {
  return (
    <g>
      <rect class="at-day" x={0} y={0} width={W} height={H} />
      <rect class="at-ground" x={0} y={146} width={W} height={34} />
      {/* The signboard far behind, seen through the air over the stove. */}
      <g class={isHot ? "at-sign is-wavering" : "at-sign"}>
        <rect x={130} y={40} width={60} height={34} rx={3} />
        <rect class="at-post" x={157} y={74} width={6} height={72} />
        <text x={160} y={62} text-anchor="middle">
          CHAI
        </text>
      </g>
      {/* The stove and its pot. */}
      <rect class="at-stove" x={136} y={132} width={48} height={16} rx={3} />
      {isHot && (
        <g class="at-flame">
          <path d="M150 132 q 4 -12 8 0 z" />
          <path d="M160 132 q 4 -14 8 0 z" />
          <path d="M170 132 q 3 -10 6 0 z" />
        </g>
      )}
      {isHot && (
        <g class="at-plume">
          {range(5).map((i) => (
            <path
              key={i}
              class="at-wave"
              style={{ animationDelay: `${-i * 0.35}s` } as JSX.CSSProperties}
              d={`M${142 + i * 9} 128 q 6 -14 0 -28 q -6 -14 0 -28 q 6 -14 0 -28 q -6 -14 0 -28`}
            />
          ))}
        </g>
      )}
      <Watcher x={290} y={150} />
      {names && isHot && (
        <Text at={[214, 112]} anchor="start">
          {say(locale, WORDS.hotAir)}
        </Text>
      )}
    </g>
  );
}

function Twinkle({ source, locale, names }: { source: SkySource; locale: string; names: boolean }) {
  const eye: Vec = [262, 150];
  const actual: Vec = [40, 92];
  const seen: Vec = [40, 62];
  const isStar = source === SkySource.Star;
  return (
    <g>
      <rect class="at-night" x={0} y={0} width={W} height={H} />
      {/* Layers of air, denser towards the ground. */}
      {range(5).map((i) => (
        <rect
          key={i}
          class="at-layer"
          style={{ opacity: 0.05 + i * 0.05 } as JSX.CSSProperties}
          x={0}
          y={40 + i * 22}
          width={W}
          height={22}
        />
      ))}
      <rect class="at-ground-night" x={0} y={150} width={W} height={30} />
      {/* The bent path of the light, and the straight line the eye traces it back along. */}
      <path class="at-light" d={`M${actual[0]} ${actual[1]} Q 150 92 ${eye[0]} ${eye[1] - 26}`} />
      <line class="at-traced" x1={eye[0]} y1={eye[1] - 26} x2={seen[0]} y2={seen[1]} />
      {isStar ? (
        <g>
          <circle class="at-star-ghost" cx={actual[0]} cy={actual[1]} r={3} />
          <g class="at-star is-twinkling" transform={`translate(${seen[0]} ${seen[1]})`}>
            <path d="M0 -7 L1.6 -1.6 L7 0 L1.6 1.6 L0 7 L-1.6 1.6 L-7 0 L-1.6 -1.6 Z" />
          </g>
        </g>
      ) : (
        <g>
          <circle class="at-star-ghost" cx={actual[0]} cy={actual[1]} r={6} />
          <circle class="at-planet" cx={seen[0]} cy={seen[1]} r={6.5} />
        </g>
      )}
      <Watcher x={eye[0]} y={eye[1]} />
      {names && (
        <g>
          <Text at={[actual[0] + 8, actual[1] + 14]} anchor="start" cls="at-name is-on-dark">
            {say(locale, WORDS.actual)}
          </Text>
          <Text at={[seen[0] + 12, seen[1] - 8]} anchor="start" cls="at-name is-on-dark">
            {say(locale, WORDS.apparent)}
          </Text>
          <Text at={[W - 8, 34]} anchor="end" cls="at-name is-on-dark">
            {say(locale, WORDS.thinner)}
          </Text>
          <Text at={[W - 8, 144]} anchor="end" cls="at-name is-on-dark">
            {say(locale, WORDS.denser)}
          </Text>
        </g>
      )}
    </g>
  );
}

function Sunrise({ step, locale, names }: { step: number; locale: string; names: boolean }) {
  const horizon = 128;
  const eye: Vec = [250, horizon];
  const actual: Vec = [56, horizon + 12];
  const seen: Vec = [56, horizon - 14];
  const withAir = step >= 1;
  return (
    <g>
      <rect class={withAir ? "at-dawn" : "at-night"} x={0} y={0} width={W} height={H} />
      {withAir &&
        range(4).map((i) => (
          <rect
            key={i}
            class="at-layer is-warm"
            style={{ opacity: 0.06 + i * 0.06 } as JSX.CSSProperties}
            x={0}
            y={56 + i * 18}
            width={W}
            height={18}
          />
        ))}
      {withAir && (
        <g>
          <path
            class="at-light"
            d={`M${actual[0] + 10} ${actual[1] - 6} Q 150 ${horizon - 6} ${eye[0]} ${eye[1] - 26}`}
          />
          <line class="at-traced" x1={eye[0]} y1={eye[1] - 26} x2={seen[0] + 14} y2={seen[1]} />
          <ellipse class="at-sun" cx={seen[0]} cy={seen[1]} rx={15} ry={12} />
        </g>
      )}
      <rect class="at-ground" x={0} y={horizon} width={W} height={H - horizon} />
      <line class="at-horizon" x1={0} y1={horizon} x2={W} y2={horizon} />
      <circle class="at-sun-ghost" cx={actual[0]} cy={actual[1]} r={14} />
      <Watcher x={eye[0]} y={eye[1]} />
      {names && (
        <g>
          <Text at={[actual[0] + 22, actual[1] + 24]} anchor="start" cls="at-name is-on-dark">
            {say(locale, WORDS.actualSun)}
          </Text>
          <Text at={[W - 8, horizon - 4]} anchor="end" cls="at-name">
            {say(locale, WORDS.horizon)}
          </Text>
          {withAir ? (
            <Text at={[seen[0] + 22, seen[1] - 14]} anchor="start" cls="at-name is-strong">
              {`${say(locale, WORDS.seenSun)}: ${say(locale, WORDS.early)}`}
            </Text>
          ) : (
            <Text at={[actual[0] + 22, horizon - 10]} anchor="start" cls="at-name is-on-dark">
              {say(locale, WORDS.notYet)}
            </Text>
          )}
        </g>
      )}
    </g>
  );
}

const DROP: Vec = [214, 66];
const DROP_R = 50;

/** One colour's path through the drop: in, across, reflected, out. */
function dropPath(n: number) {
  const y0 = DROP[1] - DROP_R * 0.82;
  const x0 = DROP[0] - Math.sqrt(DROP_R * DROP_R - (y0 - DROP[1]) ** 2);
  const entry: Vec = [x0, y0];
  const d0: Vec = [1, 0];
  const n1 = unit(sub(entry, DROP));
  const d1 = refract(d0, n1, 1 / n) as Vec;
  const back = add(entry, scale(d1, -2 * dot(sub(entry, DROP), d1)));
  const nb = unit(sub(back, DROP));
  const d2 = reflect(d1, nb);
  const exit = add(back, scale(d2, -2 * dot(sub(back, DROP), d2)));
  const n3 = unit(sub(exit, DROP));
  const d3 = refract(d2, n3, n) as Vec;
  return { entry, back, exit, out: add(exit, scale(d3, 190)) };
}

function Raindrop({ step, locale, names }: { step: number; locale: string; names: boolean }) {
  const white = dropPath(WATER_INDEX.yellow);
  const paths = COLOURS.map((c) => ({ c, p: dropPath(WATER_INDEX[c]) }));
  return (
    <g>
      <rect class="at-sky" x={0} y={0} width={W} height={H} />
      <circle class="at-drop" cx={DROP[0]} cy={DROP[1]} r={DROP_R} />
      <line class="at-white" x1={6} y1={white.entry[1]} x2={white.entry[0]} y2={white.entry[1]} />
      {step >= 1 &&
        paths.map(({ c, p }) => (
          <g key={c} class={`ey-c-${c}`}>
            <polyline
              class="at-colour"
              points={[
                p.entry,
                p.back,
                ...(step >= 2 ? [p.exit] : []),
                ...(step >= 3 ? [p.out] : []),
              ]
                .map((q) => q.join(","))
                .join(" ")}
            />
          </g>
        ))}
      {names && (
        <g>
          <Text at={[10, white.entry[1] - 7]} anchor="start">
            {say(locale, WORDS.sunlight)}
          </Text>
          <Text at={[DROP[0] + 24, DROP[1] + DROP_R + 14]}>{say(locale, WORDS.drop)}</Text>
          {step >= 1 && (
            <Text at={[white.entry[0] + 8, white.entry[1] - 8]} anchor="start">
              {say(locale, WORDS.split)}
            </Text>
          )}
          {step >= 2 && (
            <Text at={[white.back[0] - 6, white.back[1] + 18]} anchor="end">
              {say(locale, WORDS.reflects)}
            </Text>
          )}
          {step >= 3 && (
            <Text at={[24, 172]} anchor="start">{`↙ ${say(locale, WORDS.toEye)}`}</Text>
          )}
        </g>
      )}
    </g>
  );
}

export function AtmosphereView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as AtmosphereState;
  const id = useId().replace(/:/g, "");
  const k = width / W;
  const height = Math.round(H * k);
  const step = stepOf(s);
  const steps = ATMOSPHERE_STEPS[s.kind];
  const picture = (() => {
    switch (s.kind) {
      case AtmosphereKind.HotAir:
        return <HotAir isHot={s.isHot} locale={locale} names={s.showNames} />;
      case AtmosphereKind.Twinkle:
        return <Twinkle source={s.source} locale={locale} names={s.showNames} />;
      case AtmosphereKind.Sunrise:
        return <Sunrise step={step} locale={locale} names={s.showNames} />;
      case AtmosphereKind.Raindrop:
        return <Raindrop step={step} locale={locale} names={s.showNames} />;
    }
  })();
  const toggles =
    s.canToggle && s.kind === AtmosphereKind.Twinkle
      ? ([
          [
            WORDS.star,
            s.source === SkySource.Star,
            () => call(AtmosphereAction.SetSource, { source: SkySource.Star }),
          ],
          [
            WORDS.planet,
            s.source === SkySource.Planet,
            () => call(AtmosphereAction.SetSource, { source: SkySource.Planet }),
          ],
        ] as const)
      : s.canToggle && s.kind === AtmosphereKind.HotAir
        ? ([
            [WORDS.stoveOn, s.isHot, () => call(AtmosphereAction.SetHeat, { on: true })],
            [WORDS.stoveOff, !s.isHot, () => call(AtmosphereAction.SetHeat, { on: false })],
          ] as const)
        : null;
  return (
    <div class="at">
      <Stage
        label={describeAtmosphere(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "at-svg" }}
      >
        <clipPath id={`${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#${id}-frame)`} data-part="picture">
          {picture}
        </g>
      </Stage>
      {steps > 1 && (
        <p class="at-caption" data-part="caption">
          {say(locale, CAPTIONS[s.kind][step] ?? { en: "", hi: "" })}
        </p>
      )}
      {((s.canStep && steps > 1) || toggles !== null) && (
        <div class="at-controls" data-part="controls">
          {s.canStep && steps > 1 && (
            <>
              <span class="at-dots" aria-hidden="true">
                {range(steps).map((i) => (
                  <span key={i} class={i === step ? "at-dot is-on" : "at-dot"} />
                ))}
              </span>
              <button
                type="button"
                class="ey-button is-on"
                onClick={() => call(AtmosphereAction.Next, {})}
              >
                {say(locale, step === steps - 1 ? WORDS.again : WORDS.next)}
              </button>
            </>
          )}
          {toggles?.map(([w, on, go]) => (
            <button
              key={w.en}
              type="button"
              class={on ? "ey-button is-on" : "ey-button"}
              aria-pressed={on}
              onClick={go}
            >
              {say(locale, w)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** What each step shows, said on screen. */
const CAPTIONS: Record<AtmosphereKind, readonly Words[]> = {
  [AtmosphereKind.HotAir]: [],
  [AtmosphereKind.Twinkle]: [],
  [AtmosphereKind.Sunrise]: [
    {
      en: "Without air, the Sun just below the horizon could not be seen yet.",
      hi: "हवा न हो, तो क्षितिज के ठीक नीचे का सूर्य अभी नहीं दिखता।",
    },
    {
      en: "With air, the light bends over the horizon: the Sun is seen about 2 minutes early.",
      hi: "हवा हो, तो प्रकाश क्षितिज के ऊपर मुड़ जाता है: सूर्य लगभग 2 मिनट पहले दिख जाता है।",
    },
  ],
  [AtmosphereKind.Raindrop]: [
    { en: "White sunlight reaches a raindrop.", hi: "श्वेत सूर्य का प्रकाश एक बूँद तक पहुँचता है।" },
    {
      en: "Going in, it refracts and splits into colours.",
      hi: "अंदर जाते हुए यह अपवर्तित होकर रंगों में बँट जाता है।",
    },
    {
      en: "At the back of the drop, the colours reflect.",
      hi: "बूँद के पिछले हिस्से पर रंग परावर्तित होते हैं।",
    },
    {
      en: "Coming out, they refract again, each colour in its own direction.",
      hi: "बाहर आते हुए वे फिर अपवर्तित होते हैं, हर रंग अपनी दिशा में।",
    },
  ],
};
