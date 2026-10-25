import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId, useRef } from "preact/hooks";
import { clipSegment } from "./bench/clip";
import {
  BOUNDARY_O,
  BOWL,
  COIN,
  EYE,
  INSET,
  MEDIA,
  MEDIA_ORDER,
  type Medium,
  RAY,
  RefractionAction,
  RefractionMode,
  RefractionSignal,
  type RefractionState,
  SCENE,
  SLAB,
  SLAB_THICKNESS,
  coinPath,
  incidenceAt,
  incidentStart,
  pixelsOf,
  refractedOf,
  speedText,
  surfaceOf,
} from "./refraction";

type Px = [number, number];

/** Radius of the angle arcs, px. */
const ARC = 26;
/** How close to a handle a press must be to take it, px. */
const GRAB = 30;
const RAD = Math.PI / 180;

const pt = (p: Px): string => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;

function Arrowhead({ from, to, at }: { from: Px; to: Px; at: number }): JSX.Element {
  const x = from[0] + (to[0] - from[0]) * at;
  const y = from[1] + (to[1] - from[1]) * at;
  const angle = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
  return (
    <path
      class="rf-head"
      d="M-7 -5 L5 0 L-7 5 Z"
      transform={`translate(${x} ${y}) rotate(${angle})`}
    />
  );
}

/** The stage's drawable box, px: rays are cut to it so none runs past the picture's edge. */
type ClipBox = { x0: number; y0: number; x1: number; y1: number };

function clipIn(a: Px, b: Px, box: ClipBox): [Px, Px] | null {
  const c = clipSegment(
    [a[0] - box.x0, a[1] - box.y0],
    [b[0] - box.x0, b[1] - box.y0],
    box.x1 - box.x0,
    box.y1 - box.y0,
  );
  if (c === null) return null;
  return [
    [c[0][0] + box.x0, c[0][1] + box.y0],
    [c[1][0] + box.x0, c[1][1] + box.y0],
  ];
}

function RaySegment({
  from,
  to,
  box,
  cls = "rf-ray",
}: { from: Px; to: Px; box: ClipBox; cls?: string }): JSX.Element | null {
  const c = clipIn(from, to, box);
  if (c === null || Math.hypot(c[1][0] - c[0][0], c[1][1] - c[0][1]) < 1) return null;
  const [a, b] = c;
  return (
    <g class={cls}>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
      <Arrowhead from={a} to={b} at={0.55} />
    </g>
  );
}

/** A plain (dashed or dotted) line, cut to the stage. */
function ClipLine({
  a,
  b,
  box,
  cls,
}: { a: Px; b: Px; box: ClipBox; cls: string }): JSX.Element | null {
  const c = clipIn(a, b, box);
  if (c === null) return null;
  return <line class={cls} x1={c[0][0]} y1={c[0][1]} x2={c[1][0]} y2={c[1][1]} />;
}

/** An arc at `c` from the normal (up when `up`, else down) turning `deg` degrees to the left (up) or right (down). */
function arc(c: Px, deg: number, up: boolean): string {
  const s = Math.sin(deg * RAD) * ARC;
  const k = Math.cos(deg * RAD) * ARC;
  return up
    ? `M${c[0]} ${c[1] - ARC} A${ARC} ${ARC} 0 0 0 ${c[0] - s} ${c[1] - k}`
    : `M${c[0]} ${c[1] + ARC} A${ARC} ${ARC} 0 0 0 ${c[0] + s} ${c[1] + k}`;
}

function Eye({ at }: { at: Px }): JSX.Element {
  return (
    <g class="rf-eye" transform={`translate(${at[0]} ${at[1]}) rotate(-20)`}>
      <path d="M-13 0 Q0 -10 13 0 Q0 10 -13 0 Z" />
      <circle cx={-3} cy={0} r={4} />
    </g>
  );
}

/** The few words the prop shows, per language. */
const WORDS = {
  en: { from: "light comes from:", into: "light goes into:", emergence: "e = angle of emergence" },
  hi: { from: "प्रकाश यहाँ से आता है:", into: "प्रकाश यहाँ जाता है:", emergence: "e = निर्गत कोण" },
} as const;

