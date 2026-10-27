import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  BACTERIA,
  DNA_STEPS,
  DnaAction,
  DnaMode,
  DnaPart,
  type DnaState,
  GENERATIONS,
  RESISTANT,
  SEGMENTS,
  describeDna,
  survivorsAt,
} from "./dna-copy";
import { Arrow, Caption, Frame, Label, Stepper, type Words, say } from "./draw";

const W = 320;
const H = 200;

const WORDS = {
  dna: { en: "DNA", hi: "DNA" },
  copy: { en: "DNA copy", hi: "DNA की प्रति" },
  change: { en: "a small change", hi: "एक छोटा बदलाव" },
  apparatus: { en: "extra cell apparatus", hi: "अतिरिक्त कोशिकीय उपकरण" },
  similar: { en: "similar, not identical", hi: "समान, पर एकदम एक जैसी नहीं" },
  dies: { en: "too changed: dies", hi: "बहुत बदली: मर जाती है" },
  gen: { en: "generation", hi: "पीढ़ी" },
  cool: { en: "temperate water", hi: "सामान्य ताप का पानी" },
  warm: { en: "the water warms up", hi: "पानी गर्म हो गया" },
  variant: { en: "heat-resistant variant", hi: "ताप-सहिष्णु विभिन्नता" },
  survive: { en: "only the variants survive", hi: "केवल विभिन्नताएँ बचती हैं" },
  grow: { en: "they multiply", hi: "वे बढ़ती हैं" },
} as const satisfies Record<string, Words>;

const CAPTIONS: Record<DnaMode, readonly Words[]> = {
  copy: [
    { en: "A cell, with its DNA in the nucleus.", hi: "एक कोशिका, केंद्रक में उसका DNA।" },
    {
      en: "The DNA is copied. One small block of the copy has changed.",
      hi: "DNA की प्रतिलिपि बनती है। प्रति का एक छोटा हिस्सा बदल गया है।",
    },
    {
      en: "Extra cell apparatus is built for the copy.",
      hi: "प्रति के लिए अतिरिक्त कोशिकीय उपकरण बनता है।",
    },
    {
      en: "The cell divides: two similar, but not identical, cells.",
      hi: "कोशिका विभाजित होती है: दो समान, पर एकदम एक जैसी नहीं, कोशिकाएँ।",
    },
  ],
  generations: [
    { en: "Generation 0: one cell.", hi: "पीढ़ी 0: एक कोशिका।" },
    { en: "Generation 1: one copy has a small change.", hi: "पीढ़ी 1: एक प्रति में छोटा बदलाव।" },
    {
      en: "Generation 2: changes are passed on, and new ones add up.",
      hi: "पीढ़ी 2: बदलाव आगे जाते हैं, और नए जुड़ते हैं।",
    },
    {
      en: "Generation 3: eight similar cells; one changed too much and dies.",
      hi: "पीढ़ी 3: आठ समान कोशिकाएँ; एक बहुत बदल गई और मर जाती है।",
    },
  ],
  niche: [
    {
      en: "Bacteria in temperate water. Two are heat-resistant variants.",
      hi: "सामान्य ताप के पानी में जीवाणु। दो ताप-सहिष्णु विभिन्नताएँ हैं।",
    },
    { en: "The water warms up.", hi: "पानी गर्म हो जाता है।" },
    {
      en: "Most die. Only the heat-resistant variants survive.",
      hi: "अधिकतर मर जाते हैं। केवल ताप-सहिष्णु बचते हैं।",
    },
    {
      en: "The survivors multiply: variation saved the population.",
      hi: "बचे हुए बढ़ते हैं: विभिन्नता ने समष्टि को बचा लिया।",
    },
  ],
};

/** A DNA strip of SEGMENTS blocks at (x, y), `w` wide; changed blocks marked. */
function Strip({
  x,
  y,
  w,
  changed,
  isFaded = false,
}: {
  x: number;
  y: number;
  w: number;
  changed: readonly number[];
  isFaded?: boolean;
}): JSX.Element {
  const bw = w / SEGMENTS;
  return (
    <g class={isFaded ? "dc-strip is-faded" : "dc-strip"}>
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <rect
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length strip
          key={i}
          class={changed.includes(i) ? "dc-block is-changed" : "dc-block"}
          x={x + i * bw}
          y={y}
          width={bw - 0.8}
          height={Math.max(4, bw * 0.9)}
          rx={1}
        />
      ))}
    </g>
  );
}

