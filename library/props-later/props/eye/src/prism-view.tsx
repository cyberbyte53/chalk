import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import {
  COLOURS,
  type Colour,
  GLASS_INDEX,
  type Vec,
  add,
  dot,
  hitSegment,
  rad,
  refract,
  rotate,
  scale,
  sub,
  unit,
} from "./optics";
import {
  INCIDENCE_MAX,
  INCIDENCE_MIN,
  INCIDENCE_STEP,
  PRISM_ANGLE,
  PrismAction,
  PrismMode,
  type PrismState,
  RAY_INDEX,
  anglesOf,
  describePrism,
} from "./prism";
import { type Words, num, say } from "./words";

const W = 320;
const H = 180;
const TOP = 28;
const HEIGHT = 108;
const SCREEN_X = 300;

const WORDS = {
  incident: { en: "incident ray", hi: "आपतित किरण" },
  refracted: { en: "refracted ray", hi: "अपवर्तित किरण" },
  emergent: { en: "emergent ray", hi: "निर्गत किरण" },
  white: { en: "white light", hi: "श्वेत प्रकाश" },
  whiteAgain: { en: "white light again", hi: "फिर श्वेत प्रकाश" },
  screen: { en: "screen", hi: "पर्दा" },
  turn: { en: "Angle of incidence", hi: "आपतन कोण" },
  one: { en: "one prism", hi: "एक प्रिज़्म" },
  two: { en: "add a second prism", hi: "दूसरा प्रिज़्म लगाओ" },
} as const satisfies Record<string, Words>;

const LETTER: Record<Colour, Words> = {
  red: { en: "R", hi: "ला" },
  orange: { en: "O", hi: "ना" },
  yellow: { en: "Y", hi: "पी" },
  green: { en: "G", hi: "ह" },
  blue: { en: "B", hi: "नी" },
  indigo: { en: "I", hi: "जा" },
  violet: { en: "V", hi: "बैं" },
};

type Tri = readonly [Vec, Vec, Vec];

function prismAt(apexX: number): Tri {
  const half = Math.tan(rad(PRISM_ANGLE / 2)) * HEIGHT;
  return [
    [apexX, TOP],
    [apexX - half, TOP + HEIGHT],
    [apexX + half, TOP + HEIGHT],
  ];
}

const centroid = (t: Tri): Vec => [
  (t[0][0] + t[1][0] + t[2][0]) / 3,
  (t[0][1] + t[1][1] + t[2][1]) / 3,
];

/** Unit normal of the face a–b pointing out of the triangle. */
function outward(t: Tri, a: Vec, b: Vec): Vec {
  const e = unit(sub(b, a));
  const n: Vec = [e[1], -e[0]];
  const mid = scale(add(a, b), 0.5);
  return dot(n, sub(mid, centroid(t))) > 0 ? n : scale(n, -1);
}

const faces = (t: Tri): [Vec, Vec][] => [
  [t[0], t[1]],
  [t[0], t[2]],
  [t[1], t[2]],
];

/** A ray through a prism: where it goes in and out, and its direction inside and after. */
function through(t: Tri, start: Vec, d: Vec, n: number) {
  let best: { t: number; at: Vec; face: number } | null = null;
  faces(t).forEach(([a, b], face) => {
    const h = hitSegment(start, d, a, b);
    if (h !== null && (best === null || h.t < best.t)) best = { ...h, face };
  });
  const entry = best as { t: number; at: Vec; face: number } | null;
  if (entry === null) return null;
  const [ea, eb] = faces(t)[entry.face] as [Vec, Vec];
  const inside = refract(d, outward(t, ea, eb), 1 / n);
  if (inside === null) return null;
  let exit: { t: number; at: Vec; face: number } | null = null;
  faces(t).forEach(([a, b], face) => {
    if (face === entry.face) return;
    const h = hitSegment(entry.at, inside, a, b);
    if (h !== null && (exit === null || h.t < exit.t)) exit = { ...h, face };
  });
  const out = exit as { t: number; at: Vec; face: number } | null;
  if (out === null) return null;
  const [xa, xb] = faces(t)[out.face] as [Vec, Vec];
  const normalOut = outward(t, xa, xb);
  const after = refract(inside, normalOut, n);
  return {
    entry: entry.at,
    entryNormal: outward(t, ea, eb),
    inside,
    exit: out.at,
    exitNormal: normalOut,
    after,
  };
}

