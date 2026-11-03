import { ArtFrame, Stage, defineArt } from "@chalk/draw";

const INK = "var(--color-on-surface-variant)";
const FAINT = "var(--color-outline-variant)";
const ACCENT = "var(--color-primary)";

/** The chapter: a place said by two numbers, one along and one up, meeting at one dot. */
export const art = defineArt(ArtFrame.Tile, ({ width, height }) => {
  // A 6 × 6 grid of 20 px squares, its corner at (20, 140).
  const at = (x: number, y: number) => [20 + x * 20, 140 - y * 20] as const;
  const [ox, oy] = at(0, 0);
  const [px, py] = at(4, 5);
  return (
    <Stage
      label="Two numbers, 4 along and 5 up, meeting at one dot"
      x={[0, width]}
      width={width}
      height={height}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i}>
          <line
            x1={at(i, 0)[0]}
            y1={oy}
            x2={at(i, 6)[0]}
            y2={at(i, 6)[1]}
            stroke={FAINT}
            stroke-width={1}
          />
          <line
            x1={ox}
            y1={at(0, i)[1]}
            x2={at(6, i)[0]}
            y2={at(6, i)[1]}
            stroke={FAINT}
            stroke-width={1}
          />
        </g>
      ))}
      <line x1={ox} y1={oy} x2={at(6, 0)[0]} y2={oy} stroke={INK} stroke-width={2} />
      <line x1={ox} y1={oy} x2={ox} y2={at(0, 6)[1]} stroke={INK} stroke-width={2} />
      <line
        x1={px}
        y1={oy}
        x2={px}
        y2={py}
        stroke={ACCENT}
        stroke-width={2}
        stroke-dasharray="4 4"
      />
      <line
        x1={ox}
        y1={py}
        x2={px}
        y2={py}
        stroke={ACCENT}
        stroke-width={2}
        stroke-dasharray="4 4"
      />
      <circle cx={px} cy={py} r={7} fill={ACCENT} />
    </Stage>
  );
});
