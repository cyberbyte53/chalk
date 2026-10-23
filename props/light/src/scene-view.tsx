import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import {
  type LightSceneState,
  NEXT,
  PICTURE,
  SEE_TORCH,
  STEPS,
  SceneAction,
  SceneKind,
  TORCH,
  describeScene,
  isSceneLit,
} from "./scene";

const W = PICTURE.width;
const H = PICTURE.height;

type Who = "riya" | "kabir" | "grandpa" | "mom";

/**
 * A person, drawn simply: feet at (x, y), `s` the scale (1 ≈ 46 units tall for an adult).
 * From the front they have dot eyes; from the back, only hair.
 */
function Person({
  who,
  x,
  y,
  s = 1,
  back = false,
  point,
}: {
  who: Who;
  x: number;
  y: number;
  s?: number;
  back?: boolean;
  /** An arm raised towards (dx, dy) from the shoulder, in the person's own units. */
  point?: [number, number];
}): JSX.Element {
  const isChild = who === "kabir";
  const h = isChild ? 34 : 44;
  const headR = isChild ? 7.5 : 7;
  const bodyW = isChild ? 15 : 17;
  const neck = h - 2 * headR;
  const shirt =
    who === "riya"
      ? "ls-shirt-riya"
      : who === "kabir"
        ? "ls-shirt-kabir"
        : who === "grandpa"
          ? "ls-shirt-grandpa"
          : "ls-shirt-mom";
  const headY = -neck - headR + 1;
  return (
    <g class="ls-person" transform={`translate(${x} ${y}) scale(${s})`}>
      {/* legs */}
      <rect
        class="ls-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      {/* body */}
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`ls-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {/* hair behind the head */}
      {who === "riya" && (
        <path
          class="ls-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="ls-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="ls-skin" cx={0} cy={headY} r={headR} />
      {/* hair on top */}
      {who === "riya" && (
        <path
          class="ls-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -3 -${2 * headR} 0 z`}
        />
      )}
      {who === "mom" && (
        <path
          class="ls-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -2 -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="ls-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="ls-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="ls-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="ls-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="ls-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="ls-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
        </g>
      )}
      {!back && who === "grandpa" && (
        <g class="ls-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

/** A tiny face (the spoon's reflections), centred at (x, y), radius r. */
function Face({ x, y, r, flip = false }: { x: number; y: number; r: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${flip ? 180 : 0})`}>
      <circle class="ls-skin" cx={0} cy={0} r={r} />
      <path
        class="ls-hair-fill"
        d={`M${-r} 0 a ${r} ${r} 0 0 1 ${2 * r} 0 q ${-r} ${-r * 0.4} ${-2 * r} 0 z`}
      />
      <g class="ls-face">
        <circle cx={-r * 0.38} cy={r * 0.12} r={r * 0.12} />
        <circle cx={r * 0.38} cy={r * 0.12} r={r * 0.12} />
        <path d={`M${-r * 0.3} ${r * 0.48} q ${r * 0.3} ${r * 0.25} ${r * 0.6} 0`} fill="none" />
      </g>
    </g>
  );
}

/** A small rocket, nose up, centred at (x, y), `s` its scale (≈ 30 tall at 1). */
function Rocket({
  x,
  y,
  s = 1,
  flip = false,
}: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${flip ? 180 : 0})`}>
      <path class="ls-flame" d="M-4 9 L0 19 L4 9 Z" />
      <path class="ls-rocket" d="M0 -15 C 7 -8 7 4 5 9 L -5 9 C -7 4 -7 -8 0 -15 Z" />
      <path class="ls-rocket-fin" d="M-5 3 L-10 11 L-5 9 Z M5 3 L10 11 L5 9 Z" />
      <circle class="ls-rocket-window" cx={0} cy={-3} r={2.6} />
    </g>
  );
}

