import { ArtFrame, Label, Stage, defineArt, useSpace } from "@chalk/draw";
import type { JSX } from "preact";

/** ℕ inside 𝕎 inside ℤ inside ℚ inside ℝ: each collection sits in the next, like boxes in boxes. */
const SETS = ["ℝ", "ℚ", "ℤ", "𝕎", "ℕ"] as const;
const STEP = 13;

function Boxes(): JSX.Element {
  const { width, height } = useSpace();
  return (
    <g>
      {SETS.map((name, i) => {
        const inset = 8 + i * STEP;
        return (
          <rect
            key={name}
            x={inset}
            y={inset}
            width={width - inset * 2}
            height={height - inset * 2}
            rx={22 - i * 2}
            fill={`color-mix(in srgb, var(--color-primary) ${6 + i * 7}%, var(--color-surface))`}
            stroke="var(--color-primary)"
            stroke-width={i === SETS.length - 1 ? 4 : 2}
          />
        );
      })}
    </g>
  );
}

export const art = defineArt(ArtFrame.Tile, ({ width, height }) => (
  <Stage
    label="Number collections nested like boxes: N in W in Z in Q in R"
    x={[0, 1]}
    width={width}
    height={height}
  >
    <Boxes />
    <Label at={0.5} y={height / 2 + 12} text="ℕ" size="large" color="primary" />
  </Stage>
));