/** The point point-mirrored triangle that sits upside down against the first one's right face. */
function invertedNextTo(t: Tri, gap: number): Tri {
  const n = outward(t, t[0], t[2]);
  const o = add(scale(add(t[0], t[2]), 0.5), scale(n, gap / 2));
  const mirror = (p: Vec): Vec => sub(scale(o, 2), p);
  return [mirror(t[0]), mirror(t[1]), mirror(t[2])];
}

const path = (pts: readonly Vec[]): string =>
  pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

/** Where a ray from p along d reaches x = limit (or the picture's edge first). */
function toEdge(p: Vec, d: Vec, limit = W + 10): Vec {
  const tx = d[0] > 1e-6 ? (limit - p[0]) / d[0] : Number.POSITIVE_INFINITY;
  const ty =
    d[1] > 1e-6
      ? (H + 10 - p[1]) / d[1]
      : d[1] < -1e-6
        ? (-10 - p[1]) / d[1]
        : Number.POSITIVE_INFINITY;
  return add(p, scale(d, Math.min(tx, ty)));
}

/** An arc of radius r at c, from direction a to direction b (the short way), and its label spot. */
function arc(c: Vec, a: Vec, b: Vec, r: number) {
  const p = add(c, scale(unit(a), r));
  const q = add(c, scale(unit(b), r));
  const cross = a[0] * b[1] - a[1] * b[0];
  const mid = unit(add(unit(a), unit(b)));
  return {
    d: `M${p[0].toFixed(1)} ${p[1].toFixed(1)} A ${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`,
    label: add(c, scale(mid, r + 9)),
  };
}

/** The incoming direction for an angle of incidence i on the face a–b of t. */
function incoming(t: Tri, i: number): { start: Vec; d: Vec; at: Vec } {
  const a = t[0];
  const b = t[1];
  const at = add(a, scale(sub(b, a), 0.55));
  const inward = scale(outward(t, a, b), -1);
  const d = rotate(inward, -rad(i));
  const back = Math.min(150, (at[0] - 4) / Math.max(0.2, d[0]));
  return { start: sub(at, scale(d, back)), d, at };
}

/** Letters beside the screen: at their colours, spread to at least 9 apart around the middle. */
function letterYs(ys: number[]): number[] {
  if (ys.length === 0) return [];
  const first = ys[0] as number;
  const last = ys[ys.length - 1] as number;
  const gap = Math.max(9, (last - first) / Math.max(1, ys.length - 1));
  const mid = (first + last) / 2;
  return ys.map((_, i) => mid + (i - (ys.length - 1) / 2) * gap);
}

function Label({ at, text, cls = "ey-pr-label" }: { at: Vec; text: string; cls?: string }) {
  return (
    <text class={cls} x={at[0]} y={at[1] + 3} text-anchor="middle">
      {text}
    </text>
  );
}

