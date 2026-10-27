import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Caption, Frame, Label, Stepper, type Words, say } from "./draw";
import {
  HumanAction,
  HumanMode,
  HumanPart,
  type HumanState,
  JOURNEY_STEPS,
  Organ,
  describeHuman,
  systemOf,
} from "./human";

const W = 320;
const H = 200;

const NAMES: Readonly<Record<Organ, Words>> = {
  testis: { en: "testis", hi: "वृषण" },
  scrotum: { en: "scrotum", hi: "वृषण कोष" },
  vasDeferens: { en: "vas deferens", hi: "शुक्राणु वाहिनी" },
  seminalVesicle: { en: "seminal vesicle", hi: "शुक्राशय" },
  prostate: { en: "prostate gland", hi: "प्रोस्टेट ग्रंथि" },
  urinaryBladder: { en: "urinary bladder", hi: "मूत्राशय" },
  urethra: { en: "urethra", hi: "मूत्रमार्ग" },
  penis: { en: "penis", hi: "शिश्न" },
  ovary: { en: "ovary", hi: "अंडाशय" },
  oviduct: { en: "oviduct", hi: "अंडवाहिनी" },
  uterus: { en: "uterus", hi: "गर्भाशय" },
  cervix: { en: "cervix", hi: "गर्भाशय ग्रीवा" },
  vagina: { en: "vagina", hi: "योनि" },
};

const JOBS: Readonly<Record<Organ, Words>> = {
  testis: {
    en: "Testes form sperms and secrete the hormone testosterone.",
    hi: "वृषण शुक्राणु बनाते हैं और टेस्टोस्टेरॉन हॉर्मोन स्रावित करते हैं।",
  },
  scrotum: {
    en: "Keeps the testes outside the abdomen: sperms need a lower temperature.",
    hi: "वृषणों को उदर के बाहर रखता है: शुक्राणुओं को कम ताप चाहिए।",
  },
  vasDeferens: {
    en: "Carries sperms from the testis; joins the tube from the bladder.",
    hi: "वृषण से शुक्राणु ले जाती है; मूत्राशय की नली से मिलती है।",
  },
  seminalVesicle: {
    en: "Adds a fluid that eases the sperms' transport and nourishes them.",
    hi: "एक द्रव मिलाता है जो शुक्राणुओं को ले जाने में मदद करता है और पोषण देता है।",
  },
  prostate: {
    en: "Adds its secretion to the fluid: easier transport, nutrition.",
    hi: "द्रव में अपना स्राव मिलाती है: आसान परिवहन, पोषण।",
  },
  urinaryBladder: { en: "Stores urine.", hi: "मूत्र जमा करता है।" },
  urethra: {
    en: "A common passage for sperms and urine.",
    hi: "शुक्राणुओं और मूत्र, दोनों का साझा मार्ग।",
  },
  penis: {
    en: "The urethra passes through it; it delivers sperms.",
    hi: "मूत्रमार्ग इसमें से गुज़रता है; यह शुक्राणु पहुँचाता है।",
  },
  ovary: {
    en: "Ovaries make eggs (one a month after puberty) and some hormones.",
    hi: "अंडाशय अंडाणु (यौवन के बाद हर महीने एक) और कुछ हॉर्मोन बनाते हैं।",
  },
  oviduct: {
    en: "Carries the egg to the uterus; fertilisation happens here.",
    hi: "अंडाणु को गर्भाशय तक ले जाती है; निषेचन यहीं होता है।",
  },
  uterus: {
    en: "The embryo implants in its lining and develops here.",
    hi: "भ्रूण इसकी परत में स्थापित होकर यहीं विकसित होता है।",
  },
  cervix: { en: "The opening of the uterus into the vagina.", hi: "गर्भाशय का योनि में खुलने वाला मुख।" },
  vagina: { en: "The passage from the cervix to the outside.", hi: "ग्रीवा से बाहर तक का मार्ग।" },
};

const L = {
  tap: { en: "Tap an organ to see what it does.", hi: "किसी अंग पर टैप करो और देखो वह क्या करता है।" },
  egg: { en: "egg", hi: "अंडाणु" },
  sperms: { en: "sperms", hi: "शुक्राणु" },
  zygote: { en: "zygote", hi: "युग्मनज" },
  embryo: { en: "embryo", hi: "भ्रूण" },
  lining: { en: "thick lining", hi: "मोटी परत" },
  mother: { en: "mother's side: blood spaces", hi: "माँ की ओर: रक्त स्थान" },
  villi: { en: "villi (embryo's side)", hi: "दीर्घरोम (भ्रूण की ओर)" },
  toEmbryo: { en: "glucose, oxygen → embryo", hi: "ग्लूकोज़, ऑक्सीजन → भ्रूण" },
  toMother: { en: "wastes → mother's blood", hi: "अपशिष्ट → माँ का रक्त" },
  cord: { en: "to the embryo", hi: "भ्रूण की ओर" },
} as const satisfies Record<string, Words>;

