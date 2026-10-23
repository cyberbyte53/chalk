import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  DigestionAction,
  DigestionMode,
  DigestionPart,
  type DigestionState,
  FORMS,
  type Form,
  SALIVA_STEPS,
  STAGES,
  type Stage,
  describeDigestion,
  stageOf,
  stepsOf,
} from "./digestion";
import { Arrow, Button, Controls, Dots, Frame, Label, type Words, say } from "./draw";

const W = 320;
const H = 220;

const WORDS = {
  next: { en: "Move on →", hi: "आगे बढ़ो →" },
  back: { en: "← Back", hi: "← पीछे" },
  nextStep: { en: "Next step →", hi: "अगला चरण →" },
  again: { en: "Start again", hi: "फिर से शुरू" },
  liver: { en: "liver", hi: "यकृत" },
  pancreas: { en: "pancreas", hi: "अग्न्याशय" },
  starch: { en: "starch", hi: "मंड" },
  protein: { en: "protein", hi: "प्रोटीन" },
  fat: { en: "fat", hi: "वसा" },
  saliva: { en: "+ saliva", hi: "+ लार" },
  noSaliva: { en: "no saliva", hi: "लार नहीं" },
  wait: { en: "20–30 minutes", hi: "20–30 मिनट" },
  iodine: { en: "+ iodine", hi: "+ आयोडीन" },
  stillStarch: { en: "blue-black: starch", hi: "नीला-काला: मंड" },
  noStarch: { en: "no starch left", hi: "मंड नहीं बचा" },
  villus: { en: "villi", hi: "दीर्घरोम" },
  blood: { en: "blood vessels", hi: "रक्त वाहिकाएँ" },
  digested: { en: "digested food", hi: "पचा हुआ भोजन" },
} as const satisfies Record<string, Words>;

const STAGE_NAMES: Record<Stage, Words> = {
  mouth: { en: "Mouth", hi: "मुँह" },
  oesophagus: { en: "Food-pipe", hi: "ग्रसिका" },
  stomach: { en: "Stomach", hi: "आमाशय" },
  smallIntestine: { en: "Small intestine", hi: "क्षुद्रांत्र" },
  villi: { en: "Villi", hi: "दीर्घरोम" },
  largeIntestine: { en: "Large intestine", hi: "बृहदांत्र" },
  anus: { en: "Anus", hi: "गुदा" },
};

const STAGE_DOES: Record<Stage, readonly Words[]> = {
  mouth: [
    { en: "teeth crush", hi: "दाँत पीसते हैं" },
    { en: "saliva: amylase", hi: "लार: एमाइलेज़" },
  ],
  oesophagus: [{ en: "peristalsis pushes", hi: "क्रमाकुंचन धकेलता है" }],
  stomach: [{ en: "acid, pepsin, mucus", hi: "अम्ल, पेप्सिन, श्लेष्मा" }],
  smallIntestine: [
    { en: "bile, pancreatic juice", hi: "पित्त, अग्न्याशयी रस" },
    { en: "intestinal juice", hi: "आंत्र रस" },
  ],
  villi: [{ en: "absorbed into blood", hi: "रक्त में अवशोषित" }],
  largeIntestine: [{ en: "water taken back", hi: "पानी वापस सोखा" }],
  anus: [{ en: "waste out", hi: "मल बाहर" }],
};

const FORM_WORDS: Record<"starch" | "protein" | "fat", Record<Form, Words>> = {
  starch: {
    whole: { en: "starch", hi: "मंड" },
    begun: { en: "→ some sugar", hi: "→ कुछ शर्करा" },
    simple: { en: "→ glucose", hi: "→ ग्लूकोज़" },
    absorbed: { en: "in the blood", hi: "रक्त में" },
  },
  protein: {
    whole: { en: "protein", hi: "प्रोटीन" },
    begun: { en: "being broken", hi: "टूट रहा है" },
    simple: { en: "→ amino acids", hi: "→ अमीनो अम्ल" },
    absorbed: { en: "in the blood", hi: "रक्त में" },
  },
  fat: {
    whole: { en: "big drops", hi: "बड़ी बूँदें" },
    begun: { en: "small drops", hi: "छोटी बूँदें" },
    simple: { en: "→ fatty acids, glycerol", hi: "→ वसीय अम्ल, ग्लिसरॉल" },
    absorbed: { en: "in the blood", hi: "रक्त में" },
  },
};

