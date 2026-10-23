import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Button, Controls, Dots, Frame, type Words, say } from "./draw";
import {
  DROPS_USED_UP,
  EQUATIONS,
  Flame,
  type Fuel,
  LAB_STEPS,
  LabAction,
  LabKind,
  LabPart,
  type LabState,
  describeLab,
  flameOf,
} from "./lab";

const W = 320;
const H = 200;
const BENCH = 182;

const WORDS = {
  next: { en: "Next step →", hi: "अगला चरण →" },
  again: { en: "Start again", hi: "फिर से शुरू" },
  open: { en: "Air hole open", hi: "वायु छिद्र खुला" },
  closed: { en: "Air hole closed", hi: "वायु छिद्र बंद" },
  drop: { en: "Add a drop", hi: "एक बूँद डालो" },
  sun: { en: "In sunlight", hi: "धूप में" },
  dark: { en: "In the dark", hi: "अँधेरे में" },
  alcohol: { en: "alcohol", hi: "ऐल्कोहॉल" },
  camphor: { en: "camphor", hi: "कपूर" },
  naphthalene: { en: "naphthalene", hi: "नैफ़्थलीन" },
  plate: { en: "metal plate", hi: "धातु की प्लेट" },
  soot: { en: "soot", hi: "कालिख" },
  ethanol: { en: "ethanol", hi: "एथेनॉल" },
  kmno4: { en: "alkaline KMnO₄", hi: "क्षारीय KMnO₄" },
  oil: { en: "oil", hi: "तेल" },
  fat: { en: "saturated fat", hi: "संतृप्त वसा" },
  nickel: { en: "nickel catalyst", hi: "निकेल उत्प्रेरक" },
  hydrogen: { en: "hydrogen", hi: "हाइड्रोजन" },
  sodium: { en: "sodium", hi: "सोडियम" },
  pop: { en: "pop!", hi: "पॉप!" },
  acid: { en: "conc. H₂SO₄, 443 K", hi: "सांद्र H₂SO₄, 443 K" },
  ethene: { en: "ethene gas", hi: "एथीन गैस" },
  waterBath: { en: "water bath", hi: "जल ऊष्मक" },
  water: { en: "water", hi: "जल" },
  sweet: { en: "sweet smell", hi: "मीठी गंध" },
  acetic: { en: "ethanoic acid", hi: "एथेनॉइक अम्ल" },
  hcl: { en: "hydrochloric acid", hi: "हाइड्रोक्लोरिक अम्ल" },
  litmus: { en: "blue litmus → red", hi: "नीला लिटमस → लाल" },
  carbonate: { en: "sodium carbonate", hi: "सोडियम कार्बोनेट" },
  limeWater: { en: "lime water", hi: "चूने का पानी" },
  milky: { en: "milky", hi: "दूधिया" },
} as const satisfies Record<string, Words>;

