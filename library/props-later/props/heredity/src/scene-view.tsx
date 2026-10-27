import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { PeaPlant, Person, type Words, say } from "./draw";
import {
  HeredityScene,
  type HereditySceneState,
  SCENE_PICTURE,
  describeHeredityScene,
} from "./scene";

const W = SCENE_PICTURE.width;
const H = SCENE_PICTURE.height;

function Sky() {
  return (
    <g>
      <rect class="hs-sky" x={0} y={0} width={W} height={H} />
      <circle class="hs-sun" cx={280} cy={30} r={14} />
    </g>
  );
}

/** The terrace: a parapet wall and a long bed of soil along it. */
function Terrace() {
  return (
    <g>
      <rect class="hs-roof" x={0} y={140} width={W} height={40} />
      <rect class="hs-parapet" x={0} y={110} width={W} height={30} />
      <line class="hs-parapet-top" x1={0} y1={110} x2={W} y2={110} />
      <rect class="hs-bed" x={10} y={134} width={200} height={12} rx={3} />
    </g>
  );
}

function WateringCan({ x, y }: { x: number; y: number }) {
  return (
    <g class="hs-can" transform={`translate(${x} ${y})`}>
      <rect x={-8} y={-8} width={16} height={12} rx={2} />
      <path d="M8 -6 L 18 -14 L 19 -12 L 9 -3 Z" />
      <path class="hs-can-handle" d="M-6 -8 q 6 -8 12 0" fill="none" />
      <path class="hs-drops" d="M20 -10 l 3 4 M22 -13 l 4 3 M19 -7 l 2 5" />
    </g>
  );
}

function TerraceGarden() {
  return (
    <g>
      <Sky />
      <Terrace />
      {[24, 50, 76, 102, 128, 154, 180].map((x) => (
        <PeaPlant key={x} x={x} y={136} s={1} height="tall" />
      ))}
      <Person who="grandpa" x={232} y={168} s={1.25} point={[-14, 6]} />
      <WateringCan x={212} y={140} />
      <Person who="riya" x={268} y={168} s={1.05} />
      <Person who="kabir" x={296} y={168} s={1.05} />
    </g>
  );
}

function ShortSurprise() {
  const plants: [number, string][] = [
    [24, "tall"],
    [48, "tall"],
    [72, "short"],
    [96, "tall"],
    [120, "tall"],
    [144, "tall"],
    [168, "short"],
    [192, "tall"],
  ];
  return (
    <g>
      <Sky />
      <Terrace />
      {plants.map(([x, h]) => (
        <PeaPlant key={x} x={x} y={136} s={1} height={h} />
      ))}
      <circle class="hs-ring" cx={72} cy={118} r={14} />
      <circle class="hs-ring" cx={168} cy={118} r={14} />
      <Person who="grandpa" x={236} y={168} s={1.25} point={[-6, -18]} />
      <text class="hs-puzzle" x={246} y={98}>
        ?
      </text>
      <Person who="kabir" x={278} y={168} s={1.05} point={[-22, -14]} />
      <Person who="riya" x={304} y={168} s={1.05} />
    </g>
  );
}

/** A head in profile facing left, close up on its ear; the lobe hangs free or joins the cheek. */
function EarHead({
  x,
  y,
  free,
  hair,
  label,
  clip,
}: { x: number; y: number; free: boolean; hair: string; label: string; clip: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <clipPath id={clip}>
        <circle cx={0} cy={0} r={34} />
      </clipPath>
      <circle class="hs-frame" cx={0} cy={0} r={34} />
      <g clip-path={`url(#${clip})`}>
        <path class="hs-skin" d="M-40 40 Q -40 -10 -14 -30 Q 14 -46 40 -20 L 40 40 Z" />
        <path class={hair} d="M-16 -32 Q 14 -48 40 -22 L 40 -12 Q 16 -32 -10 -24 Z" />
        {/* the jaw line, below and in front of the ear */}
        <path class="hs-jaw" d="M-6 14 Q -12 30 -28 38" />
      </g>
      {/* the ear: the rim, then the lobe at its bottom */}
      <path class="hs-ear" d="M-2 -18 Q 22 -24 22 -2 Q 22 12 11 16" />
      <path class="hs-ear-inner" d="M4 -10 Q 14 -10 13 2" />
      {free ? (
        <path class="hs-ear-lobe" d="M11 16 Q 14 33 4 33 Q -4 31 -1 16" />
      ) : (
        <path class="hs-ear-lobe" d="M11 16 Q 6 22 -4 24 L -1 16 Z" />
      )}
      <text class="hs-label" x={0} y={50} text-anchor="middle">
        {label}
      </text>
    </g>
  );
}

