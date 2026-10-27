import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Frame, Label, Person } from "./draw";
import { RES_PICTURE, ResScene, ResScenePart, type ResSceneState, describeResScene } from "./scene";

const W = RES_PICTURE.width;
const H = RES_PICTURE.height;

function Sky({ isDry = false }: { isDry?: boolean }) {
  return (
    <g>
      <rect class={isDry ? "rss-sky is-dry" : "rss-sky"} x={0} y={0} width={W} height={H} />
      <circle class="rss-sun" cx={292} cy={26} r={13} />
    </g>
  );
}
function Ground({ y = 140, cls = "rss-ground" }: { y?: number; cls?: string }) {
  return <rect class={cls} x={0} y={y} width={W} height={H - y} />;
}
function Tree({
  x,
  y,
  s = 1,
  kind = "round",
}: { x: number; y: number; s?: number; kind?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect class="rss-trunk" x={-2} y={-12} width={4} height={12} />
      {kind === "pine" ? (
        <path class="rss-leaves" d="M0 -38 L12 -12 L-12 -12 Z" />
      ) : (
        <circle class="rss-leaves" cx={0} cy={-20} r={13} />
      )}
    </g>
  );
}
function Stump({ x, y }: { x: number; y: number }) {
  return <rect class="rss-stump" x={x - 5} y={y - 8} width={10} height={8} rx={2} />;
}
function House({ x, y, isNew = false }: { x: number; y: number; isNew?: boolean }) {
  return (
    <g>
      <rect
        class={isNew ? "rss-house is-new" : "rss-house"}
        x={x}
        y={y - 24}
        width={34}
        height={24}
      />
      <path
        class="rss-roof"
        d={`M${x - 3} ${y - 24} L${x + 17} ${y - 38} L${x + 37} ${y - 24} Z`}
      />
      <rect class="rss-door" x={x + 13} y={y - 12} width={8} height={12} />
    </g>
  );
}
function Well({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect class="rss-well" x={x - 18} y={y - 22} width={36} height={22} rx={3} />
      <line class="rss-post" x1={x - 16} y1={y - 22} x2={x - 16} y2={y - 46} />
      <line class="rss-post" x1={x + 16} y1={y - 22} x2={x + 16} y2={y - 46} />
      <line class="rss-post" x1={x - 18} y1={y - 46} x2={x + 18} y2={y - 46} />
      <line class="rss-rope" x1={x} y1={y - 46} x2={x} y2={y - 18} />
    </g>
  );
}

