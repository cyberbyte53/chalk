import type { JSX } from "preact";

/** Small plant pieces shared by the reproduction pictures. All in the look's tokens (plants.css). */

/** A leaf from (x, y), pointing at angle `a` (degrees, 0 = right), `len` long. */
export function Leaf({
  x,
  y,
  a,
  len = 18,
}: { x: number; y: number; a: number; len?: number }): JSX.Element {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <path
        class="pl-leaf"
        d={`M0 0 Q ${len * 0.5} ${-len * 0.38} ${len} 0 Q ${len * 0.5} ${len * 0.38} 0 0 Z`}
      />
      <line class="pl-vein" x1={0} y1={0} x2={len * 0.9} y2={0} />
    </g>
  );
}

/** A young shoot: a stem up from (x, y), `h` tall, with a pair of leaves at the top. */
export function Sprout({ x, y, h = 24 }: { x: number; y: number; h?: number }): JSX.Element {
  return (
    <g>
      <line class="pl-stem" x1={x} y1={y} x2={x} y2={y - h} />
      <Leaf x={x} y={y - h} a={-35} len={h * 0.55} />
      <Leaf x={x} y={y - h} a={-145} len={h * 0.55} />
    </g>
  );
}

/** A few roots down from (x, y), `len` long. */
export function Roots({ x, y, len = 14 }: { x: number; y: number; len?: number }): JSX.Element {
  return (
    <g class="pl-roots">
      <path d={`M${x} ${y} q -3 ${len * 0.5} -${len * 0.4} ${len}`} />
      <path d={`M${x} ${y} q 1 ${len * 0.6} 1 ${len * 1.1}`} />
      <path d={`M${x} ${y} q 3 ${len * 0.5} ${len * 0.45} ${len * 0.9}`} />
    </g>
  );
}

/** A clay pot whose rim is centred at (x, y), `w` wide. */
export function Pot({ x, y, w = 50 }: { x: number; y: number; w?: number }): JSX.Element {
  const h = w * 0.8;
  return (
    <g>
      <path
        class="pl-pot"
        d={`M${x - w / 2} ${y} L${x + w / 2} ${y} L${x + w * 0.38} ${y + h} L${x - w * 0.38} ${y + h} Z`}
      />
      <rect class="pl-pot-rim" x={x - w / 2 - 3} y={y - 4} width={w + 6} height={8} rx={2} />
      <rect class="pl-soil" x={x - w / 2 + 2} y={y - 6} width={w - 4} height={4} rx={2} />
    </g>
  );
}

/** A glass jar of water, bottom-centre at (x, y). */
export function Jar({
  x,
  y,
  w = 56,
  h = 70,
}: { x: number; y: number; w?: number; h?: number }): JSX.Element {
  return (
    <g>
      <rect
        class="pl-water"
        x={x - w / 2 + 3}
        y={y - h * 0.7}
        width={w - 6}
        height={h * 0.7 - 3}
        rx={3}
      />
      <path
        class="pl-jar"
        d={`M${x - w / 2} ${y - h} L${x - w / 2} ${y - 4} Q ${x - w / 2} ${y} ${x - w / 2 + 4} ${y} L${x + w / 2 - 4} ${y} Q ${x + w / 2} ${y} ${x + w / 2} ${y - 4} L${x + w / 2} ${y - h}`}
      />
    </g>
  );
}

/** A flat band of soil from x to x + w at height y. */
export function Soil({
  x,
  y,
  w,
  h = 30,
}: { x: number; y: number; w: number; h?: number }): JSX.Element {
  return <rect class="pl-ground" x={x} y={y} width={w} height={h} />;
}