const EAR_WORDS = {
  free: { en: "free", hi: "मुक्त" },
  attached: { en: "attached", hi: "जुड़ी" },
  grandpa: { en: "Grandpa", hi: "दादाजी" },
  mom: { en: "Mom", hi: "मम्मी" },
  riya: { en: "Riya", hi: "रिया" },
  kabir: { en: "Kabir", hi: "कबीर" },
} as const satisfies Record<string, Words>;

function EarlobesFamily({ locale, clip }: { locale: string; clip: string }) {
  const who = [
    { x: 42, name: EAR_WORDS.grandpa, free: true, hair: "hs-hair-grey" },
    { x: 121, name: EAR_WORDS.mom, free: false, hair: "hs-hair-fill" },
    { x: 200, name: EAR_WORDS.riya, free: true, hair: "hs-hair-fill" },
    { x: 279, name: EAR_WORDS.kabir, free: false, hair: "hs-cap" },
  ];
  return (
    <g>
      <rect class="hs-wall" x={0} y={0} width={W} height={H} />
      {who.map((p) => (
        <g key={p.x}>
          <EarHead
            x={p.x}
            y={76}
            free={p.free}
            hair={p.hair}
            label={`${say(locale, p.name)}: ${say(locale, p.free ? EAR_WORDS.free : EAR_WORDS.attached)}`}
            clip={`${clip}-ear-${p.x}`}
          />
        </g>
      ))}
    </g>
  );
}

/** A small face for a photo, with a curl of hair on the left that runs in the family. */
function PhotoFace({
  x,
  y,
  grey = false,
  cap = false,
}: { x: number; y: number; grey?: boolean; cap?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle class="hs-skin" cx={0} cy={0} r={11} />
      <path
        class={cap ? "hs-cap" : grey ? "hs-hair-grey" : "hs-hair-fill"}
        d="M-11 -1 a 11 11 0 0 1 22 0 q -11 -5 -22 0 z"
      />
      <path
        class={grey ? "hs-curl-grey" : "hs-curl"}
        d="M-9 -6 q -6 2 -3 7 q 3 2 4 -2"
        fill="none"
      />
      <g class="hs-face">
        <circle cx={-4} cy={1} r={1.2} />
        <circle cx={4} cy={1} r={1.2} />
        <path d="M-4 5 q 4 3 8 0" fill="none" />
      </g>
    </g>
  );
}

function FamilyAlbum({ locale }: { locale: string }) {
  const photos = [
    { x: 56, y: 82, name: EAR_WORDS.grandpa, grey: true },
    { x: 120, y: 82, name: EAR_WORDS.mom },
    { x: 200, y: 82, name: EAR_WORDS.riya },
    { x: 264, y: 82, name: EAR_WORDS.kabir, cap: true },
  ];
  return (
    <g>
      <rect class="hs-table" x={0} y={0} width={W} height={H} />
      <path class="hs-album" d="M20 22 L 158 30 L 158 162 L 20 154 Z" />
      <path class="hs-album" d="M162 30 L 300 22 L 300 154 L 162 162 Z" />
      <line class="hs-spine" x1={160} y1={28} x2={160} y2={164} />
      {photos.map((p) => (
        <g key={p.x}>
          <rect class="hs-photo" x={p.x - 27} y={p.y - 34} width={54} height={72} rx={2} />
          <g transform={`translate(${p.x} ${p.y - 6}) scale(1.5) translate(${-p.x} ${-p.y})`}>
            <PhotoFace x={p.x} y={p.y} grey={p.grey} cap={p.cap} />
          </g>
          <text class="hs-label" x={p.x} y={p.y + 30} text-anchor="middle">
            {say(locale, p.name)}
          </text>
        </g>
      ))}
    </g>
  );
}

function SceneBeetle({
  x,
  y,
  green = false,
  r = 0,
}: { x: number; y: number; green?: boolean; r?: number }) {
  return (
    <g
      class={green ? "hs-beetle-green" : "hs-beetle-red"}
      transform={`translate(${x} ${y}) rotate(${r})`}
    >
      <ellipse cx={0} cy={1} rx={4.2} ry={5.2} />
      <circle cx={0} cy={-5} r={2.2} />
    </g>
  );
}