/** A tree on the ground at (x, y), `s` its scale, upside down when `flip`. */
function Tree({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) scale(1 ${flip ? -1 : 1})`}>
      <rect class="ls-trunk" x={-2} y={-12} width={4} height={12} rx={1} />
      <circle class="ls-leaves" cx={0} cy={-20} r={10} />
      <circle class="ls-leaves" cx={-6} cy={-14} r={6.5} />
      <circle class="ls-leaves" cx={6} cy={-14} r={6.5} />
    </g>
  );
}

function PowerCut({
  isLit,
  canToggle,
  onTorch,
}: {
  isLit: boolean;
  canToggle: boolean;
  onTorch: () => void;
}): JSX.Element {
  const tableY = 122;
  const charger = { x: 160, y: tableY - 14 };
  const torchHead: [number, number] = [TORCH.x + TORCH.width, TORCH.y + TORCH.height / 2];
  // The beam: a straight cone from the torch's head across the table to past the charger.
  const beam = `M${torchHead[0]} ${torchHead[1] - 3} L 236 ${tableY - 30} L 236 ${tableY} L${torchHead[0]} ${torchHead[1] + 3} Z`;
  // The charger's shadow falls straight on, away from the torch.
  const shadow = `M${charger.x + 24} ${charger.y + 1} L 236 ${charger.y - 6} L 236 ${tableY} L${charger.x + 24} ${tableY} Z`;
  const lit = isLit ? " is-lit" : "";
  return (
    <g class={`ls-powercut${lit}`}>
      <rect class="ls-night" x={0} y={0} width={W} height={H} />
      {/* window with the moon */}
      <rect class="ls-window-night" x={26} y={18} width={58} height={50} rx={4} />
      <circle class="ls-moon" cx={66} cy={34} r={8} />
      <circle class="ls-window-night-sky" cx={70} cy={31} r={6.5} />
      <line class="ls-window-bar" x1={55} y1={18} x2={55} y2={68} />
      <line class="ls-window-bar" x1={26} y1={43} x2={84} y2={43} />
      {/* the table */}
      <rect class="ls-dark-thing" x={40} y={tableY} width={262} height={7} rx={2} />
      <rect class="ls-dark-thing" x={52} y={tableY + 7} width={6} height={H - tableY - 7} />
      <rect class="ls-dark-thing" x={284} y={tableY + 7} width={6} height={H - tableY - 7} />
      {isLit && <path class="ls-beam" d={beam} />}
      {isLit && <path class="ls-shadow" d={shadow} />}
      {/* the charger: plug and cable */}
      <path
        class="ls-dark-line"
        d={`M${charger.x} ${charger.y + 7} C ${charger.x - 18} ${charger.y + 7}, ${charger.x - 26} ${tableY - 1}, ${charger.x - 40} ${tableY - 1}`}
        fill="none"
      />
      <rect
        class="ls-dark-thing ls-charger"
        x={charger.x}
        y={charger.y}
        width={24}
        height={14}
        rx={3}
      />
      <rect
        class="ls-dark-thing ls-charger"
        x={charger.x + 24}
        y={charger.y + 3}
        width={6}
        height={2}
      />
      <rect
        class="ls-dark-thing ls-charger"
        x={charger.x + 24}
        y={charger.y + 8.5}
        width={6}
        height={2}
      />
      {/* the phone, glowing: it makes its own light */}
      <rect class="ls-phone-glow" x={238} y={tableY - 56} width={42} height={64} rx={10} />
      <rect class="ls-phone" x={246} y={tableY - 50} width={26} height={50} rx={4} />
      <rect class="ls-phone-screen" x={248.5} y={tableY - 46.5} width={21} height={42} rx={2} />
      <rect class="ls-battery" x={253} y={tableY - 30} width={11} height={7} rx={1} />
      <rect class="ls-battery" x={264} y={tableY - 28} width={1.6} height={3} />
      <rect class="ls-battery-low" x={254.2} y={tableY - 28.8} width={1.4} height={4.6} />
      <text class="ls-battery-text" x={259} y={tableY - 13} text-anchor="middle">
        2%
      </text>
      {/* the torch: the learner's switch */}
      <g
        class={`ls-torch${canToggle ? " is-tappable" : ""}`}
        role={canToggle ? "button" : undefined}
        tabIndex={canToggle ? 0 : undefined}
        aria-label={
          canToggle ? (isLit ? "Switch the torch off" : "Switch the torch on") : undefined
        }
        onClick={canToggle ? onTorch : undefined}
        onKeyDown={
          canToggle
            ? (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onTorch();
              }
            : undefined
        }
      >
        {canToggle && !isLit && (
          <circle
            class="ls-torch-halo"
            cx={TORCH.x + TORCH.width / 2}
            cy={TORCH.y + TORCH.height / 2}
            r={TORCH.width / 2 + 6}
          />
        )}
        <rect
          class="ls-torch-body"
          x={TORCH.x}
          y={TORCH.y + 4}
          width={TORCH.width - 10}
          height={TORCH.height - 8}
          rx={3}
        />
        <path
          class="ls-torch-body"
          d={`M${TORCH.x + TORCH.width - 11} ${TORCH.y + 4} L${TORCH.x + TORCH.width} ${TORCH.y} L${TORCH.x + TORCH.width} ${TORCH.y + TORCH.height} L${TORCH.x + TORCH.width - 11} ${TORCH.y + TORCH.height - 4} Z`}
        />
        <rect
          class="ls-torch-button"
          x={TORCH.x + 9}
          y={TORCH.y + 2.5}
          width={7}
          height={2.5}
          rx={1}
        />
        <rect
          class={isLit ? "ls-torch-lens is-on" : "ls-torch-lens"}
          x={TORCH.x + TORCH.width - 2}
          y={TORCH.y + 1}
          width={2.5}
          height={TORCH.height - 2}
          rx={1}
        />
      </g>
    </g>
  );
}

function Spoons(): JSX.Element {
  const spoon = (cx: number, isHollow: boolean) => (
    <g>
      <rect class="ls-steel-dark" x={cx - 4} y={112} width={8} height={62} rx={4} />
      <ellipse class="ls-steel" cx={cx} cy={70} rx={42} ry={54} />
      {isHollow ? (
        <>
          <ellipse class="ls-steel-hollow" cx={cx} cy={72} rx={34} ry={45} />
          <path class="ls-steel-shine" d={`M${cx + 18} ${38} q 10 18 6 40`} fill="none" />
        </>
      ) : (
        <>
          <ellipse class="ls-steel-back" cx={cx} cy={68} rx={36} ry={47} />
          <path class="ls-steel-shine" d={`M${cx - 20} ${40} q -8 16 -5 34`} fill="none" />
          <ellipse class="ls-steel-glint" cx={cx - 14} cy={42} rx={6} ry={9} />
        </>
      )}
      <Face x={cx} y={isHollow ? 76 : 70} r={isHollow ? 12 : 9} flip={isHollow} />
    </g>
  );
  return (
    <g>
      <rect class="ls-wall" x={0} y={0} width={W} height={H} />
      <rect class="ls-tablecloth" x={0} y={150} width={W} height={30} />
      {spoon(100, true)}
      {spoon(220, false)}
    </g>
  );
}

/** A window picture (sky, sun, grass, a tree) in the box, upside down when `flip`. */
function WindowView({
  x,
  y,
  w,
  h,
  flip = false,
}: { x: number; y: number; w: number; h: number; flip?: boolean }): JSX.Element {
  const grass = h * 0.2;
  return (
    <g transform={flip ? `translate(0 ${2 * y + h}) scale(1 -1)` : undefined}>
      <rect class="ls-sky" x={x} y={y} width={w} height={h} rx={2} />
      <circle class="ls-sun" cx={x + w * 0.76} cy={y + h * 0.24} r={Math.min(w, h) * 0.12} />
      <rect class="ls-grass" x={x} y={y + h - grass} width={w} height={grass} />
      <Tree x={x + w * 0.32} y={y + h - grass * 0.6} s={h / 60} />
    </g>
  );
}

function MakeupMirror(): JSX.Element {
  const wall = { x: 12, w: 104 };
  const win = { x: 30, y: 16, w: 68, h: 50 };
  const mirror = { x: 262, y: 92 };
  // A white tissue box on the dressing table, just in front of the mirror: the window's picture
  // lands on it, small and upside down (light from far away meets near F, close to the mirror).
  const box = { x: 222, y: 98, w: 24, h: 26 };
  const pic = { x: box.x + 3, y: box.y + 5, w: box.w - 6, h: 14 };
  return (
    <g>
      <rect class="ls-wall" x={0} y={0} width={W} height={H} />
      <rect class="ls-floor" x={0} y={152} width={W} height={28} />
      {/* the left wall, facing us, with the window high up */}
      <rect class="ls-wall-face" x={wall.x} y={0} width={wall.w} height={152} />
      <rect
        class="ls-window-frame"
        x={win.x - 4}
        y={win.y - 4}
        width={win.w + 8}
        height={win.h + 8}
        rx={4}
      />
      <WindowView x={win.x} y={win.y} w={win.w} h={win.h} />
      <line
        class="ls-window-bar-day"
        x1={win.x + win.w / 2}
        y1={win.y}
        x2={win.x + win.w / 2}
        y2={win.y + win.h}
      />
      {/* light in: window → mirror; light back: mirror → the tissue box just in front of it */}
      <path
        class="ls-light"
        d={`M${win.x + win.w} ${win.y + 6} L${mirror.x - 3} ${mirror.y - 20} L${mirror.x - 3} ${mirror.y - 3} L${win.x + win.w} ${win.y + win.h - 6} Z`}
      />
      <path
        class="ls-light-strong"
        d={`M${mirror.x - 3} ${mirror.y - 14} L${box.x + box.w} ${pic.y} L${box.x + box.w} ${pic.y + pic.h} L${mirror.x - 3} ${mirror.y + 14} Z`}
      />
      {/* the dressing table and Mom's make-up mirror, facing the window; a lipstick and a compact beside it */}
      <rect class="ls-table" x={210} y={124} width={104} height={7} rx={2} />
      <rect class="ls-table" x={218} y={131} width={5} height={21} />
      <rect class="ls-table" x={302} y={131} width={5} height={21} />
      {/* the tissue box, with the window's picture on it, upside down */}
      <rect class="ls-card" x={box.x} y={box.y} width={box.w} height={box.h} rx={2} />
      <rect
        class="ls-projected-frame"
        x={pic.x - 1}
        y={pic.y - 1}
        width={pic.w + 2}
        height={pic.h + 2}
        rx={2}
      />
      <WindowView x={pic.x} y={pic.y} w={pic.w} h={pic.h} flip />
      <rect class="ls-stand" x={mirror.x + 4} y={mirror.y + 18} width={4} height={14} />
      <rect class="ls-stand" x={mirror.x - 8} y={122} width={28} height={3} rx={1.5} />
      <ellipse class="ls-mirror-rim" cx={mirror.x} cy={mirror.y} rx={9} ry={24} />
      <ellipse class="ls-mirror-glass" cx={mirror.x - 2} cy={mirror.y} rx={5} ry={20} />
      <rect class="ls-lipstick-case" x={284} y={113} width={6} height={11} rx={1} />
      <path class="ls-lipstick" d="M284.8 113 L284.8 107 L289.2 104.5 L289.2 113 Z" />
      <ellipse class="ls-compact" cx={300} cy={122} rx={8} ry={2.6} />
      <ellipse class="ls-compact-lid" cx={300} cy={120.6} rx={7} ry={1.8} />
      <Person who="kabir" x={176} y={168} s={1.2} point={[22, -24]} />
    </g>
  );
}

function PhoneCard(): JSX.Element {
  const tableY = 128;
  const phone = { x: 26, y: tableY - 62, w: 36, h: 62 };
  const mirror = { x: 282, y: tableY - 32 };
  const card = { x: 150, y: 54, w: 44, h: 34 };
  return (
    <g>
      <rect class="ls-night" x={0} y={0} width={W} height={H} />
      <rect class="ls-dark-thing" x={10} y={tableY} width={300} height={7} rx={2} />
      <rect class="ls-dark-thing" x={20} y={tableY + 7} width={6} height={H - tableY - 7} />
      <rect class="ls-dark-thing" x={292} y={tableY + 7} width={6} height={H - tableY - 7} />
      {/* phone → mirror (above), mirror → card (below) */}
      <path
        class="ls-light-on-dark"
        d={`M${phone.x + phone.w} ${phone.y + 4} L${mirror.x - 3} ${mirror.y - 20} L${mirror.x - 3} ${mirror.y - 4} L${phone.x + phone.w} ${phone.y + phone.h - 6} Z`}
      />
      <path
        class="ls-light-on-dark-strong"
        d={`M${mirror.x - 3} ${mirror.y + 2} L${card.x + card.w} ${card.y + 4} L${card.x + card.w} ${card.y + card.h - 4} L${mirror.x - 3} ${mirror.y + 20} Z`}
      />
      {/* the phone, playing the movie */}
      <rect
        class="ls-phone-glow"
        x={phone.x - 6}
        y={phone.y - 6}
        width={phone.w + 12}
        height={phone.h + 12}
        rx={10}
      />
      <rect class="ls-phone" x={phone.x} y={phone.y} width={phone.w} height={phone.h} rx={5} />
      <rect
        class="ls-screen-bright"
        x={phone.x + 3}
        y={phone.y + 5}
        width={phone.w - 6}
        height={phone.h - 10}
        rx={2}
      />
      <Rocket x={phone.x + phone.w / 2} y={phone.y + phone.h / 2} s={0.9} />
      {/* the mirror */}
      <rect class="ls-stand" x={mirror.x + 4} y={mirror.y + 18} width={4} height={14} />
      <rect class="ls-stand" x={mirror.x - 8} y={tableY - 2} width={28} height={3} rx={1.5} />
      <ellipse class="ls-mirror-rim" cx={mirror.x} cy={mirror.y} rx={9} ry={24} />
      <ellipse class="ls-mirror-glass" cx={mirror.x - 2} cy={mirror.y} rx={5} ry={20} />
      {/* Kabir's card, with the small upside-down picture */}
      <rect class="ls-paper" x={card.x} y={card.y} width={card.w} height={card.h} rx={2} />
      <rect
        class="ls-screen-bright"
        x={card.x + 12}
        y={card.y + 7}
        width={20}
        height={20}
        rx={1.5}
      />
      <Rocket x={card.x + 22} y={card.y + 17} s={0.4} flip />
      <Person who="kabir" x={176} y={176} s={1.15} point={[-6, -46]} />
    </g>
  );
}

function ShoeboxBlurry(): JSX.Element {
  const box = { x: 18, y: 104, w: 108, h: 44 };
  const lensX = box.x + box.w;
  const mid = box.y + box.h / 2;
  const blob = { x: 250, y: 54 };
  return (
    <g>
      <rect class="ls-room-dim" x={0} y={0} width={W} height={H} />
      <rect class="ls-floor-dim" x={0} y={160} width={W} height={20} />
      <path
        class="ls-light"
        d={`M${lensX + 3} ${mid - 6} L${blob.x + 54} ${blob.y - 44} L${blob.x + 54} ${blob.y + 44} L${lensX + 3} ${mid + 6} Z`}
      />
      {/* a big blurry patch, no picture */}
      {[54, 44, 34, 24].map((r, k) => (
        <ellipse
          key={r}
          class="ls-blur"
          cx={blob.x}
          cy={blob.y}
          rx={r}
          ry={r * 0.82}
          style={{ opacity: 0.18 + k * 0.14 }}
        />
      ))}
      <rect class="ls-box-inside" x={box.x} y={box.y} width={box.w} height={box.h} />
      <path
        class="ls-box-lid"
        d={`M${box.x} ${box.y} L${box.x + 16} ${box.y - 12} L${box.x + box.w + 16} ${box.y - 12} L${box.x + box.w} ${box.y} Z`}
      />
      <rect class="ls-box-edge" x={box.x} y={box.y} width={box.w} height={box.h} fill="none" />
      <rect class="ls-phone" x={box.x + 6} y={box.y + 6} width={9} height={box.h - 12} rx={2} />
      <rect
        class="ls-phone-screen-movie"
        x={box.x + 13}
        y={box.y + 8}
        width={2.4}
        height={box.h - 16}
      />
      <path
        class="ls-light-faint"
        d={`M${box.x + 16} ${box.y + 8} L${lensX} ${mid - 6} L${lensX} ${mid + 6} L${box.x + 16} ${box.y + box.h - 8} Z`}
      />
      <ellipse class="ls-lens" cx={lensX} cy={mid} rx={4} ry={13} />
      {/* Kabir, puzzled */}
      <Person who="kabir" x={164} y={172} s={1.15} point={[-4, -30]} />
      <path class="ls-puzzle" d="M170 112 q 4 -4 8 0 M174 104 q 5 -5 10 0" fill="none" />
    </g>
  );
}

/** A ray with an arrowhead part way along, from (x1, y1) to (x2, y2). */
function Ray({
  x1,
  y1,
  x2,
  y2,
  at = 0.5,
  cls = "ls-ray",
}: { x1: number; y1: number; x2: number; y2: number; at?: number; cls?: string }): JSX.Element {
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const px = x1 + (x2 - x1) * at;
  const py = y1 + (y2 - y1) * at;
  return (
    <g class={cls}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <path d="M-6 -4 L5 0 L-6 4 Z" transform={`translate(${px} ${py}) rotate(${angle})`} />
    </g>
  );
}

function LensShapes(): JSX.Element {
  const mid = 90;
  const ys = [-28, 0, 28];
  const convex = { x: 92, focus: 150 };
  const concave = { x: 232 };
  return (
    <g>
      <rect class="ls-wall" x={0} y={0} width={W} height={H} />
      <line class="ls-divider" x1={160} y1={20} x2={160} y2={160} />
      {/* convex: thicker in the middle; rays come together */}
      {ys.map((dy) => (
        <g key={`a${dy}`}>
          <Ray x1={16} y1={mid + dy} x2={convex.x} y2={mid + dy} at={0.55} />
          <Ray x1={convex.x} y1={mid + dy} x2={convex.focus} y2={mid + dy * -0.25} at={0.6} />
        </g>
      ))}
      <path
        class="ls-lens-cut"
        d={`M${convex.x} ${mid - 44} Q ${convex.x + 22} ${mid} ${convex.x} ${mid + 44} Q ${convex.x - 22} ${mid} ${convex.x} ${mid - 44} Z`}
      />
      {/* concave: thinner in the middle; rays spread out */}
      {ys.map((dy) => (
        <g key={`b${dy}`}>
          <Ray x1={176} y1={mid + dy} x2={concave.x} y2={mid + dy} at={0.55} />
          <Ray x1={concave.x} y1={mid + dy} x2={304} y2={mid + dy * 2.1} at={0.6} />
        </g>
      ))}
      <path
        class="ls-lens-cut"
        d={`M${concave.x - 12} ${mid - 44} L${concave.x + 12} ${mid - 44} Q ${concave.x + 3} ${mid} ${concave.x + 12} ${mid + 44} L${concave.x - 12} ${mid + 44} Q ${concave.x - 3} ${mid} ${concave.x - 12} ${mid - 44} Z`}
      />
    </g>
  );
}

/** A ray drawn as light travelling along it: moving dashes, an arrowhead, optionally appearing late. */
function Flow({
  x1,
  y1,
  x2,
  y2,
  cls = "",
  late = false,
  at = 0.55,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cls?: string;
  late?: boolean;
  at?: number;
}): JSX.Element {
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g class={`ls-flowray ${cls}${late ? " ls-later" : ""}`}>
      <line class="ls-flow" x1={x1} y1={y1} x2={x2} y2={y2} />
      <path
        d="M-6 -4 L5 0 L-6 4 Z"
        transform={`translate(${x1 + (x2 - x1) * at} ${y1 + (y2 - y1) * at}) rotate(${angle})`}
      />
    </g>
  );
}

/** A torch at `t` (picture units), tilted by `angle` degrees about its left end. */
function TorchAt({
  t,
  angle,
  isOn,
  canToggle,
  onTorch,
}: {
  t: { x: number; y: number; width: number; height: number };
  angle: number;
  isOn: boolean;
  canToggle: boolean;
  onTorch: () => void;
}): JSX.Element {
  return (
    <g
      class={`ls-torch${canToggle ? " is-tappable" : ""}`}
      role={canToggle ? "button" : undefined}
      tabIndex={canToggle ? 0 : undefined}
      aria-label={canToggle ? (isOn ? "Switch the torch off" : "Switch the torch on") : undefined}
      onClick={canToggle ? onTorch : undefined}
      onKeyDown={
        canToggle
          ? (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              onTorch();
            }
          : undefined
      }
      transform={`rotate(${angle} ${t.x} ${t.y + t.height / 2})`}
    >
      {canToggle && !isOn && (
        <circle
          class="ls-torch-halo"
          cx={t.x + t.width / 2}
          cy={t.y + t.height / 2}
          r={t.width / 2 + 6}
        />
      )}
      <rect
        class="ls-torch-body-lit"
        x={t.x}
        y={t.y + 4}
        width={t.width - 12}
        height={t.height - 8}
        rx={3}
      />
      <path
        class="ls-torch-body-lit"
        d={`M${t.x + t.width - 13} ${t.y + 4} L${t.x + t.width} ${t.y} L${t.x + t.width} ${t.y + t.height} L${t.x + t.width - 13} ${t.y + t.height - 4} Z`}
      />
      <rect class="ls-torch-button" x={t.x + 10} y={t.y + 2.5} width={8} height={2.5} rx={1} />
      <rect
        class={isOn ? "ls-torch-lens is-on" : "ls-torch-lens"}
        x={t.x + t.width - 1.5}
        y={t.y + 1}
        width={2.5}
        height={t.height - 2}
        rx={1}
      />
    </g>
  );
}

/** Riya's head in profile, facing left, eye at (x, y). */
function ProfileHead({ x, y }: { x: number; y: number }): JSX.Element {
  // (x, y) is the eye; the head is a circle behind it, facing left.
  const hx = x + 10;
  const hy = y - 1;
  return (
    <g>
      <rect class="ls-shirt-riya" x={hx - 14} y={hy + 22} width={36} height={70} rx={14} />
      <rect class="ls-skin" x={hx - 4} y={hy + 10} width={10} height={16} rx={3} />
      <path class="ls-hair" d={`M${hx + 12} ${hy - 4} q 16 4 12 28`} stroke-width={8} fill="none" />
      <circle class="ls-skin" cx={hx} cy={hy} r={15} />
      <path class="ls-skin" d={`M${hx - 14} ${hy + 2} l -5 5 l 5 2 Z`} />
      <path
        class="ls-hair-fill"
        d={`M${hx - 13} ${hy - 6} A 15 15 0 0 1 ${hx + 15} ${hy + 2} Q ${hx + 8} ${hy + 6} ${hx + 6} ${hy - 4} Q ${hx - 2} ${hy - 9} ${hx - 13} ${hy - 6} Z`}
      />
      <ellipse class="ls-eye-white" cx={x} cy={y} rx={3.2} ry={2.4} />
      <circle class="ls-face-dot" cx={x - 0.8} cy={y} r={1.4} />
      <path class="ls-mouth" d={`M${hx - 13} ${hy + 9} q 3 1.5 5 0`} fill="none" />
    </g>
  );
}

function HowWeSee({
  isOn,
  canToggle,
  onTorch,
}: {
  isOn: boolean;
  canToggle: boolean;
  onTorch: () => void;
}): JSX.Element {
  const tableY = 134;
  const charger = { x: 150, y: tableY - 12, w: 26, h: 12 };
  // The torch's head, after it is tilted down towards the table.
  const tilt = 22;
  const rad = (tilt * Math.PI) / 180;
  const len = SEE_TORCH.width;
  const head: [number, number] = [
    SEE_TORCH.x + len * Math.cos(rad) - 1,
    SEE_TORCH.y + SEE_TORCH.height / 2 + len * Math.sin(rad),
  ];
  const targets: [number, number][] = [
    [charger.x + 20, charger.y],
    [charger.x + 13, charger.y],
    [charger.x + 6, charger.y + 1],
    [charger.x + 1, charger.y + 5],
  ];
  const bounce: [number, number] = [charger.x + 13, charger.y];
  const eye: [number, number] = [268, 74];
  const scatter: [number, number][] = [
    [96, 30],
    [150, 18],
    [214, 26],
    [234, 122],
  ];
  return (
    <g class={isOn ? "ls-see is-lit" : "ls-see"}>
      <rect class={isOn ? "ls-room-dim" : "ls-night"} x={0} y={0} width={W} height={H} />
      {/* table and charger */}
      <rect class="ls-dark-thing" x={96} y={tableY} width={150} height={7} rx={2} />
      <rect class="ls-dark-thing" x={106} y={tableY + 7} width={6} height={H - tableY - 7} />
      <rect class="ls-dark-thing" x={230} y={tableY + 7} width={6} height={H - tableY - 7} />
      <path
        class="ls-dark-line"
        d={`M${charger.x} ${charger.y + 6} C ${charger.x - 14} ${charger.y + 7}, ${charger.x - 22} ${tableY - 1}, ${charger.x - 36} ${tableY - 1}`}
        fill="none"
      />
      <rect
        class="ls-dark-thing ls-charger"
        x={charger.x}
        y={charger.y}
        width={charger.w}
        height={charger.h}
        rx={3}
      />
      <rect
        class="ls-dark-thing ls-charger"
        x={charger.x + charger.w}
        y={charger.y + 2.5}
        width={6}
        height={2}
      />
      <rect
        class="ls-dark-thing ls-charger"
        x={charger.x + charger.w}
        y={charger.y + 7.5}
        width={6}
        height={2}
      />
      {isOn && (
        <g>
          {/* 1. light from the torch to the charger */}
          {targets.map(([x, y], k) => (
            <Flow
              key={`in${x}`}
              x1={head[0] - 2 + k * 1.5}
              y1={head[1] - 5 + k * 3.4}
              x2={x}
              y2={y}
              cls="ls-in"
              at={0.45 + k * 0.08}
            />
          ))}
          {/* 2. it bounces off the charger every which way */}
          {scatter.map(([x, y]) => (
            <Flow key={`out${x}`} x1={bounce[0]} y1={bounce[1]} x2={x} y2={y} cls="ls-out" late />
          ))}
          {/* 3. one bounced ray goes into Riya's eye */}
          <Flow
            x1={bounce[0]}
            y1={bounce[1]}
            x2={eye[0]}
            y2={eye[1]}
            cls="ls-to-eye"
            late
            at={0.62}
          />
          <circle class="ls-eye-glow ls-later-2" cx={eye[0]} cy={eye[1]} r={5.5} />
        </g>
      )}
      <TorchAt t={SEE_TORCH} angle={tilt} isOn={isOn} canToggle={canToggle} onTorch={onTorch} />
      <ProfileHead x={eye[0] + 1} y={eye[1]} />
    </g>
  );
}

function StraightLines(): JSX.Element {
  const bulb: [number, number] = [40, 92];
  const ball = { x: 146, y: 92, r: 26 };
  const wallX = 276;
  const d = ball.x - bulb[0];
  const t = Math.asin(ball.r / d);
  const atWall = (a: number): [number, number] => [
    wallX,
    bulb[1] + Math.tan(a) * (wallX - bulb[0]),
  ];
  /** Where a ray at angle `a` first meets the ball, or null if it misses. */
  const onBall = (a: number): [number, number] | null => {
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const fx = bulb[0] - ball.x;
    const fy = bulb[1] - ball.y;
    const b = fx * dx + fy * dy;
    const c = fx * fx + fy * fy - ball.r * ball.r;
    const disc = b * b - c;
    if (disc < 0) return null;
    const s = -b - Math.sqrt(disc);
    return [bulb[0] + s * dx, bulb[1] + s * dy];
  };
  const shadowTop = atWall(-t)[1];
  const shadowBottom = atWall(t)[1];
  const misses = [-0.32, 0.32];
  const hits = [-0.12, 0.12];
  return (
    <g>
      <rect class="ls-room-dim" x={0} y={0} width={W} height={H} />
      {/* the wall: lit, with a sharp shadow */}
      <rect class="ls-wall-lit" x={wallX} y={0} width={W - wallX} height={H} />
      <rect
        class="ls-wall-shadow"
        x={wallX}
        y={shadowTop}
        width={W - wallX}
        height={shadowBottom - shadowTop}
      />
      {misses.map((a) => {
        const [x2, y2] = atWall(a);
        return <Flow key={a} x1={bulb[0]} y1={bulb[1]} x2={x2} y2={y2} cls="ls-soft" at={0.78} />;
      })}
      {hits.map((a) => {
        const p = onBall(a);
        if (p === null) return null;
        return (
          <Flow key={a} x1={bulb[0]} y1={bulb[1]} x2={p[0]} y2={p[1]} cls="ls-soft" at={0.7} />
        );
      })}
      {/* the two rays that just graze the ball carry straight on to the shadow's edges */}
      {[-t, t].map((a) => {
        const [x2, y2] = atWall(a);
        return <Flow key={a} x1={bulb[0]} y1={bulb[1]} x2={x2} y2={y2} cls="ls-pick" at={0.8} />;
      })}
      <circle class="ls-ball" cx={ball.x} cy={ball.y} r={ball.r} />
      <ellipse class="ls-steel-glint" cx={ball.x - 7} cy={ball.y - 8} rx={5} ry={4} />
      <circle class="ls-lamp-glow" cx={bulb[0]} cy={bulb[1]} r={15} />
      <circle class="ls-bulb" cx={bulb[0]} cy={bulb[1]} r={7} />
    </g>
  );
}

/** A thick cap of a sphere centred at (cx, cy), radius r, spanning `half` radians each side of angle 0 (facing right). */
function capShell(cx: number, cy: number, r: number, half: number, thick: number): string {
  const p = (rr: number, a: number) => `${cx + rr * Math.cos(a)} ${cy + rr * Math.sin(a)}`;
  return `M${p(r, -half)} A ${r} ${r} 0 0 1 ${p(r, half)} L${p(r - thick, half)} A ${r - thick} ${r - thick} 0 0 0 ${p(r - thick, -half)} Z`;
}
function capArc(cx: number, cy: number, r: number, half: number): string {
  const p = (a: number) => `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
  return `M${p(-half)} A ${r} ${r} 0 0 1 ${p(half)}`;
}

