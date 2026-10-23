import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { ACID_PICTURE, AcidSceneKind, type AcidSceneState, describeAcidScene } from "./acid-scene";

const W = ACID_PICTURE.width;
const H = ACID_PICTURE.height;

type Who = "riya" | "kabir" | "grandpa" | "mom";

/** A person in the family's look (as in the other chemistry scenes): feet at (x, y). */
function Person({
  who,
  x,
  y,
  s = 1,
  point,
  hat = false,
}: {
  who: Who;
  x: number;
  y: number;
  s?: number;
  point?: [number, number];
  hat?: boolean;
}): JSX.Element {
  const isChild = who === "kabir";
  const h = isChild ? 34 : 44;
  const headR = isChild ? 7.5 : 7;
  const bodyW = isChild ? 15 : 17;
  const neck = h - 2 * headR;
  const shirt = `cs-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="cs-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`cs-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="cs-hair"
          d={`M${-headR + 1} ${headY - 2} q -6 6 -5 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="cs-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="cs-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="cs-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -3 -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="cs-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && !hat && (
        <g>
          <path
            class="cs-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          <rect class="cs-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
        </g>
      )}
      {hat && (
        <path
          class="as-party-hat"
          d={`M${-5} ${headY - headR + 2} L0 ${headY - headR - 12} L5 ${headY - headR + 2} z`}
        />
      )}
      <g class="cs-face">
        <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
        <circle cx={2.6} cy={headY + 0.5} r={0.9} />
        <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
      </g>
      {who === "grandpa" && (
        <g class="cs-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

function Room({ floor = 150 }: { floor?: number }) {
  return (
    <g>
      <rect class="cs-wall" x={0} y={0} width={W} height={H} />
      <rect class="cs-floor" x={0} y={floor} width={W} height={H - floor} />
    </g>
  );
}

function Balloon({ x, y, cls }: { x: number; y: number; cls: string }) {
  return (
    <g>
      <path class="as-string" d={`M${x} ${y + 12} q 3 12 -2 26`} />
      <ellipse class={cls} cx={x} cy={y} rx={9} ry={11} />
    </g>
  );
}

/** A drinking glass with a coloured drink. */
function Glass({ x, y, cls }: { x: number; y: number; cls: string }) {
  return (
    <g>
      <path class={cls} d={`M${x - 8} ${y - 18} l 2 18 h 12 l 2 -18 z`} />
      <path class="ac-glass" d={`M${x - 10} ${y - 28} l 3 28 h 14 l 3 -28`} />
    </g>
  );
}

function PartyPlan() {
  return (
    <g>
      <Room />
      <Balloon x={30} y={30} cls="as-balloon-1" />
      <Balloon x={52} y={22} cls="as-balloon-2" />
      <Balloon x={290} y={28} cls="as-balloon-3" />
      {/* the poster */}
      <g transform="rotate(-2 170 66)">
        <rect class="as-poster" x={112} y={18} width={116} height={92} rx={4} />
        <path class="as-poster-title" d="M124 34 h 92" />
        <path class="as-poster-title" d="M134 44 h 72" />
        <path class="as-flask-1" d="M140 96 l 6 -16 v -8 h 6 v 8 l 6 16 z" />
        <path class="as-flask-2" d="M164 96 l 6 -16 v -8 h 6 v 8 l 6 16 z" />
        <path class="as-flask-3" d="M188 96 l 6 -16 v -8 h 6 v 8 l 6 16 z" />
        <path
          class="as-star"
          d="M128 62 l 2 4 l 4 1 l -3 3 l 1 4 l -4 -2 l -4 2 l 1 -4 l -3 -3 l 4 -1 z"
        />
        <path
          class="as-star"
          d="M212 60 l 2 4 l 4 1 l -3 3 l 1 4 l -4 -2 l -4 2 l 1 -4 l -3 -3 l 4 -1 z"
        />
      </g>
      <Person who="riya" x={86} y={160} s={1.7} point={[30, -30]} />
      <Person who="kabir" x={252} y={150} s={1.6} point={[10, -24]} />
      <path class="as-jump" d="M238 160 q 14 -6 28 0" />
    </g>
  );
}

function CurryStain() {
  return (
    <g>
      <Room />
      {/* the shirt, held up */}
      <path
        class="as-shirt"
        d="M120 42 l 26 -10 q 14 8 28 0 l 26 10 l 12 24 l -16 6 v 72 h -72 v -72 l -16 -6 z"
      />
      <ellipse class="as-stain-yellow" cx={150} cy={96} rx={14} ry={10} />
      <ellipse class="as-stain-red" cx={176} cy={104} rx={13} ry={9} />
      <rect class="as-soap" x={232} y={130} width={24} height={14} rx={4} />
      <path class="as-foam" d="M168 98 q 4 -4 8 0 q 4 -4 8 0" />
      <Person who="kabir" x={150} y={170} s={1.3} point={[-14, -26]} />
      <Person who="mom" x={250} y={170} s={1.5} point={[-34, -38]} />
      <path class="cs-bucket" d="M30 128 h40 l -4 32 h-32 z" />
      <ellipse class="ac-water" cx={50} cy={129} rx={19} ry={4} />
    </g>
  );
}

function MagicPotions() {
  const cups = ["ac-hue-red", "ac-hue-pink", "ac-hue-purple", "ac-hue-blue", "ac-hue-green"];
  return (
    <g>
      <Room />
      <rect class="cs-table" x={80} y={120} width={180} height={8} rx={2} />
      <line class="as-table-leg" x1={92} y1={128} x2={92} y2={150} />
      <line class="as-table-leg" x1={248} y1={128} x2={248} y2={150} />
      {cups.map((c, i) => (
        <Glass key={c} x={120 + i * 28} y={120} cls={c} />
      ))}
      {/* the jug of purple juice, pouring */}
      <g transform="rotate(-30 92 86)">
        <path class="ac-hue-purple" d="M80 80 h 24 v 24 q 0 6 -6 6 h -12 q -6 0 -6 -6 z" />
        <path class="ac-glass" d="M78 72 h 28 v 32 q 0 8 -8 8 h -12 q -8 0 -8 -8 z" />
      </g>
      <path class="ac-hue-purple as-pour" d="M112 76 q 6 4 8 18" />
      <Person who="riya" x={60} y={160} s={1.7} point={[24, -34]} />
      <path class="as-cape" d="M50 104 l -10 54 h 20 z" />
      <Person who="kabir" x={292} y={160} s={1.4} />
      <path class="as-wow" d="M280 98 l -4 -6 M292 94 v -8 M304 98 l 4 -6" />
      {[
        [210, 40],
        [236, 26],
        [264, 46],
      ].map(([x, y]) => (
        <path
          key={`${x}`}
          class="as-sparkle"
          d={`M${x} ${(y ?? 0) - 6} v 12 M${(x ?? 0) - 6} ${y} h 12`}
        />
      ))}
    </g>
  );
}

function GrandpaAcidity() {
  return (
    <g>
      <Room />
      <rect class="as-sofa" x={30} y={108} width={120} height={36} rx={10} />
      <rect class="as-sofa-back" x={26} y={82} width={128} height={30} rx={10} />
      <Person who="grandpa" x={88} y={146} s={1.5} point={[-6, 8]} />
      <path class="as-ouch" d="M70 70 q -6 -6 0 -12 M104 70 q 6 -6 0 -12" />
      <ellipse class="as-plate" cx={128} cy={110} rx={14} ry={4} />
      {/* the table with three choices */}
      <rect class="cs-table" x={176} y={118} width={120} height={7} rx={2} />
      <ellipse class="as-lemon" cx={196} cy={110} rx={10} ry={8} />
      <rect class="as-vinegar" x={222} y={84} width={14} height={34} rx={3} />
      <rect class="as-vinegar-cap" x={225} y={78} width={8} height={7} rx={1.5} />
      <rect class="as-soda-box" x={252} y={94} width={30} height={24} rx={2} />
      <path class="as-soda-label" d="M256 104 h 22 M256 110 h 16" />
      <Person who="mom" x={240} y={172} s={1.4} point={[-12, -10]} />
      <text class="as-question" x={258} y={60} text-anchor="middle">
        ?
      </text>
    </g>
  );
}

function CakeRise() {
  return (
    <g>
      <Room floor={160} />
      <rect class="cs-table" x={20} y={128} width={280} height={8} rx={2} />
      {/* the flat cake */}
      <path class="as-cake-flat" d="M44 128 v -14 q 30 -6 60 0 v 14 z" />
      <ellipse class="as-plate" cx={74} cy={130} rx={40} ry={4} />
      {/* the tall cake with holes */}
      <path class="as-cake" d="M196 128 v -46 q 40 -18 80 0 v 46 z" />
      {[
        [210, 104],
        [228, 92],
        [246, 110],
        [262, 96],
        [222, 118],
        [258, 118],
        [240, 84],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} class="as-cake-hole" cx={x} cy={y} r={2.4} />
      ))}
      <ellipse class="as-plate" cx={236} cy={130} rx={48} ry={4} />
      <rect class="as-tin" x={136} y={92} width={30} height={36} rx={4} />
      <rect class="as-tin-label" x={140} y={104} width={22} height={12} rx={2} />
      <path
        class="as-steam"
        d="M222 70 q -4 -8 0 -16 M240 66 q -4 -8 0 -16 M258 70 q -4 -8 0 -16"
      />
    </g>
  );
}

function BeeSting() {
  return (
    <g>
      <rect class="cs-sky" x={0} y={0} width={W} height={H} />
      <rect class="cs-ground" x={0} y={146} width={W} height={34} />
      {[30, 54, 280, 300].map((x, i) => (
        <g key={x}>
          <line class="as-stem" x1={x} y1={146} x2={x} y2={120 - (i % 2) * 8} />
          <circle
            class={i % 2 ? "as-flower-2" : "as-flower-1"}
            cx={x}
            cy={118 - (i % 2) * 8}
            r={6}
          />
        </g>
      ))}
      <Person who="kabir" x={140} y={160} s={1.6} point={[30, -4]} />
      <circle class="as-sting" cx={170} cy={113} r={3} />
      <path class="as-paste" d="M166 110 q 4 -3 8 0 q -4 4 -8 0 z" />
      <Person who="mom" x={204} y={160} s={1.7} point={[-22, -14]} />
      {/* the bee flying off */}
      <g transform="translate(232 44)">
        <ellipse class="as-bee" rx={8} ry={5.5} />
        <path class="as-bee-stripes" d="M-2 -5 v 10 M3 -5 v 10" />
        <ellipse class="as-wing" cx={-2} cy={-8} rx={5} ry={3.5} />
        <path class="as-trail" d="M-14 6 q -12 10 -30 4 q -12 -4 -24 20" />
      </g>
    </g>
  );
}

function SweetTeeth() {
  return (
    <g>
      <Room />
      <Person who="kabir" x={80} y={160} s={1.8} point={[22, -4]} />
      <ellipse class="as-plate" cx={118} cy={118} rx={22} ry={5} />
      {[0, 1, 2, 3].map((i) => (
        <circle
          key={i}
          class={i % 2 ? "as-sweet-1" : "as-sweet-2"}
          cx={106 + i * 8}
          cy={112 - (i % 2) * 4}
          r={5}
        />
      ))}
      {/* the big tooth */}
      <path
        class="as-tooth"
        d="M196 40 q 22 -14 44 0 q 14 10 6 40 q -6 24 -10 46 q -4 6 -8 -2 l -6 -30 l -6 30 q -4 8 -8 2 q -4 -22 -10 -46 q -8 -30 -2 -40 z"
      />
      <ellipse class="as-decay" cx={230} cy={56} rx={8} ry={6} />
      <g transform="translate(266 112) rotate(20)">
        <rect class="as-brush-handle" x={-4} y={-6} width={8} height={56} rx={3} />
        <rect class="as-bristles" x={-7} y={-22} width={14} height={16} rx={2} />
        <path class="as-paste-blob" d="M-8 -22 q 8 -8 16 -2 q -8 2 -16 2 z" />
      </g>
    </g>
  );
}

function Extinguisher() {
  return (
    <g>
      <Room />
      <rect class="cs-table" x={180} y={124} width={110} height={7} rx={2} />
      <rect class="ac-candle" x={232} y={92} width={10} height={32} rx={2} />
      <path class="ac-smoke" d="M237 86 q 4 -6 0 -12 q -4 -6 0 -12" />
      <g transform="translate(20 10) rotate(30 110 100)">
        <path
          class="ac-water"
          d="M92 104 q 0 -8 8 -8 h 24 q 8 0 8 8 v 30 q 0 6 -6 6 h -28 q -6 0 -6 -6 z"
        />
        <path
          class="ac-glass"
          d="M88 142 q -4 0 -4 -6 v -34 q 0 -12 12 -14 h 6 v -16 h 20 v 16 h 6 q 12 2 12 14 v 34 q 0 6 -4 6 z"
        />
        <path class="ab-pipe" d="M112 72 V60 h 30" />
      </g>
      <path
        class="ab-spray"
        d="M178 91 q 30 -8 56 -4 M180 86 q 30 -10 56 -6 M176 96 q 30 -6 58 -6"
      />
      <Person who="riya" x={50} y={160} s={1.7} point={[34, -14]} />
      <path class="as-cape" d="M40 104 l -10 54 h 20 z" />
      <Person who="kabir" x={272} y={164} s={1.4} point={[8, -26]} />
      <Person who="grandpa" x={298} y={170} s={1.3} />
    </g>
  );
}

function Handprint() {
  return (
    <g>
      <Room floor={160} />
      <rect class="cs-table" x={20} y={126} width={280} height={8} rx={2} />
      {/* the bowl being stirred */}
      <path class="as-bowl" d="M40 104 h 64 q -4 22 -32 22 q -28 0 -32 -22 z" />
      <ellipse class="as-plaster" cx={72} cy={105} rx={30} ry={4} />
      <line class="ab-rod" x1={82} y1={70} x2={70} y2={104} />
      <Person who="riya" x={70} y={170} s={1.5} point={[14, -26]} />
      {/* the slab being pressed */}
      <rect class="as-slab" x={140} y={108} width={70} height={18} rx={3} />
      <Person who="kabir" x={176} y={176} s={1.4} point={[0, -26]} />
      {/* the finished handprint */}
      <rect class="as-slab is-hard" x={228} y={96} width={62} height={30} rx={4} />
      <path
        class="as-hand"
        d="M250 122 v -14 m 5 14 v -20 m 5 20 v -20 m 5 20 v -16 m 5 16 q 3 -8 7 -10 M248 124 q 12 4 24 0"
      />
    </g>
  );
}

function PartyNight() {
  return (
    <g>
      <rect class="as-room-night" x={0} y={0} width={W} height={H} />
      <rect class="cs-floor" x={0} y={152} width={W} height={28} />
      <path class="as-streamer-1" d="M0 12 q 40 22 80 0 q 40 22 80 0 q 40 22 80 0 q 40 22 80 0" />
      <path class="as-streamer-2" d="M0 24 q 40 18 80 0 q 40 18 80 0 q 40 18 80 0 q 40 18 80 0" />
      <Balloon x={24} y={56} cls="as-balloon-1" />
      <Balloon x={296} y={52} cls="as-balloon-3" />
      <rect class="cs-table" x={90} y={116} width={140} height={7} rx={2} />
      <path class="as-cake" d="M130 116 v -22 q 30 -8 60 0 v 22 z" />
      {[142, 160, 178].map((x) => (
        <g key={x}>
          <rect class="as-birthday-candle" x={x - 1.5} y={80} width={3} height={12} />
          <path class="ac-flame ac-flicker" d={`M${x} 72 q 3 4 2 7 q -2 2 -4 0 q -1 -3 2 -7 z`} />
        </g>
      ))}
      {["ac-hue-red", "ac-hue-green", "ac-hue-blue"].map((c, i) => (
        <Glass key={c} x={104 + i * 14} y={116} cls={c} />
      ))}
      {["ac-hue-pink", "ac-hue-purple"].map((c, i) => (
        <Glass key={c} x={206 + i * 14} y={116} cls={c} />
      ))}
      <Person who="grandpa" x={56} y={164} s={1.4} />
      <Person who="mom" x={84} y={166} s={1.4} />
      <Person who="kabir" x={250} y={166} s={1.4} hat={true} point={[-10, -20]} />
      <Person who="riya" x={276} y={166} s={1.45} />
    </g>
  );
}

/** A story panel, drawn in its own 320 × 180 units and scaled to the width. */
export function AcidSceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as AcidSceneState;
  const id = useId();
  const k = width / W;
  const height = Math.round((width * H) / W);
  const scene = ((): JSX.Element => {
    switch (s.scene) {
      case AcidSceneKind.PartyPlan:
        return <PartyPlan />;
      case AcidSceneKind.CurryStain:
        return <CurryStain />;
      case AcidSceneKind.MagicPotions:
        return <MagicPotions />;
      case AcidSceneKind.GrandpaAcidity:
        return <GrandpaAcidity />;
      case AcidSceneKind.CakeRise:
        return <CakeRise />;
      case AcidSceneKind.BeeSting:
        return <BeeSting />;
      case AcidSceneKind.SweetTeeth:
        return <SweetTeeth />;
      case AcidSceneKind.Extinguisher:
        return <Extinguisher />;
      case AcidSceneKind.Handprint:
        return <Handprint />;
      case AcidSceneKind.PartyNight:
        return <PartyNight />;
    }
  })();
  return (
    <div class="cs as ac" data-part="picture">
      <Stage
        label={describeAcidScene(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "cs-svg" }}
      >
        <clipPath id={`as-${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12 / k} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#as-${id}-frame)`}>
          {scene}
        </g>
      </Stage>
    </div>
  );
}