type T = (w: Words) => string;
type Tap = ((o: Organ) => void) | undefined;

function hit(onTap: Tap, o: Organ) {
  return onTap === undefined
    ? { "data-part": o }
    : {
        "data-part": o,
        onClick: () => onTap(o),
        role: "button" as const,
        tabIndex: 0,
        style: { cursor: "pointer" },
      };
}

export function Female({
  selected,
  onTap,
  thick = false,
}: {
  selected: Organ | null;
  onTap: Tap;
  thick?: boolean;
}): JSX.Element {
  const c = (o: Organ, base: string) => `${base}${selected === o ? " is-selected" : ""}`;
  return (
    <g>
      {[-1, 1].map((d) => (
        <path
          key={`t${d}`}
          class={c(Organ.Oviduct, "rph-tube")}
          d={`M${160 + d * 26} 62 Q ${160 + d * 70} 30 ${160 + d * 96} 52 Q ${160 + d * 104} 60 ${160 + d * 98} 72`}
          {...hit(onTap, Organ.Oviduct)}
        />
      ))}
      {[-1, 1].map((d) => (
        <ellipse
          key={`o${d}`}
          class={c(Organ.Ovary, "rph-ovary")}
          cx={160 + d * 86}
          cy={90}
          rx={17}
          ry={11}
          {...hit(onTap, Organ.Ovary)}
        />
      ))}
      <path
        class={c(Organ.Uterus, "rph-uterus")}
        d="M128 58 Q 160 50 192 58 Q 202 104 172 138 L148 138 Q 118 104 128 58 Z"
        {...hit(onTap, Organ.Uterus)}
      />
      <path
        class={thick ? "rph-lining is-thick" : "rph-lining"}
        d="M138 66 Q 160 60 182 66 Q 188 102 166 128 L154 128 Q 132 102 138 66 Z"
      />
      <rect
        class={c(Organ.Cervix, "rph-cervix")}
        x={148}
        y={136}
        width={24}
        height={14}
        rx={5}
        {...hit(onTap, Organ.Cervix)}
      />
      <rect
        class={c(Organ.Vagina, "rph-vagina")}
        x={150}
        y={150}
        width={20}
        height={44}
        rx={6}
        {...hit(onTap, Organ.Vagina)}
      />
    </g>
  );
}

const FEMALE_LABELS: readonly [Organ, number, number, number, number, "start" | "end"][] = [
  [Organ.Ovary, 74, 100, 40, 128, "start"],
  [Organ.Oviduct, 212, 40, 216, 22, "start"],
  [Organ.Uterus, 186, 98, 236, 112, "start"],
  [Organ.Cervix, 172, 144, 236, 146, "start"],
  [Organ.Vagina, 150, 176, 108, 180, "end"],
];

function Male({ selected, onTap }: { selected: Organ | null; onTap: Tap }): JSX.Element {
  const c = (o: Organ, base: string) => `${base}${selected === o ? " is-selected" : ""}`;
  return (
    <g>
      <ellipse
        class={c(Organ.UrinaryBladder, "rph-bladder")}
        cx={160}
        cy={46}
        rx={34}
        ry={24}
        {...hit(onTap, Organ.UrinaryBladder)}
      />
      {[-1, 1].map((d) => (
        <path
          key={`v${d}`}
          class={c(Organ.VasDeferens, "rph-tube")}
          d={`M${160 + d * 38} 152 Q ${160 + d * 70} 120 ${160 + d * 64} 82 Q ${160 + d * 58} 62 ${160 + d * 38} 72 Q ${160 + d * 20} 82 ${160 + d * 8} 90`}
          {...hit(onTap, Organ.VasDeferens)}
        />
      ))}
      {[-1, 1].map((d) => (
        <path
          key={`s${d}`}
          class={c(Organ.SeminalVesicle, "rph-gland")}
          d={`M${160 + d * 30} 76 q ${d * 8} -10 ${d * 16} -4 q ${d * 4} 8 -${d * 2} 14 q -${d * 10} 4 -${d * 14} -10 z`}
          {...hit(onTap, Organ.SeminalVesicle)}
        />
      ))}
      <circle
        class={c(Organ.Prostate, "rph-gland")}
        cx={160}
        cy={88}
        r={14}
        {...hit(onTap, Organ.Prostate)}
      />
      <path
        class={c(Organ.Scrotum, "rph-scrotum")}
        d="M100 140 Q 100 192 132 192 Q 160 192 160 176 Q 160 192 188 192 Q 220 192 220 140 Q 200 128 188 140 L132 140 Q 120 128 100 140 Z"
        {...hit(onTap, Organ.Scrotum)}
      />
      {[-1, 1].map((d) => (
        <ellipse
          key={`te${d}`}
          class={c(Organ.Testis, "rph-testis")}
          cx={160 + d * 38}
          cy={166}
          rx={15}
          ry={19}
          {...hit(onTap, Organ.Testis)}
        />
      ))}
      <rect
        class={c(Organ.Penis, "rph-penis")}
        x={148}
        y={112}
        width={24}
        height={64}
        rx={12}
        {...hit(onTap, Organ.Penis)}
      />
      <line
        class={c(Organ.Urethra, "rph-urethra")}
        x1={160}
        y1={68}
        x2={160}
        y2={172}
        {...hit(onTap, Organ.Urethra)}
      />
    </g>
  );
}