function MirrorSteps({
  step,
  canStep,
  onNext,
  clip,
}: {
  step: number;
  canStep: boolean;
  onNext: () => void;
  clip: string;
}): JSX.Element {
  const c = { x: 130, y: 88, r: 60 };
  const cut = 36; // the cut, this far right of the centre
  const face = Math.sqrt(c.r * c.r - cut * cut);
  const next = canStep && (
    <g
      class="ls-next"
      role={canStep ? "button" : undefined}
      tabIndex={0}
      aria-label="Next step"
      onClick={onNext}
      onKeyDown={(event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onNext();
      }}
    >
      <circle class="ls-next-button" cx={NEXT.x} cy={NEXT.y} r={NEXT.r} />
      <path
        class="ls-next-arrow"
        d={`M${NEXT.x - 3} ${NEXT.y - 6} L${NEXT.x + 4} ${NEXT.y} L${NEXT.x - 3} ${NEXT.y + 6}`}
      />
    </g>
  );
  const dots = (
    <g>
      {Array.from({ length: STEPS }, (_, n) => n).map((k) => (
        <circle
          key={k}
          class={k === step ? "ls-step-dot is-on" : "ls-step-dot"}
          cx={NEXT.x - 46 + k * 10}
          cy={NEXT.y}
          r={3}
        />
      ))}
    </g>
  );
  if (step === 2) {
    const left = { x: 74, y: 88, r: 62 };
    const half = 0.62;
    const p: [number, number] = [left.x + left.r, left.y];
    const right = { x: 196, y: 88 };
    return (
      <g>
        <rect class="ls-wall" x={0} y={0} width={W} height={H} />
        <line class="ls-divider" x1={190} y1={14} x2={190} y2={160} />
        {/* concave: shiny on the inside, with the ball it came from */}
        <circle class="ls-sphere" cx={left.x} cy={left.y} r={left.r} />
        <path class="ls-shell" d={capShell(left.x, left.y, left.r + 3, half, 6)} />
        <path class="ls-shine-side" d={capArc(left.x, left.y, left.r - 3, half - 0.04)} />
        <path
          class="ls-sparkle"
          d={`M${p[0] - 14} ${p[1] - 26} l 0 8 M${p[0] - 18} ${p[1] - 22} l 8 0`}
        />
        <line class="ls-radius" x1={left.x} y1={left.y} x2={p[0] - 3} y2={p[1]} />
        <circle class="ls-point" cx={left.x} cy={left.y} r={3.5} />
        <circle class="ls-point" cx={p[0] - 3} cy={p[1]} r={3.5} />
        <text class="ls-letter" x={left.x - 4} y={left.y + 18}>
          C
        </text>
        <text class="ls-letter" x={(left.x + p[0]) / 2 - 4} y={left.y - 7}>
          R
        </text>
        <text class="ls-letter" x={p[0] - 20} y={p[1] + 18}>
          P
        </text>
        {/* convex: shiny on the outside */}
        <path class="ls-shell" d={capShell(right.x, right.y, 62, half, 6)} />
        <path class="ls-shine-side" d={capArc(right.x, right.y, 65, half - 0.04)} />
        <path
          class="ls-sparkle"
          d={`M${right.x + 74} ${right.y - 30} l 0 8 M${right.x + 70} ${right.y - 26} l 8 0`}
        />
        {dots}
        {next}
      </g>
    );
  }
  return (
    <g>
      <rect class="ls-wall" x={0} y={0} width={W} height={H} />
      <ellipse class="ls-floor-shadow" cx={c.x} cy={c.y + c.r + 8} rx={c.r * 0.8} ry={6} />
      <clipPath id={`${clip}-rest`}>
        <rect x={0} y={0} width={step === 0 ? W : c.x + cut} height={H} />
      </clipPath>
      <clipPath id={`${clip}-cap`}>
        <rect x={c.x + cut} y={0} width={W} height={H} />
      </clipPath>
      {/* the ball (what is left of it, once the cap is cut) */}
      <g clip-path={`url(#${clip}-rest)`}>
        <circle class="ls-steel-ball" cx={c.x} cy={c.y} r={c.r} />
        <path
          class="ls-steel-dark-side"
          d={`M${c.x + c.r * 0.2} ${c.y + c.r * 0.98} A ${c.r} ${c.r} 0 0 0 ${c.x + c.r * 0.98} ${c.y + c.r * 0.2} A ${c.r * 1.1} ${c.r * 1.1} 0 0 1 ${c.x + c.r * 0.2} ${c.y + c.r * 0.98} Z`}
        />
        <ellipse
          class="ls-steel-glint"
          cx={c.x - 22}
          cy={c.y - 24}
          rx={14}
          ry={9}
          transform={`rotate(-30 ${c.x - 22} ${c.y - 24})`}
        />
      </g>
      {step === 1 && (
        <g>
          <ellipse class="ls-cut-face" cx={c.x + cut} cy={c.y} rx={8} ry={face} />
          <g class="ls-cap-lift">
            <g clip-path={`url(#${clip}-cap)`}>
              <circle class="ls-steel-ball" cx={c.x} cy={c.y} r={c.r} />
            </g>
            <ellipse class="ls-cut-face" cx={c.x + cut} cy={c.y} rx={8} ry={face} />
          </g>
        </g>
      )}
      {dots}
      {next}
    </g>
  );
}

