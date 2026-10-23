import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Button, Controls, Dots, Frame, Label, type Words, say } from "./draw";
import {
  Chamber,
  HEART_STEPS,
  HeartAction,
  HeartMode,
  HeartPart,
  type HeartState,
  describeHeart,
} from "./heart";

const W = 320;
const H = 220;

const WORDS = {
  next: { en: "Next step →", hi: "अगला चरण →" },
  back: { en: "← Back", hi: "← पीछे" },
  lungs: { en: "lungs", hi: "फेफड़े" },
  body: { en: "body", hi: "शरीर" },
  toLungs: { en: "to lungs", hi: "फेफड़ों को" },
  fromLungs: { en: "from lungs", hi: "फेफड़ों से" },
  toBody: { en: "to body", hi: "शरीर को" },
  fromBody: { en: "from body", hi: "शरीर से" },
  facing: {
    en: "Drawn facing you: the heart's left side is on your right.",
    hi: "सामने से बना: हृदय का बायाँ भाग तुम्हारी दाईं ओर है।",
  },
  oxyRich: { en: "oxygen-rich", hi: "ऑक्सीजन-युक्त" },
  co2Rich: { en: "CO₂-rich", hi: "CO₂-युक्त" },
  lungsLoop: { en: "lungs: blood takes in oxygen", hi: "फेफड़े: रक्त ऑक्सीजन लेता है" },
  bodyLoop: { en: "body: cells use the oxygen", hi: "शरीर: कोशिकाएँ ऑक्सीजन लेती हैं" },
  twice: {
    en: "Double circulation: blood passes through the heart twice each round, once for the lungs and once for the body.",
    hi: "दोहरा परिसंचरण: हर चक्कर में रक्त हृदय से दो बार गुज़रता है, एक बार फेफड़ों के लिए और एक बार शरीर के लिए।",
  },
  once: {
    en: "A fish: blood passes through its two-chambered heart only once each round.",
    hi: "मछली: हर चक्कर में रक्त उसके दो-कक्षीय हृदय से केवल एक बार गुज़रता है।",
  },
  gills: { en: "gills: blood takes in oxygen", hi: "गलफड़े: रक्त ऑक्सीजन लेता है" },
  fishHeart: { en: "2-chambered heart", hi: "2-कक्षीय हृदय" },
  artery: { en: "artery", hi: "धमनी" },
  arteryDoes: { en: "thick, elastic wall", hi: "मोटी, लचीली दीवार" },
  arteryWhere: { en: "away from the heart", hi: "हृदय से दूर" },
  vein: { en: "vein", hi: "शिरा" },
  veinDoes: { en: "thin wall, valves", hi: "पतली दीवार, वाल्व" },
  veinWhere: { en: "back to the heart", hi: "हृदय की ओर" },
  capillary: { en: "capillary", hi: "केशिका" },
  capDoes: { en: "wall one cell thick", hi: "एक कोशिका मोटी दीवार" },
  capWhere: { en: "exchange with cells", hi: "कोशिकाओं से लेन-देन" },
} as const satisfies Record<string, Words>;

const CHAMBER_NAMES: Record<Chamber, Words> = {
  leftAtrium: { en: "left atrium", hi: "बायाँ आलिंद" },
  leftVentricle: { en: "left ventricle", hi: "बायाँ निलय" },
  rightAtrium: { en: "right atrium", hi: "दायाँ आलिंद" },
  rightVentricle: { en: "right ventricle", hi: "दायाँ निलय" },
};

