import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Button, Controls, Dots, Frame, Label, type Words, say } from "./draw";
import {
  LeafAction,
  LeafMode,
  LeafPart,
  type LeafState,
  VARIEGATED_STEPS,
  describeLeaf,
  stepCountOf,
} from "./leaf";

const W = 320;
const H = 200;

const WORDS = {
  next: { en: "Next step →", hi: "अगला चरण →" },
  again: { en: "Start again", hi: "फिर से शुरू" },
  open: { en: "Water in: open", hi: "पानी अंदर: खुला" },
  close: { en: "Water out: close", hi: "पानी बाहर: बंद" },
  day: { en: "Day", hi: "दिन" },
  night: { en: "Night", hi: "रात" },
  green: { en: "green", hi: "हरा" },
  cream: { en: "cream", hi: "सफ़ेद-पीला" },
  starch: { en: "starch: blue-black", hi: "मंड: नीला-काला" },
  noStarch: { en: "no starch", hi: "मंड नहीं" },
  guard: { en: "guard cell", hi: "द्वार कोशिका" },
  pore: { en: "pore", hi: "छिद्र" },
  co2: { en: "carbon dioxide", hi: "कार्बन डाइऑक्साइड" },
  o2: { en: "oxygen", hi: "ऑक्सीजन" },
  vapour: { en: "water vapour", hi: "जलवाष्प" },
  koh: { en: "potassium hydroxide", hi: "पोटैशियम हाइड्रॉक्साइड" },
  plantA: { en: "A", hi: "A" },
  plantB: { en: "B", hi: "B" },
  alcohol: { en: "alcohol", hi: "ऐल्कोहॉल" },
  water: { en: "boiling water", hi: "उबलता पानी" },
  iodine: { en: "iodine", hi: "आयोडीन" },
  dark: { en: "3 days in the dark", hi: "3 दिन अँधेरे में" },
  sun: { en: "6 hours of sun", hi: "6 घंटे धूप" },
  tracing: { en: "tracing of green parts", hi: "हरे भागों का खाका" },
} as const satisfies Record<string, Words>;

const VARIEGATED_CAPTIONS: readonly Words[] = [
  {
    en: "A variegated leaf: green parts have chlorophyll, cream parts don't. Trace the green parts.",
    hi: "चितकबरी पत्ती: हरे भागों में क्लोरोफ़िल है, सफ़ेद-पीले में नहीं। हरे भागों का खाका बनाओ।",
  },
  {
    en: "Three days in the dark: the leaf uses up all its starch.",
    hi: "तीन दिन अँधेरे में: पत्ती अपना सारा मंड इस्तेमाल कर लेती है।",
  },
  { en: "Six hours in sunlight.", hi: "छह घंटे धूप में।" },
  {
    en: "Dip the leaf in boiling water for a few minutes.",
    hi: "पत्ती को कुछ मिनट उबलते पानी में डुबाओ।",
  },
  {
    en: "Heat it in alcohol in a water-bath: the leaf goes pale, the alcohol turns green.",
    hi: "जल-ऊष्मक में ऐल्कोहॉल में गरम करो: पत्ती फीकी पड़ती है, ऐल्कोहॉल हरा हो जाता है।",
  },
  {
    en: "Dip in iodine and rinse: only the once-green parts turn blue-black. Starch is made only where chlorophyll is.",
    hi: "आयोडीन में डुबाकर धोओ: केवल पहले हरे रहे भाग नीले-काले होते हैं। मंड केवल वहीं बनता है जहाँ क्लोरोफ़िल है।",
  },
];

const BELL_JAR_CAPTIONS: readonly Words[] = [
  {
    en: "Two sealed bell-jars. Beside plant A: potassium hydroxide, which soaks up carbon dioxide.",
    hi: "दो बंद बेल-जार। पौधे A के पास: पोटैशियम हाइड्रॉक्साइड, जो कार्बन डाइऑक्साइड सोख लेता है।",
  },
  { en: "Both in sunlight for about two hours.", hi: "दोनों लगभग दो घंटे धूप में।" },
  {
    en: "Starch test: A's leaf has no starch (no carbon dioxide), B's turns blue-black.",
    hi: "मंड परीक्षण: A की पत्ती में मंड नहीं (कार्बन डाइऑक्साइड नहीं), B की नीली-काली।",
  },
];

/** A leaf pointing right, centred at (cx, cy). */
function leafPath(cx: number, cy: number, len: number, wid: number): string {
  const l = cx - len / 2;
  const r = cx + len / 2;
  return `M${l} ${cy} Q ${cx - len * 0.1} ${cy - wid} ${r} ${cy} Q ${cx - len * 0.1} ${cy + wid} ${l} ${cy} Z`;
}

