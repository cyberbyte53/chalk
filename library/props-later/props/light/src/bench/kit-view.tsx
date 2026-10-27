import { type FrameContextValue, type PartAttrs, leafView, useTheme } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { type Px, clipSegment } from "./clip";
import {
  Look,
  ObjectStyle,
  type OpticRay,
  RAY,
  RAY_BUTTON,
  RULER_ROW,
  type RayButtonsState,
  type RayPiece,
  axisPoints,
  bench,
  focalStepper,
  marker,
  opticImage,
  opticObject,
  opticRays,
  opticScreen,
  rayButtons,
  readout,
} from "./kit";

/** Arrowhead length, px. */
const HEAD = 9;
/** How far below the axis its points are named, px. */
const LABEL = 18;
/** How close to a handle a press must be to take it, px. */
const GRAB = 28;

type Frame = FrameContextValue;
const at = (frame: Frame, p: readonly [number, number]): Px => {
  const [x, y] = frame.px.toPx(p[0], p[1]);
  return [x, y];
};

/** A small filled triangle pointing along (dx, dy) with its tip at (x, y). */
export function Head({
  x,
  y,
  dx,
  dy,
  look,
}: { x: number; y: number; dx: number; dy: number; look: Look }): JSX.Element {
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <path
      class={`${look}-head`}
      d={`M0 0 L${-HEAD} ${-HEAD * 0.55} L${-HEAD} ${HEAD * 0.55} Z`}
      transform={`translate(${x} ${y}) rotate(${angle})`}
    />
  );
}

/** A straight piece of ray with one arrowhead part way along. */
function Segment({
  from,
  to,
  at: share = 0.55,
  look,
}: { from: Px; to: Px; at?: number; look: Look }): JSX.Element {
  const [x1, y1] = from;
  const [x2, y2] = to;
  return (
    <g class={`${look}-ray`}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <Head
        x={x1 + (x2 - x1) * share}
        y={y1 + (y2 - y1) * share}
        dx={x2 - x1}
        dy={y2 - y1}
        look={look}
      />
    </g>
  );
}

/** An upright arrow from the axis to its tip, in px. */
export function Arrow({
  foot,
  tip,
  cls,
  look,
}: { foot: Px; tip: Px; cls: string; look: Look }): JSX.Element {
  return (
    <g class={cls}>
      <line x1={foot[0]} y1={foot[1]} x2={tip[0]} y2={tip[1]} />
      <Head x={tip[0]} y={tip[1]} dx={0} dy={tip[1] - foot[1]} look={look} />
    </g>
  );
}

/** A phone held upside down, its screen facing the lens: from the axis up to the tip, in px. */
function Phone({ foot, tip }: { foot: Px; tip: Px }): JSX.Element {
  const h = Math.abs(foot[1] - tip[1]);
  const w = Math.max(8, Math.min(16, h * 0.45));
  const top = Math.min(foot[1], tip[1]);
  return (
    <g class="ln-phone">
      <rect class="ln-phone-body" x={foot[0] - w / 2} y={top} width={w} height={h} rx={3} />
      <rect
        class="ln-phone-glass"
        x={foot[0] + w / 2 - 3}
        y={top + 3}
        width={2.5}
        height={Math.max(0, h - 6)}
        rx={1}
      />
      {/* The camera bump sits at the phone's top, which is at the bottom when held upside down. */}
      <circle class="ln-phone-cam" cx={foot[0] - w / 4} cy={top + h - 4} r={1.6} />
    </g>
  );
}

/**
 * A small name past an arrow's tip (the mirror's way): above an upright arrow, below an inverted
 * one, kept inside the stage.
 */