function BeetleBush() {
  return (
    <g>
      <Sky />
      <rect class="hs-roof" x={0} y={150} width={W} height={30} />
      <rect class="hs-trunk" x={148} y={124} width={12} height={30} rx={2} />
      <ellipse class="hs-bush" cx={154} cy={96} rx={110} ry={50} />
      <ellipse class="hs-bush-2" cx={100} cy={84} rx={50} ry={30} />
      <ellipse class="hs-bush-2" cx={206} cy={104} rx={52} ry={28} />
      {[
        [80, 92, 10],
        [118, 70, -20],
        [150, 110, 30],
        [176, 80, 0],
        [210, 96, -10],
        [236, 112, 40],
        [104, 118, -30],
        [190, 120, 15],
      ].map(([x, y, r]) => (
        <SceneBeetle key={`${x}-${y}`} x={x ?? 0} y={y ?? 0} r={r ?? 0} />
      ))}
      <SceneBeetle x={140} y={86} green r={-15} />
      <g class="hs-crow" transform="translate(54 36) rotate(18)">
        <path d="M-22 0 q 11 -14 22 -2 q 11 -12 22 2 q -11 -3 -22 6 q -11 -9 -22 -6 z" />
        <path class="hs-beak" d="M0 2 l 5 3 l -5 2 z" />
      </g>
    </g>
  );
}

const VEG_WORDS = {
  wild: { en: "wild cabbage", hi: "जंगली गोभी" },
  cabbage: { en: "cabbage", hi: "पत्तागोभी" },
  broccoli: { en: "broccoli", hi: "ब्रोकली" },
  cauliflower: { en: "cauliflower", hi: "फूलगोभी" },
  kohlrabi: { en: "kohlrabi", hi: "गाँठगोभी" },
  kale: { en: "kale", hi: "केल" },
} as const satisfies Record<string, Words>;

function WildCabbage({ locale }: { locale: string }) {
  const c = { x: 160, y: 98 };
  const veg = [
    { x: 46, y: 46, key: "cabbage" as const },
    { x: 46, y: 140, key: "broccoli" as const },
    { x: 274, y: 46, key: "cauliflower" as const },
    { x: 274, y: 140, key: "kohlrabi" as const },
    { x: 160, y: 22, key: "kale" as const },
  ];
  return (
    <g>
      <rect class="hs-wall" x={0} y={0} width={W} height={H} />
      {veg.map((v) => (
        <path
          key={v.key}
          class="hs-arrow"
          d={`M${c.x} ${c.y} L${v.x + (c.x - v.x) * 0.3} ${v.y + (c.y - v.y) * 0.3}`}
        />
      ))}
      {/* the wild plant: loose leaves on a tall stem, a few flowers */}
      <g transform={`translate(${c.x} ${c.y + 34})`}>
        <path class="hs-stem" d="M0 0 L 0 -46" />
        <path class="hs-veg-leaf" d="M0 -10 q -22 -6 -26 -22 q 18 2 26 18 Z" />
        <path class="hs-veg-leaf" d="M0 -18 q 22 -6 26 -24 q -18 4 -26 20 Z" />
        <path class="hs-veg-leaf" d="M0 -30 q -16 -8 -16 -22 q 12 4 16 18 Z" />
        <circle class="hs-veg-flower" cx={-3} cy={-50} r={3} />
        <circle class="hs-veg-flower" cx={4} cy={-48} r={3} />
      </g>
      <text class="hs-label hs-label-strong" x={c.x} y={c.y + 50} text-anchor="middle">
        {say(locale, VEG_WORDS.wild)}
      </text>
      {/* cabbage: a tight round head */}
      <g transform="translate(46 46)">
        <circle class="hs-veg-leaf" r={15} />
        <path class="hs-veg-line" d="M-10 -6 q 10 -8 20 0 M-12 2 q 12 -8 24 0 M-8 9 q 8 -6 16 0" />
      </g>
      {/* broccoli: green florets on a stalk */}
      <g transform="translate(46 140)">
        <rect class="hs-veg-stalk" x={-4} y={0} width={8} height={14} rx={2} />
        {[
          [-9, -2],
          [0, -8],
          [9, -2],
          [-4, 3],
          [5, 3],
        ].map(([x, y]) => (
          <circle key={`${x}${y}`} class="hs-veg-floret" cx={x} cy={y} r={7} />
        ))}
      </g>
      {/* cauliflower: a white curd in green leaves */}
      <g transform="translate(274 46)">
        <path class="hs-veg-leaf" d="M-18 6 q 0 -18 18 -14 q 18 -4 18 14 q -18 10 -36 0 z" />
        {[
          [-7, -2],
          [0, -6],
          [7, -2],
          [-3, 3],
          [4, 3],
        ].map(([x, y]) => (
          <circle key={`${x}${y}`} class="hs-veg-curd" cx={x} cy={y} r={6} />
        ))}
      </g>
      {/* kohlrabi: a swollen round stem with leaf stalks */}
      <g transform="translate(274 140)">
        <circle class="hs-veg-bulb" cx={0} cy={2} r={12} />
        <path class="hs-veg-stem-line" d="M-6 -8 l -6 -12 M0 -10 l 0 -14 M6 -8 l 6 -12" />
      </g>
      {/* kale: big ruffled leaves */}
      <g transform="translate(160 22)">
        <path
          class="hs-veg-leaf"
          d="M-26 6 q -4 -16 10 -18 q 4 -8 12 -2 q 8 -8 14 0 q 12 0 14 16 q -26 10 -50 4 z"
        />
      </g>
      {veg.map((v) => (
        <text
          key={`t-${v.key}`}
          class="hs-label"
          x={v.key === "kale" ? v.x + 44 : v.x}
          y={v.key === "kale" ? v.y + 8 : v.y + 30}
          text-anchor={v.key === "kale" ? "start" : "middle"}
        >
          {say(locale, VEG_WORDS[v.key])}
        </text>
      ))}
    </g>
  );
}