/** A round cell with a nucleus and a DNA strip inside. */
function Cell({
  cx,
  cy,
  r,
  changed,
  isDead = false,
  apparatus = 1,
}: {
  cx: number;
  cy: number;
  r: number;
  changed: readonly number[];
  isDead?: boolean;
  apparatus?: number;
}): JSX.Element {
  const sw = r * 1.2;
  return (
    <g class={isDead ? "dc-cell is-dead" : "dc-cell"}>
      <circle class="dc-membrane" cx={cx} cy={cy} r={r} />
      {Array.from({ length: apparatus * 3 }, (_, i) => {
        const a = (i / (apparatus * 3)) * Math.PI * 2 + 0.4;
        return (
          <ellipse
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed decoration
            key={i}
            class="dc-organelle"
            cx={cx + Math.cos(a) * r * 0.66}
            cy={cy + Math.sin(a) * r * 0.66}
            rx={r * 0.12}
            ry={r * 0.07}
          />
        );
      })}
      <Strip x={cx - sw / 2} y={cy - sw / SEGMENTS / 2} w={sw} changed={changed} isFaded={isDead} />
      {isDead && (
        <g class="dc-cross">
          <line x1={cx - r * 0.6} y1={cy - r * 0.6} x2={cx + r * 0.6} y2={cy + r * 0.6} />
          <line x1={cx + r * 0.6} y1={cy - r * 0.6} x2={cx - r * 0.6} y2={cy + r * 0.6} />
        </g>
      )}
    </g>
  );
}

function CopyPicture({ step, names, locale }: { step: number; names: boolean; locale: string }) {
  const t = (w: Words) => say(locale, w);
  if (step === 3) {
    return (
      <g>
        <Cell cx={95} cy={92} r={44} changed={[]} />
        <Cell cx={225} cy={92} r={44} changed={[4]} />
        {names && <Label x={160} y={170} text={t(WORDS.similar)} anchor="middle" cls="is-big" />}
      </g>
    );
  }
  return (
    <g>
      <ellipse class="dc-membrane" cx={160} cy={96} rx={step === 2 ? 118 : 96} ry={70} />
      {Array.from({ length: step === 2 ? 6 : 3 }, (_, i) => {
        const a = (i / (step === 2 ? 6 : 3)) * Math.PI * 2 + 0.4;
        return (
          <ellipse
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed decoration
            key={i}
            class={step === 2 && i % 2 === 1 ? "dc-organelle is-new" : "dc-organelle"}
            cx={160 + Math.cos(a) * (step === 2 ? 92 : 72)}
            cy={96 + Math.sin(a) * 50}
            rx={7}
            ry={4}
          />
        );
      })}
      <circle class="dc-nucleus" cx={160} cy={96} r={step === 0 ? 30 : 44} />
      <Strip x={124} y={step === 0 ? 92 : 78} w={72} changed={[]} />
      {step >= 1 && <Strip x={124} y={104} w={72} changed={[4]} />}
      {names && (
        <g>
          <Label x={160} y={step === 0 ? 84 : 72} text={t(WORDS.dna)} anchor="middle" />
          {step >= 1 && (
            <g>
              <Label x={262} y={162} text={t(WORDS.change)} anchor="middle" />
              <Arrow x1={240} y1={156} x2={170} y2={114} />
              <Label x={88} y={162} text={t(WORDS.copy)} anchor="middle" />
            </g>
          )}
          {step === 2 && (
            <Label x={160} y={186} text={t(WORDS.apparatus)} anchor="middle" cls="is-dim" />
          )}
        </g>
      )}
    </g>
  );
}

