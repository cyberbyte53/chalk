import { ArtFrame, Stage, defineArt } from "@chalk/draw";

const INK = "var(--color-on-surface-variant)";
const ACCENT = "var(--color-primary)";
const SECOND = "var(--color-secondary)";

/** Coordinates of a point: a point and its two distances, to the y-axis and to the x-axis. */
export const art = defineArt(ArtFrame.Card, ({ width, height }) => {
  const unit = 22;
  const ox = width / 2 - 3 * unit;
  const oy = height - 22;
  const at = (x: number, y: number) => [ox + x * unit, oy - y * unit] as const;
  const [px, py] = at(5, 3);
  return (
    <Stage
      label="A point 5 across and 3 up, its distances to the two axes dashed"
      x={[0, width]}
      width={width}
      height={height}
    >
      <line x1={ox - unit} y1={oy} x2={at(7, 0)[0]} y2={oy} stroke={INK} stroke-width={2.5} />
      <line x1={ox} y1={oy + 10} x2={ox} y2={at(0, 4.6)[1]} stroke={INK} stroke-width={2.5} />
      <line
        x1={ox}
        y1={py}
        x2={px}
        y2={py}
        stroke={SECOND}
        stroke-width={2.5}
        stroke-dasharray="5 4"
      />
      <line
        x1={px}
        y1={py}
        x2={px}
        y2={oy}
        stroke={SECOND}
        stroke-width={2.5}
        stroke-dasharray="5 4"
      />
      <circle cx={px} cy={py} r={7} fill={ACCENT} />
    </Stage>
  );
});