function RayPicture({ s, locale }: { s: PrismState; locale: string }) {
  const t = prismAt(122);
  const { start, d } = incoming(t, s.incidence);
  const ray = through(t, start, d, RAY_INDEX);
  if (ray === null || ray.after === null) return null;
  const end = toEdge(ray.exit, ray.after);
  const a = anglesOf(s);
  const normalLen = 26;
  const n1 = ray.entryNormal;
  const n2 = ray.exitNormal;
  // Where the incident ray would have gone, and the emergent ray traced back: they meet at the
  // corner of the angle of deviation.
  const den = d[0] * ray.after[1] - d[1] * ray.after[0];
  const w = sub(ray.exit, ray.entry);
  const u = (w[0] * ray.after[1] - w[1] * ray.after[0]) / den;
  const meet = add(ray.entry, scale(d, u));
  const iArc = arc(ray.entry, scale(d, -1), n1, 15);
  const rArc = arc(ray.entry, ray.inside, scale(n1, -1), 15);
  const eArc = arc(ray.exit, ray.after, n2, 15);
  const dArc = arc(meet, d, ray.after, 22);
  const aArc = arc(t[0], sub(t[1], t[0]), sub(t[2], t[0]), 14);
  return (
    <g>
      <polygon class="ey-pr-glass" points={path(t)} data-part="prism" />
      {s.showNormals && (
        <g class="ey-pr-normal">
          <line
            x1={ray.entry[0] + n1[0] * normalLen}
            y1={ray.entry[1] + n1[1] * normalLen}
            x2={ray.entry[0] - n1[0] * normalLen}
            y2={ray.entry[1] - n1[1] * normalLen}
          />
          <line
            x1={ray.exit[0] + n2[0] * normalLen}
            y1={ray.exit[1] + n2[1] * normalLen}
            x2={ray.exit[0] - n2[0] * normalLen}
            y2={ray.exit[1] - n2[1] * normalLen}
          />
        </g>
      )}
      {s.showAngles && (
        <g class="ey-pr-extend">
          <line
            x1={ray.entry[0]}
            y1={ray.entry[1]}
            x2={meet[0] + d[0] * 40}
            y2={meet[1] + d[1] * 40}
          />
        </g>
      )}
      <polyline
        class="ey-pr-ray"
        data-part="ray"
        points={path([start, ray.entry, ray.exit, end])}
      />
      {s.showAngles && (
        <g class="ey-pr-angles" data-part="angles">
          <path d={iArc.d} />
          <path d={rArc.d} />
          <path d={eArc.d} />
          <path class="is-deviation" d={dArc.d} />
          <path d={aArc.d} />
          <Label at={iArc.label} text={`i ${num(s.incidence, 0)}°`} />
          <Label at={rArc.label} text={`r ${num(a.r1, 0)}°`} />
          <Label at={eArc.label} text={`e ${num(a.e ?? 0, 0)}°`} />
          <Label
            at={add(dArc.label, [6, 0])}
            text={`D ${num(a.deviation ?? 0, 0)}°`}
            cls="ey-pr-label is-deviation"
          />
          <Label at={[t[0][0], t[0][1] + 24]} text={`A ${PRISM_ANGLE}°`} />
        </g>
      )}
      {s.showNames && (
        <g class="ey-pr-names">
          <Label
            at={add(scale(add(start, ray.entry), 0.5), [-4, 12])}
            text={say(locale, WORDS.incident)}
            cls="ey-pr-name"
          />
          <Label
            at={[t[0][0], TOP + HEIGHT + 14]}
            text={say(locale, WORDS.refracted)}
            cls="ey-pr-name"
          />
          <Label
            at={add(scale(add(ray.exit, end), 0.5), [6, 14])}
            text={say(locale, WORDS.emergent)}
            cls="ey-pr-name"
          />
        </g>
      )}
    </g>
  );
}