const STEP_CAPTIONS: readonly Words[] = [
  {
    en: "Oxygen-rich blood from the lungs fills the left atrium as it relaxes.",
    hi: "फेफड़ों से ऑक्सीजन-युक्त रक्त, शिथिल होते बाएँ आलिंद में भरता है।",
  },
  {
    en: "The left atrium contracts; the left ventricle relaxes and fills. The valve opens one way only.",
    hi: "बायाँ आलिंद सिकुड़ता है; बायाँ निलय फैलकर भरता है। वाल्व केवल एक ओर खुलता है।",
  },
  {
    en: "The thick-walled left ventricle contracts and pumps blood to the body.",
    hi: "मोटी दीवार वाला बायाँ निलय सिकुड़कर रक्त शरीर को भेजता है।",
  },
  {
    en: "CO₂-rich blood from the body fills the right atrium as it relaxes.",
    hi: "शरीर से CO₂-युक्त रक्त, शिथिल होते दाएँ आलिंद में भरता है।",
  },
  {
    en: "The right atrium contracts; the right ventricle dilates and fills.",
    hi: "दायाँ आलिंद सिकुड़ता है; दायाँ निलय फैलकर भरता है।",
  },
  {
    en: "The right ventricle contracts and pumps blood to the lungs.",
    hi: "दायाँ निलय सिकुड़कर रक्त फेफड़ों को भेजता है।",
  },
];

/** Chamber boxes, picture-left = the heart's right. */
const BOX: Record<Chamber, { x: number; y: number; w: number; h: number; wall: number }> = {
  rightAtrium: { x: 62, y: 60, w: 84, h: 54, wall: 2 },
  rightVentricle: { x: 62, y: 124, w: 84, h: 70, wall: 4 },
  leftAtrium: { x: 174, y: 60, w: 84, h: 54, wall: 2 },
  leftVentricle: { x: 174, y: 124, w: 84, h: 74, wall: 7 },
};

function StepsPicture({ s, locale }: { s: HeartState; locale: string }) {
  const now = HEART_STEPS[s.step] ?? { fills: null, contracts: null, from: "", to: "" };
  const leftValveOpen = s.step === 1;
  const rightValveOpen = s.step === 4;
  const flowCls = s.step < 3 ? "ht-flow-red" : "ht-flow-blue";
  const arrows: Record<number, [number, number, number, number]> = {
    0: [300, 24, 228, 66],
    1: [216, 96, 216, 150],
    2: [196, 132, 176, 24],
    3: [20, 24, 92, 66],
    4: [104, 96, 104, 150],
    5: [124, 132, 146, 24],
  };
  const a = arrows[s.step] ?? [300, 24, 228, 66];
  return (
    <g>
      <rect class="lp-bg" x={0} y={0} width={W} height={H} />
      {/* vessels */}
      <path class="ht-vessel is-blue" d="M20 30 Q 60 30 90 60" />
      <path class="ht-vessel is-blue" d="M126 124 Q 140 60 150 18" />
      <path class="ht-vessel is-red" d="M300 30 Q 260 30 230 60" />
      <path class="ht-vessel is-red" d="M196 124 Q 180 60 172 18" />
      {(Object.keys(BOX) as Chamber[]).map((c) => {
        const b = BOX[c];
        const isLeft = c === Chamber.LeftAtrium || c === Chamber.LeftVentricle;
        const contracts = now.contracts === c;
        const fills = now.fills === c;
        const inset = contracts ? 5 : 0;
        return (
          <g key={c}>
            <rect
              class={`ht-chamber ${isLeft ? "is-red" : "is-blue"}${contracts ? " is-contracting" : ""}${fills ? " is-filling" : ""}`}
              x={b.x + inset}
              y={b.y + inset}
              width={b.w - 2 * inset}
              height={b.h - 2 * inset}
              rx={12}
              style={{ strokeWidth: `${b.wall + (contracts ? 2 : 0)}px` }}
            />
            {s.showNames && (
              <Label
                x={b.x + b.w / 2}
                y={b.y + b.h / 2 + 4}
                text={say(locale, CHAMBER_NAMES[c])}
                anchor="middle"
              />
            )}
          </g>
        );
      })}
      {/* valves between atrium and ventricle */}
      {[
        { x: 104, open: rightValveOpen },
        { x: 216, open: leftValveOpen },
      ].map((v) => (
        <g key={v.x} class="ht-valve">
          <path
            d={
              v.open
                ? `M${v.x - 14} 116 L${v.x - 6} 128 M${v.x + 14} 116 L${v.x + 6} 128`
                : `M${v.x - 14} 118 L${v.x} 122 M${v.x + 14} 118 L${v.x} 122`
            }
          />
        </g>
      ))}
      <g class={`ht-arrow ${flowCls}`}>
        <Arrow x1={a[0]} y1={a[1]} x2={a[2]} y2={a[3]} head={8} />
      </g>
      <Label x={14} y={16} text={say(locale, WORDS.fromBody)} cls="is-dim" />
      <Label x={130} y={14} text={say(locale, WORDS.toLungs)} anchor="end" cls="is-dim" />
      <Label x={306} y={16} text={say(locale, WORDS.fromLungs)} anchor="end" cls="is-dim" />
      <Label x={186} y={14} text={say(locale, WORDS.toBody)} cls="is-dim" />
      <Label x={160} y={212} text={say(locale, WORDS.facing)} anchor="middle" cls="is-dim" />
    </g>
  );
}

