import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { Person, type Words, say } from "./draw";
import {
  CONTROL_PICTURE,
  ControlScene,
  type ControlSceneState,
  describeControlScene,
} from "./scene";

const W = CONTROL_PICTURE.width;
const H = CONTROL_PICTURE.height;

const WORDS = {
  banner: {
    en: "How does your body know what to do?",
    hi: "तुम्हारे शरीर को कैसे पता चलता है कि क्या करना है?",
  },
  fair: { en: "Science fair in 2 weeks!", hi: "विज्ञान मेला 2 हफ़्ते में!" },
  salt: { en: "IODISED SALT", hi: "आयोडीन युक्त नमक" },
  ouch: { en: "ouch!", hi: "आह!" },
  stall: { en: "Fastest Hands", hi: "सबसे तेज़ हाथ" },
  first: { en: "1st", hi: "प्रथम" },
} as const satisfies Record<string, Words>;

function Hall(): JSX.Element {
  return (
    <g>
      <rect class="cts-wall" x={0} y={0} width={W} height={H} />
      <rect class="cts-floor" x={0} y={146} width={W} height={34} />
    </g>
  );
}

function Kitchen(): JSX.Element {
  return (
    <g>
      <rect class="cts-wall" x={0} y={0} width={W} height={H} />
      <rect class="cts-tiles" x={0} y={60} width={W} height={60} />
      {[40, 80, 120, 160, 200, 240, 280].map((x) => (
        <line key={x} class="cts-grout" x1={x} y1={60} x2={x} y2={120} />
      ))}
      <line class="cts-grout" x1={0} y1={90} x2={W} y2={90} />
      <rect class="cts-counter" x={0} y={120} width={W} height={60} />
    </g>
  );
}

function Table({ x, y, w }: { x: number; y: number; w: number }): JSX.Element {
  return (
    <g class="cts-table">
      <rect x={x} y={y} width={w} height={10} rx={2} />
      <rect class="cts-cloth" x={x} y={y + 10} width={w} height={26} />
    </g>
  );
}

function Banner({ x, y, w, text }: { x: number; y: number; w: number; text: string }): JSX.Element {
  return (
    <g>
      <rect class="cts-banner" x={x} y={y} width={w} height={20} rx={3} />
      <text class="cts-banner-text" x={x + w / 2} y={y + 14} text-anchor="middle">
        {text}
      </text>
    </g>
  );
}

function SmallPlant({
  x,
  y,
  folded = false,
}: { x: number; y: number; folded?: boolean }): JSX.Element {
  return (
    <g>
      <path
        class="cts-pot"
        d={`M${x - 10} ${y} L ${x + 10} ${y} L ${x + 7} ${y + 14} L ${x - 7} ${y + 14} Z`}
      />
      <line class="cts-stem" x1={x} y1={y} x2={x} y2={y - 22} />
      {[-1, 1].map((d) => (
        <g key={d}>
          <line
            class="cts-stem"
            x1={x}
            y1={y - 12}
            x2={x + d * 14}
            y2={y - 22 + (folded && d === 1 ? 10 : 0)}
          />
          {[0.35, 0.65, 0.95].map((t) => {
            const lx = x + d * 14 * t;
            const ly = y - 12 - 10 * t + (folded && d === 1 ? 10 * t : 0);
            return (
              <ellipse
                key={t}
                class="cts-leaflet"
                cx={lx}
                cy={ly}
                rx={folded && d === 1 ? 1.2 : 1.8}
                ry={folded && d === 1 ? 1.6 : 4}
              />
            );
          })}
        </g>
      ))}
    </g>
  );
}

function ScienceFair({ locale }: { locale: string }): JSX.Element {
  return (
    <g>
      <Hall />
      <rect class="cts-notice" x={14} y={22} width={74} height={50} rx={3} />
      <text class="cts-small" x={51} y={44} text-anchor="middle">
        {say(locale, WORDS.fair).split(" ").slice(0, 2).join(" ")}
      </text>
      <text class="cts-small" x={51} y={58} text-anchor="middle">
        {say(locale, WORDS.fair).split(" ").slice(2).join(" ")}
      </text>
      <Banner x={102} y={26} w={206} text={say(locale, WORDS.banner)} />
      <Person who="riya" x={166} y={150} s={2} />
      <Person who="kabir" x={236} y={150} s={2} point={[10, -16]} />
      <Table x={110} y={118} w={190} />
    </g>
  );
}