/** The variegated leaf, coloured for the step reached. */
function VariegatedLeaf({ step }: { step: number }) {
  const cx = 104;
  const cy = 100;
  const outer = step >= 5 ? "lf-iodine" : step === 4 ? "lf-pale" : "lf-cream";
  const inner = step >= 5 ? "lf-starch" : step === 4 ? "lf-pale-green" : "lf-green";
  return (
    <g>
      <path class="lf-stalk" d={`M${cx - 85} ${cy} L${cx - 108} ${cy + 18}`} />
      <path class={`lf-leaf ${outer}`} d={leafPath(cx, cy, 170, 70)} />
      <path class={`lf-leaf-in ${inner}`} d={leafPath(cx - 6, cy, 120, 38)} />
      <path
        class={`lf-leaf-in ${inner}`}
        d={`M${cx + 40} ${cy - 6} q 18 -14 30 -2 q -10 12 -30 2 z`}
      />
      <path class="lf-rib" d={`M${cx - 85} ${cy} Q ${cx} ${cy - 3} ${cx + 85} ${cy}`} />
    </g>
  );
}

function Sun({ x, y }: { x: number; y: number }) {
  return (
    <g class="lf-sun">
      <circle cx={x} cy={y} r={11} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <line
            key={a}
            x1={x + 15 * Math.cos(a)}
            y1={y + 15 * Math.sin(a)}
            x2={x + 20 * Math.cos(a)}
            y2={y + 20 * Math.sin(a)}
          />
        );
      })}
    </g>
  );
}

function Moon({ x, y }: { x: number; y: number }) {
  return <path class="lf-moon" d={`M${x + 4} ${y - 12} a 12 12 0 1 0 8 20 a 9 9 0 1 1 -8 -20 z`} />;
}

/** A beaker at (x, y = its base), `liquid` a class for what's in it. */
function Beaker({
  x,
  y,
  liquid,
  flame,
}: { x: number; y: number; liquid: string; flame?: boolean }) {
  return (
    <g>
      <path
        class={liquid}
        d={`M${x - 24} ${y - 34} L${x + 24} ${y - 34} L${x + 24} ${y - 4} q 0 4 -4 4 L${x - 20} ${y} q -4 0 -4 -4 Z`}
      />
      <path
        class="lf-glass"
        d={`M${x - 26} ${y - 62} L${x - 24} ${y - 4} q 0 4 4 4 L${x + 20} ${y} q 4 0 4 -4 L${x + 26} ${y - 62}`}
      />
      {flame && (
        <g>
          <path class="lf-flame" d={`M${x} ${y + 26} q -8 -10 0 -22 q 8 12 0 22 z`} />
          <rect class="lf-burner" x={x - 7} y={y + 26} width={14} height={8} rx={2} />
        </g>
      )}
    </g>
  );
}

function VariegatedPicture({ s, locale }: { s: LeafState; locale: string }) {
  const step = s.step;
  const px = 252;
  return (
    <g>
      <rect class={step === 1 ? "lf-dark" : "lp-bg"} x={0} y={0} width={W} height={H} />
      <VariegatedLeaf step={step} />
      {step === 0 && (
        <g>
          <rect class="lf-paper" x={px - 44} y={46} width={88} height={96} rx={4} />
          <path class="lf-trace" d={leafPath(px - 2, 94, 64, 22)} />
          <Label x={px} y={160} text={say(locale, WORDS.tracing)} anchor="middle" cls="is-dim" />
        </g>
      )}
      {step === 1 && (
        <g>
          <Moon x={px} y={70} />
          <Label x={px} y={118} text={say(locale, WORDS.dark)} anchor="middle" cls="lf-on-dark" />
        </g>
      )}
      {step === 2 && (
        <g>
          <Sun x={px} y={70} />
          <Label x={px} y={118} text={say(locale, WORDS.sun)} anchor="middle" />
        </g>
      )}
      {step === 3 && (
        <g>
          <Beaker x={px} y={140} liquid="lf-water" flame />
          <Label x={px} y={70} text={say(locale, WORDS.water)} anchor="middle" />
        </g>
      )}
      {step === 4 && (
        <g>
          <path
            class="lf-bath"
            d={`M${px - 38} 110 L${px + 38} 110 L${px + 38} 150 L${px - 38} 150 Z`}
          />
          <Beaker x={px} y={146} liquid="lf-alcohol" />
          <Label x={px} y={70} text={say(locale, WORDS.alcohol)} anchor="middle" />
        </g>
      )}
      {step === 5 && (
        <g>
          <rect class="lf-starch" x={px - 46} y={60} width={14} height={14} rx={3} />
          <Label x={px - 26} y={71} text={say(locale, WORDS.starch)} />
          <rect class="lf-iodine" x={px - 46} y={84} width={14} height={14} rx={3} />
          <Label x={px - 26} y={95} text={say(locale, WORDS.noStarch)} />
          <path class="lf-dropper" d={`M${px - 8} 120 l 16 0 l -4 26 l -8 0 z`} />
          <Label x={px} y={162} text={say(locale, WORDS.iodine)} anchor="middle" cls="is-dim" />
        </g>
      )}
      {step < 4 && step !== 1 && (
        <g>
          <rect class="lf-green" x={20} y={176} width={12} height={12} rx={3} />
          <Label x={36} y={186} text={say(locale, WORDS.green)} cls="is-dim" />
          <rect class="lf-cream" x={84} y={176} width={12} height={12} rx={3} />
          <Label x={100} y={186} text={say(locale, WORDS.cream)} cls="is-dim" />
        </g>
      )}
    </g>
  );
}

