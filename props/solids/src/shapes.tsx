import type { JSX } from "preact";
import {
  AxisMark,
  Box,
  Cone,
  Cylinder,
  type Extent,
  type Frame,
  Frustum,
  HeightMark,
  Hemisphere,
  Look,
  RadiusMark,
  SlantMark,
  Sphere,
} from "./draw";
import { type Dims, Solid, numText, slantOfCone, slantOfFrustum } from "./solids";

/** A single basic solid standing on height y0: the heights it spans and its widest half-width. */
export function extentOf(solid: Solid, d: Dims, y0 = 0): Extent {
  switch (solid) {
    case Solid.Cuboid:
      return { y0, y1: y0 + d.h, r: Math.hypot(d.l, d.b) / 2 };
    case Solid.Cube:
      return { y0, y1: y0 + d.a, r: (Math.SQRT2 * d.a) / 2 };
    case Solid.Cylinder:
    case Solid.Cone:
      return { y0, y1: y0 + d.h, r: d.r };
    case Solid.Sphere:
      return { y0, y1: y0 + 2 * d.r, r: d.r };
    case Solid.Hemisphere:
      return { y0, y1: y0 + d.r, r: d.r };
    case Solid.Frustum:
      return { y0, y1: y0 + d.h, r: Math.max(d.r1, d.r2) };
  }
}

/** How the measurement labels read: just the letter ("r"), or the letter and value ("r = 3.5 cm"). */
export type Labels = { show: boolean; values: boolean; unit: string };

function name(letter: string, value: number, labels: Labels): string {
  return labels.values
    ? `${letter} = ${numText(value)}${labels.unit === "" ? "" : ` ${labels.unit}`}`
    : letter;
}

/**
 * Draws one basic solid on the frame, standing on height y0, with its labels. A frustum is drawn with
 * its larger end r1 at the bottom (a bucket stands the other way: `isUpsideDown`).
 */
export function SolidShape({
  f,
  solid,
  d,
  y0 = 0,
  look = Look.Solid,
  tone = 1,
  labels,
  isUpsideDown = false,
}: {
  f: Frame;
  solid: Solid;
  d: Dims;
  y0?: number;
  look?: Look;
  tone?: number;
  labels: Labels;
  isUpsideDown?: boolean;
}): JSX.Element {
  const L = labels.show;
  switch (solid) {
    case Solid.Cuboid:
    case Solid.Cube: {
      const l = solid === Solid.Cube ? d.a : d.l;
      const b = solid === Solid.Cube ? d.a : d.b;
      const h = solid === Solid.Cube ? d.a : d.h;
      return (
        <g>
          <Box f={f} y0={y0} y1={y0 + h} l={l} b={b} look={look} tone={tone} />
          {L && (
            <BoxLabels
              f={f}
              y0={y0}
              l={l}
              b={b}
              h={h}
              isCube={solid === Solid.Cube}
              labels={labels}
            />
          )}
        </g>
      );
    }
    case Solid.Cylinder:
      return (
        <g>
          <Cylinder f={f} y0={y0} y1={y0 + d.h} r={d.r} look={look} tone={tone} />
          {L && <RadiusMark f={f} y={y0 + d.h} r={d.r} label={name("r", d.r, labels)} />}
          {L && (
            <HeightMark f={f} y0={y0} y1={y0 + d.h} x={d.r * 1.12} label={name("h", d.h, labels)} />
          )}
        </g>
      );
    case Solid.Cone:
      return (
        <g>
          <Cone f={f} yBase={y0} yApex={y0 + d.h} r={d.r} look={look} tone={tone} />
          {L && <AxisMark f={f} y0={y0} y1={y0 + d.h} label={name("h", d.h, labels)} />}
          {L && <RadiusMark f={f} y={y0} r={d.r} label={name("r", d.r, labels)} isBelow />}
          {L && (
            <SlantMark
              f={f}
              yLow={y0}
              rLow={d.r}
              yHigh={y0 + d.h}
              rHigh={0}
              label={name("l", slantOfCone(d.r, d.h), labels)}
            />
          )}
        </g>
      );
    case Solid.Sphere:
      return (
        <g>
          <Sphere f={f} yc={y0 + d.r} r={d.r} look={look} tone={tone} />
          {L && <RadiusMark f={f} y={y0 + d.r} r={d.r} label={name("r", d.r, labels)} />}
        </g>
      );
    case Solid.Hemisphere:
      return (
        <g>
          <Hemisphere f={f} yFlat={y0} r={d.r} isUp look={look} tone={tone} />
          {L && <RadiusMark f={f} y={y0} r={d.r} label={name("r", d.r, labels)} isBelow />}
        </g>
      );
    case Solid.Frustum: {
      const rBottom = isUpsideDown ? d.r2 : d.r1;
      const rTop = isUpsideDown ? d.r1 : d.r2;
      const top = y0 + d.h;
      return (
        <g>
          <Frustum f={f} y0={y0} y1={top} rBottom={rBottom} rTop={rTop} look={look} tone={tone} />
          {L && <AxisMark f={f} y0={y0} y1={top} label={name("h", d.h, labels)} />}
          {L && (
            <RadiusMark
              f={f}
              y={top}
              r={rTop}
              label={name(isUpsideDown ? "r₁" : "r₂", rTop, labels)}
            />
          )}
          {L && (
            <RadiusMark
              f={f}
              y={y0}
              r={rBottom}
              label={name(isUpsideDown ? "r₂" : "r₁", rBottom, labels)}
              isBelow
            />
          )}
          {L && (
            <SlantMark
              f={f}
              yLow={y0}
              rLow={rBottom}
              yHigh={top}
              rHigh={rTop}
              label={name("l", slantOfFrustum(d.r1, d.r2, d.h), labels)}
            />
          )}
        </g>
      );
    }
  }
}

