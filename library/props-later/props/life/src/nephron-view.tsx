import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Button, Controls, Dots, Frame, Label, type Words, say } from "./draw";
import {
  Drink,
  FILTERED,
  FILTER_STEPS,
  FILTRATE_LITRES,
  NephronAction,
  NephronMode,
  NephronPart,
  type NephronState,
  SUBSTANCES,
  Substance,
  URINE_LITRES,
  describeNephron,
  reabsorbedPercentOf,
} from "./nephron";

const W = 320;
const H = 220;

const WORDS = {
  next: { en: "Next step →", hi: "अगला चरण →" },
  again: { en: "Start again", hi: "फिर से शुरू" },
  little: { en: "Drank little", hi: "कम पानी पिया" },
  normal: { en: "Normal", hi: "सामान्य" },
  lots: { en: "Drank lots", hi: "ख़ूब पानी पिया" },
  kidney: { en: "kidney", hi: "वृक्क" },
  ureter: { en: "ureter", hi: "मूत्रवाहिनी" },
  bladder: { en: "urinary bladder", hi: "मूत्राशय" },
  urethra: { en: "urethra", hi: "मूत्रमार्ग" },
  backbone: { en: "backbone", hi: "रीढ़" },
  bloodIn: { en: "blood in", hi: "रक्त अंदर" },
  bloodOut: { en: "cleaned blood out", hi: "साफ़ रक्त बाहर" },
  capsule: { en: "Bowman's capsule", hi: "बोमन संपुट" },
  knot: { en: "capillaries", hi: "केशिकाएँ" },
  tube: { en: "tube", hi: "नलिका" },
  toUreter: { en: "urine to ureter", hi: "मूत्र, मूत्रवाहिनी को" },
  takenBack: { en: "taken back into blood", hi: "रक्त में वापस" },
  filtered: { en: "filtered a day", hi: "रोज़ छनता है" },
  urine: { en: "leaves as urine", hi: "मूत्र बनकर निकलता है" },
  back: { en: "taken back", hi: "वापस सोखा" },
  fluid: { en: "dialysing fluid", hi: "अपोहन द्रव" },
  semi: { en: "semi-permeable tube", hi: "अर्धपारगम्य नली" },
  noBack: { en: "no re-absorption", hi: "पुनःअवशोषण नहीं" },
} as const satisfies Record<string, Words>;

const SUBSTANCE_NAMES: Record<Substance, Words> = {
  cells: { en: "blood cells", hi: "रक्त कोशिकाएँ" },
  proteins: { en: "proteins", hi: "प्रोटीन" },
  glucose: { en: "glucose", hi: "ग्लूकोज़" },
  aminoAcids: { en: "amino acids", hi: "अमीनो अम्ल" },
  salts: { en: "salts", hi: "लवण" },
  water: { en: "water", hi: "पानी" },
  urea: { en: "urea", hi: "यूरिया" },
};

const STEP_CAPTIONS: readonly Words[] = [
  {
    en: "Blood arrives at a knot of very thin capillaries.",
    hi: "रक्त बहुत पतली केशिकाओं के गुच्छे तक पहुँचता है।",
  },
  {
    en: "Small substances are filtered into Bowman's capsule. Cells and proteins stay in the blood.",
    hi: "छोटे पदार्थ छनकर बोमन संपुट में जाते हैं। कोशिकाएँ और प्रोटीन रक्त में रहते हैं।",
  },
  {
    en: "Along the tube, glucose, amino acids, salts and most water go back into the blood.",
    hi: "नलिका में, ग्लूकोज़, अमीनो अम्ल, लवण और ज़्यादातर पानी रक्त में लौट जाते हैं।",
  },
  { en: "What's left, urea in water, is urine.", hi: "जो बचता है, पानी में यूरिया, वही मूत्र है।" },
];

/** One token for each substance, drawn at (x, y). */
function Token({ kind, x, y }: { kind: Substance; x: number; y: number }) {
  const cls = `np-${kind}`;
  switch (kind) {
    case Substance.Cells:
      return <circle class={cls} cx={x} cy={y} r={5} />;
    case Substance.Proteins:
      return (
        <path class={cls} d={`M${x - 6} ${y} q 2 -7 7 -5 q 6 1 5 6 q -1 6 -7 5 q -6 0 -5 -6 z`} />
      );
    case Substance.Glucose:
      return <rect class={cls} x={x - 3.5} y={y - 3.5} width={7} height={7} rx={1} />;
    case Substance.AminoAcids:
      return <path class={cls} d={`M${x} ${y - 4} L${x + 4} ${y + 3} L${x - 4} ${y + 3} Z`} />;
    case Substance.Salts:
      return (
        <path class={cls} d={`M${x} ${y - 4} L${x + 4} ${y} L${x} ${y + 4} L${x - 4} ${y} Z`} />
      );
    case Substance.Water:
      return <circle class={cls} cx={x} cy={y} r={3} />;
    default:
      return <circle class={cls} cx={x} cy={y} r={3.2} />;
  }
}