const MALE_LABELS: readonly [Organ, number, number, number, number, "start" | "end"][] = [
  [Organ.UrinaryBladder, 192, 36, 230, 24, "start"],
  [Organ.SeminalVesicle, 210, 74, 240, 62, "start"],
  [Organ.Prostate, 174, 92, 240, 96, "start"],
  [Organ.VasDeferens, 106, 116, 84, 104, "end"],
  [Organ.Urethra, 160, 124, 240, 124, "start"],
  [Organ.Penis, 148, 130, 84, 136, "end"],
  [Organ.Testis, 210, 166, 240, 160, "start"],
  [Organ.Scrotum, 104, 176, 84, 180, "end"],
];

function Names({
  labels,
  selected,
  t,
}: {
  labels: readonly [Organ, number, number, number, number, "start" | "end"][];
  selected: Organ | null;
  t: T;
}) {
  return (
    <g>
      {labels.map(([o, x, y, tx, ty, anchor]) => (
        <g key={o} class={selected === o ? "rph-name is-selected" : "rph-name"}>
          <line
            class="rph-leader"
            x1={x}
            y1={y}
            x2={anchor === "start" ? tx - 2 : tx + 2}
            y2={ty - 3}
          />
          <Label x={tx} y={ty} text={t(NAMES[o])} anchor={anchor} />
        </g>
      ))}
    </g>
  );
}

function Journey({ step, t }: { step: number; t: T }) {
  const eggAt: readonly [number, number][] = [
    [246, 90],
    [232, 50],
    [214, 40],
    [192, 52],
    [168, 92],
  ];
  const [ex, ey] = eggAt[step] ?? [246, 90];
  return (
    <g>
      <Female selected={null} onTap={undefined} thick={step >= 3} />
      {step >= 1 &&
        step <= 2 &&
        [
          [166, 150],
          [176, 120],
          [188, 76],
          [200, 54],
        ].map(([x, y], i) => (
          <g
            key={`${x}`}
            class="rph-sperm"
            transform={`translate(${x} ${y}) rotate(${-60 - i * 6})`}
          >
            <ellipse cx={0} cy={0} rx={3} ry={2} />
            <path d="M3 0 q 4 -3 8 0 t 8 0" />
          </g>
        ))}
      {step <= 1 && <circle class="rph-egg" cx={ex} cy={ey} r={7} />}
      {step === 2 && <circle class="rph-zygote" cx={ex} cy={ey} r={8} />}
      {step >= 3 && (
        <g>
          {[
            [-3, -3],
            [3, -3],
            [-3, 3],
            [3, 3],
          ].map(([dx, dy]) => (
            <circle
              key={`${dx}${dy}`}
              class="rph-zygote"
              cx={ex + (dx as number)}
              cy={ey + (dy as number)}
              r={4.2}
            />
          ))}
        </g>
      )}
      <Label
        x={ex + 14}
        y={ey - 10}
        text={t(step <= 1 ? L.egg : step === 2 ? L.zygote : L.embryo)}
        cls={step >= 2 ? "is-good" : ""}
      />
      {step >= 1 && step <= 2 && <Label x={186} y={170} text={t(L.sperms)} />}
      {step === 4 && <Label x={24} y={140} text={t(L.lining)} />}
      {step === 4 && <Arrow x1={80} y1={134} x2={138} y2={104} />}
    </g>
  );
}