function SeeThrough(): JSX.Element {
  const cols = [56, 160, 264] as const;
  const lampY = 70;
  const lamp = (x: number) => (
    <g>
      <circle class="ls-lamp-glow" cx={x} cy={lampY} r={20} />
      <circle class="ls-bulb" cx={x} cy={lampY} r={9} />
      <rect class="ls-stand" x={x - 3} y={lampY + 9} width={6} height={60} />
      <rect class="ls-stand" x={x - 14} y={lampY + 67} width={28} height={4} rx={2} />
    </g>
  );
  return (
    <g>
      <rect class="ls-room-dim" x={0} y={0} width={W} height={H} />
      <rect class="ls-floor-dim" x={0} y={150} width={W} height={30} />
      {cols.map((x) => (
        <g key={x}>{lamp(x)}</g>
      ))}
      {/* clear glass: the lamp seen sharply */}
      <rect class="ls-pane-glass" x={cols[0] - 34} y={30} width={68} height={92} rx={3} />
      <path
        class="ls-steel-shine"
        d={`M${cols[0] - 24} 44 l 10 -8 M${cols[0] - 24} 58 l 18 -16`}
        fill="none"
      />
      {/* butter paper: only a fuzzy glow */}
      <rect class="ls-pane-paper" x={cols[1] - 34} y={30} width={68} height={92} rx={3} />
      {[30, 22, 14].map((rr, k) => (
        <circle
          key={rr}
          class="ls-glow-through"
          cx={cols[1]}
          cy={lampY}
          r={rr}
          style={{ opacity: 0.18 + k * 0.16 }}
        />
      ))}
      {/* a wooden board: nothing gets through, a shadow behind */}
      <path
        class="ls-shadow-soft"
        d={`M${cols[2] - 34} 150 L${cols[2] + 34} 150 L${cols[2] + 50} 166 L${cols[2] - 18} 166 Z`}
      />
      <rect class="ls-board" x={cols[2] - 34} y={30} width={68} height={92} rx={3} />
      <line class="ls-board-grain" x1={cols[2] - 26} y1={48} x2={cols[2] + 26} y2={52} />
      <line class="ls-board-grain" x1={cols[2] - 26} y1={78} x2={cols[2] + 26} y2={74} />
      <line class="ls-board-grain" x1={cols[2] - 26} y1={104} x2={cols[2] + 26} y2={106} />
    </g>
  );
}

