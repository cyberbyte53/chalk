import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Button, Controls, Dots, Frame, Label, type Words, say } from "./draw";
import {
  FeedingAction,
  FeedingKind,
  FeedingPart,
  type FeedingState,
  describeFeeding,
  feedingSteps,
} from "./feeding";

const W = 320;
const H = 200;

const WORDS = {
  next: { en: "Next step →", hi: "अगला चरण →" },
  again: { en: "Start again", hi: "फिर से शुरू" },
  food: { en: "food", hi: "भोजन" },
  pseudopodia: { en: "finger-like extensions", hi: "उँगली जैसे उभार" },
  vacuole: { en: "food vacuole", hi: "खाद्य रिक्तिका" },
  nucleus: { en: "nucleus", hi: "केंद्रक" },
  cytoplasm: { en: "cytoplasm", hi: "कोशिका द्रव्य" },
  waste: { en: "undigested waste out", hi: "अपचा कचरा बाहर" },
  cilia: { en: "cilia", hi: "पक्ष्माभ" },
  spot: { en: "food goes in here", hi: "भोजन यहाँ से अंदर" },
} as const satisfies Record<string, Words>;

const CAPTIONS: Record<FeedingKind, readonly Words[]> = {
  amoeba: [
    {
      en: "An Amoeba, a single cell with no fixed shape, near some food.",
      hi: "अमीबा, बिना निश्चित आकार की एक कोशिका, भोजन के पास।",
    },
    {
      en: "It pushes out finger-like extensions that flow round the food.",
      hi: "यह उँगली जैसे उभार निकालता है जो भोजन के चारों ओर बहते हैं।",
    },
    {
      en: "They fuse over the food: a food vacuole forms inside the cell.",
      hi: "वे भोजन के ऊपर जुड़ जाते हैं: कोशिका के अंदर खाद्य रिक्तिका बनती है।",
    },
    {
      en: "The food is broken down; simple substances diffuse into the cytoplasm. Waste is thrown out.",
      hi: "भोजन टूटता है; सरल पदार्थ कोशिका द्रव्य में फैल जाते हैं। कचरा बाहर फेंका जाता है।",
    },
  ],
  paramoecium: [
    {
      en: "A Paramoecium: one cell with a fixed shape, covered in cilia.",
      hi: "पैरामीशियम: निश्चित आकार की एक कोशिका, पक्ष्माभों से ढकी।",
    },
    {
      en: "The cilia beat and sweep food to one spot, where it is taken in.",
      hi: "पक्ष्माभ हिलते हैं और भोजन को एक जगह तक ले जाते हैं, जहाँ से वह अंदर जाता है।",
    },
  ],
};

const AMOEBA_SHAPE = [
  "M90 60 C120 30 170 40 190 70 C212 96 200 140 170 150 C130 165 85 150 75 120 C62 95 70 75 90 60 Z",
  "M90 60 C120 30 168 42 190 70 C204 58 236 60 250 84 C254 92 246 96 238 91 C226 80 214 82 207 92 C213 106 228 107 239 105 C250 103 256 110 249 118 C234 140 204 138 196 126 C176 152 128 164 85 150 C62 140 62 95 90 60 Z",
  "M84 58 C120 28 200 34 238 80 C262 108 236 150 190 156 C140 162 80 154 68 120 C60 95 64 72 84 58 Z",
  "M84 58 C120 28 200 34 238 80 C262 108 236 150 190 156 C140 162 80 154 68 120 C60 95 64 72 84 58 Z",
] as const;

function Food({ x, y, r = 8 }: { x: number; y: number; r?: number }) {
  return (
    <g class="cf-food">
      <circle cx={x} cy={y} r={r} />
      <circle cx={x - r * 0.6} cy={y - r * 0.5} r={r * 0.45} />
      <circle cx={x + r * 0.5} cy={y + r * 0.6} r={r * 0.4} />
    </g>
  );
}