const SALIVA_CAPTIONS: readonly Words[] = [
  {
    en: "Starch solution in two tubes: A gets saliva, B doesn't.",
    hi: "दो नलियों में मंड का घोल: A में लार, B में नहीं।",
  },
  { en: "Leave both for 20 to 30 minutes.", hi: "दोनों को 20 से 30 मिनट छोड़ दो।" },
  {
    en: "Add iodine: B turns blue-black, A doesn't. Saliva broke the starch down.",
    hi: "आयोडीन डालो: B नीला-काला, A नहीं। लार ने मंड को तोड़ दिया।",
  },
];

const FOOD_AT: Record<Stage, [number, number]> = {
  mouth: [80, 38],
  oesophagus: [82, 62],
  stomach: [110, 94],
  smallIntestine: [86, 146],
  villi: [86, 146],
  largeIntestine: [128, 152],
  anus: [92, 204],
};

/** The canal, with the part the food is in picked out. */
function Canal({ here }: { here: Stage }) {
  const on = (st: Stage) => (st === here ? " is-here" : "");
  return (
    <g>
      <circle class="ldt-head" cx={80} cy={26} r={20} />
      <path class={`ldt-mouth${on("mouth")}`} d="M70 36 Q 80 42 90 36" />
      <path class="ldt-liver" d="M38 80 C 58 68 86 74 86 88 C 82 100 56 104 38 96 Z" />
      <ellipse class="ldt-pancreas" cx={112} cy={120} rx={16} ry={4} />
      <path class={`ldt-tube${on("oesophagus")}`} d="M80 46 L84 82" />
      <path
        class={`ldt-organ${on("stomach")}`}
        d="M84 80 C 90 72 120 72 126 86 C 132 102 118 114 104 114 C 96 114 92 108 96 102 C 100 98 104 96 100 90 Z"
      />
      <path
        class={`ldt-tube ldt-small${on("smallIntestine")}${on("villi")}`}
        d="M100 112 C 112 122 66 124 62 134 C 58 144 112 140 112 150 C 112 160 60 156 60 166 C 60 172 92 172 96 168"
      />
      <path
        class={`ldt-tube ldt-large${on("largeIntestine")}`}
        d="M96 168 L46 174 L46 124 L130 124 L130 180 L92 188"
      />
      <path class={`ldt-tube${on("anus")}`} d="M92 188 L92 204" />
    </g>
  );
}

function Villi() {
  const xs = [26, 54, 82, 110, 138];
  return (
    <g>
      <rect class="ldt-lumen" x={10} y={20} width={150} height={190} rx={8} />
      <path class="ldt-wall" d="M10 170 L160 170 L160 210 L10 210 Z" />
      {xs.map((x) => (
        <g key={x}>
          <path
            class="ldt-villus"
            d={`M${x - 11} 172 L${x - 11} 96 Q ${x} 78 ${x + 11} 96 L${x + 11} 172 Z`}
          />
          <path
            class="ldt-capillary"
            d={`M${x - 5} 170 L${x - 5} 100 Q ${x} 92 ${x + 5} 100 L${x + 5} 170`}
          />
        </g>
      ))}
      {[
        [40, 60],
        [70, 48],
        [98, 64],
        [126, 52],
        [60, 84],
        [120, 86],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} class="lp-food-dot" cx={x} cy={y} r={3} />
      ))}
      <g class="lp-food">
        <Arrow x1={70} y1={56} x2={60} y2={90} />
        <Arrow x1={126} y1={58} x2={114} y2={92} />
      </g>
    </g>
  );
}

function JourneyPicture({ stage, locale }: { stage: Stage; locale: string }) {
  const [fx, fy] = FOOD_AT[stage];
  const forms = FORMS[stage];
  const rows = [
    { key: "starch" as const, cls: "ldt-starch" },
    { key: "protein" as const, cls: "ldt-protein" },
    { key: "fat" as const, cls: "ldt-fat" },
  ];
  return (
    <g>
      <rect class="lp-bg" x={0} y={0} width={W} height={H} />
      <g data-part={DigestionPart.Canal}>
        {stage === "villi" ? (
          <g>
            <Villi />
            <Label x={84} y={36} text={say(locale, WORDS.digested)} anchor="middle" />
            <Label x={18} y={120} text={say(locale, WORDS.villus)} />
            <Label
              x={84}
              y={196}
              text={say(locale, WORDS.blood)}
              anchor="middle"
              cls="ldt-on-wall"
            />
          </g>
        ) : (
          <g>
            <Canal here={stage} />
            <circle class="ldt-bolus" cx={fx} cy={fy} r={6} />
            <Label x={32} y={70} text={say(locale, WORDS.liver)} anchor="middle" cls="is-dim" />
            <Label x={140} y={118} text={say(locale, WORDS.pancreas)} cls="is-dim" />
          </g>
        )}
      </g>
      <g data-part={DigestionPart.Panel}>
        <Label x={176} y={26} text={say(locale, STAGE_NAMES[stage])} cls="is-big" />
        {STAGE_DOES[stage].map((w, i) => (
          <Label key={w.en} x={176} y={44 + i * 14} text={say(locale, w)} cls="is-dim" />
        ))}
        {rows.map((r, i) => {
          const y = 104 + i * 36;
          return (
            <g key={r.key}>
              <rect class={r.cls} x={176} y={y - 10} width={12} height={12} rx={3} />
              <Label x={194} y={y} text={say(locale, WORDS[r.key])} />
              <Label
                x={194}
                y={y + 14}
                text={say(locale, FORM_WORDS[r.key][forms[r.key]])}
                cls={forms[r.key] === "whole" ? "is-dim" : "is-good"}
              />
            </g>
          );
        })}
      </g>
    </g>
  );
}

