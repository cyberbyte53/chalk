import { ArtFrame, Axis, Curve, Dot, Stage, defineArt } from "@chalk/draw";
import { Color } from "@chalk/prop";

/** Class 9 Maths in one picture: a number line that becomes the floor of a graph. */
export const art = defineArt(ArtFrame.Card, ({ width, height }) => (
  <Stage
    label="A curve rising over a number line"
    x={[-2.2, 2.2]}
    y={[-0.6, 2.6]}
    width={width}
    height={height}
    inset={{ left: 14, right: 14, top: 10, bottom: 10 }}
  >
    <Axis y={0} ticks={[-2, -1, 0, 1, 2].map((value) => ({ value }))} />
    <Curve fn={(x) => (x * x) / 2} from={-2.1} to={2.1} color={Color.Primary} />
    <Dot at={1} y={0.5} r={9} color={Color.Secondary} />
  </Stage>
));
