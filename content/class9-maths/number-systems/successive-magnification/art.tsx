import { ArtFrame, Dot, Line, Range, Stage, defineArt, useSpace } from "@chalk/draw";
import { Color } from "@chalk/prop";
import type { JSX } from "preact";

const TOP = 34;
const LOW = 108;
const steps = (from: number, step: number) => Array.from({ length: 11 }, (_, i) => from + i * step);

/** The stretch from 3.7 to 3.8 on the top line, opened out to fill the line below. */
function Lens(): JSX.Element {
  const { x, width } = useSpace();
  return (
    <path
      d={`M${x(3.7)} ${TOP + 10} L18 ${LOW - 13} L${width - 18} ${LOW - 13} L${x(3.8)} ${TOP + 10} Z`}
      fill="var(--color-primary)"
      opacity={0.14}
    />
  );
}

function Ticks({ y, values }: { y: number; values: readonly number[] }): JSX.Element {
  const { x } = useSpace();
  return (
    <g>
      {values.map((v) => (
        <line
          key={v}
          x1={x(v)}
          x2={x(v)}
          y1={y - 8}
          y2={y + 8}
          stroke="var(--color-on-surface)"
          stroke-width={3}
          stroke-linecap="round"
        />
      ))}
    </g>
  );
}

export const art = defineArt(ArtFrame.Card, ({ width, height }) => (
  <Stage
    label="A number line from 3 to 4, with its stretch from 3.7 to 3.8 magnified below it"
    x={[3, 4]}
    width={width}
    height={height}
    inset={{ left: 18, right: 18 }}
  >
    <Lens />
    <Line from={3} to={4} y={TOP} />
    <Ticks y={TOP} values={steps(3, 0.1)} />
    <Line from={3.7} to={3.8} y={TOP} color={Color.Primary} />
    <Range x={[3.7, 3.8]}>
      <Line from={3.7} to={3.8} y={LOW} />
      <Ticks y={LOW} values={steps(3.7, 0.01)} />
      <Dot at={3.765} y={LOW} r={9} color={Color.Secondary} />
    </Range>
  </Stage>
));