function StomataPicture({ s, locale }: { s: LeafState; locale: string }) {
  const cx = 118;
  const cy = 104;
  const gap = s.isOpen ? 13 : 0;
  const rx = s.isOpen ? 15 : 12;
  return (
    <g>
      <rect class="lf-epidermis" x={0} y={0} width={W} height={H} />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4, 5].map((c) => (
          <rect
            key={`${r}-${c}`}
            class="lf-cell"
            x={c * 56 - (r % 2) * 28}
            y={r * 52}
            width={54}
            height={50}
            rx={6}
          />
        )),
      )}
      <ellipse class="lf-pore" cx={cx} cy={cy} rx={gap + 3} ry={s.isOpen ? 30 : 34} />
      <ellipse class="lf-guard" cx={cx - gap - rx + 3} cy={cy} rx={rx} ry={40} />
      <ellipse class="lf-guard" cx={cx + gap + rx - 3} cy={cy} rx={rx} ry={40} />
      {s.isOpen &&
        [-20, 0, 20].map((dy) => (
          <g key={dy}>
            <circle class="lp-water-dot" cx={cx - gap - rx + 3} cy={cy + dy} r={2.2} />
            <circle class="lp-water-dot" cx={cx + gap + rx - 3} cy={cy + dy} r={2.2} />
          </g>
        ))}
      <Label x={cx - 52} y={cy + 56} text={say(locale, WORDS.guard)} anchor="middle" />
      <Label x={cx} y={cy - 48} text={say(locale, WORDS.pore)} anchor="middle" />
      {s.isOpen ? (
        <g>
          <g class="lp-co2">
            <Arrow x1={220} y1={58} x2={cx + 6} y2={cy - 10} />
          </g>
          <Label x={210} y={50} text={say(locale, WORDS.co2)} />
          <g class="lp-oxygen">
            <Arrow x1={cx + 6} y1={cy + 2} x2={226} y2={cy + 6} />
          </g>
          <Label x={232} y={cy + 9} text={say(locale, WORDS.o2)} />
          <g class="lp-water">
            <Arrow x1={cx + 6} y1={cy + 14} x2={220} y2={156} />
          </g>
          <Label x={214} y={170} text={say(locale, WORDS.vapour)} />
        </g>
      ) : null}
    </g>
  );
}

function Plant({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path class="lf-pot" d="M-16 0 L16 0 L12 20 L-12 20 Z" />
      <path class="lf-stalk" d="M0 0 L0 -40" />
      <path class="lf-leaf lf-green" d={leafPath(13, -30, 26, 9)} />
      <path class="lf-leaf lf-green" d={leafPath(-13, -18, 26, 9)} />
      <path class="lf-leaf lf-green" d={leafPath(10, -46, 22, 8)} />
    </g>
  );
}

function BellJarPicture({ s, locale }: { s: LeafState; locale: string }) {
  const jars = [
    { x: 86, name: WORDS.plantA, koh: true },
    { x: 226, name: WORDS.plantB, koh: false },
  ];
  return (
    <g>
      <rect class="lp-bg" x={0} y={0} width={W} height={H} />
      {s.step >= 1 && <Sun x={156} y={30} />}
      {jars.map((j) => (
        <g key={j.x}>
          <rect class="lf-plate" x={j.x - 48} y={140} width={96} height={6} rx={2} />
          <Plant x={j.x} y={120} s={0.9} />
          {j.koh && (
            <g>
              <path class="lf-koh" d={`M${j.x + 22} 136 q 10 6 20 0 z`} />
              <Label x={j.x - 46} y={22} text={say(locale, WORDS.koh)} cls="is-dim" />
              <Arrow x1={j.x + 10} y1={28} x2={j.x + 30} y2={128} />
            </g>
          )}
          <path
            class="lf-jar"
            d={`M${j.x - 44} 140 L${j.x - 44} 76 Q ${j.x} 30 ${j.x + 44} 76 L${j.x + 44} 140`}
          />
          <Label x={j.x - 52} y={60} text={say(locale, j.name)} cls="is-big" />
          {s.step === 2 && (
            <g>
              <path
                class={j.koh ? "lf-leaf lf-iodine" : "lf-leaf lf-starch"}
                d={leafPath(j.x, 170, 54, 11)}
              />
              <Label
                x={j.x}
                y={194}
                anchor="middle"
                text={say(locale, j.koh ? WORDS.noStarch : WORDS.starch)}
                cls={j.koh ? "is-bad" : "is-good"}
              />
            </g>
          )}
        </g>
      ))}
    </g>
  );
}