function AmoebaPicture({ s, locale }: { s: FeedingState; locale: string }) {
  const step = s.step;
  const names = s.showNames;
  return (
    <g>
      <rect class="cf-pond" x={0} y={0} width={W} height={H} />
      <path class="cf-cell" d={AMOEBA_SHAPE[step] ?? AMOEBA_SHAPE[0]} />
      <circle class="cf-nucleus" cx={120} cy={100} r={14} />
      {step <= 1 && <Food x={226} y={99} />}
      {step >= 2 && (
        <g>
          <circle class="cf-vacuole" cx={200} cy={100} r={step === 2 ? 16 : 11} />
          <Food x={200} y={100} r={step === 2 ? 7 : 4} />
        </g>
      )}
      {step === 3 && (
        <g>
          {[
            [170, 80],
            [165, 118],
            [150, 96],
            [178, 132],
            [140, 70],
            [150, 128],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} class="lp-food-dot" cx={x} cy={y} r={2.4} />
          ))}
          <path class="cf-waste" d="M60 132 l 6 -4 l 4 6 l -6 4 z M48 140 l 5 -3 l 3 5 l -5 3 z" />
          <Arrow x1={78} y1={128} x2={52} y2={146} />
        </g>
      )}
      {names && (
        <g>
          <Label x={120} y={126} text={say(locale, WORDS.nucleus)} anchor="middle" cls="is-dim" />
          {step <= 1 && <Label x={226} y={124} text={say(locale, WORDS.food)} anchor="middle" />}
          {step === 1 && (
            <Label x={244} y={68} text={say(locale, WORDS.pseudopodia)} anchor="end" />
          )}
          {step >= 2 && (
            <Label
              x={200}
              y={step === 2 ? 132 : 126}
              text={say(locale, WORDS.vacuole)}
              anchor="middle"
            />
          )}
          {step === 3 && (
            <Label
              x={150}
              y={52}
              text={say(locale, WORDS.cytoplasm)}
              anchor="middle"
              cls="is-dim"
            />
          )}
          {step === 3 && <Label x={10} y={166} text={say(locale, WORDS.waste)} />}
        </g>
      )}
    </g>
  );
}

function ParamoeciumPicture({ s, locale }: { s: FeedingState; locale: string }) {
  const cx = 150;
  const cy = 100;
  const cilia = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * 2 * Math.PI;
    const x = cx + 92 * Math.cos(a);
    const y = cy + 40 * Math.sin(a);
    const nx = Math.cos(a) * 8;
    const ny = Math.sin(a) * 8;
    // biome-ignore lint/suspicious/noArrayIndexKey: a fixed drawing, never reordered
    return <line key={i} class="cf-cilium" x1={x} y1={y} x2={x + nx} y2={y + ny} />;
  });
  return (
    <g>
      <rect class="cf-pond" x={0} y={0} width={W} height={H} />
      <g transform={`rotate(-8 ${cx} ${cy})`}>
        {cilia}
        <ellipse class="cf-cell" cx={cx} cy={cy} rx={92} ry={40} />
        <path
          class="cf-groove"
          d={`M${cx - 10} ${cy - 40} Q ${cx + 8} ${cy - 14} ${cx + 6} ${cy + 4}`}
        />
        <circle class="cf-nucleus" cx={cx - 40} cy={cy + 6} r={13} />
        {s.step === 1 && (
          <g>
            <circle class="cf-vacuole" cx={cx + 20} cy={cy + 14} r={8} />
            <Food x={cx + 20} y={cy + 14} r={3.5} />
            <circle class="cf-vacuole" cx={cx + 44} cy={cy + 4} r={7} />
            <Food x={cx + 44} y={cy + 4} r={3} />
          </g>
        )}
      </g>
      {s.step === 0 ? (
        <g>
          <Food x={68} y={34} r={5} />
          <Food x={238} y={36} r={5} />
          <Food x={262} y={166} r={5} />
        </g>
      ) : (
        <g class="lp-food">
          <Arrow x1={70} y1={34} x2={128} y2={52} />
          <Arrow x1={232} y1={34} x2={152} y2={54} />
        </g>
      )}
      {s.showNames && (
        <g>
          <Label x={34} y={170} text={say(locale, WORDS.cilia)} />
          <Label x={150} y={20} text={say(locale, WORDS.spot)} anchor="middle" />
          <Label x={110} y={134} text={say(locale, WORDS.nucleus)} anchor="middle" cls="is-dim" />
        </g>
      )}
    </g>
  );
}

export function CellFeedingView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as FeedingState;
  const steps = feedingSteps(s.kind);
  return (
    <div class="lp cf">
      <Frame w={W} h={H} width={width} label={describeFeeding(s)} cls="cf-svg">
        <g data-part={FeedingPart.Cell}>
          {s.kind === FeedingKind.Amoeba ? (
            <AmoebaPicture s={s} locale={locale} />
          ) : (
            <ParamoeciumPicture s={s} locale={locale} />
          )}
        </g>
      </Frame>
      <p class="lp-caption">
        {say(locale, CAPTIONS[s.kind][s.step] ?? CAPTIONS[s.kind][0] ?? WORDS.food)}
      </p>
      {s.canStep && (
        <Controls>
          {s.step < steps - 1 && (
            <Button
              part={FeedingPart.Next}
              label={say(locale, WORDS.next)}
              onClick={() => call(FeedingAction.Next, {})}
            />
          )}
          {s.step > 0 && (
            <Button
              label={say(locale, WORDS.again)}
              onClick={() => call(FeedingAction.Reset, {})}
            />
          )}
          <Dots step={s.step} count={steps} />
        </Controls>
      )}
    </div>
  );
}