function Picture({ scene }: { scene: ResScene }): JSX.Element {
  switch (scene) {
    case ResScene.AuditNotice:
      return (
        <g>
          <rect class="rss-wall" x={0} y={0} width={W} height={H} />
          <rect class="rss-board" x={150} y={22} width={150} height={106} rx={4} />
          <rect class="rss-paper" x={162} y={34} width={126} height={82} />
          {["water", "forest", "river", "fuel", "habits"].map((t, i) => (
            <g key={t}>
              <rect class="rss-check" x={170} y={44 + i * 14} width={8} height={8} />
              <line class="rss-line" x1={184} y1={48 + i * 14} x2={272} y2={48 + i * 14} />
            </g>
          ))}
          <rect class="rss-floor" x={0} y={150} width={W} height={30} />
          <Person who="riya" x={80} y={160} s={1.4} point={[22, -18]} />
          <Person who="kabir" x={122} y={160} s={1.3} />
        </g>
      );
    case ResScene.VillageReturn:
      return (
        <g>
          <Sky />
          <Ground y={128} />
          <rect class="rss-road" x={0} y={146} width={W} height={18} />
          <House x={150} y={128} isNew={true} />
          <House x={200} y={128} isNew={true} />
          <House x={250} y={128} />
          <rect class="rss-bus" x={10} y={112} width={70} height={32} rx={6} />
          <Person who="grandpa" x={98} y={160} s={1.1} />
          <Person who="riya" x={120} y={162} s={1} />
          <Person who="kabir" x={138} y={162} s={0.95} />
        </g>
      );
    case ResScene.DryWell:
      return (
        <g>
          <Sky isDry={true} />
          <Ground y={140} cls="rss-ground is-dry" />
          <Well x={160} y={140} />
          <rect class="rss-mud" x={150} y={124} width={20} height={4} />
          <Person who="mom" x={90} y={158} s={1.2} />
          <ellipse class="rss-pot" cx={112} cy={152} rx={8} ry={7} />
          <ellipse class="rss-pot" cx={210} cy={152} rx={8} ry={7} />
          <Person who="kabir" x={240} y={160} s={1} />
        </g>
      );
    case ResScene.CutGrove:
      return (
        <g>
          <Sky />
          <Ground y={140} />
          <path class="rss-temple" d="M20 140 v-40 l20 -22 l20 22 v40 z" />
          {[100, 130, 160].map((x) => (
            <Stump key={x} x={x} y={146} />
          ))}
          <Tree x={210} y={146} s={1.4} />
          <Tree x={250} y={146} s={1.6} />
          <Tree x={290} y={146} s={1.3} />
          <Person who="grandpa" x={140} y={164} s={1.1} />
        </g>
      );
    case ResScene.Khejri:
      return (
        <g>
          <Sky isDry={true} />
          <Ground y={136} cls="rss-ground is-sand" />
          <Tree x={170} y={146} s={2} />
          <rect class="rss-stone" x={186} y={130} width={18} height={14} rx={3} />
          <Person who="grandpa" x={100} y={162} s={1.1} />
          <Person who="riya" x={250} y={162} s={1} />
          <Person who="kabir" x={274} y={162} s={0.95} />
        </g>
      );
    case ResScene.Chipko:
      return (
        <g>
          <rect class="rss-page" x={0} y={0} width={W} height={H} />
          <rect class="rss-photo" x={20} y={14} width={280} height={152} rx={4} />
          <Tree x={90} y={150} s={2} kind="pine" />
          <Tree x={170} y={150} s={2.2} kind="pine" />
          <Tree x={250} y={150} s={1.9} kind="pine" />
          <Person who="mom" x={78} y={152} s={1} point={[10, -4]} />
          <Person who="neighbour" x={158} y={152} s={1} point={[10, -4]} />
          <Person who="mom" x={238} y={152} s={1} point={[10, -4]} />
          <path class="rss-axe" d="M286 150 l-14 -26 m-4 2 l6 -6 l4 4" />
        </g>
      );
    case ResScene.TailEnd:
      return (
        <g>
          <Sky />
          <rect class="rss-green-field" x={0} y={110} width={150} height={70} />
          <rect class="rss-cracked" x={170} y={110} width={150} height={70} />
          <path class="rss-canal" d="M0 106 H320" />
          <path class="rss-canal-water" d="M0 106 H150" />
          {[20, 50, 80, 110, 140].map((x) => (
            <path key={x} class="rss-cane" d={`M${x} 160 v-40 m0 10 l-6 -8 m6 16 l6 -8`} />
          ))}
          {[190, 230, 270, 300].map((x) => (
            <path key={x} class="rss-crack" d={`M${x} 130 l8 10 l-6 12`} />
          ))}
          <Person who="neighbour" x={250} y={176} s={1.1} />
        </g>
      );
    case ResScene.CheckDam:
      return (
        <g>
          <Sky />
          <path class="rss-gully" d="M0 120 Q 160 170 320 120 V180 H0 Z" />
          <path class="rss-pool" d="M66 134 Q 92 145 116 143 V134 Z" />
          <path class="rss-checkdam" d="M110 150 h100 l-6 -18 h-88 z" />
          <Well x={290} y={176} />
          <Person who="kabir" x={52} y={146} s={1} point={[14, -2]} />
          <Person who="riya" x={232} y={148} s={1} />
          <Person who="neighbour" x={26} y={138} s={1.1} />
        </g>
      );
    case ResScene.DirtyGhat:
      return (
        <g>
          <Sky />
          <rect class="rss-steps" x={0} y={90} width={W} height={34} />
          {[0, 1, 2].map((i) => (
            <line key={i} class="rss-step-line" x1={0} y1={100 + i * 10} x2={W} y2={100 + i * 10} />
          ))}
          <rect class="rss-river" x={0} y={124} width={W} height={56} />
          <rect class="rss-drain" x={250} y={92} width={22} height={10} />
          <path class="rss-murk" d="M262 102 q 6 14 2 30" />
          <path class="rss-litter" d="M40 96 h10 v4 h-10 z M120 108 h8 v4 h-8 z" />
          <Person who="riya" x={150} y={120} s={1.1} />
          <rect class="rss-tube" x={164} y={86} width={6} height={18} rx={3} />
        </g>
      );
    case ResScene.ScooterQueue:
      return (
        <g>
          <Sky />
          <Ground y={140} />
          <rect class="rss-pump" x={270} y={92} width={22} height={48} rx={3} />
          {[60, 110, 160, 210].map((x) => (
            <g key={x}>
              <circle class="rss-wheel" cx={x - 12} cy={150} r={7} />
              <circle class="rss-wheel" cx={x + 12} cy={150} r={7} />
              <path class="rss-scooter" d={`M${x - 14} 144 h28 l-4 -14 h-14 z`} />
            </g>
          ))}
          <rect class="rss-sign" x={10} y={60} width={56} height={22} rx={3} />
          <Label x={38} y={75} text="2 km" anchor="middle" cls="is-big" />
          <Person who="kabir" x={30} y={170} s={1} point={[4, -22]} />
          <Person who="grandpa" x={250} y={172} s={1} />
        </g>
      );
    default:
      return (
        <g>
          <Sky />
          <Ground y={146} />
          <Tree x={160} y={146} s={3.2} />
          <rect class="rss-chart" x={196} y={64} width={92} height={66} rx={3} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              class="rss-chart-bar"
              x={204 + i * 16}
              y={118 - (i + 2) * 7}
              width={10}
              height={(i + 2) * 7}
            />
          ))}
          <Person who="riya" x={182} y={166} s={1.1} point={[16, -24]} />
          <Person who="kabir" x={300} y={166} s={1} />
          <Person who="grandpa" x={40} y={170} s={1} />
          <Person who="neighbour" x={70} y={170} s={1} />
          <Person who="mom" x={100} y={170} s={1} />
        </g>
      );
  }
}

/** A story panel for the Village Audit. */
export function ResourcesSceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as ResSceneState;
  return (
    <div class="rs rss" data-part={ResScenePart.Picture}>
      <Frame w={W} h={H} width={width} label={describeResScene(s)} cls="rss-svg">
        <Picture scene={s.scene} />
      </Frame>
    </div>
  );
}