function CirculationPicture({ locale, isFish }: { locale: string; isFish: boolean }) {
  if (isFish)
    return (
      <g>
        <rect class="lp-bg" x={0} y={0} width={W} height={H} />
        <rect class="ht-organ" x={110} y={12} width={100} height={34} rx={10} />
        <Label x={160} y={62} text={say(locale, WORDS.gills)} anchor="middle" />
        <rect class="ht-organ" x={110} y={174} width={100} height={34} rx={10} />
        <Label x={160} y={196} text={say(locale, WORDS.body)} anchor="middle" />
        <rect class="ht-chamber is-blue" x={40} y={96} width={40} height={30} rx={8} />
        <rect class="ht-chamber is-blue" x={40} y={128} width={40} height={30} rx={8} />
        <Label x={88} y={131} text={say(locale, WORDS.fishHeart)} />
        <path class="ht-loop is-blue" d="M60 96 C 60 40 80 29 110 29" />
        <path class="ht-loop is-red" d="M210 29 C 290 29 290 191 210 191" />
        <path class="ht-loop is-blue" d="M110 191 C 70 191 60 180 60 158" />
        <path
          class="lp-flow ht-flow"
          d="M60 96 C 60 40 80 29 110 29 M210 29 C 290 29 290 191 210 191 M110 191 C 70 191 60 180 60 158"
        />
      </g>
    );
  return (
    <g>
      <rect class="lp-bg" x={0} y={0} width={W} height={H} />
      <rect class="ht-organ" x={110} y={10} width={100} height={34} rx={10} />
      <Label x={160} y={58} text={say(locale, WORDS.lungsLoop)} anchor="middle" />
      <rect class="ht-organ" x={110} y={176} width={100} height={34} rx={10} />
      <Label x={160} y={170} text={say(locale, WORDS.bodyLoop)} anchor="middle" />
      <rect class="ht-chamber is-blue" x={124} y={88} width={34} height={44} rx={8} />
      <rect class="ht-chamber is-red" x={162} y={88} width={34} height={44} rx={8} />
      <path class="ht-loop is-blue" d="M141 88 C 141 60 60 70 60 40 C 60 27 90 27 110 27" />
      <path class="ht-loop is-red" d="M210 27 C 240 27 260 30 260 50 C 260 76 179 66 179 88" />
      <path
        class="ht-loop is-red"
        d="M179 132 C 179 160 260 150 260 175 C 260 190 240 193 210 193"
      />
      <path class="ht-loop is-blue" d="M110 193 C 80 193 60 190 60 175 C 60 150 141 160 141 132" />
      <path
        class="lp-flow ht-flow"
        d="M141 88 C 141 60 60 70 60 40 C 60 27 90 27 110 27 M210 27 C 240 27 260 30 260 50 C 260 76 179 66 179 88 M179 132 C 179 160 260 150 260 175 C 260 190 240 193 210 193 M110 193 C 80 193 60 190 60 175 C 60 150 141 160 141 132"
      />
      <rect class="ht-chamber is-red" x={10} y={204} width={10} height={10} rx={2} />
      <Label x={24} y={213} text={say(locale, WORDS.oxyRich)} cls="is-dim" />
      <rect class="ht-chamber is-blue" x={10} y={190} width={10} height={10} rx={2} />
      <Label x={24} y={199} text={say(locale, WORDS.co2Rich)} cls="is-dim" />
    </g>
  );
}