function Tokens({
  kinds,
  x,
  y,
  dx = 11,
}: { kinds: readonly Substance[]; x: number; y: number; dx?: number }) {
  return (
    <g>
      {kinds.map((k, i) => (
        <Token key={k} kind={k} x={x + i * dx} y={y} />
      ))}
    </g>
  );
}

function FilterPicture({ s, locale }: { s: NephronState; locale: string }) {
  const step = s.step;
  const backIn = [Substance.Glucose, Substance.AminoAcids, Substance.Salts, Substance.Water];
  return (
    <g>
      <rect class="lp-bg" x={0} y={0} width={W} height={H} />
      {/* blood: artery in, the knot, the capillary along the tube, vein out */}
      <path class="np-blood" d="M8 40 L58 52" />
      <path class="np-blood" d="M100 70 C 110 104 140 112 260 112 L 290 112" />
      <path class="np-blood is-vein" d="M290 112 L290 128 L8 128" />
      {/* Bowman's capsule round the knot, then the tube */}
      <path class="np-capsule" d="M96 36 A 30 30 0 1 0 96 84" />
      <circle class="np-knot" cx={74} cy={60} r={16} />
      <path
        class="np-knot-lines"
        d="M62 54 q 6 -10 12 0 q 6 10 12 0 M62 64 q 6 -8 12 0 q 6 8 12 0"
      />
      <path
        class="np-tube"
        d="M96 36 C 120 20 130 60 150 44 C 170 28 180 70 200 54 C 220 38 232 74 252 58 L 286 58 L 286 210"
      />
      {step === 0 && <Tokens kinds={SUBSTANCES} x={12} y={26} dx={12} />}
      {step >= 1 && <Tokens kinds={[Substance.Cells, Substance.Proteins]} x={40} y={110} />}
      {step === 1 && <Tokens kinds={FILTERED} x={124} y={30} dx={13} />}
      {step === 2 && (
        <g>
          <Tokens kinds={[Substance.Urea, Substance.Water]} x={212} y={46} />
          <Tokens kinds={backIn} x={120} y={120} dx={14} />
          <Arrow x1={150} y1={62} x2={150} y2={104} />
          <Arrow x1={200} y1={70} x2={200} y2={104} />
          <Label x={160} y={88} text={say(locale, WORDS.takenBack)} />
        </g>
      )}
      {step === 3 && (
        <g>
          <Tokens kinds={backIn} x={120} y={120} dx={14} />
          <Token kind={Substance.Urea} x={286} y={150} />
          <Token kind={Substance.Water} x={286} y={166} />
        </g>
      )}
      {s.showNames && (
        <g>
          <Label x={8} y={60} text={say(locale, WORDS.bloodIn)} cls="is-dim" />
          <Label x={74} y={98} text={say(locale, WORDS.capsule)} anchor="middle" />
          <Label x={150} y={18} text={say(locale, WORDS.tube)} cls="is-dim" />
          <Label x={278} y={208} text={say(locale, WORDS.toUreter)} anchor="end" />
          <Label x={8} y={144} text={say(locale, WORDS.bloodOut)} cls="is-dim" />
        </g>
      )}
      {/* legend */}
      {SUBSTANCES.map((k, i) => {
        const x = 10 + (i % 4) * 66;
        const y = 166 + Math.floor(i / 4) * 18;
        return (
          <g key={k}>
            <Token kind={k} x={x + 4} y={y - 3} />
            <Label x={x + 12} y={y + 1} text={say(locale, SUBSTANCE_NAMES[k])} cls="is-dim" />
          </g>
        );
      })}
    </g>
  );
}

function SystemPicture({ locale }: { locale: string }) {
  return (
    <g>
      <rect class="lp-bg" x={0} y={0} width={W} height={H} />
      <rect class="np-torso" x={70} y={10} width={180} height={200} rx={40} />
      <line class="np-spine" x1={160} y1={14} x2={160} y2={150} />
      <path
        class="np-kidney"
        d="M112 70 C 92 70 92 120 112 120 C 126 120 124 106 120 96 C 124 86 126 70 112 70 Z"
      />
      <path
        class="np-kidney"
        d="M208 70 C 228 70 228 120 208 120 C 194 120 196 106 200 96 C 196 86 194 70 208 70 Z"
      />
      <path
        class="np-ureter"
        d="M121 96 C 130 130 140 150 150 164 M199 96 C 190 130 180 150 170 164"
      />
      <ellipse class="np-bladder" cx={160} cy={172} rx={22} ry={16} />
      <path class="np-ureter" d="M160 188 L160 206" />
      <Label x={86} y={64} text={say(locale, WORDS.kidney)} anchor="middle" />
      <Label x={236} y={64} text={say(locale, WORDS.kidney)} anchor="middle" />
      <Label x={230} y={140} text={say(locale, WORDS.ureter)} />
      <line class="np-leader" x1={228} y1={136} x2={188} y2={130} />
      <Label x={186} y={176} text={say(locale, WORDS.bladder)} />
      <Label x={166} y={208} text={say(locale, WORDS.urethra)} />
      <Label x={166} y={30} text={say(locale, WORDS.backbone)} cls="is-dim" />
    </g>
  );
}

