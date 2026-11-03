import { ArtFrame, Stage, defineArt } from "@chalk/draw";

const INK = "var(--color-on-surface-variant)";
const FAINT = "var(--color-outline-variant)";
const ACCENT = "var(--color-primary)";

/** The pairs plotted: a few dots, each set down by its own two numbers. */
const PAIRS: readonly (readonly [number, number])[] = [
  [-4, 2],
  [-1, -1],
  [2, 2],
  [4, -2],
  [5, 1],
];

/** Plotting points: dots set on the plane from their pairs. */
export const art = defineArt(ArtFrame.Card, ({ width, height }) => {
  const unit = 20;
  const cx = width / 2;
  const cy = height / 2;
  const at = (x: number, y: number) => [cx + x * unit, cy - y * unit] as const;
  const ticks = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6];
  return (
    <Stage
      label="Five dots plotted on the plane from their pairs"
      x={[0, width]}
      width={width}
      height={height}
    >
      {ticks.map((n) => (
        <line
          key={n}
          x1={at(n, 0)[0]}
          y1={cy - 4}
          x2={at(n, 0)[0]}
          y2={cy + 4}
          stroke={FAINT}
          stroke-width={1.5}
        />
      ))}
      {[-2, -1, 1, 2].map((n) => (
        <line
          key={n}
          x1={cx - 4}
          y1={at(0, n)[1]}
          x2={cx + 4}
          y2={at(0, n)[1]}
          stroke={FAINT}
          stroke-width={1.5}
        />
      ))}
      <line
        x1={cx - 6.6 * unit}
        y1={cy}
        x2={cx + 6.6 * unit}
        y2={cy}
        stroke={INK}
        stroke-width={2.5}
      />
      <line
        x1={cx}
        y1={cy - 3.1 * unit}
        x2={cx}
        y2={cy + 3.1 * unit}
        stroke={INK}
        stroke-width={2.5}
      />
      {PAIRS.map(([x, y]) => (
        <circle key={`${x},${y}`} cx={at(x, y)[0]} cy={at(x, y)[1]} r={6} fill={ACCENT} />
      ))}
    </Stage>
  );
});