function SpectrumPicture({ s, locale }: { s: PrismState; locale: string }) {
  const two = s.mode === PrismMode.Recombine;
  const t = prismAt(two ? 96 : 118);
  const second = two ? invertedNextTo(t, 4) : null;
  const { start, d } = incoming(t, s.incidence);
  const traced = COLOURS.map((c) => {
    const first = through(t, start, d, GLASS_INDEX[c]);
    if (first === null || first.after === null) return null;
    if (second === null) {
      return {
        c,
        points: [first.entry, first.exit, toEdge(first.exit, first.after, SCREEN_X)] as Vec[],
      };
    }
    const again = through(second, first.exit, first.after, GLASS_INDEX[c]);
    if (again === null || again.after === null) return null;
    return {
      c,
      points: [
        first.entry,
        first.exit,
        again.entry,
        again.exit,
        toEdge(again.exit, again.after),
      ] as Vec[],
    };
  });
  const hits = traced
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .map((r) => ({ c: r.c, at: r.points[r.points.length - 1] as Vec }));
  const entry = traced.find((r) => r !== null)?.points[0] ?? start;
  // Where the recombined beam is drawn as white again: on its way out, still inside the picture.
  const glow = ((): Vec | null => {
    const r = traced.find((x) => x !== null);
    if (second === null || r === undefined || r === null) return null;
    const from = r.points[r.points.length - 2] as Vec;
    const to = r.points[r.points.length - 1] as Vec;
    const d = unit(sub(to, from));
    const tx = d[0] > 1e-6 ? (290 - from[0]) / d[0] : Number.POSITIVE_INFINITY;
    const ty =
      d[1] < -1e-6
        ? (16 - from[1]) / d[1]
        : d[1] > 1e-6
          ? (H - 16 - from[1]) / d[1]
          : Number.POSITIVE_INFINITY;
    return add(from, scale(d, Math.max(0, Math.min(tx, ty))));
  })();
  return (
    <g>
      <rect class="ey-pr-slit" x={2} y={start[1] - 9} width={5} height={18} rx={1} />
      <line class="ey-pr-white" x1={start[0]} y1={start[1]} x2={entry[0]} y2={entry[1]} />
      <Label
        at={add(scale(add(start, entry), 0.5), [0, 13])}
        text={say(locale, WORDS.white)}
        cls="ey-pr-name is-on-dark"
      />
      {traced.map(
        (r) =>
          r !== null && (
            <polyline key={r.c} class={`ey-pr-colour ey-c-${r.c}`} points={path(r.points)} />
          ),
      )}
      <polygon class="ey-pr-glass is-dark" points={path(t)} data-part="prism" />
      {second !== null && (
        <polygon class="ey-pr-glass is-dark" points={path(second)} data-part="secondPrism" />
      )}
      {second === null && (
        <g data-part="spectrum">
          <rect class="ey-pr-screen" x={SCREEN_X} y={14} width={6} height={H - 28} rx={2} />
          {hits.map((h) => (
            <rect
              key={h.c}
              class={`ey-pr-band ey-c-${h.c}`}
              x={SCREEN_X}
              y={h.at[1] - 2.5}
              width={6}
              height={5}
            />
          ))}
          {s.showColourNames &&
            letterYs(hits.map((h) => h.at[1])).map((y, i) => {
              const h = hits[i] as { c: Colour };
              return (
                <text
                  key={h.c}
                  class={`ey-pr-letter ey-c-${h.c}`}
                  x={SCREEN_X + 13}
                  y={y + 3}
                  text-anchor="middle"
                >
                  {say(locale, LETTER[h.c])}
                </text>
              );
            })}
          <Label
            at={[SCREEN_X - 2, H - 4]}
            text={say(locale, WORDS.screen)}
            cls="ey-pr-name is-on-dark"
          />
        </g>
      )}
      {second !== null && glow !== null && (
        <g data-part="spectrum">
          <circle class="ey-pr-white-glow" cx={glow[0]} cy={glow[1]} r={7} />
          <Label
            at={[Math.min(glow[0], 280), glow[1] + (glow[1] < 40 ? 20 : -14)]}
            text={say(locale, WORDS.whiteAgain)}
            cls="ey-pr-name is-on-dark"
          />
        </g>
      )}
    </g>
  );
}

export function PrismView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as PrismState;
  const id = useId().replace(/:/g, "");
  const k = width / W;
  const height = Math.round(H * k);
  const isRay = s.mode === PrismMode.Ray;
  const turn = (by: number) =>
    call(PrismAction.SetIncidence, {
      deg: Math.max(INCIDENCE_MIN, Math.min(INCIDENCE_MAX, s.incidence + by)),
    });
  return (
    <div class="pr">
      <Stage
        label={describePrism(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "ey-pr-svg" }}
      >
        <clipPath id={`${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#${id}-frame)`}>
          <rect class={isRay ? "ey-pr-bg" : "ey-pr-bg is-dark"} x={0} y={0} width={W} height={H} />
          {isRay ? <RayPicture s={s} locale={locale} /> : <SpectrumPicture s={s} locale={locale} />}
        </g>
      </Stage>
      {(s.canSetIncidence || s.canSetMode) && (
        <div class="ey-pr-controls" data-part="controls">
          {s.canSetIncidence && (
            <div class="ey-pr-row">
              <span class="ey-pr-row-name">{say(locale, WORDS.turn)}</span>
              <button
                type="button"
                class="ey-button"
                disabled={s.incidence <= INCIDENCE_MIN}
                onClick={() => turn(-INCIDENCE_STEP)}
              >
                −
              </button>
              <span class="ey-pr-value">{`${num(s.incidence, 0)}°`}</span>
              <button
                type="button"
                class="ey-button"
                disabled={s.incidence >= INCIDENCE_MAX}
                onClick={() => turn(INCIDENCE_STEP)}
              >
                +
              </button>
            </div>
          )}
          {s.canSetMode && (
            <div class="ey-pr-row">
              {(
                [
                  [PrismMode.Dispersion, WORDS.one],
                  [PrismMode.Recombine, WORDS.two],
                ] as const
              ).map(([m, w]) => (
                <button
                  key={m}
                  type="button"
                  class={s.mode === m ? "ey-button is-on" : "ey-button"}
                  aria-pressed={s.mode === m}
                  onClick={() => call(PrismAction.SetMode, { mode: m })}
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
