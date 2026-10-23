import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Caption, Frame, Label, Stepper, type Words, say } from "./draw";
import {
  GERM_STEPS,
  GermAction,
  GermMode,
  GermPart,
  type GermState,
  describeGerm,
} from "./germ-cells";

const W = 320;
const H = 200;

const L = {
  parent: { en: "parent", hi: "जनक" },
  child: { en: "child", hi: "संतान" },
  grandchild: { en: "next generation", hi: "अगली पीढ़ी" },
  germ: { en: "germ cells (half)", hi: "जनन कोशिकाएँ (आधी)" },
  zygote: { en: "zygote", hi: "युग्मनज" },
  meiosis: { en: "meiosis", hi: "अर्धसूत्री विभाजन" },
  tooMuch: { en: "too much DNA!", hi: "बहुत अधिक DNA!" },
  same: { en: "same as the parents", hi: "जनकों जितना ही" },
  egg: { en: "egg: large, food store", hi: "अंडाणु: बड़ा, भोजन भंडार" },
  sperm: { en: "sperm: small, moves", hi: "शुक्राणु: छोटा, गतिशील" },
  female: { en: "female gamete", hi: "मादा युग्मक" },
  male: { en: "male gamete", hi: "नर युग्मक" },
  alike: { en: "two germ cells, alike", hi: "दो एक जैसी जनन कोशिकाएँ" },
} as const satisfies Record<string, Words>;

type T = (w: Words) => string;

/** A cell with `n` chromosomes drawn as short bars, coloured by parent (a or b). */
function ChromoCell({
  cx,
  cy,
  r,
  a,
  b = 0,
  cls = "",
}: {
  cx: number;
  cy: number;
  r: number;
  a: number;
  b?: number;
  cls?: string;
}): JSX.Element {
  const n = a + b;
  const cols = Math.min(n, 8);
  const rows = Math.ceil(n / cols);
  const gap = Math.min(9, (r * 1.5) / cols);
  const hh = Math.min(16, (r * 1.2) / rows - 2);
  return (
    <g class={`gc-cell ${cls}`}>
      <circle class="gc-membrane" cx={cx} cy={cy} r={r} />
      {Array.from({ length: n }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = cx - ((cols - 1) * gap) / 2 + col * gap;
        const y = cy - ((rows - 1) * (hh + 3)) / 2 + row * (hh + 3);
        return (
          <rect
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed bars
            key={i}
            class={i < a ? "gc-chromo is-a" : "gc-chromo is-b"}
            x={x - 2}
            y={y - hh / 2}
            width={4}
            height={hh}
            rx={2}
          />
        );
      })}
    </g>
  );
}

function Doubling({ step, t }: { step: number; t: T }) {
  return (
    <g>
      <ChromoCell cx={70} cy={50} r={24} a={4} />
      <ChromoCell cx={250} cy={50} r={24} a={0} b={4} />
      <Label x={70} y={88} text={t(L.parent)} anchor="middle" cls="is-dim" />
      <Label x={250} y={88} text={t(L.parent)} anchor="middle" cls="is-dim" />
      {step >= 1 && (
        <g>
          <Arrow x1={92} y1={64} x2={140} y2={104} />
          <Arrow x1={228} y1={64} x2={180} y2={104} />
          <ChromoCell cx={160} cy={120} r={28} a={4} b={4} />
          <Label x={204} y={124} text={`${t(L.child)}: 8`} />
        </g>
      )}
      {step === 2 && (
        <g>
          <ChromoCell cx={70} cy={160} r={30} a={8} b={8} cls="is-warn" />
          <Label x={110} y={164} text={`${t(L.grandchild)}: 16`} />
          <Label x={160} y={194} text={t(L.tooMuch)} anchor="middle" cls="is-bad" />
        </g>
      )}
    </g>
  );
}

function Halving({ step, t }: { step: number; t: T }) {
  return (
    <g>
      <ChromoCell cx={60} cy={46} r={26} a={4} />
      <ChromoCell cx={260} cy={46} r={26} a={0} b={4} />
      <Label x={60} y={86} text={t(L.parent)} anchor="middle" cls="is-dim" />
      <Label x={260} y={86} text={t(L.parent)} anchor="middle" cls="is-dim" />
      {step >= 1 && (
        <g>
          <ChromoCell cx={92} cy={118} r={16} a={2} />
          <ChromoCell cx={228} cy={118} r={16} a={0} b={2} />
          <Arrow x1={80} y1={64} x2={88} y2={100} />
          <Arrow x1={240} y1={64} x2={232} y2={100} />
          <Label x={160} y={70} text={t(L.meiosis)} anchor="middle" cls="is-dim" />
          <Label x={160} y={122} text={t(L.germ)} anchor="middle" />
        </g>
      )}
      {step === 2 && (
        <g>
          <Arrow x1={104} y1={130} x2={138} y2={156} />
          <Arrow x1={216} y1={130} x2={182} y2={156} />
          <ChromoCell cx={160} cy={168} r={20} a={2} b={2} />
          <Label x={188} y={164} text={`${t(L.zygote)}: 4`} />
          <Label x={188} y={180} text={t(L.same)} cls="is-good" />
        </g>
      )}
    </g>
  );
}

