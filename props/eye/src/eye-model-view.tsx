import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import {
  CORRECTION_LIMIT,
  CORRECTION_STEP,
  EyeAction,
  EyeDefect,
  type EyeState,
  Light,
  Muscles,
  OBJECT_STOPS,
  describeEye,
  farOf,
  focusOf,
  musclesOf,
  nearOf,
} from "./eye-model";
import { ImageAt, RETINA_CM } from "./optics";
import { type Words, dioptres, num, say } from "./words";

const W = 320;
const H = 180;
const AXIS = 92;
/** Pixels per cm inside the eye (the eye is drawn to scale; the room outside is not). */
const K = 56;
const RETINA_X = 292;
const LENS_X = RETINA_X - RETINA_CM * K;
const BALL_R = 64;
const BALL_X = RETINA_X - BALL_R;
const SPECS_X = 146;
const OBJECT_H = 24;
/**
 * How much the drawing exaggerates the miss: a real myopic eye's image is a fraction of a
 * millimetre off the retina, too little to see, so the gap is drawn this many times bigger.
 */
const MISS_ZOOM = 6;
/** Lens heights the drawn rays pass through. */
const RAY_HEIGHTS = [-15, 0, 15] as const;

const WORDS = {
  cornea: { en: "cornea", hi: "कॉर्निया" },
  iris: { en: "iris", hi: "परितारिका" },
  pupil: { en: "pupil", hi: "पुतली" },
  lens: { en: "eye lens", hi: "नेत्र लेंस" },
  ciliary: { en: "ciliary muscles", hi: "पक्ष्माभी पेशियाँ" },
  retina: { en: "retina", hi: "दृष्टिपटल" },
  nerve: { en: "optic nerve", hi: "दृक् तंत्रिका" },
  far: { en: "far away", hi: "बहुत दूर" },
  sees: { en: "what you see", hi: "जो दिखता है" },
  sharp: { en: "Rays meet on the retina: sharp", hi: "किरणें दृष्टिपटल पर मिलती हैं: साफ़" },
  front: {
    en: "Rays meet in front of the retina: blurred",
    hi: "किरणें दृष्टिपटल के आगे मिलती हैं: धुँधला",
  },
  behind: {
    en: "Rays would meet behind the retina: blurred",
    hi: "किरणें दृष्टिपटल के पीछे मिलतीं: धुँधला",
  },
  relaxed: {
    en: "Ciliary muscles relaxed: lens thin",
    hi: "पक्ष्माभी पेशियाँ ढीली: लेंस पतला",
  },
  contracting: {
    en: "Ciliary muscles contracted: lens thicker",
    hi: "पक्ष्माभी पेशियाँ सिकुड़ी: लेंस मोटा",
  },
  full: {
    en: "Ciliary muscles as tight as they go: lens at its thickest",
    hi: "पक्ष्माभी पेशियाँ पूरी सिकुड़ी: लेंस सबसे मोटा",
  },
  near: { en: "Near point", hi: "निकट बिंदु" },
  farPoint: { en: "Far point", hi: "दूर बिंदु" },
  infinity: { en: "infinity", hi: "अनंत" },
  none: { en: "none", hi: "कोई नहीं" },
  object: { en: "Object", hi: "वस्तु" },
  nearer: { en: "nearer", hi: "पास" },
  farther: { en: "farther", hi: "दूर" },
  glasses: { en: "Glasses", hi: "चश्मा" },
  noGlasses: { en: "no glasses", hi: "चश्मा नहीं" },
  off: { en: "take off", hi: "उतारो" },
  on: { en: "put on", hi: "पहनो" },
  bright: { en: "bright light", hi: "तेज़ रोशनी" },
  dim: { en: "dim light", hi: "मद्धम रोशनी" },
  normal: { en: "normal", hi: "सामान्य" },
  myopia: { en: "myopia", hi: "निकट-दृष्टि" },
  hyper: { en: "hypermetropia", hi: "दूर-दृष्टि" },
  presby: { en: "presbyopia", hi: "जरा-दूरदृष्टिता" },
} as const satisfies Record<string, Words>;

/** Where an object this far away (cm) is drawn: a log scale from 10 cm (near the eye) to 10 m. */
function objectX(cm: number | null): number {
  if (cm === null) return 16;
  const t = (Math.log10(Math.max(5, Math.min(1000, cm))) - 1) / 2;
  return 132 - t * 108;
}