function RulerDrop(): JSX.Element {
  return (
    <g>
      <Hall />
      <Person who="riya" x={110} y={170} s={2.6} point={[22, -18]} />
      <Person who="kabir" x={226} y={170} s={2.4} point={[-24, -6]} />
      {/* the ruler, held at the top, Kabir's fingers open at the bottom */}
      <rect class="cts-ruler" x={160} y={30} width={10} height={86} rx={1.5} />
      {[40, 50, 60, 70, 80, 90, 100, 110].map((y) => (
        <line key={y} class="cts-tick" x1={160} y1={y} x2={164} y2={y} />
      ))}
      <path class="cts-fingers" d="M178 118 q -8 -2 -16 2 M178 126 q -8 2 -16 0" />
      <path class="cts-motion" d="M150 44 l 0 12 M180 44 l 0 12 M150 66 l 0 12" />
    </g>
  );
}

function HotTawa({ locale }: { locale: string }): JSX.Element {
  return (
    <g>
      <Kitchen />
      <rect class="cts-stove" x={40} y={112} width={120} height={14} rx={3} />
      <ellipse class="cts-tawa" cx={90} cy={108} rx={36} ry={6} />
      {[70, 90, 110].map((x) => (
        <path key={x} class="cts-heat" d={`M${x} 98 q 4 -6 0 -12 q -4 -6 0 -12`} />
      ))}
      <Person who="kabir" x={180} y={170} s={2.2} point={[-18, -30]} />
      <path class="cts-motion" d="M126 62 q 8 -6 16 -2 M122 74 q 8 -6 16 -2" />
      <text class="cts-shout" x={112} y={52}>
        {say(locale, WORDS.ouch)}
      </text>
      <Person who="mom" x={270} y={170} s={2.2} />
    </g>
  );
}

function ChhuiMui(): JSX.Element {
  return (
    <g>
      <rect class="cts-sky" x={0} y={0} width={W} height={H} />
      <rect class="cts-parapet" x={0} y={110} width={W} height={30} />
      <rect class="cts-roof" x={0} y={140} width={W} height={40} />
      <g transform="translate(160 138) scale(2.2) translate(-150 -128)">
        <SmallPlant x={150} y={128} folded={true} />
      </g>
      <Person who="kabir" x={232} y={172} s={1.9} point={[-26, -14]} />
      <Person who="grandpa" x={70} y={172} s={2.1} />
    </g>
  );
}

function BeanBox(): JSX.Element {
  return (
    <g>
      <rect class="cts-wall" x={0} y={0} width={W} height={H} />
      <rect class="cts-window" x={230} y={20} width={80} height={100} rx={4} />
      <circle class="cts-sun" cx={286} cy={46} r={12} />
      <rect class="cts-sill" x={0} y={120} width={W} height={60} />
      {/* the box, its right side cut open */}
      <path class="cts-box" d="M70 50 L 200 50 L 200 62 M200 104 L 200 120 L 70 120 Z" />
      <rect class="cts-box-inside" x={72} y={52} width={126} height={66} />
      {[110, 140, 168].map((x, i) => (
        <g key={x}>
          <path
            class="cts-flask"
            d={`M${x - 3} 118 L ${x - 3} 106 L ${x - 10} 118 Z M${x + 3} 118 L ${x + 3} 106 L ${x + 10} 118 Z`}
          />
          <path class="cts-shoot" d={`M${x} 106 C ${x} 92, ${x + 8} 84, ${x + 18 + i * 2} 76`} />
          <ellipse class="cts-leaflet" cx={x + 20 + i * 2} cy={74} rx={4} ry={2} />
        </g>
      ))}
      <path class="cts-rays" d="M228 70 L 204 80 M228 90 L 204 92 M228 110 L 204 104" />
      <Person who="riya" x={40} y={170} s={1.8} />
    </g>
  );
}

