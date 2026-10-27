import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Frame, Person, type Words, say } from "./draw";
import { CarbonScene, CarbonScenePart, type CarbonSceneState, describeCarbonScene } from "./scene";

const W = 320;
const H = 180;

const WORDS = {
  fair: { en: "GREEN FAIR", hi: "हरित मेला" },
  weeks: { en: "3 weeks!", hi: "3 हफ़्ते!" },
  project: { en: "SOAP PROJECT", hi: "साबुन प्रोजेक्ट" },
  ghee: { en: "ghee", hi: "घी" },
} as const satisfies Record<string, Words>;

function Room() {
  return (
    <g>
      <rect class="cbs-wall" x={0} y={0} width={W} height={H} />
      <rect class="cbs-floor" x={0} y={150} width={W} height={30} />
    </g>
  );
}

function Counter({ x, w, y = 112 }: { x: number; w: number; y?: number }) {
  return (
    <g>
      <rect class="cbs-counter" x={x} y={y} width={w} height={8} rx={2} />
      <rect class="cbs-cabinet" x={x + 4} y={y + 8} width={w - 8} height={150 - y - 8} />
    </g>
  );
}

function Soap({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect class="cbs-soap" x={-12} y={-6} width={24} height={12} rx={4} />
      <path class="cbs-soap-mark" d="M-6 0 q 6 -4 12 0" />
    </g>
  );
}

function Flame({ x, y, kind }: { x: number; y: number; kind: "blue" | "yellow" }) {
  return (
    <path
      class={`cbs-flame is-${kind}`}
      d={`M${x} ${y - 16} C ${x + 6} ${y - 8} ${x + 6} ${y} ${x} ${y} C ${x - 6} ${y} ${x - 6} ${y - 8} ${x} ${y - 16} Z`}
    />
  );
}

function Bottle({ x, cls, label }: { x: number; cls: string; label: string }) {
  return (
    <g>
      <rect class={`cbs-bottle ${cls}`} x={x - 14} y={60} width={28} height={62} rx={6} />
      <rect class={`cbs-bottle ${cls}`} x={x - 6} y={48} width={12} height={14} rx={2} />
      <rect class="cbs-label-patch" x={x - 11} y={78} width={22} height={24} rx={2} />
      <text class="cbs-tag" x={x} y={94} text-anchor="middle">
        {label}
      </text>
    </g>
  );
}