const distanceText = (locale: string, cm: number | null): string =>
  cm === null ? say(locale, WORDS.far) : cm >= 100 ? `${num(cm / 100, 1)} m` : `${num(cm, 0)} cm`;

/** Where the line from p heading along d leaves the eyeball (the retina side). */
function toRetina(p: readonly [number, number], d: readonly [number, number]): [number, number] {
  const ox = p[0] - BALL_X;
  const oy = p[1] - AXIS;
  const a = d[0] * d[0] + d[1] * d[1];
  const b = 2 * (ox * d[0] + oy * d[1]);
  const c = ox * ox + oy * oy - BALL_R * BALL_R;
  const t = (-b + Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a);
  return [p[0] + d[0] * t, p[1] + d[1] * t];
}

type Ray = { points: [number, number][] };

function raysOf(s: EyeState): { rays: Ray[]; image: [number, number]; spot: [number, number] } {
  const f = focusOf(s);
  const far = s.objectCm === null;
  const ox = objectX(s.objectCm);
  const tip: [number, number] = [ox, AXIS - OBJECT_H];
  // The centre ray goes straight through the middle of the lens; its slope fixes where the tip's
  // image is (below the axis: inverted).
  const slope = far ? 0 : OBJECT_H / (LENS_X - ox);
  // Any miss is drawn at least 14 px off the retina so a blurred eye always looks blurred.
  const missCm = Number.isFinite(f.imageCm) ? f.imageCm - RETINA_CM : 10;
  const miss =
    f.imageAt === ImageAt.Retina ? 0 : Math.sign(missCm) * (14 + Math.abs(missCm) * K * MISS_ZOOM);
  const imageX = RETINA_X + Math.max(-70, Math.min(60, miss));
  const image: [number, number] = [imageX, AXIS + (imageX - LENS_X) * slope];
  const spread = s.correction === null ? 1 : Math.max(0.55, Math.min(1.5, 1 - 0.07 * s.correction));
  const rays = RAY_HEIGHTS.map((h): Ray => {
    const atLens: [number, number] = [LENS_X, AXIS + h * spread];
    const start: [number, number] = far ? [8, AXIS + h] : tip;
    const points: [number, number][] = [start];
    if (s.correction !== null) {
      const t = (SPECS_X - start[0]) / (LENS_X - start[0]);
      const plain = start[1] + (AXIS + h - start[1]) * t;
      points.push([SPECS_X, far ? AXIS + h : plain]);
    }
    points.push(atLens);
    const d: [number, number] = [image[0] - atLens[0], image[1] - atLens[1]];
    if (f.imageAt === ImageAt.Retina) {
      points.push(image);
    } else if (f.imageAt === ImageAt.InFront) {
      points.push(image, toRetina(image, d));
    } else {
      points.push(toRetina(atLens, d));
    }
    return { points };
  });
  const ends = rays.map((r) => r.points[r.points.length - 1] as [number, number]);
  const ys = ends.map((p) => p[1]);
  return { rays, image, spot: [Math.min(...ys), Math.max(...ys)] };
}

function Name({
  text,
  at,
  to,
  anchor = "middle",
}: {
  text: string;
  at: [number, number];
  to: [number, number];
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <g class="ey-name">
      <line x1={at[0]} y1={at[1] + (to[1] > at[1] ? 3 : -9)} x2={to[0]} y2={to[1]} />
      <circle cx={to[0]} cy={to[1]} r={1.6} />
      <text x={at[0]} y={at[1]} text-anchor={anchor}>
        {text}
      </text>
    </g>
  );
}

/** The eye chart the person is looking at, as they see it: sharp, or blurred by how far off it is. */
function Seen({ blur, id, locale }: { blur: number; id: string; locale: string }) {
  const sd = blur === 0 ? 0 : Math.min(5, 1.6 + blur * 28 * MISS_ZOOM);
  return (
    <g class="ey-sees" transform="translate(6 6)">
      <defs>
        <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={sd} />
        </filter>
      </defs>
      <rect class="ey-sees-card" x={0} y={0} width={62} height={46} rx={4} />
      <g filter={sd > 0.05 ? `url(#${id}-blur)` : undefined}>
        <text class="ey-chart-1" x={31} y={20} text-anchor="middle">
          E
        </text>
        <text class="ey-chart-2" x={31} y={31} text-anchor="middle">
          F P
        </text>
        <text class="ey-chart-3" x={31} y={39} text-anchor="middle">
          T O Z
        </text>
      </g>
      <text class="ey-sees-label" x={31} y={56} text-anchor="middle">
        {say(locale, WORDS.sees)}
      </text>
    </g>
  );
}

