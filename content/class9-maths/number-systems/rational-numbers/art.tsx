import { ArtFrame, Axis, Dot, Stage, defineArt } from "@chalk/draw";
import { Color } from "@chalk/prop";

/** Between 0 and 1 there is always another: the middle, then the middles of the halves, and on. */
const ROUNDS = [[1 / 2], [1 / 4, 3 / 4], [1 / 8, 3 / 8, 5 / 8, 7 / 8]];

export const art = defineArt(ArtFrame.Card, ({ width, height }) => (
  <Stage
    label="Dots between 0 and 1, each round half the size of the last"
    x={[0, 1]}
    width={width}
    height={height}
    inset={{ left: 28, right: 28 }}
  >
    <Axis
      y={78}
      ticks={[
        { value: 0, label: "0" },
        { value: 1, label: "1" },
      ]}
    />
    {ROUNDS.flatMap((round, i) =>
      round.map((at) => (
        <Dot
          key={at}
          at={at}
          y={78}
          r={10 - i * 3}
          color={i === 0 ? Color.Secondary : Color.Primary}
        />
      )),
    )}
  </Stage>
));