function Picture({ scene, locale }: { scene: CarbonScene; locale: string }) {
  switch (scene) {
    case CarbonScene.GreenFair:
      return (
        <g>
          <Room />
          <rect class="cbs-board" x={110} y={18} width={140} height={92} rx={4} />
          <rect class="cbs-poster" x={126} y={28} width={108} height={72} rx={3} />
          <text class="cbs-title" x={180} y={52} text-anchor="middle">
            {say(locale, WORDS.fair)}
          </text>
          <path class="cbs-leaf" d="M160 70 q 20 -14 40 0 q -20 14 -40 0 Z" />
          <text class="cbs-small" x={180} y={92} text-anchor="middle">
            {say(locale, WORDS.weeks)}
          </text>
          <Person who="riya" x={64} y={168} s={2} point={[30, -18]} />
          <Person who="kabir" x={272} y={170} s={1.9} point={[-20, 4]} />
          <Soap x={242} y={150} s={0.9} />
        </g>
      );
    case CarbonScene.SupplyList:
      return (
        <g>
          <Room />
          <rect class="cbs-table" x={70} y={112} width={180} height={8} rx={2} />
          <rect class="cbs-paper" x={128} y={64} width={66} height={48} rx={2} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={i}
              class="cbs-writing"
              x1={134}
              y1={72 + i * 7}
              x2={186 - (i % 3) * 8}
              y2={72 + i * 7}
            />
          ))}
          <rect class="cbs-toothpaste" x={204} y={102} width={30} height={9} rx={3} />
          <rect class="cbs-pencil" x={92} y={106} width={30} height={4} rx={1} />
          <Person who="kabir" x={104} y={168} s={1.9} point={[26, -6]} />
          <Person who="riya" x={232} y={168} s={2} />
        </g>
      );
    case CarbonScene.NosePinPencil:
      return (
        <g>
          <rect class="cbs-velvet" x={0} y={0} width={W} height={H} />
          <g transform="translate(100 90)">
            <polygon class="cbs-diamond" points="0,-26 24,-6 0,30 -24,-6" />
            <polyline class="cbs-facet" points="-24,-6 -8,-6 0,-26 8,-6 24,-6" />
            <line class="cbs-facet" x1={-8} y1={-6} x2={0} y2={30} />
            <line class="cbs-facet" x1={8} y1={-6} x2={0} y2={30} />
            <circle class="cbs-sparkle" cx={18} cy={-22} r={3} />
          </g>
          <g transform="translate(220 90) rotate(-30)">
            <rect class="cbs-pencil-body" x={-60} y={-8} width={96} height={16} rx={2} />
            <polygon class="cbs-wood" points="36,-8 58,0 36,8" />
            <polygon class="cbs-lead" points="50,-3 60,0 50,3" />
          </g>
          <text class="cbs-big" x={W / 2} y={164} text-anchor="middle">
            C = C ?
          </text>
        </g>
      );
    case CarbonScene.GasCylinder:
      return (
        <g>
          <Room />
          <Counter x={150} w={160} />
          <rect class="cbs-stove" x={190} y={100} width={80} height={12} rx={3} />
          <Flame x={230} y={100} kind="blue" />
          <rect class="cbs-cylinder" x={40} y={84} width={44} height={66} rx={12} />
          <rect class="cbs-cylinder" x={52} y={72} width={20} height={14} rx={3} />
          <path class="cbs-hose" d="M72 76 C 120 60, 160 110, 190 106" />
          <text class="cbs-tag-light" x={62} y={122} text-anchor="middle">
            LPG
          </text>
          <Person who="mom" x={292} y={168} s={1.9} point={[-24, -8]} />
        </g>
      );
    case CarbonScene.BottleLabels:
      return (
        <g>
          <Room />
          <rect class="cbs-shelf" x={30} y={122} width={260} height={8} rx={2} />
          <Bottle x={84} cls="is-sanitizer" label="C₂H₅OH" />
          <Bottle x={160} cls="is-vinegar" label="CH₃COOH" />
          <Bottle x={236} cls="is-poison" label="CH₃OH" />
          <g transform="translate(236 34)">
            <polygon class="cbs-danger" points="0,-12 13,10 -13,10" />
            <text class="cbs-danger-mark" x={0} y={8} text-anchor="middle">
              !
            </text>
          </g>
        </g>
      );
    case CarbonScene.BlackPan:
      return (
        <g>
          <Room />
          <Counter x={60} w={200} />
          <rect class="cbs-stove" x={110} y={100} width={100} height={12} rx={3} />
          <Flame x={160} y={100} kind="yellow" />
          <path class="cbs-smoke" d="M160 80 q -8 -10 0 -18 q 8 -8 0 -16" />
          <g transform="translate(160 58) rotate(-8)">
            <rect class="cbs-pan" x={-40} y={-10} width={80} height={18} rx={4} />
            <rect class="cbs-soot" x={-38} y={4} width={76} height={5} rx={2} />
            <rect class="cbs-pan" x={38} y={-6} width={42} height={6} rx={2} />
          </g>
          <Person who="mom" x={262} y={168} s={1.9} point={[-30, -40]} />
        </g>
      );
    case CarbonScene.Vanaspati:
      return (
        <g>
          <Room />
          <rect class="cbs-table" x={60} y={118} width={200} height={8} rx={2} />
          <rect class="cbs-tin" x={92} y={74} width={50} height={44} rx={4} />
          <rect class="cbs-label-patch" x={98} y={86} width={38} height={18} rx={2} />
          <text class="cbs-tag" x={117} y={99} text-anchor="middle">
            {say(locale, WORDS.ghee)}
          </text>
          <rect class="cbs-oil" x={180} y={58} width={30} height={60} rx={6} />
          <rect class="cbs-oil" x={188} y={46} width={14} height={14} rx={2} />
          <Person who="riya" x={262} y={168} s={1.9} point={[-24, -26]} />
        </g>
      );
    case CarbonScene.FruitySoap:
      return (
        <g>
          <Room />
          <Person who="riya" x={130} y={168} s={2.1} point={[18, -34]} />
          <g transform="translate(178 40) rotate(-20)">
            <rect class="cbs-tube" x={-5} y={-22} width={10} height={36} rx={5} />
            <rect class="cbs-tube-liquid" x={-4} y={0} width={8} height={13} rx={4} />
          </g>
          <path
            class="cbs-smell"
            d="M186 24 q 6 -8 0 -14 M198 28 q 6 -8 0 -14 M210 32 q 6 -8 0 -14"
          />
          <g class="cbs-fruit" transform="translate(220 60)">
            <circle cx={0} cy={0} r={11} />
            <path class="cbs-fruit-leaf" d="M0 -11 q 6 -8 12 -4 q -6 6 -12 4 Z" />
          </g>
          <Person who="kabir" x={232} y={168} s={1.9} />
        </g>
      );
    case CarbonScene.HandPump:
      return (
        <g>
          <rect class="cbs-sky" x={0} y={0} width={W} height={H} />
          <rect class="cbs-ground" x={0} y={138} width={W} height={42} />
          <rect class="cbs-pump" x={140} y={56} width={14} height={82} rx={3} />
          <rect class="cbs-pump" x={130} y={60} width={34} height={10} rx={3} />
          <line class="cbs-handle" x1={164} y1={66} x2={204} y2={40} />
          <path class="cbs-pump" d="M140 76 l -16 6 l 0 6 l 16 -4 Z" />
          <path class="cbs-stream" d="M126 88 q 2 20 0 40" />
          <ellipse class="cbs-bucket-water" cx={126} cy={146} rx={26} ry={6} />
          <ellipse class="cbs-scum" cx={118} cy={145} rx={8} ry={2.4} />
          <ellipse class="cbs-scum" cx={134} cy={147} rx={6} ry={2} />
          <Person who="kabir" x={86} y={168} s={1.9} point={[30, -16]} />
          <Person who="grandpa" x={244} y={168} s={2} point={[-20, -26]} />
        </g>
      );
    default:
      return (
        <g>
          <rect class="cbs-sky" x={0} y={0} width={W} height={H} />
          <rect class="cbs-ground" x={0} y={146} width={W} height={34} />
          <rect class="cbs-banner" x={60} y={14} width={200} height={26} rx={4} />
          <text class="cbs-title-light" x={160} y={32} text-anchor="middle">
            {say(locale, WORDS.project)}
          </text>
          <Person who="riya" x={92} y={118} s={1.6} />
          <Person who="kabir" x={130} y={118} s={1.5} />
          <Person who="mom" x={168} y={118} s={1.6} />
          <Person who="grandpa" x={206} y={118} s={1.6} />
          <rect class="cbs-stall" x={60} y={104} width={200} height={42} rx={3} />
          {[86, 118, 150, 182, 214].map((x) => (
            <Soap key={x} x={x} y={98} s={0.85} />
          ))}
        </g>
      );
  }
}

/** A story panel; nothing to tap. */
export function CarbonSceneView({ view, width, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as CarbonSceneState;
  return (
    <div class="cb cbs" data-part={CarbonScenePart.Picture}>
      <Frame w={W} h={H} width={width} label={describeCarbonScene(s)} cls="cbs-svg">
        <Picture scene={s.scene} locale={locale} />
      </Frame>
    </div>
  );
}
