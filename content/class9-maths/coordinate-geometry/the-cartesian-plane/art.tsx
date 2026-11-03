import { ArtFrame, Stage, defineArt } from "@chalk/draw";

const INK = "var(--color-on-surface-variant)";
const FAINT = "var(--color-outline-variant)";
const ACCENT = "var(--color-primary)";

/** The Cartesian plane: two number lines crossing at O, making four quadrants. */
export const art = defineArt(ArtFrame.Card, ({ width, height }) => {
  const cx = width / 2;
  const cy = height / 2;
  const unit = 18;
  const ticks = [-3, -2, -1, 1, 2, 3];
  return (
    <Stage
      label="The x and y axes crossing at O, with four quadrants"
      x={[0, width]}
      width={width}
      height={height}
    >
      {ticks.map((n) => (
        <g key={n}>
          <line
            x1={cx + n * unit}
            y1={cy - 3.5 * unit}
            x2={cx + n * unit}
            y2={cy + 3.5 * unit}
            stroke={FAINT}
            stroke-width={1}
          />
          <line
            x1={cx - 6 * unit}
            y1={cy + n * unit}
            x2={cx + 6 * unit}
            y2={cy + n * unit}
            stroke={FAINT}
            stroke-width={1}
          />
        </g>
      ))}
      <line
        x1={cx - 6.5 * unit}
        y1={cy}
        x2={cx + 6.5 * unit}
        y2={cy}
        stroke={INK}
        stroke-width={2.5}
      />
      <line
        x1={cx}
        y1={cy - 3.7 * unit}
        x2={cx}
        y2={cy + 3.7 * unit}
        stroke={INK}
        stroke-width={2.5}
      />
      <circle cx={cx} cy={cy} r={6} fill={ACCENT} />
      <text x={cx - 8} y={cy + 18} text-anchor="end" font-size={15} font-weight={700} fill={ACCENT}>
        O
      </text>
    </Stage>
  );
});