function GenerationsPicture({
  step,
  names,
  locale,
}: { step: number; names: boolean; locale: string }) {
  const rows = GENERATIONS.slice(0, step + 1);
  const rowY = (g: number) => 22 + g * 46;
  const xOf = (g: number, i: number) => 14 + ((i + 0.5) * (W - 14)) / 2 ** g;
  const r = (g: number) => [18, 17, 16, 14][g] ?? 14;
  return (
    <g>
      {rows.map((row, g) =>
        row.map((c, i) => {
          if (g === 0) return null;
          const px = xOf(g - 1, Math.floor(i / 2));
          return (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed tree
              key={`l-${g}-${i}`}
              class="dc-link"
              x1={px}
              y1={rowY(g - 1) + r(g - 1)}
              x2={xOf(g, i)}
              y2={rowY(g) - r(g)}
            />
          );
        }),
      )}
      {rows.map((row, g) =>
        row.map((c, i) => (
          <Cell
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed tree
            key={`c-${g}-${i}`}
            cx={xOf(g, i)}
            cy={rowY(g)}
            r={r(g)}
            changed={c.changed}
            isDead={c.isDead}
          />
        )),
      )}
      {names && (
        <g>
          {rows.map((_, g) => (
            <Label
              // biome-ignore lint/suspicious/noArrayIndexKey: one per row
              key={g}
              x={4}
              y={rowY(g) + 4}
              text={`${g}`}
              cls="is-dim"
            />
          ))}
          {step === 3 && (
            <Label
              x={xOf(3, 5)}
              y={rowY(3) + 30}
              text={say(locale, WORDS.dies)}
              anchor="middle"
              cls="is-bad"
            />
          )}
        </g>
      )}
    </g>
  );
}

const BACTERIA_AT: readonly [number, number][] = [
  [48, 70],
  [90, 52],
  [132, 78],
  [176, 56],
  [222, 74],
  [266, 54],
  [62, 118],
  [108, 132],
  [154, 112],
  [200, 136],
  [246, 114],
  [282, 136],
];

function NichePicture({ step, names, locale }: { step: number; names: boolean; locale: string }) {
  const isWarm = step >= 1;
  const spots = step === 3 ? BACTERIA_AT.slice(0, survivorsAt(3)) : BACTERIA_AT.slice(0, BACTERIA);
  return (
    <g>
      <rect class={isWarm ? "dc-water is-warm" : "dc-water"} x={0} y={30} width={W} height={150} />
      {isWarm &&
        [40, 120, 200, 280].map((x) => (
          <path key={x} class="dc-heat" d={`M${x} 196 q 6 -8 0 -16 q -6 -8 0 -16`} />
        ))}
      {spots.map(([x, y], i) => {
        const isVariant = step === 3 ? true : RESISTANT.includes(i);
        const isDead = step === 2 && !isVariant;
        return (
          <g
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed positions
            key={i}
            class={`dc-bacterium${isVariant ? " is-variant" : ""}${isDead ? " is-dead" : ""}`}
          >
            <rect x={x - 13} y={y - 6} width={26} height={12} rx={6} />
            {isDead && <line x1={x - 9} y1={y - 8} x2={x + 9} y2={y + 8} />}
          </g>
        );
      })}
      {names && (
        <g>
          <Label
            x={160}
            y={20}
            text={say(
              locale,
              step === 0
                ? WORDS.cool
                : step === 1
                  ? WORDS.warm
                  : step === 2
                    ? WORDS.survive
                    : WORDS.grow,
            )}
            anchor="middle"
            cls="is-big"
          />
          {step <= 1 && (
            <g>
              <Label x={154} y={160} text={say(locale, WORDS.variant)} anchor="middle" />
              <Arrow x1={154} y1={150} x2={154} y2={121} />
            </g>
          )}
        </g>
      )}
    </g>
  );
}

export function DnaCopyView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as DnaState;
  return (
    <div class="rp dc">
      <Frame w={W} h={H} width={width} label={describeDna(s)} cls="dc-svg">
        <rect class="rp-bg" x={0} y={0} width={W} height={H} />
        <g data-part={DnaPart.Picture}>
          {s.mode === DnaMode.Copy && (
            <CopyPicture step={s.step} names={s.showNames} locale={locale} />
          )}
          {s.mode === DnaMode.Generations && (
            <GenerationsPicture step={s.step} names={s.showNames} locale={locale} />
          )}
          {s.mode === DnaMode.Niche && (
            <NichePicture step={s.step} names={s.showNames} locale={locale} />
          )}
        </g>
      </Frame>
      <Caption text={say(locale, CAPTIONS[s.mode][s.step] ?? CAPTIONS[s.mode][0] ?? WORDS.dna)} />
      {s.canStep && (
        <Stepper
          step={s.step}
          count={DNA_STEPS}
          locale={locale}
          part={DnaPart.Next}
          onNext={() => call(DnaAction.Next, {})}
          onReset={() => call(DnaAction.Reset, {})}
        />
      )}
    </div>
  );
}