/** A box's three measurements, along three of its edges. */
function BoxLabels({
  f,
  y0,
  l,
  b,
  h,
  isCube,
  labels,
}: {
  f: Frame;
  y0: number;
  l: number;
  b: number;
  h: number;
  isCube: boolean;
  labels: Labels;
}): JSX.Element {
  const across = isCube ? name("a", l, labels) : name("l", l, labels);
  return (
    <g>
      <HeightMark
        f={f}
        y0={y0}
        y1={y0 + h}
        x={Math.hypot(l, b) / 2 + 0.06 * l}
        label={isCube ? "" : name("h", h, labels)}
      />
      <BottomLabel f={f} y={y0} b={b} text={across} />
      {!isCube && <DepthLabel f={f} y={y0} l={l} text={name("b", b, labels)} />}
    </g>
  );
}

function BottomLabel({
  f,
  y,
  b,
  text,
}: {
  f: Frame;
  y: number;
  b: number;
  text: string;
}): JSX.Element {
  // Under the middle of the front bottom edge.
  const x = f.cx;
  const py = f.baseY - f.k * y * f.cos + f.k * (b / 2) * f.sin * Math.cos(f.yaw) + 15;
  return (
    <text class="so-dim-text" x={Math.round(x)} y={Math.round(py)} text-anchor="middle">
      {text}
    </text>
  );
}

function DepthLabel({
  f,
  y,
  l,
  text,
}: {
  f: Frame;
  y: number;
  l: number;
  text: string;
}): JSX.Element {
  // Beside the seen side face's bottom edge.
  const side = Math.sin(f.yaw) > 0 ? -1 : 1;
  const X = (side * l) / 2;
  const sx = f.cx + f.k * X * Math.cos(f.yaw);
  const sy = f.baseY - f.k * y * f.cos + f.k * (-X * Math.sin(f.yaw)) * f.sin;
  return (
    <text
      class="so-dim-text"
      x={Math.round(sx + side * 8)}
      y={Math.round(sy + 12)}
      text-anchor={side > 0 ? "start" : "end"}
    >
      {text}
    </text>
  );
}
