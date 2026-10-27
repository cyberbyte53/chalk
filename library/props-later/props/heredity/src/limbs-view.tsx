import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { type Words, say } from "./draw";
import {
  LIMBS,
  Limb,
  LimbAction,
  LimbPart,
  type LimbState,
  type Relation,
  describeLimbs,
  relationNow,
} from "./limbs";

const W = 320;
const H = 160;

const NAMES: Readonly<Record<Limb, Words>> = {
  human: { en: "human arm", hi: "मानव की बाँह" },
  dog: { en: "dog's front leg", hi: "कुत्ते की अगली टाँग" },
  bat: { en: "bat's wing", hi: "चमगादड़ का पंख" },
  bird: { en: "bird's wing", hi: "पक्षी का पंख" },
  whale: { en: "whale's flipper", hi: "व्हेल का फ़्लिपर" },
  butterfly: { en: "butterfly's wing", hi: "तितली का पंख" },
};

const SHORT: Readonly<Record<Limb, Words>> = {
  human: { en: "Human", hi: "मानव" },
  dog: { en: "Dog", hi: "कुत्ता" },
  bat: { en: "Bat", hi: "चमगादड़" },
  bird: { en: "Bird", hi: "पक्षी" },
  whale: { en: "Whale", hi: "व्हेल" },
  butterfly: { en: "Butterfly", hi: "तितली" },
};

const BONES = [
  { cls: "hl-upper", words: { en: "upper arm", hi: "ऊपरी बाँह" } },
  { cls: "hl-fore", words: { en: "forearm", hi: "अग्रबाहु" } },
  { cls: "hl-wrist", words: { en: "wrist", hi: "कलाई" } },
  { cls: "hl-finger", words: { en: "fingers", hi: "उँगलियाँ" } },
] as const;

const VERDICT: Readonly<Record<Relation, Words>> = {
  homologous: {
    en: "Homologous: the same bones in the same plan, changed for different jobs. They come from a common ancestor.",
    hi: "समजात: वही हड्डियाँ, वही ढाँचा, अलग-अलग कामों के लिए बदला हुआ। ये एक साझा पूर्वज से आए हैं।",
  },
  analogous: {
    en: "Analogous: they do the same job (flying), but are built completely differently. Not from a common ancestor.",
    hi: "समरूप: काम एक ही (उड़ना), पर बनावट बिल्कुल अलग। ये साझा पूर्वज से नहीं आए।",
  },
  both: {
    en: "The arm bones are homologous (same plan), but the wings are analogous: a bat's is skin stretched between long fingers, a bird's is feathers along the whole arm.",
    hi: "बाँह की हड्डियाँ समजात हैं (वही ढाँचा), पर पंख समरूप हैं: चमगादड़ का पंख लंबी उँगलियों के बीच तनी त्वचा है, पक्षी का पंख पूरी बाँह पर लगे परों से बना है।",
  },
  unrelated: {
    en: "Neither the same bones nor the same job.",
    hi: "न वही हड्डियाँ, न वही काम।",
  },
};

const NO_BONES: Words = { en: "no bones", hi: "कोई हड्डी नहीं" };
const PICK: Words = { en: "Tap two to compare", hi: "तुलना के लिए दो चुनो" };

type Seg = [number, number, number, number];

/** A limb's bones (in a 140 × 100 box) and the soft outline around them. */
const SHAPES: Readonly<
  Record<
    Limb,
    {
      outline: string;
      cover: string;
      upper: Seg[];
      fore: Seg[];
      wrist: [number, number][];
      fingers: Seg[];
    }
  >
> = {
  human: {
    cover: "hl-skin",
    outline: "M8 40 Q 60 32 100 41 L 136 34 L 138 64 L 100 60 Q 60 68 8 62 Z",
    upper: [[12, 51, 56, 51]],
    fore: [
      [60, 48, 96, 48],
      [60, 54, 96, 54],
    ],
    wrist: [
      [101, 47],
      [101, 55],
      [106, 51],
    ],
    fingers: [0, 1, 2, 3, 4].map((i): Seg => [110, 43 + i * 4, 132, 38 + i * 6]),
  },
  dog: {
    cover: "hl-skin",
    outline: "M50 6 Q 74 10 72 40 L 68 80 L 80 94 L 50 97 L 50 80 L 46 40 Q 42 12 50 6 Z",
    upper: [[59, 10, 61, 42]],
    fore: [
      [57, 47, 57, 79],
      [64, 47, 64, 79],
    ],
    wrist: [
      [59, 84],
      [65, 85],
    ],
    fingers: [
      [56, 89, 54, 97],
      [61, 89, 61, 97],
      [66, 89, 68, 97],
      [71, 88, 76, 95],
    ],
  },
  bat: {
    cover: "hl-membrane",
    outline: "M12 54 L 46 46 L 88 30 L 132 16 L 128 52 L 112 86 L 84 96 L 40 90 L 12 72 Z",
    upper: [[12, 58, 46, 47]],
    fore: [
      [50, 45, 86, 30],
      [50, 50, 86, 35],
    ],
    wrist: [
      [90, 31],
      [93, 36],
    ],
    fingers: [
      [96, 31, 132, 16],
      [96, 34, 128, 52],
      [94, 37, 112, 86],
      [91, 39, 84, 96],
      [91, 29, 95, 22],
    ],
  },
  bird: {
    cover: "hl-feathers",
    outline:
      "M10 44 L 120 44 L 130 51 Q 118 66 110 60 Q 102 78 92 66 Q 82 84 72 70 Q 60 88 50 72 Q 38 88 30 70 Q 20 80 12 64 Z",
    upper: [[13, 52, 46, 50]],
    fore: [
      [50, 47, 86, 47],
      [50, 53, 86, 53],
    ],
    wrist: [
      [90, 49],
      [94, 53],
    ],
    fingers: [
      [98, 49, 124, 48],
      [98, 53, 112, 56],
    ],
  },
  whale: {
    cover: "hl-skin",
    outline: "M8 40 Q 40 26 92 34 Q 132 42 138 54 Q 120 66 84 66 Q 40 70 8 62 Z",
    upper: [[12, 51, 28, 51]],
    fore: [
      [32, 47, 46, 46],
      [32, 55, 46, 56],
    ],
    wrist: [
      [50, 46],
      [54, 51],
      [50, 56],
    ],
    fingers: [
      [58, 44, 108, 40],
      [58, 49, 126, 50],
      [58, 54, 118, 58],
      [58, 59, 94, 62],
    ],
  },
  butterfly: {
    cover: "hl-insect",
    outline:
      "M14 50 C 40 6 110 4 128 22 C 134 40 100 52 70 52 C 104 58 120 80 104 94 C 80 102 40 84 14 56 Z",
    upper: [],
    fore: [],
    wrist: [],
    fingers: [],
  },
};

