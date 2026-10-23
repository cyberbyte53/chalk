import type { JSX } from "preact";
import { type Look, Trait } from "./genetics";

/** Words shown on screen, in both languages. */
export type Words = { readonly en: string; readonly hi: string };
export const say = (locale: string, w: Words): string => (locale === "hi" ? w.hi : w.en);

export type Who = "riya" | "kabir" | "grandpa" | "mom";

/**
 * A person, drawn the way the light chapter draws the family: feet at (x, y), `s` the scale
 * (1 ≈ 46 units tall for an adult). From the front they have dot eyes; from the back, only hair.
 */
export function Person({
  who,
  x,
  y,
  s = 1,
  back = false,
  point,
}: {
  who: Who;
  x: number;
  y: number;
  s?: number;
  back?: boolean;
  /** An arm raised towards (dx, dy) from the shoulder, in the person's own units. */
  point?: [number, number];
}): JSX.Element {
  const isChild = who === "kabir";
  const h = isChild ? 34 : 44;
  const headR = isChild ? 7.5 : 7;
  const bodyW = isChild ? 15 : 17;
  const neck = h - 2 * headR;
  const shirt = `hs-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g class="hs-person" transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="hs-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`hs-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="hs-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="hs-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="hs-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="hs-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} ${who === "mom" ? -2 : -3} -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="hs-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="hs-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="hs-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="hs-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="hs-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="hs-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
        </g>
      )}
      {!back && who === "grandpa" && (
        <g class="hs-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

/** A pea seed at (x, y), radius r: round and smooth, or wrinkled; yellow or green. */
export function Seed({
  x,
  y,
  r,
  shape = "round",
  colour = "yellow",
}: {
  x: number;
  y: number;
  r: number;
  shape?: string;
  colour?: string;
}): JSX.Element {
  const fill = colour === "green" ? "hs-seed-green" : "hs-seed-yellow";
  if (shape === "wrinkled") {
    // A lumpy outline: nine bumps joined by curves, flattened a little, with creases across it.
    const bumps = 9;
    const point = (i: number, f: number) => {
      const a = (i / bumps) * 2 * Math.PI;
      return [x + f * r * Math.cos(a), y + f * r * 0.9 * Math.sin(a)] as const;
    };
    let d = "";
    for (let i = 0; i < bumps; i++) {
      const [sx, sy] = point(i, 0.82);
      const [cx, cy] = point(i + 0.5, 1.12);
      const [ex, ey] = point(i + 1, 0.82);
      d += `${i === 0 ? `M${sx.toFixed(2)} ${sy.toFixed(2)}` : ""} Q${cx.toFixed(2)} ${cy.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
    }
    return (
      <g class="hs-seed">
        <path class={fill} d={`${d} Z`} stroke-linejoin="round" />
        <path
          class="hs-crease"
          d={`M${x - r * 0.5} ${y - r * 0.2} q ${r * 0.5} ${r * 0.35} ${r} 0 M${x - r * 0.35} ${y + r * 0.35} q ${r * 0.35} ${r * 0.2} ${r * 0.7} 0`}
        />
      </g>
    );
  }
  return (
    <g class="hs-seed">
      <circle class={fill} cx={x} cy={y} r={r} />
      <circle class="hs-shine" cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.25} />
    </g>
  );
}

/**
 * A pea plant standing on the ground at (x, y): tall or short, with a violet or white flower on
 * top. `s` is its scale (a tall plant ≈ 64 units at 1).
 */
export function PeaPlant({
  x,
  y,
  s = 1,
  height = "tall",
  flower = "violet",
}: {
  x: number;
  y: number;
  s?: number;
  height?: string;
  flower?: string;
}): JSX.Element {
  const h = height === "short" ? 24 : 60;
  const leaves = height === "short" ? [0.55] : [0.3, 0.55, 0.8];
  return (
    <g class="hs-plant" transform={`translate(${x} ${y}) scale(${s})`}>
      <path class="hs-stem" d={`M0 0 C -2 ${-h * 0.35} 2 ${-h * 0.65} 0 ${-h}`} />
      {leaves.map((f, i) => {
        const ly = -h * f;
        const side = i % 2 === 0 ? 1 : -1;
        return (
          <path
            key={f}
            class="hs-leaf"
            d={`M0 ${ly} q ${side * 9} -7 ${side * 14} -2 q ${-side * 6} 7 ${-side * 14} 2 Z`}
          />
        );
      })}
      <g transform={`translate(0 ${-h - 3})`}>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse
            key={a}
            class={flower === "white" ? "hs-petal-white" : "hs-petal-violet"}
            cx={0}
            cy={-4}
            rx={3.2}
            ry={5}
            transform={`rotate(${a})`}
          />
        ))}
        <circle class="hs-flower-heart" cx={0} cy={0} r={2.2} />
      </g>
      <line class="hs-soil" x1={-12} y1={0} x2={12} y2={0} />
    </g>
  );
}

/**
 * What a look is drawn as: a plant when height or flower colour is a trait (with its seed beside
 * it if seed traits are too), otherwise a seed alone. Fits a box of `size` units, base at y.
 */
export function LookFigure({
  traits,
  look,
  x,
  y,
  size,
}: {
  traits: readonly Trait[];
  look: Look;
  x: number;
  y: number;
  size: number;
}): JSX.Element {
  const hasPlant = traits.includes(Trait.Height) || traits.includes(Trait.FlowerColour);
  const hasSeed = traits.includes(Trait.SeedShape) || traits.includes(Trait.SeedColour);
  const shape = look[Trait.SeedShape] ?? "round";
  const colour = look[Trait.SeedColour] ?? "yellow";
  if (!hasPlant)
    return <Seed x={x} y={y - size * 0.45} r={size * 0.32} shape={shape} colour={colour} />;
  const s = size / 76;
  return (
    <g>
      <PeaPlant
        x={hasSeed ? x - size * 0.14 : x}
        y={y}
        s={s}
        height={look[Trait.Height] ?? "tall"}
        flower={look[Trait.FlowerColour] ?? "violet"}
      />
      {hasSeed && (
        <Seed
          x={x + size * 0.3}
          y={y - size * 0.14}
          r={size * 0.12}
          shape={shape}
          colour={colour}
        />
      )}
    </g>
  );
}
