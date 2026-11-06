import { ArtFrame, Stage, defineArt } from "@chalk/draw";

const INK = "var(--color-on-surface-variant)";
const FAINT = "var(--color-outline-variant)";
const ACCENT = "var(--color-primary)";

/** Locating a point: one number is a place on a line; along, then up, reaches a house. */
export const art = defineArt(ArtFrame.Card, ({ width, height }) => {
  const road = 118;
  const step = 34;
  const x = (n: number) => 60 + n * step;
  const street = 4;
  const house = 3;
  const up = (n: number) => road - n * 22;
  return (
    <Stage
      label="A road numbered 1 to 6; a walk along to 4, then up to the third house"
      x={[0, width]}
      width={width}
      height={height}
    >
      <line
        x1={x(0)}
        y1={road}
        x2={x(6) + 10}
        y2={road}
        stroke={INK}
        stroke-width={3}
        stroke-linecap="round"
      />
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <line
          key={n}
          x1={x(n)}
          y1={road - 5}
          x2={x(n)}
          y2={road + 5}
          stroke={INK}
          stroke-width={2}
        />
      ))}
      <line
        x1={x(street)}
        y1={road}
        x2={x(street)}
        y2={up(4)}
        stroke={FAINT}
        stroke-width={3}
        stroke-linecap="round"
      />
      {[1, 2, 3, 4].map((n) => (
        <rect
          key={n}
          x={x(street) + 8}
          y={up(n) - 7}
          width={14}
          height={12}
          rx={2}
          fill={n === house ? ACCENT : FAINT}
        />
      ))}
      <path
        d={`M ${x(0)} ${road} H ${x(street)} V ${up(house)}`}
        fill="none"
        stroke={ACCENT}
        stroke-width={3}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx={x(0)} cy={road} r={6} fill={ACCENT} />
    </Stage>
  );
});