const VEINS = "M14 52 L 120 18 M14 52 L 112 40 M14 52 L 74 52 M14 53 L 104 88 M14 54 L 70 90";

function LimbDrawing({
  limb,
  x,
  y,
  showColours,
  locale,
  part,
}: { limb: Limb; x: number; y: number; showColours: boolean; locale: string; part: string }) {
  const shape = SHAPES[limb];
  const cls = (c: string) => (showColours ? c : "hl-bone");
  return (
    <g data-part={part} transform={`translate(${x} ${y})`}>
      <rect class="hl-panel" x={0} y={0} width={148} height={116} rx={8} />
      <g transform="translate(4 6)">
        <path class={`hl-cover ${shape.cover}`} d={shape.outline} />
        {limb === Limb.Butterfly && <path class="hl-vein" d={VEINS} />}
        {shape.upper.map(([a, b, c, d]) => (
          <line key={`u${a}-${b}`} class={`hl-b ${cls("hl-upper")}`} x1={a} y1={b} x2={c} y2={d} />
        ))}
        {shape.fore.map(([a, b, c, d]) => (
          <line
            key={`f${a}-${b}`}
            class={`hl-b hl-thin ${cls("hl-fore")}`}
            x1={a}
            y1={b}
            x2={c}
            y2={d}
          />
        ))}
        {shape.wrist.map(([a, b]) => (
          <circle key={`w${a}-${b}`} class={cls("hl-wrist")} cx={a} cy={b} r={2.6} />
        ))}
        {shape.fingers.map(([a, b, c, d]) => (
          <line
            key={`d${a}-${b}-${c}`}
            class={`hl-b hl-finest ${cls("hl-finger")}`}
            x1={a}
            y1={b}
            x2={c}
            y2={d}
          />
        ))}
        {limb === Limb.Butterfly && (
          <text class="hl-note" x={4} y={98}>
            {say(locale, NO_BONES)}
          </text>
        )}
      </g>
      <text class="hl-name" x={74} y={132} text-anchor="middle">
        {say(locale, NAMES[limb])}
      </text>
    </g>
  );
}

/** Two forelimbs compared bone by bone, with buttons to choose which two. */
export function LimbBonesView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as LimbState;
  const k = width / W;
  const height = Math.round(H * k);
  const r = relationNow(s);
  return (
    <div class="hl">
      <Stage
        label={describeLimbs(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "hl-svg" }}
      >
        <g transform={`scale(${k})`}>
          {s.first !== null && (
            <LimbDrawing
              limb={s.first}
              x={8}
              y={4}
              showColours={s.showColours}
              locale={locale}
              part={LimbPart.First}
            />
          )}
          {s.second !== null && (
            <LimbDrawing
              limb={s.second}
              x={164}
              y={4}
              showColours={s.showColours}
              locale={locale}
              part={LimbPart.Second}
            />
          )}
          {s.showColours &&
            BONES.map((b, i) => (
              <g key={b.cls}>
                <rect class={b.cls} x={14 + i * 76} y={146} width={10} height={10} rx={2} />
                <text class="hl-legend" x={28 + i * 76} y={155}>
                  {say(locale, b.words)}
                </text>
              </g>
            ))}
        </g>
      </Stage>
      {r !== null && (
        <p class={`hl-verdict hl-verdict-${r}`} data-part={LimbPart.Verdict}>
          {say(locale, VERDICT[r])}
        </p>
      )}
      {s.canChoose && (
        <div class="hl-controls" data-part={LimbPart.Controls}>
          <span class="hl-label">{say(locale, PICK)}</span>
          {LIMBS.map((l) => (
            <button
              key={l}
              type="button"
              class={l === s.first || l === s.second ? "hl-chip is-on" : "hl-chip"}
              data-part={`choose-${l}`}
              aria-pressed={l === s.first || l === s.second}
              onClick={() => call(LimbAction.Choose, { limb: l })}
            >
              {say(locale, SHORT[l])}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