function StageFright(): JSX.Element {
  return (
    <g>
      <rect class="cts-dark" x={0} y={0} width={W} height={H} />
      <path class="cts-spot" d="M150 0 L 190 0 L 230 130 L 110 130 Z" />
      <rect class="cts-stage" x={60} y={124} width={200} height={14} />
      <Person who="riya" x={170} y={126} s={1.9} point={[6, -24]} />
      <line class="cts-mic" x1={186} y1={86} x2={186} y2={126} />
      <circle class="cts-mic-head" cx={186} cy={84} r={4} />
      <path
        class="cts-heart"
        d="M154 82 C 154 78, 160 78, 160 82 C 160 86, 154 90, 154 92 C 154 90, 148 86, 148 82 C 148 78, 154 78, 154 82 Z"
      />
      <path class="cts-pulse" d="M136 82 l 6 0 l 3 -6 l 4 12 l 3 -6 l 6 0" />
      <path
        class="cts-sweat"
        d="M180 46 q 3 4 0 6 q -3 -2 0 -6 z M160 44 q 3 4 0 6 q -3 -2 0 -6 z"
      />
      {[30, 70, 110, 150, 190, 230, 270, 300].map((x, i) => (
        <circle key={x} class="cts-head" cx={x} cy={160 + (i % 2) * 6} r={10} />
      ))}
    </g>
  );
}

function IodisedSalt({ locale }: { locale: string }): JSX.Element {
  return (
    <g>
      <Kitchen />
      <rect class="cts-shelf" x={150} y={40} width={150} height={6} />
      <rect class="cts-jar" x={160} y={18} width={24} height={22} rx={3} />
      <rect class="cts-jar" x={190} y={22} width={20} height={18} rx={3} />
      <rect class="cts-packet" x={136} y={52} width={56} height={70} rx={4} />
      <text class="cts-packet-text" x={164} y={80} text-anchor="middle">
        {say(locale, WORDS.salt).split(" ")[0]}
      </text>
      <text class="cts-packet-text" x={164} y={94} text-anchor="middle">
        {say(locale, WORDS.salt).split(" ").slice(1).join(" ")}
      </text>
      <Person who="grandpa" x={92} y={170} s={2.2} point={[16, -6]} />
      <Person who="riya" x={220} y={170} s={2.1} />
    </g>
  );
}

function FairDay({ locale }: { locale: string }): JSX.Element {
  return (
    <g>
      <Hall />
      <Banner x={70} y={18} w={180} text={say(locale, WORDS.stall)} />
      <g class="cts-ribbon">
        <circle cx={262} cy={30} r={10} />
        <path d="M256 38 l -4 16 l 6 -4 l 4 6 Z M268 38 l 4 16 l -6 -4 l -4 6 Z" />
        <text x={262} y={34} text-anchor="middle">
          {say(locale, WORDS.first)}
        </text>
      </g>
      <Person who="riya" x={110} y={124} s={1.4} point={[18, -14]} />
      <rect class="cts-poster" x={124} y={60} width={40} height={30} rx={2} />
      <path
        class="cts-brain-icon"
        d="M134 80 C 128 70, 140 62, 148 66 C 156 62, 162 72, 154 80 Z"
      />
      <Person who="kabir" x={226} y={124} s={1.3} point={[14, -12]} />
      <Table x={70} y={120} w={200} />
      <SmallPlant x={96} y={118} />
      <rect class="cts-box-small" x={170} y={104} width={30} height={14} />
      <Person who="mom" x={36} y={178} s={1.4} back={true} />
      <Person who="grandpa" x={290} y={178} s={1.4} back={true} />
      {[70, 130, 190, 250].map((x) => (
        <circle key={x} class="cts-head" cx={x} cy={172} r={9} />
      ))}
    </g>
  );
}

export function ControlSceneView({ view, width, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ControlSceneState;
  const clip = `cs-clip-${useId()}`;
  const k = width / W;
  const height = Math.round((width * H) / W);
  const scene = ((): JSX.Element => {
    switch (s.scene) {
      case ControlScene.ScienceFair:
        return <ScienceFair locale={locale} />;
      case ControlScene.RulerDrop:
        return <RulerDrop />;
      case ControlScene.HotTawa:
        return <HotTawa locale={locale} />;
      case ControlScene.ChhuiMui:
        return <ChhuiMui />;
      case ControlScene.BeanBox:
        return <BeanBox />;
      case ControlScene.StageFright:
        return <StageFright />;
      case ControlScene.IodisedSalt:
        return <IodisedSalt locale={locale} />;
      case ControlScene.FairDay:
        return <FairDay locale={locale} />;
    }
  })();
  return (
    <div class="cts">
      <Stage
        label={describeControlScene(s.scene)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "cts-svg" }}
      >
        <clipPath id={clip}>
          <rect x={0} y={0} width={W} height={H} rx={12 / k} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#${clip})`}>
          {scene}
        </g>
      </Stage>
    </div>
  );
}