function WaterPicture({ s, locale }: { s: NephronState; locale: string }) {
  const urine = URINE_LITRES[s.drink];
  const lit = Math.ceil(urine);
  const size = 11;
  return (
    <g>
      <rect class="lp-bg" x={0} y={0} width={W} height={H} />
      {Array.from({ length: FILTRATE_LITRES }, (_, i) => {
        const c = i % 20;
        const r = Math.floor(i / 20);
        return (
          <rect
            key={`${r}-${c}`}
            class={i < lit ? `np-litre is-urine is-${s.drink}` : "np-litre"}
            x={12 + c * (size + 1.5)}
            y={36 + r * (size + 1.5)}
            width={size}
            height={size}
            rx={2}
          />
        );
      })}
      <Label
        x={12}
        y={24}
        text={`${FILTRATE_LITRES} L ${say(locale, WORDS.filtered)}`}
        cls="is-big"
      />
      <Label x={12} y={170} text={`≈ ${urine} L ${say(locale, WORDS.urine)}`} cls="is-big" />
      <Label
        x={12}
        y={190}
        text={`${reabsorbedPercentOf(s.drink)}% ${say(locale, WORDS.back)}`}
        cls="is-good"
      />
      <rect
        class={`np-litre is-urine is-${s.drink}`}
        x={270}
        y={150}
        width={36}
        height={50}
        rx={6}
      />
    </g>
  );
}

function DialysisPicture({ locale }: { locale: string }) {
  return (
    <g>
      <rect class="lp-bg" x={0} y={0} width={W} height={H} />
      <rect class="np-tank" x={60} y={50} width={200} height={130} rx={8} />
      <path
        class="np-dialysis-tube"
        d="M10 70 L 80 70 C 120 70 120 100 160 100 C 200 100 200 130 240 130 L 310 130"
      />
      {(
        [
          [96, 74],
          [140, 96],
          [184, 104],
        ] as const
      ).map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <Token kind={Substance.Urea} x={x} y={y} />
          <Arrow x1={x} y1={y + 6} x2={x + 2} y2={y + 34} />
        </g>
      ))}
      {(
        [
          [100, 150],
          [150, 160],
          [200, 156],
          [230, 70],
        ] as const
      ).map(([x, y]) => (
        <Token key={`${x}-${y}`} kind={Substance.Urea} x={x} y={y} />
      ))}
      <Tokens kinds={[Substance.Urea, Substance.Urea]} x={20} y={58} />
      <Label x={10} y={92} text={say(locale, WORDS.bloodIn)} />
      <Label x={312} y={150} text={say(locale, WORDS.bloodOut)} anchor="end" />
      <Label x={160} y={44} text={say(locale, WORDS.fluid)} anchor="middle" />
      <Label x={160} y={198} text={say(locale, WORDS.semi)} anchor="middle" cls="is-dim" />
      <Label x={160} y={214} text={say(locale, WORDS.noBack)} anchor="middle" cls="is-bad" />
    </g>
  );
}

export function NephronView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as NephronState;
  const drinks = [
    { d: Drink.Little, w: WORDS.little },
    { d: Drink.Normal, w: WORDS.normal },
    { d: Drink.Lots, w: WORDS.lots },
  ];
  return (
    <div class="lp np">
      <Frame w={W} h={H} width={width} label={describeNephron(s)} cls="np-svg">
        <g data-part={NephronPart.Picture}>
          {s.mode === NephronMode.Filter && <FilterPicture s={s} locale={locale} />}
          {s.mode === NephronMode.System && <SystemPicture locale={locale} />}
          {s.mode === NephronMode.Water && <WaterPicture s={s} locale={locale} />}
          {s.mode === NephronMode.Dialysis && <DialysisPicture locale={locale} />}
        </g>
      </Frame>
      {s.mode === NephronMode.Filter && (
        <p class="lp-caption">{say(locale, STEP_CAPTIONS[s.step] ?? WORDS.next)}</p>
      )}
      {s.mode === NephronMode.Filter && s.canStep && (
        <Controls>
          {s.step < FILTER_STEPS - 1 ? (
            <Button
              part={NephronPart.Next}
              label={say(locale, WORDS.next)}
              onClick={() => call(NephronAction.Next, {})}
            />
          ) : (
            <Button
              label={say(locale, WORDS.again)}
              onClick={() => call(NephronAction.Reset, {})}
            />
          )}
          <Dots step={s.step} count={FILTER_STEPS} />
        </Controls>
      )}
      {s.mode === NephronMode.Water && s.canSetDrink && (
        <Controls>
          {drinks.map((x) => (
            <Button
              key={x.d}
              part={x.d === Drink.Normal ? NephronPart.Drink : undefined}
              label={say(locale, x.w)}
              isOn={s.drink === x.d}
              onClick={() => call(NephronAction.SetDrink, { drink: x.d })}
            />
          ))}
        </Controls>
      )}
    </div>
  );
}