function Tube({
  x,
  label,
  fill,
  locale,
}: { x: number; label: string; fill: string; locale: string }) {
  void locale;
  return (
    <g>
      <path
        class={fill}
        d={`M${x - 14} 100 L${x + 14} 100 L${x + 14} 168 Q ${x + 14} 182 ${x} 182 Q ${x - 14} 182 ${x - 14} 168 Z`}
      />
      <path
        class="ldt-glass"
        d={`M${x - 16} 50 L${x - 16} 168 Q ${x - 16} 184 ${x} 184 Q ${x + 16} 184 ${x + 16} 168 L${x + 16} 50`}
      />
      <Label x={x} y={44} text={label} anchor="middle" cls="is-big" />
    </g>
  );
}

function SalivaPicture({ step, locale }: { step: number; locale: string }) {
  const done = step === SALIVA_STEPS - 1;
  return (
    <g data-part={DigestionPart.Canal}>
      <rect class="lp-bg" x={0} y={0} width={W} height={H} />
      <Tube
        x={90}
        label="A"
        fill={done ? "ldt-iodine-light" : "ldt-starch-solution"}
        locale={locale}
      />
      <Tube
        x={200}
        label="B"
        fill={done ? "ldt-blue-black" : "ldt-starch-solution"}
        locale={locale}
      />
      <Label x={90} y={204} text={say(locale, WORDS.saliva)} anchor="middle" />
      <Label x={200} y={204} text={say(locale, WORDS.noSaliva)} anchor="middle" />
      {step === 1 && (
        <g>
          <circle class="ldt-clock" cx={268} cy={70} r={18} />
          <path class="ldt-hand" d="M268 70 L268 58 M268 70 L277 74" />
          <Label x={268} y={104} text={say(locale, WORDS.wait)} anchor="middle" />
        </g>
      )}
      {done && (
        <g>
          <Label x={145} y={22} text={say(locale, WORDS.iodine)} anchor="middle" />
          <Label x={36} y={150} text={say(locale, WORDS.noStarch)} anchor="middle" cls="is-good" />
          <Label
            x={262}
            y={150}
            text={say(locale, WORDS.stillStarch)}
            anchor="middle"
            cls="is-bad"
          />
        </g>
      )}
    </g>
  );
}

export function DigestiveTractView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as DigestionState;
  const stage = stageOf(s);
  const steps = stepsOf(s.mode);
  const isJourney = s.mode === DigestionMode.Journey;
  return (
    <div class="lp dt">
      <Frame w={W} h={H} width={width} label={describeDigestion(s)} cls="ldt-svg">
        {stage !== null ? (
          <JourneyPicture stage={stage} locale={locale} />
        ) : (
          <SalivaPicture step={s.step} locale={locale} />
        )}
      </Frame>
      {!isJourney && <p class="lp-caption">{say(locale, SALIVA_CAPTIONS[s.step] ?? WORDS.wait)}</p>}
      {s.canStep && (
        <Controls>
          {isJourney && s.step > 0 && (
            <Button
              label={say(locale, WORDS.back)}
              onClick={() => call(DigestionAction.Back, {})}
            />
          )}
          {s.step < steps - 1 && (
            <Button
              part={DigestionPart.Next}
              label={say(locale, isJourney ? WORDS.next : WORDS.nextStep)}
              onClick={() => call(DigestionAction.Next, {})}
            />
          )}
          {s.step === steps - 1 && (
            <Button
              label={say(locale, WORDS.again)}
              onClick={() => call(DigestionAction.Reset, {})}
            />
          )}
          <Dots step={s.step} count={isJourney ? STAGES.length : SALIVA_STEPS} />
        </Controls>
      )}
    </div>
  );
}