function DayNightPicture({ s, locale }: { s: LeafState; locale: string }) {
  const into = s.isDay ? WORDS.co2 : WORDS.o2;
  const out = s.isDay ? WORDS.o2 : WORDS.co2;
  return (
    <g>
      <rect class={s.isDay ? "lf-sky" : "lf-dark"} x={0} y={0} width={W} height={H} />
      {s.isDay ? <Sun x={268} y={36} /> : <Moon x={268} y={36} />}
      <Plant x={150} y={150} s={2} />
      <g class={s.isDay ? "lp-co2" : "lp-oxygen"}>
        <Arrow x1={40} y1={70} x2={118} y2={86} head={7} />
      </g>
      <Label x={20} y={60} text={`${say(locale, into)} →`} cls={s.isDay ? "" : "lf-on-dark"} />
      <g class={s.isDay ? "lp-oxygen" : "lp-co2"}>
        <Arrow x1={184} y1={86} x2={262} y2={104} head={7} />
      </g>
      <Label x={200} y={124} text={`→ ${say(locale, out)}`} cls={s.isDay ? "" : "lf-on-dark"} />
    </g>
  );
}

/** The leaf lab: one picture per mode, with the experiment's controls under it. */
export function LeafLabView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as LeafState;
  const steps = stepCountOf(s.mode);
  const isStepped = steps > 1;
  const caption =
    s.mode === LeafMode.Variegated
      ? VARIEGATED_CAPTIONS[s.step]
      : s.mode === LeafMode.BellJar
        ? BELL_JAR_CAPTIONS[s.step]
        : null;
  return (
    <div class="lp lf">
      <Frame w={W} h={H} width={width} label={describeLeaf(s)} cls="lf-svg">
        <g data-part={LeafPart.Picture}>
          {s.mode === LeafMode.Variegated && <VariegatedPicture s={s} locale={locale} />}
          {s.mode === LeafMode.Stomata && <StomataPicture s={s} locale={locale} />}
          {s.mode === LeafMode.BellJar && <BellJarPicture s={s} locale={locale} />}
          {s.mode === LeafMode.DayNight && <DayNightPicture s={s} locale={locale} />}
        </g>
      </Frame>
      {caption && <p class="lp-caption">{say(locale, caption)}</p>}
      <Controls>
        {isStepped && s.canStep && s.step < steps - 1 && (
          <Button
            part={LeafPart.Next}
            label={say(locale, WORDS.next)}
            onClick={() => call(LeafAction.Next, {})}
          />
        )}
        {isStepped && s.canStep && s.step > 0 && (
          <Button label={say(locale, WORDS.again)} onClick={() => call(LeafAction.Reset, {})} />
        )}
        {isStepped && (
          <Dots step={s.step} count={s.mode === LeafMode.Variegated ? VARIEGATED_STEPS : steps} />
        )}
        {s.mode === LeafMode.Stomata && s.canToggle && (
          <>
            <Button
              part={LeafPart.Toggle}
              label={say(locale, WORDS.open)}
              isOn={s.isOpen}
              onClick={() => call(LeafAction.SetOpen, { open: true })}
            />
            <Button
              label={say(locale, WORDS.close)}
              isOn={!s.isOpen}
              onClick={() => call(LeafAction.SetOpen, { open: false })}
            />
          </>
        )}
        {s.mode === LeafMode.DayNight && s.canToggle && (
          <>
            <Button
              part={LeafPart.Toggle}
              label={say(locale, WORDS.day)}
              isOn={s.isDay}
              onClick={() => call(LeafAction.SetDay, { day: true })}
            />
            <Button
              label={say(locale, WORDS.night)}
              isOn={!s.isDay}
              onClick={() => call(LeafAction.SetDay, { day: false })}
            />
          </>
        )}
      </Controls>
    </div>
  );
}