const TREE_WORDS = {
  ladder: { en: "a ladder?", hi: "सीढ़ी?" },
  tree: { en: "a tree", hi: "एक वृक्ष" },
  bacteria: { en: "bacteria", hi: "जीवाणु" },
  spider: { en: "spider", hi: "मकड़ी" },
  fish: { en: "fish", hi: "मछली" },
  chimp: { en: "chimp", hi: "चिंपैंज़ी" },
  human: { en: "human", hi: "मानव" },
  ancestor: { en: "common ancestors", hi: "साझा पूर्वज" },
} as const satisfies Record<string, Words>;

function TreeNotLadder({ locale }: { locale: string }) {
  const rungs = [
    TREE_WORDS.bacteria,
    TREE_WORDS.spider,
    TREE_WORDS.fish,
    TREE_WORDS.chimp,
    TREE_WORDS.human,
  ];
  const tips = [
    { x: 150, w: TREE_WORDS.bacteria },
    { x: 185, w: TREE_WORDS.spider },
    { x: 220, w: TREE_WORDS.fish },
    { x: 255, w: TREE_WORDS.chimp },
    { x: 290, w: TREE_WORDS.human },
  ];
  return (
    <g>
      <rect class="hs-wall" x={0} y={0} width={W} height={H} />
      {/* the ladder, crossed out */}
      <g>
        <line class="hs-ladder" x1={30} y1={160} x2={30} y2={30} />
        <line class="hs-ladder" x1={70} y1={160} x2={70} y2={30} />
        {rungs.map((w, i) => {
          const y = 148 - i * 27;
          return (
            <g key={w.en}>
              <line class="hs-ladder" x1={30} y1={y} x2={70} y2={y} />
              <text class="hs-label" x={76} y={y + 4}>
                {say(locale, w)}
              </text>
            </g>
          );
        })}
        <path class="hs-cross" d="M14 40 L 120 150 M120 40 L 14 150" />
        <text class="hs-label hs-label-strong" x={66} y={20} text-anchor="middle">
          {say(locale, TREE_WORDS.ladder)}
        </text>
      </g>
      {/* the branching tree */}
      <g>
        <path
          class="hs-branch"
          d="M220 168 L 220 140 M220 140 L 168 110 M168 110 L 150 50 M168 110 L 185 50 M220 140 L 255 108 M255 108 L 220 50 M255 108 L 272 80 M272 80 L 255 50 M272 80 L 290 50"
        />
        {[
          [220, 140],
          [168, 110],
          [255, 108],
          [272, 80],
        ].map(([x, y]) => (
          <circle key={`${x}${y}`} class="hs-node" cx={x} cy={y} r={3.5} />
        ))}
        {tips.map((t, i) => (
          <text
            key={t.w.en}
            class="hs-label hs-tip"
            x={t.x}
            y={i % 2 === 0 ? 42 : 30}
            text-anchor="middle"
          >
            {say(locale, t.w)}
          </text>
        ))}
        <text class="hs-label" x={220} y={176} text-anchor="middle">
          {say(locale, TREE_WORDS.ancestor)}
        </text>
        <text class="hs-label hs-label-strong hs-tick" x={220} y={16} text-anchor="middle">
          {`✓ ${say(locale, TREE_WORDS.tree)}`}
        </text>
      </g>
    </g>
  );
}

