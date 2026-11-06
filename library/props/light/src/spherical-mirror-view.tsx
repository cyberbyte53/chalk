import type { Locale } from "@chalk/content";
import { Arrowhead } from "@chalk/draw";
import { FrameStage, type PropViewProps, useDrags } from "@chalk/player";
import { type FramePixels, does, shows } from "@chalk/prop";
import type { JSX } from "preact";
import {
  APERTURE,
  ASPECT,
  ImageCase,
  type Mirror,
  MirrorKind,
  ObjectKind,
  PAD,
  type Pt,
  keepU,
  surfaceX,
  windowOf,
} from "./mirror";
import { sphericalMirror } from "./spherical-mirror";
import { KIND_WORDS, NATURE, PLACE_WORDS, WHERE_WORDS, caseLine, signed, word } from "./words";

type Props = PropViewProps<typeof sphericalMirror>;
type View = Props["view"];

/** The picture's pixels at a width: the window across, the axis through the middle, cm square. */
export function pixelsOf(s: Mirror, width: number): FramePixels {
  const w = windowOf(s);
  const height = Math.round(width * ASPECT);
  const scale = (width - 2 * PAD) / (w.xMax - w.xMin);
  const axis = height / 2;
  const toCm = (px: number) => w.xMin + (px - PAD) / scale;
  return {
    width,
    height,
    domain: { x: [toCm(0), toCm(width)], y: [-axis / scale, axis / scale] },
    toPx: (x, y = 0) => [PAD + (x - w.xMin) * scale, axis - y * scale],
    fromPx: (px, py = 0) => [toCm(px), (axis - py) / scale],
  };
}

const at = (px: FramePixels, p: Pt): Pt => px.toPx(p[0], p[1]);

/** Where a ray from `from` going `dir` (px) leaves the picture. */
function toEdge(from: Pt, dir: Pt, width: number, height: number): Pt {
  const [x, y] = from;
  const [dx, dy] = dir;
  let t = Number.POSITIVE_INFINITY;
  if (dx < 0) t = Math.min(t, -x / dx);
  if (dx > 0) t = Math.min(t, (width - x) / dx);
  if (dy < 0) t = Math.min(t, -y / dy);
  if (dy > 0) t = Math.min(t, (height - y) / dy);
  if (!Number.isFinite(t)) return from;
  return [x + dx * t, y + dy * t];
}

/** A piece of a ray: a line, its soft glow, and an arrowhead part way along. */
function RayLine({
  from,
  to,
  head = 0.55,
  isDashed = false,
}: {
  from: Pt;
  to: Pt;
  head?: number | null;
  isDashed?: boolean;
}): JSX.Element {
  const d = `M${from[0]} ${from[1]} L${to[0]} ${to[1]}`;
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  return (
    <g class={isDashed ? "lt-ray is-dashed" : "lt-ray"}>
      {!isDashed && <path class="lt-ray-glow" d={d} />}
      <path class="lt-ray-line" d={d} />
      {head !== null && length > 24 && (
        <Arrowhead
          class="lt-ray-head"
          at={[from[0] + (to[0] - from[0]) * head, from[1] + (to[1] - from[1]) * head]}
          toward={[to[0] - from[0], to[1] - from[1]]}
        />
      )}
    </g>
  );
}

/** The two rays from the object's tip: to the mirror, back out (to the picture's edge), dashed behind. */
function Rays({ s, px }: { s: View; px: FramePixels }): JSX.Element {
  return (
    <g class="lt-rays">
      {s.rays.map((r) => {
        const from = at(px, r.from);
        const hit = at(px, r.hit);
        const dir: Pt = [r.out[0], -r.out[1]];
        const out = toEdge(hit, dir, px.width, px.height);
        return (
          <g key={r.ray} class={`lt-ray-${r.ray}`}>
            <RayLine from={from} to={hit} />
            <RayLine from={hit} to={out} head={0.35} />
            {r.behind !== null && <RayLine from={hit} to={at(px, r.behind)} head={null} isDashed />}
          </g>
        );
      })}
    </g>
  );
}