function RayBeam(): JSX.Element {
  const head: [number, number] = [74, 90];
  const ends = [-44, -22, 0, 22, 44];
  return (
    <g>
      <rect class="ls-room-dim" x={0} y={0} width={W} height={H} />
      <path
        class="ls-beam-ray"
        d={`M${head[0]} ${head[1] - 8} L 312 ${head[1] - 56} L 312 ${head[1] + 56} L${head[0]} ${head[1] + 8} Z`}
      />
      {ends.map((dy, k) => (
        <Ray
          key={dy}
          x1={head[0] + 4}
          y1={head[1] + dy * 0.16}
          x2={306}
          y2={head[1] + dy}
          at={0.55}
          cls={k === 3 ? "ls-ray-pick" : "ls-ray-soft"}
        />
      ))}
      <g transform="translate(18 81)">
        <rect class="ls-torch-body-lit" x={0} y={4} width={44} height={10} rx={3} />
        <path class="ls-torch-body-lit" d="M43 4 L56 -1 L56 19 L43 14 Z" />
        <rect class="ls-torch-button" x={12} y={2.5} width={7} height={2.5} rx={1} />
        <rect class="ls-torch-lens is-on" x={55} y={0} width={2.5} height={18} rx={1} />
      </g>
    </g>
  );
}