function Gametes({ step, t }: { step: number; t: T }) {
  if (step === 0)
    return (
      <g>
        <ChromoCell cx={110} cy={100} r={26} a={2} />
        <ChromoCell cx={210} cy={100} r={26} a={0} b={2} />
        <Label x={160} y={160} text={t(L.alike)} anchor="middle" />
      </g>
    );
  return (
    <g>
      <circle class="gc-egg" cx={100} cy={96} r={58} />
      <ChromoCell cx={100} cy={96} r={16} a={2} />
      {[
        [64, 70],
        [130, 66],
        [70, 126],
        [132, 124],
        [100, 140],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} class="gc-yolk" cx={x} cy={y} r={6} />
      ))}
      <g transform="translate(236 96)">
        <ellipse class="gc-membrane" cx={0} cy={0} rx={12} ry={8} />
        <rect class="gc-chromo is-b" x={-6} y={-4} width={4} height={8} rx={2} />
        <rect class="gc-chromo is-b" x={1} y={-4} width={4} height={8} rx={2} />
        <path class="gc-tail" d="M12 0 q 10 -8 20 0 t 20 0 t 18 0" />
      </g>
      <Label x={100} y={178} text={t(L.egg)} anchor="middle" />
      <Label x={100} y={194} text={t(L.female)} anchor="middle" cls="is-dim" />
      <Label x={250} y={130} text={t(L.sperm)} anchor="middle" />
      <Label x={250} y={146} text={t(L.male)} anchor="middle" cls="is-dim" />
    </g>
  );
}

const CAPTIONS: Readonly<Record<GermMode, readonly Words[]>> = {
  doubling: [
    { en: "Two parents, 4 chromosomes each.", hi: "दो जनक, हर एक में 4 गुणसूत्र।" },
    {
      en: "Combine everything: the child has 8, twice as much.",
      hi: "सब मिला दें: संतान में 8, दोगुना।",
    },
    {
      en: "16 in the next generation: the DNA would get out of control.",
      hi: "अगली पीढ़ी में 16: DNA नियंत्रण से बाहर हो जाएगा।",
    },
  ],
  halving: [
    { en: "Two parents, 4 chromosomes each.", hi: "दो जनक, हर एक में 4 गुणसूत्र।" },
    {
      en: "Meiosis makes germ cells with half: 2 each.",
      hi: "अर्धसूत्री विभाजन से आधे गुणसूत्र वाली जनन कोशिकाएँ: हर एक में 2।",
    },
    {
      en: "They fuse: the zygote has 4 again, like the parents.",
      hi: "वे मिलती हैं: युग्मनज में फिर 4, जनकों जैसे।",
    },
  ],
  gametes: [
    {
      en: "Simple organisms: the two germ cells are alike.",
      hi: "सरल जीव: दोनों जनन कोशिकाएँ एक जैसी।",
    },
    {
      en: "Complex organisms: a large egg with food, and a small sperm that moves.",
      hi: "जटिल जीव: भोजन वाला बड़ा अंडाणु, और गतिशील छोटा शुक्राणु।",
    },
  ],
};

export function GermCellsView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as GermState;
  const t: T = (w) => say(locale, w);
  return (
    <div class="rp gc">
      <Frame w={W} h={H} width={width} label={describeGerm(s)} cls="gc-svg">
        <rect class="rp-bg" x={0} y={0} width={W} height={H} />
        <g data-part={GermPart.Picture} class={s.showNames ? "" : "rp-no-names"}>
          {s.mode === GermMode.Doubling && <Doubling step={s.step} t={t} />}
          {s.mode === GermMode.Halving && <Halving step={s.step} t={t} />}
          {s.mode === GermMode.Gametes && <Gametes step={s.step} t={t} />}
        </g>
      </Frame>
      <Caption text={say(locale, CAPTIONS[s.mode][s.step] ?? CAPTIONS[s.mode][0] ?? L.parent)} />
      {s.canStep && (
        <Stepper
          step={s.step}
          count={GERM_STEPS[s.mode]}
          locale={locale}
          part={GermPart.Next}
          onNext={() => call(GermAction.Next, {})}
          onReset={() => call(GermAction.Reset, {})}
        />
      )}
    </div>
  );
}