function Placenta({ t }: { t: T }) {
  return (
    <g>
      <rect class="rph-wall" x={0} y={20} width={W} height={60} />
      {[40, 110, 180, 250].map((x) => (
        <ellipse key={x} class="rph-blood" cx={x + 20} cy={70} rx={30} ry={20} />
      ))}
      <rect class="rph-disc" x={0} y={84} width={W} height={34} />
      {[40, 110, 180, 250].map((x) => (
        <path
          key={x}
          class="rph-villus"
          d={`M${x + 8} 96 Q ${x + 12} 64 ${x + 20} 58 Q ${x + 28} 64 ${x + 32} 96 Z`}
        />
      ))}
      <path class="rph-cord" d="M240 118 Q 230 150 248 196" />
      <Arrow x1={70} y1={52} x2={70} y2={100} cls="rph-in" />
      <Arrow x1={200} y1={100} x2={200} y2={52} cls="rph-out" />
      <Label x={160} y={16} text={t(L.mother)} anchor="middle" />
      <Label x={12} y={134} text={t(L.villi)} />
      <Label x={12} y={156} text={t(L.toEmbryo)} cls="is-good" />
      <Label x={12} y={174} text={t(L.toMother)} />
      <Label x={234} y={194} text={t(L.cord)} anchor="end" cls="is-dim" />
    </g>
  );
}

const JOURNEY_CAPTIONS: readonly Words[] = [
  { en: "An ovary releases an egg.", hi: "एक अंडाशय एक अंडाणु छोड़ता है।" },
  {
    en: "The egg moves along the oviduct; sperms reach the oviduct.",
    hi: "अंडाणु अंडवाहिनी में आगे बढ़ता है; शुक्राणु अंडवाहिनी तक पहुँचते हैं।",
  },
  { en: "Fertilisation in the oviduct: a zygote.", hi: "अंडवाहिनी में निषेचन: युग्मनज।" },
  {
    en: "The zygote divides into a ball of cells, the embryo.",
    hi: "युग्मनज बँटकर कोशिकाओं की गेंद, भ्रूण, बनाता है।",
  },
  {
    en: "The embryo implants in the uterus lining and grows.",
    hi: "भ्रूण गर्भाशय की परत में स्थापित होकर बढ़ता है।",
  },
];

export function HumanSystemsView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as HumanState;
  const t: T = (w) => say(locale, w);
  const onTap: Tap = s.canTap ? (o) => call(HumanAction.Tap, { organ: o }) : undefined;
  const isMale = s.mode === HumanMode.Male;
  const sel =
    s.selected !== null && systemOf(s.selected) === (isMale ? "male" : "female")
      ? s.selected
      : null;
  const caption: Words =
    s.mode === HumanMode.Journey
      ? (JOURNEY_CAPTIONS[s.step] ?? L.egg)
      : s.mode === HumanMode.Placenta
        ? {
            en: "Glucose and oxygen pass to the embryo; wastes pass to the mother's blood.",
            hi: "ग्लूकोज़ और ऑक्सीजन भ्रूण तक जाते हैं; अपशिष्ट माँ के रक्त में।",
          }
        : sel === null
          ? L.tap
          : JOBS[sel];
  return (
    <div class="rp hs">
      <Frame w={W} h={H} width={width} label={describeHuman(s)} cls="rph-svg">
        <rect class="rp-bg" x={0} y={0} width={W} height={H} />
        <g data-part={HumanPart.Picture} class={s.showNames ? "" : "rp-no-names"}>
          {s.mode === HumanMode.Female && (
            <g>
              <Female selected={sel} onTap={onTap} />
              <Names labels={FEMALE_LABELS} selected={sel} t={t} />
            </g>
          )}
          {s.mode === HumanMode.Male && (
            <g>
              <Male selected={sel} onTap={onTap} />
              <Names labels={MALE_LABELS} selected={sel} t={t} />
            </g>
          )}
          {s.mode === HumanMode.Journey && <Journey step={s.step} t={t} />}
          {s.mode === HumanMode.Placenta && <Placenta t={t} />}
        </g>
      </Frame>
      <Caption text={t(caption)} />
      {s.canStep && s.mode === HumanMode.Journey && (
        <Stepper
          step={s.step}
          count={JOURNEY_STEPS}
          locale={locale}
          part={HumanPart.Next}
          onNext={() => call(HumanAction.Next, {})}
          onReset={() => call(HumanAction.Reset, {})}
        />
      )}
    </div>
  );
}