function SideMirror({ clip }: { clip: string }): JSX.Element {
  return (
    <g>
      {/* the road and sky beyond the car */}
      <rect class="ls-sky" x={0} y={0} width={W} height={100} />
      <rect class="ls-grass" x={0} y={90} width={W} height={90} />
      <path class="ls-road" d="M0 180 L 320 180 L 320 128 L 190 98 L 150 98 L 0 140 Z" />
      {/* the car's door and window frame */}
      <path class="ls-car" d="M0 120 L 120 120 L 150 180 L 0 180 Z" />
      <path class="ls-car-window" d="M0 70 L 96 70 L 118 118 L 0 118 Z" />
      {/* the mirror housing and its convex glass */}
      <rect class="ls-car" x={112} y={98} width={18} height={12} rx={3} />
      <rect class="ls-car" x={124} y={36} width={150} height={92} rx={30} />
      <clipPath id={clip}>
        <rect x={132} y={43} width={134} height={78} rx={24} />
      </clipPath>
      <g clip-path={`url(#${clip})`}>
        <rect class="ls-sky" x={130} y={40} width={140} height={44} />
        <rect class="ls-grass" x={130} y={80} width={140} height={44} />
        {/* the road behind, small and wide */}
        <path class="ls-road" d="M150 124 L 250 124 L 206 82 L 194 82 Z" />
        <line class="ls-road-line" x1={200} y1={86} x2={200} y2={92} />
        <line class="ls-road-line" x1={200} y1={98} x2={200} y2={106} />
        <line class="ls-road-line" x1={200} y1={112} x2={200} y2={122} />
        <Tree x={150} y={84} s={0.45} />
        <Tree x={162} y={83} s={0.35} />
        <Tree x={248} y={84} s={0.45} />
        <Tree x={236} y={83} s={0.35} />
        {/* a bus far behind, upright and small */}
        <rect class="ls-bus" x={203} y={88} width={14} height={11} rx={2} />
        <rect class="ls-bus-window" x={205} y={90} width={10} height={3.5} rx={0.8} />
        <rect class="ls-car-other" x={184} y={100} width={10} height={6} rx={2} />
      </g>
      <rect class="ls-glass-shine" x={132} y={43} width={134} height={78} rx={24} />
      <path class="ls-steel-shine" d="M146 56 q 6 -8 18 -10" fill="none" />
    </g>
  );
}