function MirrorName({
  tip,
  foot,
  text,
  cls,
  width,
}: { tip: Px; foot: Px; text: string; cls: string; width: number }): JSX.Element {
  const isUp = tip[1] <= foot[1];
  const x = Math.min(width - 30, Math.max(30, tip[0]));
  const y = isUp ? tip[1] - 20 : tip[1] + 28;
  return (
    <text class={`sm-arrow-name ${cls}`} x={x} y={y} text-anchor="middle">
      {text}
    </text>
  );
}

const NAMES = {
  object: { en: "object", hi: "वस्तु" },
  phone: { en: "phone", hi: "फ़ोन" },
  image: { en: "image", hi: "प्रतिबिंब" },
} as const;
const nameIn = (k: keyof typeof NAMES, locale: string) =>
  locale === "hi" ? NAMES[k].hi : NAMES[k].en;

// ---- the bench ----

export const BenchView = leafView(bench, ({ s, frame, part }) => {
  const look = useTheme() as Look;
  if (frame === null) return null;
  const { width, height } = frame.px;
  const [, axisY] = at(frame, [0, 0]);
  return (
    <g {...part("bench")}>
      <rect class={`${look}-bg`} x={0} y={0} width={width} height={height} rx={12} />
      {s.ticks.length > 0 && (
        <g class={`${look}-ruler`} {...part("ruler")}>
          {s.ticks.map((x) => {
            const [px, py] = at(frame, [x, 0]);
            const isMajor = x % 10 === 0;
            return (
              <g key={x}>
                <line x1={px} y1={py} x2={px} y2={py + (isMajor ? 8 : 5)} />
                {isMajor && (
                  <text x={px} y={py + RULER_ROW} text-anchor="middle">
                    {Math.abs(x)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      )}
      <line class={`${look}-axis`} x1={0} y1={axisY} x2={width} y2={axisY} />
    </g>
  );
});

// ---- points on the axis ----

export const AxisPointsView = leafView(axisPoints, ({ s, frame, part }) => {
  const look = useTheme() as Look;
  if (frame === null) return null;
  return (
    <g>
      {s.points.map((p) => {
        const [px, py] = at(frame, [p.x, 0]);
        return (
          <g key={p.id} class={`${look}-mark`} {...part("point", p.id)}>
            <circle cx={px} cy={py} r={3.5} />
            {s.showNames && (
              <text x={px} y={py + LABEL} text-anchor="middle">
                {p.name}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
});

// ---- the object ----

export const OpticObjectView = leafView(opticObject, ({ s, frame, part, grab, locale }) => {
  const look = useTheme() as Look;
  if (frame === null) return null;
  const { width } = frame.px;
  const foot = at(frame, [s.x, 0]);
  const tip = at(frame, [s.x, s.height]);
  const art =
    s.style === ObjectStyle.Phone ? (
      <Phone foot={foot} tip={tip} />
    ) : (
      <Arrow foot={foot} tip={tip} cls="" look={look} />
    );
  const handle = <circle class={`${look}-handle`} cx={tip[0]} cy={tip[1]} r={14} />;
  const hit = (
    <circle
      class="bench-grab"
      cx={tip[0]}
      cy={tip[1]}
      r={GRAB}
      fill="transparent"
      onPointerDown={grab("object")}
    />
  );
  if (look === Look.Mirror)
    return (
      <>
        {s.name !== null && (
          <MirrorName
            tip={tip}
            foot={foot}
            text={nameIn(s.name, locale)}
            cls="sm-name-object"
            width={width}
          />
        )}
        <g class="sm-object" {...part("object")}>
          {art}
          {handle}
        </g>
        {hit}
      </>
    );
  const lensObject = (
    <g class="ln-object" {...part("object")}>
      {art}
      {handle}
      {s.name !== null && (
        <text
          class="ln-name"
          x={Math.max(34, Math.min(width - 34, foot[0]))}
          y={Math.max(12, tip[1] - 18)}
          text-anchor="middle"
        >
          {nameIn(s.name, locale)}
        </text>
      )}
    </g>
  );
  // The touch area sits outside the styled group, so the look's rules never draw it.
  return (
    <>
      {lensObject}
      {hit}
    </>
  );
});

// ---- the image ----

export const OpticImageView = leafView(opticImage, ({ s, frame, part, locale }) => {
  const look = useTheme() as Look;
  if (frame === null) return null;
  const { width, height } = frame.px;
  const caption = (text: string) => (
    <text class={`${look}-caption`} {...part("image")} x={12} y={height - 10}>
      {text}
    </text>
  );
  if (s.tip === null) return caption(s.whenInfinite);
  const foot = at(frame, [s.tip.x, 0]);
  const tip = at(frame, [s.tip.x, s.tip.height]);
  const fits =
    tip[0] >= 8 &&
    tip[0] <= width - 8 &&
    tip[1] >= 8 &&
    tip[1] <= height - 8 &&
    (look === Look.Lens || (foot[0] >= 8 && foot[0] <= width - 8));
  if (!fits) return caption(s.whenOutside);
  const virtual = s.tip.isReal ? "" : " is-virtual";
  if (look === Look.Mirror)
    return (
      <g {...part("image")}>
        <Arrow foot={foot} tip={tip} cls={`sm-image${virtual}`} look={look} />
        {s.showName && (
          <MirrorName
            tip={tip}
            foot={foot}
            text={nameIn("image", locale)}
            cls="sm-name-image"
            width={width}
          />
        )}
      </g>
    );
  const isNearRight = foot[0] > width - 72;
  return (
    <g {...part("image")}>
      <Arrow
        foot={foot}
        tip={tip}
        cls={`ln-image${virtual}${s.isDim ? " is-dim" : ""}`}
        look={look}
      />
      {s.showName && (
        <text
          class="ln-name is-image"
          x={foot[0] + (isNearRight ? -7 : 7)}
          y={tip[1] + (s.tip.height < 0 ? -4 : 12)}
          text-anchor={isNearRight ? "end" : "start"}
        >
          {nameIn("image", locale)}
        </text>
      )}
    </g>
  );
});

// ---- rays ----

/** A piece's two ends in px: its `to`, or on along `toward` to the picture's edge. */
export function pieceEnds(frame: Frame, p: RayPiece): [Px, Px] {
  const from = at(frame, p.from);
  if (p.to !== undefined) {
    const to = at(frame, p.to);
    if (p.fromLeftEdge !== true) return [from, to];
    // In from the left edge, along the line from `from` to `to`.
    const dx = to[0] - from[0];
    if (Math.abs(dx) < 1e-9) return [from, to];
    return [[0, from[1] + ((to[1] - from[1]) * (0 - from[0])) / dx], to];
  }
  const base = p.via === undefined ? from : at(frame, p.via);
  const dir = p.toward ?? [1, 0];
  const origin = p.via ?? p.from;
  const ahead = at(frame, [origin[0] + dir[0], origin[1] + dir[1]]);
  const dx = ahead[0] - base[0];
  const dy = ahead[1] - base[1];
  if (p.edge === "left") {
    if (Math.abs(dx) < 1e-9) return [from, ahead];
    const t = (0 - base[0]) / dx;
    return [from, [0, base[1] + dy * t]];
  }
  // To the right edge; a direction that doesn't go right stays where it is.
  if (dx <= 1e-9) return [from, from];
  const t = (frame.px.width - base[0]) / dx;
  return [from, [frame.px.width, base[1] + dy * t]];
}

function RayDraw({
  ray,
  frame,
  look,
  tag,
}: { ray: OpticRay; frame: Frame; look: Look; tag: PartAttrs | undefined }) {
  const { width, height } = frame.px;
  return (
    <g {...tag}>
      {ray.pieces.map((p, i) => {
        const [a, b] = pieceEnds(frame, p);
        const c = clipSegment(a, b, width, height);
        if (c === null) return null;
        if (p.isDashed)
          return (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: pieces are fixed per ray
              key={i}
              class={`${look}-dashed`}
              x1={c[0][0]}
              y1={c[0][1]}
              x2={c[1][0]}
              y2={c[1][1]}
            />
          );
        if (Math.hypot(c[1][0] - c[0][0], c[1][1] - c[0][1]) < 1) return null;
        return (
          <Segment
            // biome-ignore lint/suspicious/noArrayIndexKey: pieces are fixed per ray
            key={i}
            from={c[0]}
            to={c[1]}
            look={look}
            {...(p.at !== undefined ? { at: p.at } : {})}
          />
        );
      })}
    </g>
  );
}

export const OpticRaysView = leafView(opticRays, ({ s, frame, part }) => {
  const look = useTheme() as Look;
  if (frame === null) return null;
  // A ray is a part while it says what it is (a spare one drawn for a moment isn't).
  const rayPart = (r: OpticRay) => (r.says === "" ? undefined : part("ray", `${RAY}${r.id}`));
  const rays = s.rays.filter((r) => r.kind === "ray");
  const beam = s.rays.filter((r) => r.kind === "beam");
  return (
    <g>
      {rays.map((r) => (
        <RayDraw key={r.id} ray={r} frame={frame} look={look} tag={rayPart(r)} />
      ))}
      {beam.length > 0 && (
        <g class={`${look}-beam`} {...part("beam")}>
          {beam.map((r) => (
            <RayDraw key={r.id} ray={r} frame={frame} look={look} tag={rayPart(r)} />
          ))}
          {s.spots.map((p) => {
            const [x, y] = at(frame, p);
            return <circle key={`${x},${y}`} class={`${look}-spot`} cx={x} cy={y} r={7} />;
          })}
        </g>
      )}
    </g>
  );
});

// ---- a screen ----

export const OpticScreenView = leafView(opticScreen, ({ s, frame, part, grab }) => {
  const look = useTheme() as Look;
  const id = useId();
  if (frame === null) return null;
  const { width, height } = frame.px;
  const blurId = `${look}-blur-${id}`;
  const [sx, top] = at(frame, [s.x, s.half]);
  const [, bottom] = at(frame, [s.x, -s.half]);
  const cone = s.cone.map((p, i) => {
    const c = clipSegment(...pieceEnds(frame, p), width, height);
    if (c === null) return null;
    return (
      <line
        // biome-ignore lint/suspicious/noArrayIndexKey: the cone's pieces are fixed
        key={i}
        class={look === Look.Lens ? "ln-cone" : undefined}
        x1={c[0][0]}
        y1={c[0][1]}
        x2={c[1][0]}
        y2={c[1][1]}
      />
    );
  });
  const movable = s.canMove ? " is-movable" : "";
  /** px per cm. */
  const scale = frame.px.toPx(1, 0)[0] - frame.px.toPx(0, 0)[0];

  if (look === Look.Mirror) {
    const k = s.caught;
    const picture = ((): JSX.Element => {
      if (k === null)
        return (
          <rect
            class="sm-patch"
            x={sx - 3}
            y={top + 6}
            width={6}
            height={bottom - top - 12}
            rx={3}
          />
        );
      const foot = at(frame, [s.x, 0]);
      const tip = at(frame, [s.x, k.height]);
      const [, patchTop] = at(frame, [s.x, k.height + k.blur]);
      const [, patchBottom] = at(frame, [s.x, k.height - k.blur]);
      return (
        <g class={k.isSharp ? "sm-caught is-sharp" : "sm-caught"}>
          {k.isSharp ? (
            <circle
              class="sm-glow"
              cx={tip[0]}
              cy={(tip[1] + foot[1]) / 2}
              r={Math.max(14, Math.abs(tip[1] - foot[1]) / 2 + 8)}
            />
          ) : (
            <rect
              class="sm-patch is-real"
              x={sx - 5}
              y={Math.max(top, patchTop)}
              width={10}
              height={Math.max(2, Math.min(bottom, patchBottom) - Math.max(top, patchTop))}
              rx={4}
              filter={`url(#${blurId})`}
            />
          )}
          <g filter={k.isSharp ? undefined : `url(#${blurId})`}>
            <Arrow foot={foot} tip={tip} cls="sm-caught-arrow" look={look} />
          </g>
        </g>
      );
    })();
    const std = Math.min(14, s.blur * scale * 0.35);
    return (
      <>
        <g class="sm-cone">{cone}</g>
        <g class={`sm-screen${movable}`} {...part("screen")}>
          <defs>
            <filter id={blurId} x="-200%" y="-50%" width="500%" height="200%">
              <feGaussianBlur stdDeviation={std.toFixed(2)} />
            </filter>
          </defs>
          <line class="sm-stand" x1={sx} y1={bottom} x2={sx} y2={height - 6} />
          <line class="sm-stand" x1={sx - 12} y1={height - 6} x2={sx + 12} y2={height - 6} />
          <rect class="sm-card" x={sx - 4} y={top} width={8} height={bottom - top} rx={2} />
          {picture}
          {k?.isSharp === true && (
            <text class="sm-tick" x={sx} y={top - 6} text-anchor="middle">
              ✓
            </text>
          )}
        </g>
        {s.canMove && (
          <rect
            class="bench-grab"
            x={sx - GRAB * 0.8}
            y={top - 10}
            width={GRAB * 1.6}
            height={height - (top - 10)}
            fill="transparent"
            onPointerDown={grab("screen")}
          />
        )}
      </>
    );
  }

  // The lens's screen: a white card on a stand, and what it catches, blurred by how far out it is.
  const k = s.caught;
  let caught: JSX.Element;
  if (k !== null) {
    const foot = at(frame, [s.x, 0]);
    const head = at(frame, [s.x, k.height]);
    if (k.isSharp) {
      caught = (
        <g class="ln-caught is-sharp">
          <circle class="ln-glow" cx={head[0] + 3} cy={head[1]} r={8} />
          <line x1={foot[0] + 3} y1={foot[1]} x2={head[0] + 3} y2={head[1]} />
        </g>
      );
    } else {
      // Every point of the object makes its own patch, blur cm high: the shape smears out and
      // the light spreads thinner the further the screen is from the image.
      const lo = Math.min(0, k.centre) - k.blur;
      const hi = Math.max(0, k.centre) + k.blur;
      const [, yTop] = at(frame, [s.x, hi]);
      const [, yBottom] = at(frame, [s.x, lo]);
      const strength = Math.max(0.12, Math.min(0.7, 1.2 / (1 + k.blur)));
      caught = (
        <g class="ln-caught" filter={`url(#${blurId})`} opacity={strength}>
          <rect
            class="ln-smear"
            x={sx - 2}
            y={yTop}
            width={10}
            height={Math.max(2, yBottom - yTop)}
            rx={3}
          />
          <line x1={foot[0] + 3} y1={foot[1]} x2={head[0] + 3} y2={head[1]} />
        </g>
      );
    }
  } else {
    caught = (
      <rect class="ln-patch" x={sx - 2} y={top + 4} width={10} height={bottom - top - 8} rx={2} />
    );
  }
  const stand = Math.min(height - 4, bottom + 14);
  return (
    <g class="ln-screen-wrap">
      <defs>
        <filter id={blurId} x="-300%" y="-50%" width="700%" height="200%">
          <feGaussianBlur stdDeviation={`1.5 ${Math.min(10, 0.3 * s.blur * scale)}`} />
        </filter>
      </defs>
      {cone}
      <g class={`ln-screen${movable}`} {...part("screen")}>
        <rect class="ln-card-screen" x={sx - 4} y={top} width={14} height={bottom - top} rx={2} />
        <line class="ln-stand" x1={sx + 3} y1={bottom} x2={sx + 3} y2={stand} />
        <line class="ln-stand" x1={sx - 9} y1={stand} x2={sx + 15} y2={stand} />
        {caught}
      </g>
      {s.canMove && (
        <rect
          class="bench-grab"
          x={sx - GRAB}
          y={top - GRAB}
          width={2 * GRAB}
          height={bottom - top + 2 * GRAB}
          fill="transparent"
          onPointerDown={grab("screen")}
        />
      )}
    </g>
  );
});

// ---- the "?" marker ----

export const MarkerView = leafView(marker, ({ s, frame, part, grab }) => {
  const look = useTheme() as Look;
  if (frame === null) return null;
  const [mx, my] = at(frame, [s.at.x, s.at.y]);
  const isLens = look === Look.Lens;
  return (
    <>
      <g
        class={`${look}-mark-q${isLens && s.isRight ? " is-right" : ""}`}
        {...part("mark")}
        aria-label={isLens ? "Marker for the image's tip" : "your guess for the image's tip"}
      >
        <circle cx={mx} cy={my} r={isLens ? 11 : 13} />
        <text x={mx} y={my + 5} text-anchor="middle">
          {isLens && s.isRight ? "✓" : "?"}
        </text>
      </g>
      <circle
        class="bench-grab"
        cx={mx}
        cy={my}
        r={GRAB}
        fill="transparent"
        onPointerDown={grab("mark")}
      />
    </>
  );
});

// ---- under the picture ----

export const ReadoutView = leafView(readout, ({ s, part }) => {
  const look = useTheme() as Look;
  return look === Look.Mirror ? (
    <p class="sm-readout" {...part("readout")}>
      {s.text}
    </p>
  ) : (
    <span class="ln-readout" {...part("readout")}>
      {s.text}
    </span>
  );
});

export const RayButtonsView = leafView(rayButtons, ({ s, part, locale }) => {
  const look = useTheme() as Look;
  const words = (b: RayButtonsState["buttons"][number]) => (locale === "hi" ? b.hi : b.en);
  const buttons = (
    cls: string,
    label: (b: RayButtonsState["buttons"][number], k: number) => string,
  ) =>
    s.buttons.map((b, k) => (
      <button
        key={b.ray}
        type="button"
        class={s.on.includes(b.ray) ? `${cls} is-on` : cls}
        {...part("button", `${RAY_BUTTON}${b.ray}`)}
        aria-pressed={s.on.includes(b.ray)}
        aria-label={label(b, k)}
        title={words(b)}
      >
        {k + 1}
      </button>
    ));
  if (look === Look.Mirror)
    return (
      <fieldset class="sm-rays" aria-label={locale === "hi" ? "किरणें" : "rays"}>
        {buttons("sm-button sm-ray-pick", (b, k) => `${k + 1}: ${words(b)}`)}
      </fieldset>
    );
  return <span class="ln-pick">{buttons("ln-raybtn", (b) => words(b))}</span>;
});

export const FocalStepperView = leafView(focalStepper, ({ s, part }) => {
  const look = useTheme() as Look;
  if (look === Look.Mirror)
    return (
      <div class="sm-stepper">
        <button type="button" class="sm-button" {...part("less")} aria-label="focal length − 1 cm">
          −
        </button>
        <span class="sm-stepper-value" {...part("value")}>
          <span class="sm-name">f</span> = {s.value} cm
        </span>
        <button type="button" class="sm-button" {...part("more")} aria-label="focal length + 1 cm">
          +
        </button>
      </div>
    );
  return (
    <span class="ln-focal">
      <button type="button" class="ln-step" {...part("less")} aria-label="Shorter focal length">
        −
      </button>
      <span class="ln-focal-value" {...part("value")}>
        f = {s.value} cm
      </span>
      <button type="button" class="ln-step" {...part("more")} aria-label="Longer focal length">
        +
      </button>
    </span>
  );
});