/** ‹ name › for one medium: steps through Table 10.3. */
function Chooser({
  value,
  locale,
  onChange,
  part,
  showIndex,
  caption,
}: {
  value: Medium;
  showIndex: boolean;
  /** Words saying which side this medium is: "light comes from:" / "light goes into:". */
  caption: string;
  locale: string;
  onChange: (m: Medium) => void;
  part: string;
}): JSX.Element {
  const k = MEDIA_ORDER.indexOf(value);
  const name = (m: Medium) => (locale === "hi" ? MEDIA[m].hi : MEDIA[m].en);
  const prev = MEDIA_ORDER[k - 1];
  const next = MEDIA_ORDER[k + 1];
  return (
    <div class="rf-choose" data-part={part}>
      <span class="rf-choose-caption">{caption}</span>
      <button
        type="button"
        class="rf-step"
        aria-label={prev === undefined ? name(value) : name(prev)}
        disabled={prev === undefined}
        onClick={() => prev !== undefined && onChange(prev)}
      >
        ‹
      </button>
      <span class="rf-choose-name">
        {name(value)} {showIndex && <span class="rf-n">n = {MEDIA[value].n}</span>}
      </span>
      <button
        type="button"
        class="rf-step"
        aria-label={next === undefined ? name(value) : name(next)}
        disabled={next === undefined}
        onClick={() => next !== undefined && onChange(next)}
      >
        ›
      </button>
    </div>
  );
}