function GlassOfWater(): JSX.Element {
  const top = 46;
  const bottom = 146;
  const water = 70;
  // The glass: a slightly tapered tumbler.
  const left = (y: number) => 120 + ((y - top) / (bottom - top)) * 8;
  const right = (y: number) => 200 - ((y - top) / (bottom - top)) * 8;
  return (
    <g>
      <rect class="ls-wall" x={0} y={0} width={W} height={H} />
      <rect class="ls-table" x={0} y={bottom} width={W} height={H - bottom} />
      <path
        class="ls-water"
        d={`M${left(water)} ${water} L${right(water)} ${water} L${right(bottom)} ${bottom} L${left(bottom)} ${bottom} Z`}
      />
      {/* the lemon in the water: looks bigger */}
      <ellipse class="ls-lemon" cx={160} cy={112} rx={30} ry={24} />
      <ellipse class="ls-lemon-shine" cx={150} cy={102} rx={8} ry={5} />
      {/* the straw: broken at the surface */}
      <line class="ls-straw" x1={204} y1={20} x2={178} y2={water} />
      <line class="ls-straw is-under" x1={170} y1={water} x2={146} y2={bottom - 8} />
      <path
        class="ls-glass"
        d={`M${left(top)} ${top} L${left(bottom)} ${bottom} L${right(bottom)} ${bottom} L${right(top)} ${top}`}
        fill="none"
      />
      <line class="ls-water-line" x1={left(water)} y1={water} x2={right(water)} y2={water} />
      <path
        class="ls-glass-shine-line"
        d={`M${left(top) + 7} ${top + 10} L${left(bottom) + 6} ${bottom - 12}`}
      />
      {/* the same lemon, beside the glass */}
      <ellipse class="ls-lemon" cx={252} cy={bottom - 13} rx={17} ry={13} />
      <ellipse class="ls-lemon-shine" cx={246} cy={bottom - 19} rx={4.5} ry={3} />
    </g>
  );
}

function Shoebox(): JSX.Element {
  const box = { x: 18, y: 104, w: 108, h: 44 };
  const lensX = box.x + box.w;
  const mid = box.y + box.h / 2;
  const pic = { x: 196, y: 16, w: 110, h: 76 };
  return (
    <g>
      <rect class="ls-room-dim" x={0} y={0} width={W} height={H} />
      <rect class="ls-floor-dim" x={0} y={160} width={W} height={20} />
      {/* the wall picture: big and the right way up */}
      <path
        class="ls-light"
        d={`M${lensX + 3} ${mid - 6} L${pic.x} ${pic.y} L${pic.x} ${pic.y + pic.h} L${lensX + 3} ${mid + 6} Z`}
      />
      <rect class="ls-screen-bright" x={pic.x} y={pic.y} width={pic.w} height={pic.h} rx={4} />
      <Rocket x={pic.x + pic.w / 2} y={pic.y + pic.h / 2} s={1.7} />
      <circle class="ls-star" cx={pic.x + 16} cy={pic.y + 14} r={1.6} />
      <circle class="ls-star" cx={pic.x + 92} cy={pic.y + 22} r={1.6} />
      <circle class="ls-star" cx={pic.x + 84} cy={pic.y + 58} r={1.3} />
      {/* the box, cut open */}
      <rect class="ls-box-inside" x={box.x} y={box.y} width={box.w} height={box.h} />
      <path
        class="ls-box-lid"
        d={`M${box.x} ${box.y} L${box.x + 16} ${box.y - 12} L${box.x + box.w + 16} ${box.y - 12} L${box.x + box.w} ${box.y} Z`}
      />
      <rect class="ls-box-edge" x={box.x} y={box.y} width={box.w} height={box.h} fill="none" />
      {/* the phone at the back, the movie upside down on its screen */}
      <rect class="ls-phone" x={box.x + 6} y={box.y + 6} width={9} height={box.h - 12} rx={2} />
      <rect
        class="ls-phone-screen-movie"
        x={box.x + 13}
        y={box.y + 8}
        width={2.4}
        height={box.h - 16}
      />
      <g transform={`translate(${box.x + 30} ${mid})`}>
        <rect class="ls-inset" x={-11} y={-14} width={22} height={28} rx={3} />
        <Rocket x={0} y={0} s={0.55} flip />
      </g>
      {/* inside the box: light from the phone gathering into the lens */}
      <path
        class="ls-light-faint"
        d={`M${box.x + 16} ${box.y + 8} L${lensX} ${mid - 6} L${lensX} ${mid + 6} L${box.x + 16} ${box.y + box.h - 8} Z`}
      />
      {/* the magnifying glass in the front */}
      <ellipse class="ls-lens" cx={lensX} cy={mid} rx={4} ry={13} />
      <Person who="kabir" x={152} y={170} s={1.15} point={[20, -14]} />
    </g>
  );
}

function Glasses({ clip }: { clip: string }): JSX.Element {
  const paper = { x: 40, y: 70, w: 240, h: 96 };
  const lines = Array.from({ length: 8 }, (_, k) => paper.y + 12 + k * 10);
  const lens = { x: 200, y: 112, r: 32 };
  return (
    <g>
      <rect class="ls-table" x={0} y={0} width={W} height={H} />
      <rect
        class="ls-paper"
        x={paper.x}
        y={paper.y}
        width={paper.w}
        height={paper.h}
        rx={2}
        transform={`rotate(-3 ${W / 2} ${paper.y})`}
      />
      <g transform={`rotate(-3 ${W / 2} ${paper.y})`}>
        <rect class="ls-headline" x={paper.x + 12} y={paper.y + 4} width={120} height={5} rx={2} />
        {lines.map((y) => (
          <g key={y}>
            <rect class="ls-print" x={paper.x + 12} y={y} width={100} height={2.6} rx={1.2} />
            <rect class="ls-print" x={paper.x + 124} y={y} width={104} height={2.6} rx={1.2} />
          </g>
        ))}
      </g>
      {/* reading glasses */}
      <g class="ls-glasses" transform="translate(84 46) rotate(-8)">
        <circle cx={-16} cy={0} r={12} />
        <circle cx={16} cy={0} r={12} />
        <path d="M-4 -1 q 4 -4 8 0" fill="none" />
        <line x1={-28} y1={-2} x2={-48} y2={-10} />
        <line x1={28} y1={-2} x2={44} y2={-14} />
      </g>
      {/* the magnifying glass: the print inside it is bigger */}
      <clipPath id={clip}>
        <circle cx={lens.x} cy={lens.y} r={lens.r} />
      </clipPath>
      <g clip-path={`url(#${clip})`}>
        <circle class="ls-paper" cx={lens.x} cy={lens.y} r={lens.r} />
        {[0, 1, 2, 3].map((k) => (
          <rect
            key={k}
            class="ls-print-big"
            x={lens.x - 40}
            y={lens.y - 26 + k * 16}
            width={k === 2 ? 46 : 70}
            height={6}
            rx={3}
            transform={`rotate(-3 ${lens.x} ${lens.y})`}
          />
        ))}
      </g>
      <circle class="ls-magnifier-rim" cx={lens.x} cy={lens.y} r={lens.r} />
      <path
        class="ls-steel-shine"
        d={`M${lens.x - 20} ${lens.y - 14} q 6 -10 16 -12`}
        fill="none"
      />
      <line class="ls-handle" x1={lens.x + 23} y1={lens.y + 23} x2={lens.x + 52} y2={lens.y + 52} />
    </g>
  );
}