function Spectacles({ power }: { power: number }) {
  const h = 26;
  const bulge = Math.min(6, 1.5 + Math.abs(power) * 0.9);
  const isConvex = power > 0;
  // A convex lens bulges out both sides; a concave one caves in, thick at the rims.
  const d = isConvex
    ? `M${SPECS_X} ${AXIS - h} Q ${SPECS_X + bulge * 2} ${AXIS} ${SPECS_X} ${AXIS + h} Q ${SPECS_X - bulge * 2} ${AXIS} ${SPECS_X} ${AXIS - h} Z`
    : `M${SPECS_X - bulge} ${AXIS - h} L ${SPECS_X + bulge} ${AXIS - h} Q ${SPECS_X + 1} ${AXIS} ${SPECS_X + bulge} ${AXIS + h} L ${SPECS_X - bulge} ${AXIS + h} Q ${SPECS_X - 1} ${AXIS} ${SPECS_X - bulge} ${AXIS - h} Z`;
  return (
    <g class="ey-specs" data-part="spectacles">
      <path d={d} />
      <text x={SPECS_X} y={AXIS - h - 5} text-anchor="middle">
        {`${dioptres(power)} D`}
      </text>
    </g>
  );
}

export function EyeModelView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as EyeState;
  const id = useId().replace(/:/g, "");
  const k = width / W;
  const height = Math.round(H * k);
  const f = focusOf(s);
  const effort = f.effort;
  const muscles = musclesOf(effort);
  const { rays, image, spot } = raysOf(s);
  const pupil = s.light === Light.Bright ? 6 : 14;
  const lensRx = 4 + effort * 5;
  const ciliaryR = 3.2 + effort * 1.8;
  const ox = objectX(s.objectCm);
  const far = s.objectCm === null;
  const stopIndex = (() => {
    const i = OBJECT_STOPS.indexOf(s.objectCm);
    if (i >= 0) return i;
    const cm = s.objectCm ?? Number.POSITIVE_INFINITY;
    return OBJECT_STOPS.findIndex((x) => (x ?? Number.POSITIVE_INFINITY) >= cm);
  })();
  const moveTo = (i: number) => call(EyeAction.MoveObject, { cm: OBJECT_STOPS[i] ?? null });
  const lens = (p: number | null) =>
    call(EyeAction.SetCorrection, {
      power: p === null ? null : Math.max(-CORRECTION_LIMIT, Math.min(CORRECTION_LIMIT, p)),
    });
  const near = nearOf(s);
  const farPoint = farOf(s);
  const status =
    f.imageAt === ImageAt.Retina
      ? WORDS.sharp
      : f.imageAt === ImageAt.InFront
        ? WORDS.front
        : WORDS.behind;
  const muscleWords =
    muscles === Muscles.Relaxed
      ? WORDS.relaxed
      : muscles === Muscles.Full
        ? WORDS.full
        : WORDS.contracting;
  const defects: [EyeDefect, Words][] = [
    [EyeDefect.Normal, WORDS.normal],
    [EyeDefect.Myopia, WORDS.myopia],
    [EyeDefect.Hypermetropia, WORDS.hyper],
    [EyeDefect.Presbyopia, WORDS.presby],
  ];
  const isSharp = f.imageAt === ImageAt.Retina;
  return (
    <div class="ey">
      <Stage
        label={describeEye(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "ey-svg" }}
      >
        <clipPath id={`${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#${id}-frame)`}>
          <rect
            class={s.light === Light.Bright ? "ey-bg" : "ey-bg is-dim"}
            x={0}
            y={0}
            width={W}
            height={H}
          />
          <line class="ey-axis" x1={4} y1={AXIS} x2={W - 4} y2={AXIS} />
          {/* The eyeball, the optic nerve leaving at the back. */}
          <rect
            class="ey-nerve"
            x={RETINA_X - 4}
            y={AXIS - 6}
            width={W - RETINA_X + 8}
            height={12}
            rx={3}
          />
          <circle class="ey-ball" cx={BALL_X} cy={AXIS} r={BALL_R} data-part="eye" />
          <path
            class="ey-retina"
            data-part="retina"
            d={`M ${BALL_X + BALL_R * Math.cos(1.05)} ${AXIS - BALL_R * Math.sin(1.05)} A ${BALL_R} ${BALL_R} 0 0 1 ${BALL_X + BALL_R * Math.cos(1.05)} ${AXIS + BALL_R * Math.sin(1.05)}`}
          />
          <path
            class="ey-cornea"
            d={`M ${BALL_X - BALL_R * Math.cos(0.55)} ${AXIS - BALL_R * Math.sin(0.55)} Q ${BALL_X - BALL_R - 16} ${AXIS} ${BALL_X - BALL_R * Math.cos(0.55)} ${AXIS + BALL_R * Math.sin(0.55)}`}
          />
          {/* Iris, with the pupil the gap in it. */}
          <rect
            class="ey-iris"
            x={LENS_X - 9}
            y={AXIS - 31}
            width={3.5}
            height={31 - pupil}
            rx={1.5}
          />
          <rect
            class="ey-iris"
            x={LENS_X - 9}
            y={AXIS + pupil}
            width={3.5}
            height={31 - pupil}
            rx={1.5}
          />
          {/* The eye lens and the ciliary muscles that squeeze it. */}
          <line class="ey-ligament" x1={LENS_X} y1={AXIS - 22} x2={LENS_X} y2={AXIS - 27} />
          <line class="ey-ligament" x1={LENS_X} y1={AXIS + 22} x2={LENS_X} y2={AXIS + 27} />
          <ellipse class="ey-ciliary" cx={LENS_X} cy={AXIS - 29} rx={ciliaryR} ry={ciliaryR + 1} />
          <ellipse class="ey-ciliary" cx={LENS_X} cy={AXIS + 29} rx={ciliaryR} ry={ciliaryR + 1} />
          <ellipse class="ey-lens" data-part="lens" cx={LENS_X} cy={AXIS} rx={lensRx} ry={22} />
          {s.correction !== null && <Spectacles power={s.correction} />}
          {/* The object. */}
          <g data-part="object">
            {far ? (
              <g class="ey-far">
                <text x={16} y={AXIS + 30} text-anchor="start">
                  {`← ${say(locale, WORDS.far)}`}
                </text>
              </g>
            ) : (
              <g class="ey-object">
                <line x1={ox} y1={AXIS} x2={ox} y2={AXIS - OBJECT_H + 4} />
                <path
                  d={`M${ox - 4} ${AXIS - OBJECT_H + 6} L${ox} ${AXIS - OBJECT_H} L${ox + 4} ${AXIS - OBJECT_H + 6} Z`}
                />
                <text x={ox} y={AXIS + 13} text-anchor="middle">
                  {distanceText(locale, s.objectCm)}
                </text>
              </g>
            )}
          </g>
          {s.showRays && (
            <g class="ey-rays">
              {rays.map((r) => (
                <polyline
                  key={r.points[1]?.[1]}
                  points={r.points.map((p) => p.join(",")).join(" ")}
                />
              ))}
            </g>
          )}
          {s.showRays && !isSharp && (
            <line class="ey-spot" x1={RETINA_X - 1} y1={spot[0]} x2={RETINA_X - 1} y2={spot[1]} />
          )}
          {s.showRays && isSharp && !far && (
            <g class="ey-image">
              <line x1={image[0] - 2} y1={AXIS} x2={image[0] - 2} y2={image[1]} />
              <circle cx={image[0] - 2} cy={image[1]} r={2} />
            </g>
          )}
          {s.showRays && isSharp && far && (
            <circle class="ey-image-dot" cx={image[0] - 2} cy={AXIS} r={2.6} />
          )}
          {s.showNames && (
            <g>
              <Name text={say(locale, WORDS.cornea)} at={[138, 40]} to={[154, 70]} />
              <Name
                text={say(locale, WORDS.iris)}
                at={[160, 22]}
                to={[LENS_X - 7, AXIS - 24]}
                anchor="end"
              />
              <Name
                text={say(locale, WORDS.ciliary)}
                at={[208, 14]}
                to={[LENS_X + 2, AXIS - 32]}
                anchor="start"
              />
              <Name
                text={say(locale, WORDS.pupil)}
                at={[146, 160]}
                to={[LENS_X - 7, AXIS + pupil - 2]}
              />
              <Name text={say(locale, WORDS.lens)} at={[200, 172]} to={[LENS_X + 2, AXIS + 16]} />
              <Name text={say(locale, WORDS.retina)} at={[262, 168]} to={[284, 128]} />
              <Name
                text={say(locale, WORDS.nerve)}
                at={[312, 66]}
                to={[306, AXIS - 5]}
                anchor="end"
              />
            </g>
          )}
          {s.showSees && <Seen blur={f.blur} id={id} locale={locale} />}
        </g>
      </Stage>
      <p class={isSharp ? "ey-status is-sharp" : "ey-status"} data-part="readout">
        {say(locale, status)}
        <span class="ey-muscles">{say(locale, muscleWords)}</span>
        {s.showReadout && (
          <span class="ey-points">
            {`${say(locale, WORDS.near)}: ${Number.isFinite(near) ? distanceText(locale, near) : say(locale, WORDS.none)} · ${say(locale, WORDS.farPoint)}: ${farPoint === Number.POSITIVE_INFINITY ? say(locale, WORDS.infinity) : Number.isFinite(farPoint) ? distanceText(locale, farPoint) : say(locale, WORDS.none)}`}
          </span>
        )}
      </p>
      {(s.canMoveObject || s.canSetCorrection || s.canSetLight || s.canSetDefect) && (
        <div class="ey-controls" data-part="controls">
          {s.canMoveObject && (
            <div class="ey-row">
              <span class="ey-row-name">{say(locale, WORDS.object)}</span>
              <button
                type="button"
                class="ey-button"
                disabled={stopIndex <= 0}
                onClick={() => moveTo(stopIndex - 1)}
              >
                {`← ${say(locale, WORDS.nearer)}`}
              </button>
              <span class="ey-value">{distanceText(locale, s.objectCm)}</span>
              <button
                type="button"
                class="ey-button"
                disabled={stopIndex >= OBJECT_STOPS.length - 1}
                onClick={() => moveTo(stopIndex + 1)}
              >
                {`${say(locale, WORDS.farther)} →`}
              </button>
            </div>
          )}
          {s.canSetCorrection && (
            <div class="ey-row">
              <span class="ey-row-name">{say(locale, WORDS.glasses)}</span>
              <button
                type="button"
                class="ey-button"
                disabled={s.correction !== null && s.correction <= -CORRECTION_LIMIT}
                onClick={() => lens((s.correction ?? 0) - CORRECTION_STEP)}
              >
                −
              </button>
              <span class="ey-value">
                {s.correction === null
                  ? say(locale, WORDS.noGlasses)
                  : `${dioptres(s.correction)} D`}
              </span>
              <button
                type="button"
                class="ey-button"
                disabled={s.correction !== null && s.correction >= CORRECTION_LIMIT}
                onClick={() => lens((s.correction ?? 0) + CORRECTION_STEP)}
              >
                +
              </button>
              {s.correction !== null && (
                <button type="button" class="ey-button is-quiet" onClick={() => lens(null)}>
                  {say(locale, WORDS.off)}
                </button>
              )}
            </div>
          )}
          {s.canSetLight && (
            <div class="ey-row">
              {[Light.Bright, Light.Dim].map((l) => (
                <button
                  key={l}
                  type="button"
                  class={s.light === l ? "ey-button is-on" : "ey-button"}
                  aria-pressed={s.light === l}
                  onClick={() => call(EyeAction.SetLight, { light: l })}
                >
                  {say(locale, l === Light.Bright ? WORDS.bright : WORDS.dim)}
                </button>
              ))}
            </div>
          )}
          {s.canSetDefect && (
            <div class="ey-row is-wrap">
              {defects.map(([d, w]) => (
                <button
                  key={d}
                  type="button"
                  class={s.defect === d ? "ey-button is-on" : "ey-button"}
                  aria-pressed={s.defect === d}
                  onClick={() => call(EyeAction.SetDefect, { defect: d })}
                >
                  {say(locale, w)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