/** Two media and the ray between them; or the glass slab; or the coin in the bowl. */
export function RefractionView({ view, width, call, signal, locale }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as RefractionState;
  const svg = useRef<SVGSVGElement | null>(null);
  const px = pixelsOf(width);
  const P = (x: number, y: number): Px => [px.x(x), px.y(y)];
  const box: ClipBox = { x0: px.x(0), y0: px.y(SCENE.height), x1: px.x(SCENE.width), y1: px.y(0) };
  const clipId = `rf-clip-${useId()}`;
  const name = (m: Medium) => (locale === "hi" ? MEDIA[m].hi : MEDIA[m].en);
  const words = locale === "hi" ? WORDS.hi : WORDS.en;
  const label = (m: Medium) => (s.showSpeeds ? `${name(m)} · ${speedText(m)}` : name(m));

  const isCoin = s.mode === RefractionMode.Coin;
  const isSlab = s.mode === RefractionMode.Slab;

  const pointerCm = (event: { clientX: number; clientY: number }): [number, number] | null => {
    const rect = svg.current?.getBoundingClientRect();
    if (rect === undefined) return null;
    const k = width / rect.width;
    return px.toCm((event.clientX - rect.left) * k, (event.clientY - rect.top) * k);
  };
  const handle = (): Px =>
    isCoin
      ? P(BOWL.left + 1.2, surfaceOf(s.water))
      : (() => {
          const [x, y] = incidentStart(s);
          return P(x, y);
        })();
  const drag = useRef<boolean>(false);
  const onPointerDown = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    const cm = pointerCm(event);
    if (cm === null) return;
    const [hx, hy] = handle();
    if (Math.hypot(px.x(cm[0]) - hx, px.y(cm[1]) - hy) > GRAB) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = true;
  };
  const moveTo = (cm: [number, number]) => {
    if (isCoin) {
      const level =
        Math.round(Math.min(1, Math.max(0, (cm[1] - BOWL.floor) / (BOWL.rim - BOWL.floor))) * 20) /
        20;
      if (level !== s.water) call(RefractionAction.SetWater, { level });
    } else {
      const deg = incidenceAt(s, cm[0], cm[1]);
      if (deg !== s.incidence) call(RefractionAction.SetIncidence, { deg });
    }
  };
  const onPointerMove = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    if (!drag.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const cm = pointerCm(event);
    if (cm !== null) moveTo(cm);
  };
  const release = () =>
    signal(RefractionSignal.Released, isCoin ? { water: s.water } : { incidence: s.incidence });
  const onPointerUp = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    drag.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    release();
  };
  const onKeyDown = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    const up = event.key === "ArrowUp" || event.key === "ArrowRight";
    const down = event.key === "ArrowDown" || event.key === "ArrowLeft";
    if (!up && !down) return;
    event.preventDefault();
    if (isCoin) {
      const level = Math.min(1, Math.max(0, Math.round((s.water + (up ? 0.05 : -0.05)) * 20) / 20));
      call(RefractionAction.SetWater, { level });
      signal(RefractionSignal.Released, { water: level });
    } else {
      // Right / up opens the angle out, left / down brings it towards the normal.
      const deg = Math.min(80, Math.max(0, s.incidence + (up ? 1 : -1)));
      call(RefractionAction.SetIncidence, { deg });
      signal(RefractionSignal.Released, { incidence: deg });
    }
  };

  const svgProps = {
    ref: svg,
    class: "rf-svg",
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  };
  const h = handle();
  const Handle = (
    <g
      class="rf-handle"
      tabIndex={0}
      onKeyDown={onKeyDown}
      transform={`translate(${h[0]} ${h[1]})`}
    >
      {isCoin ? (
        // The water surface's grab handle: a pill with ▲ ▼, so it reads as "drag me up or down".
        <>
          <rect class="rf-handle-halo" x={-17} y={-21} width={34} height={42} rx={17} />
          <rect class="rf-grip" x={-11} y={-15} width={22} height={30} rx={11} />
          <path class="rf-grip-arrow" d="M0 -11 L5 -4 L-5 -4 Z M0 11 L5 4 L-5 4 Z" />
        </>
      ) : (
        <>
          <circle class="rf-handle-halo" r={15} />
          <circle class="rf-handle-dot" r={5.5} />
        </>
      )}
    </g>
  );

  let picture: JSX.Element;
  let caption: string;
  if (isCoin) {
    const hy = surfaceOf(s.water);
    const path = coinPath(s);
    const seen = path !== null;
    caption = `A coin in a bowl ${s.water === 0 ? "with no water" : `filled ${Math.round(s.water * 100)}%`}; the coin is ${seen ? "seen" : "hidden"}`;
    // Without water: the eye's line over the rim, which passes beyond the coin.
    const overRim = (() => {
      const slope = (BOWL.rim - EYE.y) / (BOWL.right - EYE.x);
      const x = BOWL.right + (BOWL.floor - BOWL.rim) / slope;
      return P(x, BOWL.floor);
    })();
    picture = (
      <>
        <rect
          class="rf-top"
          x={px.x(0)}
          y={px.y(SCENE.height)}
          width={px.x(SCENE.width) - px.x(0)}
          height={px.y(0) - px.y(SCENE.height)}
          rx={10}
        />
        {s.water > 0 && (
          <rect
            class="rf-bottom"
            x={px.x(BOWL.left)}
            y={px.y(hy)}
            width={px.x(BOWL.right) - px.x(BOWL.left)}
            height={px.y(BOWL.floor) - px.y(hy)}
          />
        )}
        {s.water > 0 && (
          <line
            class="rf-interface"
            x1={px.x(BOWL.left)}
            y1={px.y(hy)}
            x2={px.x(BOWL.right)}
            y2={px.y(hy)}
          />
        )}
        <path
          class="rf-bowl"
          d={`M${pt(P(BOWL.left, BOWL.rim))} L${pt(P(BOWL.left, BOWL.floor))} L${pt(P(BOWL.right, BOWL.floor))} L${pt(P(BOWL.right, BOWL.rim))}`}
        />
        <ellipse
          class="rf-coin"
          cx={px.x(COIN.x)}
          cy={px.y(BOWL.floor) - 3}
          rx={COIN.halfWidth * px.scale}
          ry={3}
        />
        {path !== null ? (
          <>
            <ClipLine
              box={box}
              cls="rf-sight"
              a={[px.x(EYE.x), px.y(EYE.y)]}
              b={[px.x(path.apparent[0]), px.y(path.apparent[1])]}
            />
            <ellipse
              class="rf-coin is-apparent"
              cx={px.x(path.apparent[0])}
              cy={px.y(path.apparent[1]) - 3}
              rx={COIN.halfWidth * px.scale}
              ry={3}
            />
            <RaySegment
              box={box}
              from={P(path.floor[0], path.floor[1])}
              to={P(path.surface[0], path.surface[1])}
            />
            <RaySegment box={box} from={P(path.surface[0], path.surface[1])} to={P(EYE.x, EYE.y)} />
          </>
        ) : (
          <ClipLine
            box={box}
            cls="rf-sight"
            a={[px.x(EYE.x), px.y(EYE.y)]}
            b={[overRim[0], overRim[1]]}
          />
        )}
        <Eye at={P(EYE.x, EYE.y)} />
        {s.water > 0 && (
          <text
            class="rf-label"
            x={px.x(BOWL.right) - 6}
            y={px.y(BOWL.floor) - 10}
            text-anchor="end"
          >
            {label(s.bottom)}
          </text>
        )}
        <text
          class="rf-label"
          x={px.x(SCENE.width) - 8}
          y={px.y(SCENE.height) + 16}
          text-anchor="end"
        >
          {label(s.top)}
        </text>
      </>
    );
  } else {
    const o: Px = isSlab ? P(SLAB.enterX, SLAB.top) : P(BOUNDARY_O.x, BOUNDARY_O.y);
    const [sx, sy] = incidentStart(s);
    const start = P(sx, sy);
    const rDeg = refractedOf(s);
    const i = Math.round(s.incidence);
    const r = rDeg === null ? null : Math.round(rDeg);
    const inc = s.incidence * RAD;
    caption = `A ray in ${MEDIA[s.top].en} meets ${MEDIA[s.bottom].en} at ${i} degrees to the normal${r === null ? "; there is no refracted ray" : ` and is refracted at ${r} degrees`}`;
    // The dotted straight-on line: the incident ray carried on as if nothing bent it.
    const onwardLen = isSlab ? SLAB_THICKNESS / Math.cos(inc) + RAY.out : RAY.boundary;
    const oCm: [number, number] = isSlab ? [SLAB.enterX, SLAB.top] : [BOUNDARY_O.x, BOUNDARY_O.y];
    const onward = P(oCm[0] + onwardLen * Math.sin(inc), oCm[1] - onwardLen * Math.cos(inc));

    let refracted: JSX.Element | null = null;
    let emergent: JSX.Element | null = null;
    let exitPx: Px | null = null;
    if (rDeg !== null) {
      const rr = rDeg * RAD;
      if (isSlab) {
        const exitCm: [number, number] = [SLAB.enterX + SLAB_THICKNESS * Math.tan(rr), SLAB.bottom];
        exitPx = P(exitCm[0], exitCm[1]);
        refracted = <RaySegment box={box} from={o} to={exitPx} />;
        emergent = (
          <RaySegment
            box={box}
            from={exitPx}
            to={P(exitCm[0] + RAY.out * Math.sin(inc), exitCm[1] - RAY.out * Math.cos(inc))}
          />
        );
      } else {
        refracted = (
          <RaySegment
            box={box}
            from={o}
            to={P(oCm[0] + RAY.boundary * Math.sin(rr), oCm[1] - RAY.boundary * Math.cos(rr))}
          />
        );
      }
    }
    const normalLen = 3.4 * px.scale;
    const readout = (() => {
      if (!s.showSines || rDeg === null || s.incidence === 0) return null;
      const si = Math.sin(inc);
      const sr = Math.sin(rDeg * RAD);
      const lines = [
        `sin i = ${si.toFixed(2)}`,
        `sin r = ${sr.toFixed(2)}`,
        `sin i / sin r = ${(si / sr).toFixed(2)}`,
        `i / r = ${(s.incidence / rDeg).toFixed(2)}`,
      ];
      return (
        <g class="rf-readout">
          {lines.map((line, k) => (
            <text key={line} x={px.x(0) + 10} y={px.height - 12 - (lines.length - 1 - k) * 19}>
              {line}
            </text>
          ))}
        </g>
      );
    })();

    picture = (
      <>
        {isSlab ? (
          <>
            <rect
              class="rf-top"
              x={px.x(0)}
              y={px.y(SCENE.height)}
              width={px.x(SCENE.width) - px.x(0)}
              height={px.y(0) - px.y(SCENE.height)}
              rx={10}
            />
            <rect
              class="rf-bottom rf-slab"
              x={px.x(SLAB.left)}
              y={px.y(SLAB.top)}
              width={px.x(SLAB.right) - px.x(SLAB.left)}
              height={px.y(SLAB.bottom) - px.y(SLAB.top)}
            />
          </>
        ) : (
          <>
            <rect
              class="rf-top"
              x={px.x(0)}
              y={px.y(SCENE.height)}
              width={px.x(SCENE.width) - px.x(0)}
              height={o[1] - px.y(SCENE.height)}
            />
            <rect
              class="rf-bottom"
              x={px.x(0)}
              y={o[1]}
              width={px.x(SCENE.width) - px.x(0)}
              height={px.y(0) - o[1]}
            />
            <line class="rf-interface" x1={px.x(0)} y1={o[1]} x2={px.x(SCENE.width)} y2={o[1]} />
          </>
        )}
        {s.showNormal && (
          <>
            <ClipLine
              box={box}
              cls="rf-normal"
              a={[o[0], o[1] - normalLen]}
              b={[o[0], o[1] + normalLen]}
            />
            {exitPx !== null && (
              <ClipLine
                box={box}
                cls="rf-normal"
                a={[exitPx[0], exitPx[1] - normalLen]}
                b={[exitPx[0], exitPx[1] + normalLen]}
              />
            )}
          </>
        )}
        {s.showIncidentExtension && s.incidence > 0 && (
          <ClipLine box={box} cls="rf-onward" a={[o[0], o[1]]} b={[onward[0], onward[1]]} />
        )}
        {s.showAngles && (
          <g class="rf-angles">
            {i > 0 && <path d={arc(o, s.incidence, true)} />}
            {r !== null && r > 0 && <path d={arc(o, rDeg ?? 0, false)} />}
            {exitPx !== null && i > 0 && <path d={arc(exitPx, s.incidence, false)} />}
            <text class="rf-angle-label" x={o[0] - ARC - 8} y={o[1] - 8} text-anchor="end">
              i = {i}°
            </text>
            {r !== null && (
              <text
                class="rf-angle-label"
                x={o[0] + ARC + 6}
                y={o[1] + ARC + 6}
                text-anchor="start"
              >
                r = {r}°
              </text>
            )}
            {exitPx !== null && (
              <text
                class="rf-angle-label"
                x={exitPx[0] + ARC + 6}
                y={exitPx[1] + ARC + 6}
                text-anchor="start"
              >
                e = {i}°
              </text>
            )}
            {exitPx !== null && (
              <text
                class="rf-legend"
                x={px.x(SCENE.width) - 10}
                y={px.height - 14}
                text-anchor="end"
              >
                {words.emergence}
              </text>
            )}
          </g>
        )}
        <RaySegment box={box} from={start} to={o} />
        {refracted}
        {emergent}
        {isSlab && (
          <>
            <text class="rf-point" x={o[0] - 8} y={o[1] + 14} text-anchor="end">
              O
            </text>
            {exitPx !== null && (
              <text class="rf-point" x={exitPx[0] - 8} y={exitPx[1] - 6} text-anchor="end">
                O′
              </text>
            )}
          </>
        )}
        <text
          class="rf-label"
          x={px.x(SCENE.width) - 8}
          y={px.y(SCENE.height) + 16}
          text-anchor="end"
        >
          {label(s.top)}
        </text>
        <text
          class="rf-label"
          x={px.x(isSlab ? SLAB.right : SCENE.width) - 8}
          y={isSlab ? px.y(SLAB.bottom) - 8 : px.height - 12}
          text-anchor="end"
        >
          {label(s.bottom)}
        </text>
        {readout}
      </>
    );
  }

  return (
    <div class="rf">
      <Stage
        label={caption}
        x={[0, SCENE.width]}
        y={[0, SCENE.height]}
        width={width}
        height={px.height}
        inset={INSET}
        svg={svgProps}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={box.x0} y={box.y0} width={box.x1 - box.x0} height={box.y1 - box.y0} rx={10} />
          </clipPath>
        </defs>
        <g clip-path={`url(#${clipId})`}>{picture}</g>
        {Handle}
      </Stage>
      {s.canChooseMedium && (
        <div class="rf-controls">
          {s.mode === RefractionMode.Boundary && (
            <Chooser
              value={s.top}
              locale={locale}
              part="top"
              showIndex={s.showIndex}
              caption={words.from}
              onChange={(medium) => call(RefractionAction.SetMedium, { which: "top", medium })}
            />
          )}
          <Chooser
            value={s.bottom}
            locale={locale}
            part="bottom"
            showIndex={s.showIndex}
            caption={words.into}
            onChange={(medium) => call(RefractionAction.SetMedium, { which: "bottom", medium })}
          />
        </div>
      )}
    </div>
  );
}