function VesselsPicture({ locale }: { locale: string }) {
  const cols = [
    {
      x: 56,
      outer: 34,
      inner: 16,
      cls: "is-artery",
      n: WORDS.artery,
      d: WORDS.arteryDoes,
      w: WORDS.arteryWhere,
    },
    {
      x: 160,
      outer: 34,
      inner: 28,
      cls: "is-vein",
      n: WORDS.vein,
      d: WORDS.veinDoes,
      w: WORDS.veinWhere,
    },
    {
      x: 264,
      outer: 12,
      inner: 9,
      cls: "is-capillary",
      n: WORDS.capillary,
      d: WORDS.capDoes,
      w: WORDS.capWhere,
    },
  ];
  return (
    <g>
      <rect class="lp-bg" x={0} y={0} width={W} height={H} />
      {cols.map((c) => (
        <g key={c.x}>
          <circle class={`ht-wall ${c.cls}`} cx={c.x} cy={86} r={c.outer} />
          <circle class="ht-lumen" cx={c.x} cy={86} r={c.inner} />
          {c.cls === "is-vein" && (
            <path class="ht-flap" d={`M${c.x - 22} 76 Q ${c.x} 96 ${c.x + 22} 76`} />
          )}
          <Label x={c.x} y={146} text={say(locale, c.n)} anchor="middle" cls="is-big" />
          <Label x={c.x} y={164} text={say(locale, c.d)} anchor="middle" cls="is-dim" />
          <Label x={c.x} y={180} text={say(locale, c.w)} anchor="middle" cls="is-dim" />
        </g>
      ))}
    </g>
  );
}

export function HeartView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as HeartState;
  const isSteps = s.mode === HeartMode.Steps;
  return (
    <div class="lp ht">
      <Frame w={W} h={H} width={width} label={describeHeart(s)} cls="ht-svg">
        <g data-part={HeartPart.Picture}>
          {isSteps && <StepsPicture s={s} locale={locale} />}
          {s.mode === HeartMode.Circulation && (
            <CirculationPicture locale={locale} isFish={false} />
          )}
          {s.mode === HeartMode.Fish && <CirculationPicture locale={locale} isFish />}
          {s.mode === HeartMode.Vessels && <VesselsPicture locale={locale} />}
        </g>
      </Frame>
      {isSteps && <p class="lp-caption">{say(locale, STEP_CAPTIONS[s.step] ?? WORDS.next)}</p>}
      {s.mode === HeartMode.Circulation && <p class="lp-caption">{say(locale, WORDS.twice)}</p>}
      {s.mode === HeartMode.Fish && <p class="lp-caption">{say(locale, WORDS.once)}</p>}
      {isSteps && s.canStep && (
        <Controls>
          {s.step > 0 && (
            <Button label={say(locale, WORDS.back)} onClick={() => call(HeartAction.Back, {})} />
          )}
          <Button
            part={HeartPart.Next}
            label={say(locale, WORDS.next)}
            onClick={() => call(HeartAction.Next, {})}
          />
          <Dots step={s.step} count={HEART_STEPS.length} />
        </Controls>
      )}
    </div>
  );
}