const CAPTIONS_HI: Readonly<Record<LabKind, readonly string[]>> = {
  spatula: ["स्पैचुला पर एक कार्बन यौगिक, ऊपर धातु की प्लेट।", "यह जलता है।"],
  burner: ["एक बर्नर जिसके तल में वायु छिद्र है।", "जलाया गया।"],
  permanganate: ["परखनली में गरम एथेनॉल; क्षारीय पोटैशियम परमैंगनेट बूँद-बूँद डाला जाता है।", ""],
  hydrogenation: [
    "वनस्पति तेल: द्विबंध वाली लंबी कार्बन शृंखलाएँ (असंतृप्त), एक द्रव।",
    "निकेल उत्प्रेरक के साथ इसमें हाइड्रोजन प्रवाहित की जाती है।",
    "द्विबंध हाइड्रोजन ले लेते हैं: एक संतृप्त वसा, वनस्पति घी जैसी ठोस।",
  ],
  chlorination: ["मेथेन और क्लोरीन साथ में।", ""],
  sodium: [
    "परखनली में परिशुद्ध ऐल्कोहॉल (एथेनॉल)।",
    "चावल के दो दानों जितना सोडियम डाला जाता है: बुदबुदाहट होती है।",
    "मुँह पर जलती तीली: गैस 'पॉप' से जलती है। यह हाइड्रोजन है।",
  ],
  dehydration: [
    "443 K पर अधिक गरम सांद्र सल्फ़्यूरिक अम्ल के साथ एथेनॉल।",
    "अम्ल हर एथेनॉल अणु से जल निकाल लेता है: एथीन गैस निकलती है।",
  ],
  ester: [
    "1 mL एथेनॉल, 1 mL ग्लेशियल एथेनॉइक अम्ल और सांद्र सल्फ़्यूरिक अम्ल की कुछ बूँदें।",
    "कम से कम पाँच मिनट जल ऊष्मक में गरम किया गया।",
    "पानी से भरे बीकर में डाला गया।",
    "एक मीठी, फल जैसी गंध: एक एस्टर बन गया है।",
  ],
  acidStrength: [
    "तनु एथेनॉइक अम्ल और तनु हाइड्रोक्लोरिक अम्ल, साथ-साथ।",
    "नीला लिटमस: दोनों उसे लाल करते हैं। दोनों अम्ल हैं।",
    "सार्वत्रिक सूचक: हाइड्रोक्लोरिक अम्ल लाल (pH लगभग 1), एथेनॉइक अम्ल नारंगी (pH लगभग 3)। एथेनॉइक अम्ल दुर्बल अम्ल है।",
  ],
  carbonate: [
    "परखनली में सोडियम कार्बोनेट; तनु एथेनॉइक अम्ल डाला जाता है।",
    "बुदबुदाहट: एक गैस निकलती है।",
    "गैस को चूने के पानी से गुज़ारा जाता है: वह दूधिया हो जाता है। गैस कार्बन डाइऑक्साइड है।",
  ],
};

const EQUATIONS_HI: Readonly<Record<LabKind, string>> = {
  spatula: "C + O₂ → CO₂ + ऊष्मा और प्रकाश",
  burner: "CH₄ + 2O₂ → CO₂ + 2H₂O + ऊष्मा और प्रकाश",
  permanganate: "CH₃CH₂OH → CH₃COOH (क्षारीय KMnO₄ + ऊष्मा)",
  hydrogenation: "R–CH=CH–R + H₂ → R–CH₂–CH₂–R (निकेल उत्प्रेरक)",
  chlorination: "CH₄ + Cl₂ → CH₃Cl + HCl (सूर्य के प्रकाश में)",
  sodium: "2Na + 2CH₃CH₂OH → 2CH₃CH₂O⁻Na⁺ + H₂",
  dehydration: "CH₃–CH₂OH → CH₂=CH₂ + H₂O (गरम सांद्र H₂SO₄)",
  ester: "CH₃COOH + CH₃CH₂OH → CH₃COOCH₂CH₃ + H₂O (अम्ल)",
  acidStrength: "CH₃COOH ⇌ CH₃COO⁻ + H⁺ (थोड़ा ही आयनित)",
  carbonate: "2CH₃COOH + Na₂CO₃ → 2CH₃COONa + H₂O + CO₂",
};

function captionOf(s: LabState, locale: string): string {
  if (locale !== "hi") return describeLab(s);
  if (s.kind === LabKind.Spatula && s.step > 0)
    return flameOf(s) === Flame.Sooty
      ? "पीली, धुएँ वाली लौ: प्लेट पर काली कालिख जम जाती है।"
      : "साफ़ लौ: प्लेट साफ़ रहती है।";
  if (s.kind === LabKind.Burner && s.step > 0)
    return s.isAirOpen ? "वायु छिद्र खुला: साफ़ नीली लौ।" : "वायु छिद्र बंद: पीली, कालिख वाली लौ।";
  if (s.kind === LabKind.Permanganate && s.drops > 0)
    return s.drops <= DROPS_USED_UP
      ? `${s.drops} बूँद: बैंगनी रंग हर बार गायब हो जाता है; एथेनॉल का ऑक्सीकरण होकर एथेनॉइक अम्ल बन रहा है।`
      : `${s.drops} बूँदें: अब बैंगनी रंग बना रहता है। एथेनॉल समाप्त हो गया है।`;
  if (s.kind === LabKind.Chlorination && s.step > 0)
    return s.isSunny
      ? "धूप में: एक क्लोरीन परमाणु एक हाइड्रोजन परमाणु की जगह लेता है: CH₃Cl और HCl बनते हैं।"
      : "अँधेरे में: कुछ नहीं होता। संतृप्त हाइड्रोकार्बन काफ़ी अक्रियाशील होते हैं।";
  return CAPTIONS_HI[s.kind][s.step] ?? CAPTIONS_HI[s.kind][0] ?? "";
}