const MAP_WORDS = {
  africa: { en: "Africa", hi: "अफ़्रीका" },
  europe: { en: "Europe", hi: "यूरोप" },
  asia: { en: "Asia", hi: "एशिया" },
  australia: { en: "Australia", hi: "ऑस्ट्रेलिया" },
  americas: { en: "Americas", hi: "अमेरिका" },
} as const satisfies Record<string, Words>;

function OutOfAfrica({ locale }: { locale: string }) {
  return (
    <g>
      <rect class="hs-ocean" x={0} y={0} width={W} height={H} />
      {/* rough land shapes, not a real map */}
      <path
        class="hs-land"
        d="M20 40 Q 40 20 70 28 L 80 60 Q 60 70 70 100 L 60 150 Q 44 160 40 130 Q 30 90 20 70 Z"
      />
      <path
        class="hs-land hs-africa"
        d="M150 70 Q 170 62 190 72 Q 200 96 188 120 Q 178 150 166 150 Q 156 128 150 110 Q 140 90 150 70 Z"
      />
      <path
        class="hs-land"
        d="M150 30 Q 190 14 250 22 Q 300 28 304 60 Q 290 84 262 88 Q 236 92 220 84 Q 200 70 186 64 Q 160 58 150 46 Z"
      />
      <path class="hs-land" d="M260 120 Q 286 114 300 128 Q 298 148 276 150 Q 256 146 260 120 Z" />
      <text class="hs-label hs-label-strong" x={170} y={106} text-anchor="middle">
        {say(locale, MAP_WORDS.africa)}
      </text>
      <text class="hs-label" x={168} y={40} text-anchor="middle">
        {say(locale, MAP_WORDS.europe)}
      </text>
      <text class="hs-label" x={252} y={50} text-anchor="middle">
        {say(locale, MAP_WORDS.asia)}
      </text>
      <text class="hs-label" x={280} y={164} text-anchor="middle">
        {say(locale, MAP_WORDS.australia)}
      </text>
      <text class="hs-label" x={46} y={170} text-anchor="middle">
        {say(locale, MAP_WORDS.americas)}
      </text>
      {/* the routes out */}
      <path class="hs-route" d="M176 84 Q 190 66 204 64" />
      <path class="hs-route" d="M204 64 Q 186 50 172 46" />
      <path class="hs-route" d="M204 64 Q 222 72 236 72" />
      <path class="hs-route" d="M236 72 Q 262 64 280 54" />
      <path class="hs-route" d="M236 76 Q 262 100 276 122" />
      <path class="hs-route" d="M282 48 Q 300 20 270 10 Q 140 2 64 26" />
      {[
        [204, 64],
        [172, 46],
        [236, 72],
        [280, 54],
        [276, 122],
        [64, 26],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} class="hs-route-dot" cx={x} cy={y} r={2.6} />
      ))}
    </g>
  );
}

/** One illustrated panel, scaled to the width. */
export function HereditySceneView({ view, width, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as HereditySceneState;
  const id = useId();
  const clip = `hs-clip-${id}`;
  const k = width / W;
  const height = Math.round((width * H) / W);
  const scene = ((): JSX.Element => {
    switch (s.scene) {
      case HeredityScene.TerraceGarden:
        return <TerraceGarden />;
      case HeredityScene.ShortSurprise:
        return <ShortSurprise />;
      case HeredityScene.EarlobesFamily:
        return <EarlobesFamily locale={locale} clip={clip} />;
      case HeredityScene.FamilyAlbum:
        return <FamilyAlbum locale={locale} />;
      case HeredityScene.BeetleBush:
        return <BeetleBush />;
      case HeredityScene.WildCabbage:
        return <WildCabbage locale={locale} />;
      case HeredityScene.TreeNotLadder:
        return <TreeNotLadder locale={locale} />;
      case HeredityScene.OutOfAfrica:
        return <OutOfAfrica locale={locale} />;
    }
  })();
  return (
    <div class="hs">
      <Stage
        label={describeHeredityScene(s.scene)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "hs-svg" }}
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