/** The mirror: its face along the arc, its back hatched, its kind in its shape. */
function MirrorFace({ s, px }: { s: View; px: FramePixels }): JSX.Element {
  const a = APERTURE * s.focalLength;
  const steps = 32;
  const face = Array.from({ length: steps + 1 }, (_, k) => {
    const y = -a + (2 * a * k) / steps;
    return px.toPx(surfaceX(s, y), y);
  });
  const d = face.map(([x, y], k) => `${k === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  const hatch = face
    .filter((_, k) => k % 2 === 0)
    .map(([x, y]) => `M${x + 1.5} ${y} l6 -6`)
    .join(" ");
  return (
    <g class="lt-mirror" {...shows("mirror", s.kind, `a ${s.kind} mirror, f = ${signed(s.f)} cm`)}>
      <path class="lt-mirror-hatch" d={hatch} />
      <path class="lt-mirror-shine" d={d} />
      <path class="lt-mirror-face" d={d} />
    </g>
  );
}

/** P, F and C on the axis, named under it: beside it, when the object or its image stands there. */
function AxisPoints({ s, px, clear }: { s: View; px: FramePixels; clear: number }): JSX.Element {
  const points = [
    { name: "P", x: 0 },
    { name: "F", x: s.f },
    { name: "C", x: 2 * s.f },
  ];
  const feet = [s.u, ...(s.image === null ? [] : [s.image.v])].map((x) => px.toPx(x, 0)[0]);
  return (
    <g class="lt-points">
      {points.map((p) => {
        const [x, y] = px.toPx(p.x, 0);
        const isCovered = p.name !== "P" && feet.some((foot) => Math.abs(foot - x) < clear);
        const dx = p.name === "P" ? -9 : isCovered ? clear + 4 : 0;
        return (
          <g key={p.name} class="lt-point">
            <circle cx={x} cy={y} r={3} />
            <text x={x + dx} y={y + 17} text-anchor="middle">
              {p.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** A candle standing on (0, 0), its flame's tip `h` px up: drawn upright, flipped by its holder. */
function Candle({ h }: { h: number }): JSX.Element {
  const w = 0.13 * h;
  const top = -0.68 * h;
  const fw = 0.1 * h;
  const base = -0.7 * h;
  const flame = `M0 ${-h} C ${fw} ${-0.86 * h}, ${fw} ${base}, 0 ${base} C ${-fw} ${base}, ${-fw} ${-0.86 * h}, 0 ${-h} Z`;
  const cw = fw * 0.5;
  const core = `M0 ${-0.84 * h} C ${cw} ${-0.78 * h}, ${cw} ${base}, 0 ${base} C ${-cw} ${base}, ${-cw} ${-0.78 * h}, 0 ${-0.84 * h} Z`;
  return (
    <g class="lt-candle">
      <circle class="lt-halo" cx={0} cy={-0.83 * h} r={0.32 * h} />
      <rect class="lt-wax" x={-w} y={top} width={2 * w} height={-top} rx={0.04 * h} />
      <ellipse class="lt-wax-top" cx={0} cy={top} rx={w} ry={0.035 * h} />
      <line class="lt-wick" x1={0} y1={top} x2={0} y2={base} />
      <path class="lt-flame" d={flame} />
      <path class="lt-flame-core" d={core} />
    </g>
  );
}

/** An upright arrow on (0, 0), `h` px tall. */
function UprightArrow({ h }: { h: number }): JSX.Element {
  return (
    <g class="lt-arrow">
      <line x1={0} y1={0} x2={0} y2={-h + 4} />
      <Arrowhead at={[0, -h]} toward={[0, -1]} />
    </g>
  );
}

/** The object or its image: the candle or arrow at a foot, scaled by m (flipped when negative). */
function Figure({
  kind,
  foot,
  h,
  m = 1,
}: {
  kind: ObjectKind;
  foot: Pt;
  h: number;
  m?: number;
}): JSX.Element {
  // A thin image stays a candle: its width grows with |m|, but no wider than three times.
  const across = Math.min(Math.abs(m), 3);
  const up = Math.max(-40, Math.min(40, m));
  return (
    <g transform={`translate(${foot[0]} ${foot[1]}) scale(${across} ${up})`}>
      {kind === ObjectKind.Candle ? <Candle h={h} /> : <UprightArrow h={h} />}
    </g>
  );
}

function imageWords(s: View): string {
  if (s.image === null) return "the image is at infinity";
  const side = s.isReal ? "in front of the mirror" : "behind the mirror";
  return `the image at v = ${signed(s.image.v)} cm, ${side}, m = ${signed(s.image.m)}`;
}

/** The image: real, solid and in front; virtual, faint and dashed behind. */
function ImageFigure({ s, px, h }: { s: View; px: FramePixels; h: number }): JSX.Element | null {
  const img = s.image;
  if (img === null || s.imageCase === ImageCase.AtF)
    return <g {...shows("image", null, imageWords(s))} />;
  return (
    <g
      class={img.isReal ? "lt-image is-real" : "lt-image is-virtual"}
      {...shows("image", Math.round(img.v * 100) / 100, imageWords(s))}
    >
      <Figure kind={s.object} foot={px.toPx(img.v, 0)} h={h} m={img.m} />
    </g>
  );
}

/** The object, dragged along the axis by the student (to the half cm). */
function ObjectFigure({ s, px, h }: { s: View; px: FramePixels; h: number }): JSX.Element {
  const drag = useDrags();
  const foot = px.toPx(s.u, 0);
  const words = `u = ${signed(s.u)} cm`;
  return (
    <g
      class={s.canMoveObject ? "lt-object is-movable" : "lt-object"}
      {...drag({
        axis: "x",
        at: { x: s.u, y: 0 },
        place: (to) => ({ x: keepU(s, Math.round(to.x * 2) / 2), y: 0 }),
        isOn: s.canMoveObject,
        move: sphericalMirror.actions.moveObject,
        release: { action: sphericalMirror.actions.letGo },
        step: 0.5,
        words,
      })}
    >
      <rect class="lt-grab" x={foot[0] - 22} y={foot[1] - h - 12} width={44} height={h + 26} />
      <g {...shows("object", s.u, words)}>
        <Figure kind={s.object} foot={foot} h={h} />
      </g>
      {s.canMoveObject && (
        <g class="lt-grip" transform={`translate(${foot[0]} ${foot[1]})`}>
          <circle r={6} />
          <path d="M-12 0 l4 -3.5 v7 z M12 0 l-4 -3.5 v7 z" />
        </g>
      )}
    </g>
  );
}

/** Under the picture: where the object is, and what the image is, in the textbook's words. */
function CaseWords({ s, locale }: { s: View; locale: Locale }): JSX.Element | null {
  if (!s.showCase) return null;
  const c = s.imageCase;
  const isReal = c !== ImageCase.BetweenFAndP && c !== ImageCase.Convex;
  return (
    <div class="lt-case" key={c} {...shows("case", c, caseLine(c, locale))}>
      <p class="lt-case-place">{word(PLACE_WORDS[c], locale)}</p>
      <p class="lt-case-image">
        <span class="lt-case-where">{word(WHERE_WORDS[c], locale)}</span>
        {NATURE[c].map((w, i) => (
          <span key={i} class={`lt-chip ${i === 0 ? (isReal ? "is-real" : "is-virtual") : ""}`}>
            {word(w, locale)}
          </span>
        ))}
      </p>
    </div>
  );
}

function Numbers({ s }: { s: View }): JSX.Element | null {
  if (!s.showNumbers) return null;
  // Within "at F" the image is at infinity, as the words say: v and m are written ∞.
  const isFar = s.v === null || s.m === null || s.imageCase === ImageCase.AtF;
  const v = isFar || s.v === null ? "∞" : `${signed(s.v)} cm`;
  const m = isFar || s.m === null ? "∞" : signed(Math.round(s.m * 100) / 100);
  const text = `u = ${signed(s.u)} cm   v = ${v}   m = ${m}`;
  return (
    <p class="lt-numbers" {...shows("numbers", { u: s.u, v: s.v, m: s.m }, text)}>
      <span>u = {signed(s.u)} cm</span>
      <span>v = {v}</span>
      <span>m = {m}</span>
    </p>
  );
}

function KindSwitch({ s, locale }: { s: View; locale: Locale }): JSX.Element | null {
  if (!s.canSwitchKind) return null;
  return (
    <div class="lt-switch">
      {[MirrorKind.Concave, MirrorKind.Convex].map((kind) => (
        <button
          key={kind}
          type="button"
          class={kind === s.kind ? "lt-switch-button is-on" : "lt-switch-button"}
          aria-pressed={kind === s.kind}
          {...does(sphericalMirror.actions.setKind, { kind }, kind)}
        >
          {word(KIND_WORDS[kind], locale)}
        </button>
      ))}
    </div>
  );
}

/**
 * The mirror on a dark bench: the axis with P, F and C, the mirror's arc, the two rays, the image
 * and the object (dragged); under it the case in the textbook's words, and u, v, m.
 */
export function SphericalMirrorView(props: Props): JSX.Element {
  const { view: s, width, locale } = props;
  const px = pixelsOf(s, width);
  const scale = px.toPx(1, 0)[0] - px.toPx(0, 0)[0];
  const h = s.objectHeight * scale;
  const [, axisY] = px.toPx(0, 0);
  return (
    <div class="lt-mirror-prop">
      <FrameStage
        px={px}
        label={`A ${s.kind} mirror; ${caseLine(s.imageCase, "en")}`}
        look="lt-bench"
      >
        <rect class="lt-bench-bg" x={0} y={0} width={px.width} height={px.height} rx={14} />
        <line class="lt-axis" x1={0} y1={axisY} x2={px.width} y2={axisY} />
        <Rays s={s} px={px} />
        <ImageFigure s={s} px={px} h={h} />
        <AxisPoints s={s} px={px} clear={Math.max(10, 0.16 * h)} />
        <MirrorFace s={s} px={px} />
        <ObjectFigure s={s} px={px} h={h} />
      </FrameStage>
      <CaseWords s={s} locale={locale} />
      <Numbers s={s} />
      <KindSwitch s={s} locale={locale} />
    </div>
  );
}