function MovieNight(): JSX.Element {
  const pic = { x: 66, y: 12, w: 164, h: 88 };
  const projector = { x: 284, y: 112 };
  return (
    <g>
      <rect class="ls-night" x={0} y={0} width={W} height={H} />
      <path
        class="ls-beam-soft"
        d={`M${projector.x - 8} ${projector.y - 2} L${pic.x + pic.w} ${pic.y} L${pic.x + pic.w} ${pic.y + pic.h} L${projector.x - 8} ${projector.y + 4} Z`}
      />
      <rect class="ls-screen-bright" x={pic.x} y={pic.y} width={pic.w} height={pic.h} rx={4} />
      <Rocket x={pic.x + pic.w / 2} y={pic.y + pic.h / 2 + 4} s={2} />
      <circle class="ls-star" cx={pic.x + 22} cy={pic.y + 18} r={2} />
      <circle class="ls-star" cx={pic.x + 136} cy={pic.y + 24} r={2} />
      <circle class="ls-star" cx={pic.x + 40} cy={pic.y + 66} r={1.6} />
      <circle class="ls-star" cx={pic.x + 128} cy={pic.y + 70} r={1.6} />
      {/* the shoebox projector on a stool */}
      <rect class="ls-dark-thing-2" x={projector.x - 4} y={projector.y + 8} width={6} height={60} />
      <rect
        class="ls-dark-thing-2"
        x={projector.x - 14}
        y={projector.y + 6}
        width={30}
        height={4}
        rx={2}
      />
      <rect
        class="ls-box-dim"
        x={projector.x - 8}
        y={projector.y - 8}
        width={26}
        height={14}
        rx={2}
      />
      <ellipse class="ls-lens-glow" cx={projector.x - 8} cy={projector.y - 1} rx={2.5} ry={5} />
      {/* the family on the sofa, from behind */}
      <rect class="ls-sofa" x={30} y={136} width={232} height={30} rx={10} />
      <Person who="grandpa" x={70} y={150} s={1.25} back />
      <Person who="mom" x={122} y={150} s={1.2} back />
      <Person who="riya" x={176} y={150} s={1.1} back />
      <Person who="kabir" x={222} y={150} s={1.15} back />
      <rect class="ls-sofa-front" x={22} y={146} width={248} height={34} rx={12} />
      {/* popcorn */}
      <g transform="translate(150 140)">
        <circle class="ls-popcorn" cx={-5} cy={-2} r={3.2} />
        <circle class="ls-popcorn" cx={1} cy={-4} r={3.4} />
        <circle class="ls-popcorn" cx={6} cy={-1} r={3} />
        <path class="ls-bucket" d="M-9 0 L9 0 L6.5 16 L-6.5 16 Z" />
        <path class="ls-bucket-stripe" d="M-3 0 L3 0 L2.2 16 L-2.2 16 Z" />
      </g>
    </g>
  );
}

function TinyScreen(): JSX.Element {
  const phone = { x: 150, y: 96, w: 16, h: 26 };
  return (
    <g>
      <rect class="ls-night" x={0} y={0} width={W} height={H} />
      {/* the bare wall where a picture could be */}
      <rect class="ls-wall-bare" x={66} y={12} width={164} height={88} rx={4} />
      {/* the phone, held up in the middle, and its small glow */}
      <ellipse
        class="ls-phone-glow"
        cx={phone.x + phone.w / 2}
        cy={phone.y + phone.h / 2}
        rx={30}
        ry={24}
      />
      <rect class="ls-phone" x={phone.x} y={phone.y} width={phone.w} height={phone.h} rx={3} />
      <rect
        class="ls-screen-bright"
        x={phone.x + 1.5}
        y={phone.y + 2.5}
        width={phone.w - 3}
        height={phone.h - 5}
        rx={1.5}
      />
      <Rocket x={phone.x + phone.w / 2} y={phone.y + phone.h / 2 + 1} s={0.35} />
      {/* the family, squeezed together, leaning in */}
      <rect class="ls-sofa" x={30} y={136} width={232} height={30} rx={10} />
      <Person who="grandpa" x={104} y={150} s={1.25} back />
      <Person who="mom" x={136} y={150} s={1.2} back />
      <Person who="riya" x={170} y={150} s={1.1} back point={[-13, -10]} />
      <Person who="kabir" x={200} y={150} s={1.15} back />
      <rect class="ls-sofa-front" x={22} y={146} width={248} height={34} rx={12} />
    </g>
  );
}

/** The story panel: the scene drawn in its own 320 × 180 units, scaled to the width. */
export function LightSceneView({ view, width, call }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as LightSceneState;
  const id = useId();
  const clip = `ls-clip-${id}`;
  const height = Math.round((width * H) / W);
  const k = width / W;
  const onTorch = () => call(SceneAction.ToggleTorch, {});
  const onNext = () => call(SceneAction.Next, {});
  const scene = ((): JSX.Element => {
    switch (s.scene) {
      case SceneKind.PowerCut:
        return <PowerCut isLit={s.isLit} canToggle={s.canToggle} onTorch={onTorch} />;
      case SceneKind.Spoon:
        return <Spoons />;
      case SceneKind.MakeupMirror:
        return <MakeupMirror />;
      case SceneKind.SideMirror:
        return <SideMirror clip={`${clip}-mirror`} />;
      case SceneKind.GlassOfWater:
        return <GlassOfWater />;
      case SceneKind.Shoebox:
        return <Shoebox />;
      case SceneKind.Glasses:
        return <Glasses clip={`${clip}-lens`} />;
      case SceneKind.MovieNight:
        return <MovieNight />;
      case SceneKind.PhoneCard:
        return <PhoneCard />;
      case SceneKind.ShoeboxBlurry:
        return <ShoeboxBlurry />;
      case SceneKind.LensShapes:
        return <LensShapes />;
      case SceneKind.MirrorFromSphere:
        return (
          <MirrorSteps
            step={s.step ?? 0}
            canStep={s.canStep === true}
            onNext={onNext}
            clip={`${clip}-sphere`}
          />
        );
      case SceneKind.HowWeSee:
        return <HowWeSee isOn={isSceneLit(s)} canToggle={s.canToggle} onTorch={onTorch} />;
      case SceneKind.StraightLines:
        return <StraightLines />;
      case SceneKind.SeeThrough:
        return <SeeThrough />;
      case SceneKind.RayBeam:
        return <RayBeam />;
      case SceneKind.TinyScreen:
        return <TinyScreen />;
    }
  })();
  return (
    <div class="ls">
      <Stage
        label={describeScene(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "ls-svg" }}
      >
        <clipPath id={`${clip}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12 / k} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#${clip}-frame)`}>
          {scene}
        </g>
      </Stage>
    </div>
  );
}