/* ---------- apparatus ---------- */

function Tube({
  x,
  top = 52,
  h = 116,
  level = 0.45,
  liquid = "cb-liquid",
  w = 30,
}: {
  x: number;
  top?: number;
  h?: number;
  level?: number;
  liquid?: string;
  w?: number;
}) {
  const r = w / 2;
  const bottom = top + h;
  const ly = bottom - (h - r) * level - r;
  const body = `M${x - r} ${top} L${x - r} ${bottom - r} A ${r} ${r} 0 0 0 ${x + r} ${bottom - r} L${x + r} ${top}`;
  const fill = `M${x - r + 2} ${ly} L${x - r + 2} ${bottom - r} A ${r - 2} ${r - 2} 0 0 0 ${x + r - 2} ${bottom - r} L${x + r - 2} ${ly} Z`;
  return (
    <g>
      {level > 0 && <path class={liquid} d={fill} />}
      <path class="cb-glass" d={body} />
      <line class="cb-glass" x1={x - r - 3} y1={top} x2={x + r + 3} y2={top} />
    </g>
  );
}

function Bubbles({
  x,
  y,
  spread = 8,
  cls = "",
}: { x: number; y: number; spread?: number; cls?: string }) {
  return (
    <g class={`cb-bubbles ${cls}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          class="cb-bubble"
          style={{ animationDelay: `${i * 0.35}s` }}
          cx={x + ((i * 37) % (spread * 2)) - spread}
          cy={y - (i % 3) * 8}
          r={2 + (i % 2)}
        />
      ))}
    </g>
  );
}

function FlameShape({
  x,
  y,
  kind,
  size = 1,
}: { x: number; y: number; kind: Flame; size?: number }) {
  if (kind === Flame.None) return null;
  const h = 40 * size;
  const w = 12 * size;
  const d = `M${x} ${y - h} C ${x + w} ${y - h * 0.5}, ${x + w} ${y}, ${x} ${y} C ${x - w} ${y}, ${x - w} ${y - h * 0.5}, ${x} ${y - h} Z`;
  return (
    <g class={`cb-flame is-${kind}`}>
      <path d={d} />
      {kind === Flame.Clean && (
        <path
          class="cb-flame-core"
          d={`M${x} ${y - h * 0.5} C ${x + w * 0.45} ${y - h * 0.25}, ${x + w * 0.45} ${y}, ${x} ${y} C ${x - w * 0.45} ${y}, ${x - w * 0.45} ${y - h * 0.25}, ${x} ${y - h * 0.5} Z`}
        />
      )}
      {kind === Flame.Sooty && (
        <g class="cb-smoke">
          <path d={`M${x} ${y - h - 2} q -8 -10 0 -18 q 8 -8 0 -18`} />
          <path d={`M${x + 6} ${y - h} q 6 -10 -1 -18`} />
        </g>
      )}
    </g>
  );
}

function SmallBurner({ x }: { x: number }) {
  return (
    <g class="cb-burner">
      <rect x={x - 16} y={BENCH - 8} width={32} height={8} rx={2} />
      <rect x={x - 5} y={BENCH - 26} width={10} height={18} />
    </g>
  );
}

function Label({
  x,
  y,
  text,
  anchor = "start",
}: { x: number; y: number; text: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <text class="cb-label" x={x} y={y} text-anchor={anchor}>
      {text}
    </text>
  );
}

/* ---------- each demonstration ---------- */

function Spatula({ s, locale }: { s: LabState; locale: string }) {
  const flame = flameOf(s);
  const fx = 150;
  return (
    <g>
      <rect class="cb-plate" x={98} y={30} width={104} height={8} rx={2} />
      {flame === Flame.Sooty && (
        <g class="cb-soot">
          <ellipse cx={150} cy={41} rx={30} ry={5} />
          <ellipse cx={138} cy={42} rx={12} ry={3} />
        </g>
      )}
      <line class="cb-spatula" x1={40} y1={150} x2={146} y2={128} />
      <ellipse class="cb-lump" cx={150} cy={126} rx={9} ry={4} />
      <FlameShape x={fx} y={124} kind={flame} size={1.4} />
      {s.showNames && (
        <g>
          <Label x={208} y={38} text={say(locale, WORDS.plate)} />
          <Label x={40} y={168} text={say(locale, WORDS[s.fuel])} />
          {flame === Flame.Sooty && <Label x={206} y={54} text={say(locale, WORDS.soot)} />}
        </g>
      )}
    </g>
  );
}

function Burner({ s, locale }: { s: LabState; locale: string }) {
  const flame = flameOf(s);
  const x = 150;
  return (
    <g>
      <rect class="cb-pan" x={104} y={42} width={92} height={18} rx={4} />
      {flame === Flame.Sooty && (
        <rect class="cb-soot-fill" x={106} y={56} width={88} height={4} rx={2} />
      )}
      <g class="cb-burner">
        <rect x={x - 28} y={BENCH - 10} width={56} height={10} rx={3} />
        <rect x={x - 8} y={BENCH - 70} width={16} height={60} rx={2} />
        <circle
          class={s.isAirOpen ? "cb-airhole is-open" : "cb-airhole"}
          cx={x}
          cy={BENCH - 24}
          r={5}
        />
      </g>
      <FlameShape x={x} y={BENCH - 70} kind={flame} size={1.5} />
      {s.showNames && (
        <Label
          x={x + 16}
          y={BENCH - 20}
          text={say(locale, s.isAirOpen ? WORDS.open : WORDS.closed)}
        />
      )}
    </g>
  );
}

function Permanganate({ s, locale }: { s: LabState; locale: string }) {
  const stays = s.drops > DROPS_USED_UP;
  return (
    <g>
      <rect class="cb-bath" x={100} y={110} width={100} height={64} rx={6} />
      <Tube
        x={150}
        top={46}
        h={112}
        level={0.5}
        liquid={stays ? "cb-liquid is-purple" : "cb-liquid"}
      />
      <g class="cb-dropper">
        <rect x={142} y={8} width={16} height={18} rx={6} />
        <rect x={147} y={26} width={6} height={14} />
      </g>
      {s.drops > 0 && <circle class="cb-drop is-purple" cx={150} cy={58} r={3.5} />}
      {s.showNames && (
        <g>
          <Label x={170} y={22} text={say(locale, WORDS.kmno4)} />
          <Label x={36} y={140} text={say(locale, WORDS.ethanol)} />
          <Label x={204} y={170} text={`${s.drops} / 6`} />
        </g>
      )}
    </g>
  );
}

function Chain({ x, y, saturated }: { x: number; y: number; saturated: boolean }) {
  // a zig-zag fatty chain with one C=C in the middle (or not)
  const pts = Array.from(
    { length: 9 },
    (_, i) => [x + i * 22, y + (i % 2 === 0 ? 0 : 14)] as const,
  );
  return (
    <g class="cb-zigzag">
      {pts.slice(1).map(([px, py], i) => {
        const [qx, qy] = pts[i] as readonly [number, number];
        const isDouble = !saturated && i === 4;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed chain
          <g key={i}>
            <line class={isDouble ? "cb-bond is-hot" : "cb-bond"} x1={qx} y1={qy} x2={px} y2={py} />
            {isDouble && (
              <line class="cb-bond is-hot" x1={qx + 3} y1={qy - 3} x2={px + 3} y2={py - 3} />
            )}
          </g>
        );
      })}
    </g>
  );
}

function Hydrogenation({ s, locale }: { s: LabState; locale: string }) {
  return (
    <g>
      <rect class="cb-beaker" x={92} y={92} width={116} height={82} rx={6} />
      <rect
        class={s.step === 2 ? "cb-fat" : "cb-oil"}
        x={96}
        y={118}
        width={108}
        height={52}
        rx={4}
      />
      {s.step === 1 && <Bubbles x={150} y={160} spread={30} />}
      {s.step === 1 && <line class="cb-pipe" x1={150} y1={60} x2={150} y2={160} />}
      <Chain x={64} y={26} saturated={s.step === 2} />
      {s.step >= 1 && (
        <g>
          <rect class="cb-catalyst" x={120} y={166} width={60} height={6} rx={3} />
        </g>
      )}
      {s.showNames && (
        <g>
          <Label x={220} y={150} text={say(locale, s.step === 2 ? WORDS.fat : WORDS.oil)} />
          {s.step >= 1 && (
            <Label x={150} y={194} text={say(locale, WORDS.nickel)} anchor="middle" />
          )}
          {s.step === 1 && <Label x={156} y={74} text={say(locale, WORDS.hydrogen)} />}
        </g>
      )}
    </g>
  );
}

function Mini({
  x,
  y,
  atoms,
}: { x: number; y: number; atoms: { el: string; dx: number; dy: number; hot?: boolean }[] }) {
  return (
    <g>
      {atoms.slice(1).map((a, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed molecule
        <line key={i} class="cb-bond" x1={x} y1={y} x2={x + a.dx * 0.7} y2={y + a.dy * 0.7} />
      ))}
      {atoms.map((a, i) => (
        <text
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed molecule
          key={i}
          class={`cb-atom is-${a.el}${a.hot ? " is-hot" : ""}`}
          x={x + a.dx}
          y={y + a.dy + 5}
          text-anchor="middle"
        >
          {a.el}
        </text>
      ))}
    </g>
  );
}

function Chlorination({ s, locale }: { s: LabState; locale: string }) {
  const done = s.isSunny && s.step > 0;
  const c = { el: "C", dx: 0, dy: 0 };
  return (
    <g>
      {!s.isSunny && <rect class="cb-dark" x={0} y={0} width={W} height={H} />}
      {s.isSunny && (
        <g class="cb-sun">
          <circle cx={282} cy={34} r={14} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((ray) => {
            const a = (ray * Math.PI) / 4;
            return (
              <line
                key={ray}
                x1={282 + 18 * Math.cos(a)}
                y1={34 + 18 * Math.sin(a)}
                x2={282 + 25 * Math.cos(a)}
                y2={34 + 25 * Math.sin(a)}
              />
            );
          })}
        </g>
      )}
      <Mini
        x={86}
        y={100}
        atoms={[
          c,
          { el: "H", dx: -30, dy: 0 },
          { el: done ? "Cl" : "H", dx: 32, dy: 0, hot: done },
          { el: "H", dx: 0, dy: -30 },
          { el: "H", dx: 0, dy: 30 },
        ]}
      />
      {done ? (
        <g>
          <text class="cb-atom is-H" x={204} y={105} text-anchor="middle">
            H
          </text>
          <line class="cb-bond" x1={212} y1={100} x2={226} y2={100} />
          <text class="cb-atom is-Cl is-hot" x={238} y={105} text-anchor="middle">
            Cl
          </text>
        </g>
      ) : (
        <g>
          <text class="cb-atom is-Cl" x={196} y={105} text-anchor="middle">
            Cl
          </text>
          <line class="cb-bond" x1={207} y1={100} x2={223} y2={100} />
          <text class="cb-atom is-Cl" x={236} y={105} text-anchor="middle">
            Cl
          </text>
        </g>
      )}
      {s.showNames && (
        <Label
          x={W / 2}
          y={176}
          text={say(locale, s.isSunny ? WORDS.sun : WORDS.dark)}
          anchor="middle"
        />
      )}
    </g>
  );
}

function Sodium({ s, locale }: { s: LabState; locale: string }) {
  return (
    <g>
      <Tube x={150} level={0.45} liquid="cb-liquid" />
      {s.step >= 1 && <rect class="cb-sodium" x={144} y={140} width={12} height={8} rx={2} />}
      {s.step >= 1 && <Bubbles x={150} y={136} spread={8} />}
      {s.step === 2 && (
        <g>
          <line class="cb-splint" x1={200} y1={20} x2={160} y2={44} />
          <FlameShape x={160} y={44} kind={Flame.Clean} size={0.5} />
          <text class="cb-pop" x={110} y={36} text-anchor="middle">
            {say(locale, WORDS.pop)}
          </text>
        </g>
      )}
      {s.showNames && (
        <g>
          <Label x={36} y={150} text={say(locale, WORDS.ethanol)} />
          {s.step >= 1 && <Label x={174} y={150} text={say(locale, WORDS.sodium)} />}
          {s.step === 2 && <Label x={204} y={60} text={say(locale, WORDS.hydrogen)} />}
        </g>
      )}
    </g>
  );
}

function Dehydration({ s, locale }: { s: LabState; locale: string }) {
  return (
    <g>
      <Tube x={120} level={0.4} liquid="cb-liquid" />
      <SmallBurner x={120} />
      <FlameShape x={120} y={BENCH - 26} kind={Flame.Clean} size={0.6} />
      <path class="cb-pipe" d="M120 56 L120 34 L230 34 L230 120" />
      <Tube x={230} top={110} h={60} level={0} />
      {s.step === 1 && <Bubbles x={120} y={150} spread={8} />}
      {s.step === 1 && (
        <g class="cb-gas">
          <circle cx={230} cy={132} r={4} />
          <circle cx={226} cy={146} r={3} />
          <circle cx={234} cy={156} r={3.5} />
        </g>
      )}
      {s.showNames && (
        <g>
          <Label x={100} y={128} text={say(locale, WORDS.ethanol)} anchor="end" />
          <Label x={100} y={142} text={say(locale, WORDS.acid)} anchor="end" />
          {s.step === 1 && <Label x={252} y={140} text={say(locale, WORDS.ethene)} />}
        </g>
      )}
    </g>
  );
}

function Ester({ s, locale }: { s: LabState; locale: string }) {
  return (
    <g>
      {s.step === 1 && (
        <g>
          <rect class="cb-bath" x={96} y={100} width={108} height={74} rx={6} />
          <SmallBurner x={150} />
        </g>
      )}
      {s.step < 2 && <Tube x={150} level={0.4} liquid="cb-liquid is-warm" />}
      {s.step >= 2 && (
        <g>
          <rect class="cb-beaker" x={100} y={92} width={100} height={82} rx={6} />
          <rect class="cb-liquid" x={104} y={120} width={92} height={50} rx={4} />
        </g>
      )}
      {s.step === 3 && (
        <g class="cb-smell">
          <path d="M130 84 q 6 -10 0 -20 q -6 -10 0 -20" />
          <path d="M150 80 q 6 -10 0 -20 q -6 -10 0 -20" />
          <path d="M170 84 q 6 -10 0 -20 q -6 -10 0 -20" />
        </g>
      )}
      {s.showNames && (
        <g>
          {s.step === 1 && <Label x={210} y={120} text={say(locale, WORDS.waterBath)} />}
          {s.step === 2 && <Label x={208} y={150} text={say(locale, WORDS.water)} />}
          {s.step === 3 && <Label x={190} y={46} text={say(locale, WORDS.sweet)} />}
        </g>
      )}
    </g>
  );
}

function AcidStrength({ s, locale }: { s: LabState; locale: string }) {
  const tubes = [
    { x: 100, word: WORDS.acetic, ui: "cb-liquid is-orange" },
    { x: 220, word: WORDS.hcl, ui: "cb-liquid is-red" },
  ];
  return (
    <g>
      {tubes.map((t) => (
        <g key={t.x}>
          <Tube x={t.x} top={40} h={110} level={0.5} liquid={s.step === 2 ? t.ui : "cb-liquid"} />
          {s.step === 1 && (
            <g>
              <rect class="cb-litmus is-red" x={t.x - 4} y={18} width={8} height={40} rx={1} />
              <rect class="cb-litmus" x={t.x - 4} y={18} width={8} height={18} rx={1} />
            </g>
          )}
          {s.showNames && <Label x={t.x} y={168} text={say(locale, t.word)} anchor="middle" />}
        </g>
      ))}
      {s.showNames && s.step === 1 && (
        <Label x={W / 2} y={194} text={say(locale, WORDS.litmus)} anchor="middle" />
      )}
      {s.showNames && s.step === 2 && (
        <g>
          <Label x={100} y={194} text="pH ≈ 3" anchor="middle" />
          <Label x={220} y={194} text="pH ≈ 1" anchor="middle" />
        </g>
      )}
    </g>
  );
}

function Carbonate({ s, locale }: { s: LabState; locale: string }) {
  return (
    <g>
      <Tube x={100} level={0.3} liquid="cb-liquid" />
      <rect class="cb-powder" x={90} y={150} width={20} height={8} rx={2} />
      <path class="cb-pipe" d="M100 56 L100 30 L220 30 L220 140" />
      <Tube
        x={220}
        top={70}
        h={100}
        level={0.55}
        liquid={s.step === 2 ? "cb-liquid is-milky" : "cb-liquid"}
      />
      {s.step >= 1 && <Bubbles x={100} y={146} spread={8} />}
      {s.step === 2 && <Bubbles x={220} y={150} spread={6} />}
      {s.showNames && (
        <g>
          <Label x={80} y={160} text={say(locale, WORDS.carbonate)} anchor="end" />
          <Label x={244} y={150} text={say(locale, WORDS.limeWater)} />
          {s.step === 2 && <Label x={244} y={164} text={say(locale, WORDS.milky)} />}
        </g>
      )}
    </g>
  );
}

const PICTURES: Readonly<Record<LabKind, (p: { s: LabState; locale: string }) => JSX.Element>> = {
  spatula: Spatula,
  burner: Burner,
  permanganate: Permanganate,
  hydrogenation: Hydrogenation,
  chlorination: Chlorination,
  sodium: Sodium,
  dehydration: Dehydration,
  ester: Ester,
  acidStrength: AcidStrength,
  carbonate: Carbonate,
};

export function CarbonLabView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as LabState;
  const Picture = PICTURES[s.kind];
  const steps = LAB_STEPS[s.kind];
  const stepped = ![LabKind.Spatula, LabKind.Permanganate].includes(s.kind as never);
  return (
    <div class="cb cb-lab">
      <Frame w={W} h={H} width={width} label={describeLab(s)} cls="cb-lab-svg">
        <rect class="cb-bg" x={0} y={0} width={W} height={H} />
        <rect class="cb-bench" x={0} y={BENCH} width={W} height={H - BENCH} />
        <g data-part={LabPart.Bench}>
          <Picture s={s} locale={locale} />
        </g>
      </Frame>
      <p class="cb-caption">{captionOf(s, locale)}</p>
      {s.showEquation && (
        <p class="cb-equation">{locale === "hi" ? EQUATIONS_HI[s.kind] : EQUATIONS[s.kind]}</p>
      )}
      {s.canAct && (
        <Controls>
          {s.kind === LabKind.Spatula &&
            s.fuels.map((f) => (
              <Button
                key={f}
                part={LabPart.Fuel}
                label={say(locale, WORDS[f as Fuel])}
                isOn={s.step > 0 && s.fuel === f}
                onClick={() => call(LabAction.SetFuel, { fuel: f })}
              />
            ))}
          {s.kind === LabKind.Burner && (
            <Button
              part={LabPart.Air}
              label={say(locale, s.isAirOpen ? WORDS.closed : WORDS.open)}
              onClick={() => call(LabAction.SetAir, { isOpen: !s.isAirOpen })}
            />
          )}
          {s.kind === LabKind.Permanganate && (
            <Button
              part={LabPart.Drop}
              label={say(locale, WORDS.drop)}
              isDisabled={s.drops >= 6}
              onClick={() => call(LabAction.AddDrop, {})}
            />
          )}
          {s.kind === LabKind.Chlorination && (
            <Button
              part={LabPart.Sun}
              label={say(locale, s.isSunny ? WORDS.dark : WORDS.sun)}
              onClick={() => call(LabAction.SetSun, { isSunny: !s.isSunny })}
            />
          )}
          {stepped && s.step < steps - 1 && (
            <Button
              part={LabPart.Next}
              label={say(locale, WORDS.next)}
              onClick={() => call(LabAction.Next, {})}
            />
          )}
          {(s.step > 0 || s.drops > 0) && s.kind !== LabKind.Spatula && (
            <Button label={say(locale, WORDS.again)} onClick={() => call(LabAction.Reset, {})} />
          )}
          {stepped && steps > 2 && <Dots step={s.step} count={steps} />}
        </Controls>
      )}
    </div>
  );
}
