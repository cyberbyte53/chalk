import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Button, Caption, Controls, Frame, Label, Stepper, type Words, say } from "./draw";
import {
  Agent,
  FLOWER_STEPS,
  FlowerAction,
  FlowerMode,
  FlowerPart,
  FlowerPartId,
  type FlowerState,
  FlowerType,
  Pollination,
  describeFlower,
} from "./flower";

const W = 320;
const H = 200;

const NAMES: Readonly<Record<FlowerPart, Words>> = {
  sepal: { en: "sepal", hi: "बाह्यदल" },
  petal: { en: "petal", hi: "दल (पंखुड़ी)" },
  anther: { en: "anther", hi: "परागकोश" },
  filament: { en: "filament", hi: "तंतु" },
  stigma: { en: "stigma", hi: "वर्तिकाग्र" },
  style: { en: "style", hi: "वर्तिका" },
  ovary: { en: "ovary", hi: "अंडाशय" },
  ovule: { en: "ovule", hi: "बीजांड" },
};

const JOBS: Readonly<Record<FlowerPart, Words>> = {
  sepal: {
    en: "Sepal: green outer part; protects the flower in bud.",
    hi: "बाह्यदल: हरा बाहरी भाग; कली में फूल की रक्षा करता है।",
  },
  petal: {
    en: "Petal: often bright; attracts insects that carry pollen.",
    hi: "दल: अक्सर चमकीला; पराग ले जाने वाले कीटों को आकर्षित करता है।",
  },
  anther: {
    en: "Anther: top of the stamen (male part); makes yellowish pollen.",
    hi: "परागकोश: पुंकेसर (नर भाग) का सिरा; पीले परागकण बनाता है।",
  },
  filament: {
    en: "Filament: the stalk of the stamen, holding the anther up.",
    hi: "तंतु: पुंकेसर का डंठल, जो परागकोश को उठाए रखता है।",
  },
  stigma: {
    en: "Stigma: sticky top of the pistil (female part); pollen lands here.",
    hi: "वर्तिकाग्र: स्त्रीकेसर (मादा भाग) का चिपचिपा सिरा; पराग यहाँ गिरता है।",
  },
  style: {
    en: "Style: middle of the pistil; the pollen tube grows through it.",
    hi: "वर्तिका: स्त्रीकेसर का बीच का भाग; परागनलिका इसमें से बढ़ती है।",
  },
  ovary: {
    en: "Ovary: swollen base of the pistil; holds ovules, becomes the fruit.",
    hi: "अंडाशय: स्त्रीकेसर का फूला आधार; बीजांड रखता है, फल बनता है।",
  },
  ovule: {
    en: "Ovule: has the egg cell; becomes the seed.",
    hi: "बीजांड: इसमें अंड कोशिका होती है; बीज बनता है।",
  },
};

const L = {
  tapPart: { en: "Tap a part of the flower.", hi: "फूल के किसी भाग पर टैप करो।" },
  bisexual: { en: "Bisexual", hi: "उभयलिंगी" },
  unisexual: { en: "Unisexual", hi: "एकलिंगी" },
  hibiscus: { en: "Hibiscus: stamens and pistil", hi: "गुड़हल: पुंकेसर और स्त्रीकेसर" },
  male: { en: "male flower: stamens", hi: "नर फूल: पुंकेसर" },
  female: { en: "female flower: pistil", hi: "मादा फूल: स्त्रीकेसर" },
  papaya: { en: "papaya", hi: "पपीता" },
  self: { en: "Self", hi: "स्व" },
  cross: { en: "Cross", hi: "पर" },
  wind: { en: "Wind", hi: "हवा" },
  water: { en: "Water", hi: "पानी" },
  animal: { en: "Insect", hi: "कीट" },
  pollen: { en: "pollen", hi: "पराग" },
  tube: { en: "pollen tube", hi: "परागनलिका" },
  zygote: { en: "zygote", hi: "युग्मनज" },
  embryo: { en: "embryo", hi: "भ्रूण" },
  seed: { en: "seeds", hi: "बीज" },
  fruit: { en: "fruit (from the ovary)", hi: "फल (अंडाशय से)" },
  fallen: { en: "petals, stamens fall", hi: "दल, पुंकेसर गिर जाते हैं" },
} as const satisfies Record<string, Words>;

type T = (w: Words) => string;

type Look = {
  cx: number;
  by: number;
  k: number;
  stamens?: boolean;
  pistil?: boolean;
  petals?: boolean;
  selected?: FlowerPart | null;
  onTap?: ((p: FlowerPart) => void) | undefined;
  pollen?: boolean;
  tube?: number;
  fused?: boolean;
  fruit?: number;
};

/** One flower in longitudinal section; base of the stalk at (cx, by), scale k. */
function FlowerLS(f: Look): JSX.Element {
  const { cx, by, k } = f;
  const y = (v: number) => by - v * k;
  const x = (v: number) => cx + v * k;
  const stamens = f.stamens ?? true;
  const pistil = f.pistil ?? true;
  const petals = f.petals ?? true;
  const fruit = f.fruit ?? 0;
  const isSel = (p: FlowerPart) => f.selected === p;
  const tap = (p: FlowerPart) =>
    f.onTap === undefined
      ? {}
      : {
          onClick: () => f.onTap?.(p),
          role: "button" as const,
          tabIndex: 0,
          style: { cursor: "pointer" },
        };
  const cls = (base: string, p: FlowerPart) => `${base}${isSel(p) ? " is-selected" : ""}`;
  const ovaryRx = fruit >= 1 ? 30 : 18;
  const ovaryRy = fruit >= 1 ? 26 : 16;
  return (
    <g>
      <line class="fl-stalk" x1={cx} y1={by} x2={cx} y2={y(34)} />
      {[-1, 1].map((d) => (
        <path
          key={`s${d}`}
          data-part={FlowerPart.Sepal}
          class={cls("fl-sepal", FlowerPart.Sepal)}
          d={`M${x(d * 10)} ${y(34)} Q ${x(d * 42)} ${y(34)} ${x(d * 50)} ${y(52)} Q ${x(d * 30)} ${y(44)} ${x(d * 8)} ${y(40)} Z`}
          {...tap(FlowerPart.Sepal)}
        />
      ))}
      {petals &&
        [-1, 1].map((d) => (
          <path
            key={`p${d}`}
            data-part={FlowerPart.Petal}
            class={cls("fl-petal", FlowerPart.Petal)}
            d={`M${x(d * 12)} ${y(40)} C ${x(d * 66)} ${y(50)} ${x(d * 92)} ${y(110)} ${x(d * 74)} ${y(140)} C ${x(d * 58)} ${y(118)} ${x(d * 36)} ${y(80)} ${x(d * 12)} ${y(48)} Z`}
            {...tap(FlowerPart.Petal)}
          />
        ))}
      <ellipse class="fl-receptacle" cx={cx} cy={y(38)} rx={22 * k} ry={6 * k} />
      {stamens &&
        petals &&
        [-1, 1].map((d) => (
          <g key={`st${d}`}>
            <line
              data-part={FlowerPart.Filament}
              class={cls("fl-filament", FlowerPart.Filament)}
              x1={x(d * 14)}
              y1={y(40)}
              x2={x(d * 40)}
              y2={y(118)}
              {...tap(FlowerPart.Filament)}
            />
            <ellipse
              data-part={FlowerPart.Anther}
              class={cls("fl-anther", FlowerPart.Anther)}
              cx={x(d * 42)}
              cy={y(124)}
              rx={6 * k}
              ry={10 * k}
              transform={`rotate(${d * 18} ${x(d * 42)} ${y(124)})`}
              {...tap(FlowerPart.Anther)}
            />
          </g>
        ))}
      {pistil && (
        <g>
          {fruit < 2 && (
            <g>
              <rect
                data-part={FlowerPart.Style}
                class={cls("fl-style", FlowerPart.Style)}
                x={cx - 3.5 * k}
                y={y(134)}
                width={7 * k}
                height={(134 - 60) * k}
                rx={3 * k}
                {...tap(FlowerPart.Style)}
              />
              <ellipse
                data-part={FlowerPart.Stigma}
                class={cls("fl-stigma", FlowerPart.Stigma)}
                cx={cx}
                cy={y(136)}
                rx={11 * k}
                ry={6 * k}
                {...tap(FlowerPart.Stigma)}
              />
            </g>
          )}
          <ellipse
            data-part={FlowerPart.Ovary}
            class={cls(fruit >= 1 ? "fl-ovary is-fruit" : "fl-ovary", FlowerPart.Ovary)}
            cx={cx}
            cy={y(58 + (fruit >= 1 ? 6 : 0))}
            rx={ovaryRx * k}
            ry={ovaryRy * k}
            {...tap(FlowerPart.Ovary)}
          />
          {[
            [-7, 62],
            [7, 62],
            [0, 50],
          ].map(([dx, dy], i) => (
            <circle
              key={`o${dx}${dy}`}
              data-part={FlowerPart.Ovule}
              class={cls(
                fruit >= 1
                  ? "fl-ovule is-seed"
                  : f.fused && i === 0
                    ? "fl-ovule is-zygote"
                    : "fl-ovule",
                FlowerPart.Ovule,
              )}
              cx={x((dx as number) * (fruit >= 1 ? 1.6 : 1))}
              cy={y((dy as number) + (fruit >= 1 ? 4 : 0))}
              r={(fruit >= 1 ? 6 : 4.5) * k}
              {...tap(FlowerPart.Ovule)}
            />
          ))}
        </g>
      )}
      {f.pollen && <circle class="fl-pollen" cx={x(-3)} cy={y(141)} r={4 * k} />}
      {(f.tube ?? 0) > 0 && (
        <path
          class="fl-tube"
          d={
            (f.tube ?? 0) === 1
              ? `M${x(-3)} ${y(139)} L${x(-1)} ${y(100)}`
              : `M${x(-3)} ${y(139)} L${x(-1)} ${y(90)} L${x(-1)} ${y(72)} Q ${x(-3)} ${y(66)} ${x(-6)} ${y(64)}`
          }
        />
      )}
    </g>
  );
}

const LABEL_AT: Readonly<
  Record<FlowerPart, { x: number; y: number; tx: number; ty: number; anchor: "start" | "end" }>
> = {
  stigma: { x: 160, y: 46, tx: 214, ty: 26, anchor: "start" },
  anther: { x: 202, y: 58, tx: 250, ty: 52, anchor: "start" },
  filament: { x: 190, y: 104, tx: 252, ty: 92, anchor: "start" },
  style: { x: 162, y: 88, tx: 96, ty: 26, anchor: "end" },
  petal: { x: 92, y: 80, tx: 54, ty: 66, anchor: "end" },
  ovary: { x: 146, y: 126, tx: 70, ty: 120, anchor: "end" },
  ovule: { x: 160, y: 132, tx: 252, ty: 132, anchor: "start" },
  sepal: { x: 120, y: 152, tx: 70, ty: 170, anchor: "end" },
};

function PartsPic({ s, t, onTap }: { s: FlowerState; t: T; onTap?: (p: FlowerPart) => void }) {
  return (
    <g>
      <FlowerLS cx={160} by={194} k={1} selected={s.selected} onTap={onTap} />
      {s.showNames &&
        (Object.keys(LABEL_AT) as FlowerPart[]).map((p) => {
          const a = LABEL_AT[p];
          return (
            <g key={p} class={s.selected === p ? "fl-name is-selected" : "fl-name"}>
              <line class="fl-leader" x1={a.x} y1={a.y} x2={a.tx} y2={a.ty - 4} />
              <Label x={a.tx} y={a.ty} text={t(NAMES[p])} anchor={a.anchor} />
            </g>
          );
        })}
    </g>
  );
}

function TypesPic({ s, t }: { s: FlowerState; t: T }) {
  if (s.flowerType === FlowerType.Bisexual)
    return (
      <g>
        <FlowerLS cx={160} by={190} k={0.95} />
        <Label x={160} y={196} text={t(L.hibiscus)} anchor="middle" />
      </g>
    );
  return (
    <g>
      <FlowerLS cx={84} by={180} k={0.82} pistil={false} />
      <FlowerLS cx={236} by={180} k={0.82} stamens={false} />
      <Label x={84} y={196} text={t(L.male)} anchor="middle" />
      <Label x={236} y={196} text={t(L.female)} anchor="middle" />
      <Label x={310} y={18} text={t(L.papaya)} anchor="end" cls="is-dim" />
    </g>
  );
}

function Bee({ x, y }: { x: number; y: number }) {
  return (
    <g class="fl-bee" transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={9} ry={6} />
      <line x1={-3} y1={-6} x2={-3} y2={6} />
      <line x1={3} y1={-6} x2={3} y2={6} />
      <ellipse class="fl-wing" cx={-2} cy={-9} rx={5} ry={4} />
      <ellipse class="fl-wing" cx={4} cy={-9} rx={5} ry={4} />
    </g>
  );
}

function PollinationPic({ s, t }: { s: FlowerState; t: T }) {
  const isSelf = s.pollination === Pollination.Self;
  return (
    <g>
      <FlowerLS cx={86} by={196} k={0.72} />
      <FlowerLS cx={238} by={196} k={0.72} pollen={!isSelf} />
      {isSelf ? (
        <g>
          <path class="fl-path" d="M116 106 Q 120 80 92 92" />
          <Arrow x1={98} y1={89} x2={90} y2={95} />
        </g>
      ) : (
        <g>
          <path class="fl-path" d="M116 106 Q 170 30 236 92" />
          <Arrow x1={228} y1={84} x2={236} y2={94} />
          {s.agent === Agent.Animal && <Bee x={170} y={56} />}
          {s.agent === Agent.Wind &&
            [44, 58, 72].map((yy) => (
              <path key={yy} class="fl-wind" d={`M136 ${yy} q 18 -8 36 0 t 36 0`} />
            ))}
          {s.agent === Agent.Water &&
            [
              [150, 52],
              [172, 46],
              [194, 54],
            ].map(([xx, yy]) => (
              <path key={`${xx}`} class="fl-drop" d={`M${xx} ${yy} q 4 6 0 9 q -4 -3 0 -9 z`} />
            ))}
        </g>
      )}
      <Label x={160} y={196} text={t(isSelf ? L.self : L.cross)} anchor="middle" cls="is-big" />
      <Label x={124} y={118} text={t(L.pollen)} cls="is-dim" />
    </g>
  );
}

function FertilisationPic({ s, t }: { s: FlowerState; t: T }) {
  const step = s.step;
  return (
    <g>
      <FlowerLS
        cx={160}
        by={200}
        k={1.08}
        pollen
        tube={step === 0 ? 0 : step === 1 ? 1 : 2}
        fused={step === 3}
      />
      <Label x={176} y={44} text={t(L.pollen)} />
      {step >= 1 && <Label x={196} y={100} text={t(L.tube)} />}
      {step === 3 && <Label x={110} y={132} text={t(L.zygote)} anchor="end" cls="is-good" />}
    </g>
  );
}

function FruitPic({ s, t }: { s: FlowerState; t: T }) {
  const step = s.step;
  return (
    <g>
      <FlowerLS
        cx={160}
        by={194}
        k={1}
        fruit={step}
        petals={step < 2}
        stamens={step < 2}
        fused={step === 0}
      />
      {step === 0 && <Label x={130} y={140} text={t(L.embryo)} anchor="end" cls="is-good" />}
      {step >= 1 && (
        <g>
          <Label x={200} y={128} text={t(L.fruit)} />
          <Label x={120} y={150} text={t(L.seed)} anchor="end" />
        </g>
      )}
      {step === 2 &&
        [
          [60, 190],
          [250, 192],
          [90, 194],
        ].map(([xx, yy]) => (
          <ellipse key={`${xx}`} class="fl-fallen" cx={xx} cy={yy} rx={12} ry={4} />
        ))}
      {step === 2 && <Label x={300} y={180} text={t(L.fallen)} anchor="end" cls="is-dim" />}
    </g>
  );
}

export function FlowerView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as FlowerState;
  const t: T = (w) => say(locale, w);
  const onTap =
    s.canTap && s.mode === FlowerMode.Parts
      ? (p: FlowerPart) => call(FlowerAction.Tap, { part: p })
      : undefined;
  const caption: Words = (() => {
    switch (s.mode) {
      case FlowerMode.Parts:
        return s.selected === null ? L.tapPart : JOBS[s.selected];
      case FlowerMode.Types:
        return s.flowerType === FlowerType.Bisexual
          ? {
              en: "Bisexual: both stamens and pistil in one flower.",
              hi: "उभयलिंगी: एक फूल में पुंकेसर और स्त्रीकेसर दोनों।",
            }
          : { en: "Unisexual: either stamens or a pistil.", hi: "एकलिंगी: या तो पुंकेसर या स्त्रीकेसर।" };
      case FlowerMode.Pollination:
        return s.pollination === Pollination.Self
          ? {
              en: "Self-pollination: pollen reaches the stigma of the same flower.",
              hi: "स्व-परागण: पराग उसी फूल के वर्तिकाग्र पर पहुँचता है।",
            }
          : {
              en: "Cross-pollination: pollen reaches another flower's stigma.",
              hi: "पर-परागण: पराग दूसरे फूल के वर्तिकाग्र पर पहुँचता है।",
            };
      case FlowerMode.Fertilisation:
        return (
          [
            { en: "Pollen lands on the stigma.", hi: "पराग वर्तिकाग्र पर गिरता है।" },
            {
              en: "A tube grows from the pollen down the style.",
              hi: "पराग से एक नलिका वर्तिका में नीचे बढ़ती है।",
            },
            { en: "The tube reaches an ovule.", hi: "नलिका बीजांड तक पहुँचती है।" },
            {
              en: "Male and female germ cells fuse: a zygote.",
              hi: "नर और मादा जनन कोशिकाएँ मिलती हैं: युग्मनज।",
            },
          ][s.step] ?? L.pollen
        );
      case FlowerMode.Fruit:
        return (
          [
            {
              en: "The zygote divides into an embryo inside the ovule.",
              hi: "युग्मनज बँटकर बीजांड में भ्रूण बनाता है।",
            },
            { en: "Ovule → seed; ovary → fruit.", hi: "बीजांड → बीज; अंडाशय → फल।" },
            { en: "The other parts shrivel and fall off.", hi: "बाकी भाग सूखकर गिर जाते हैं।" },
          ][s.step] ?? L.seed
        );
    }
  })();
  return (
    <div class="rp fl">
      {s.canChoose && s.mode === FlowerMode.Types && (
        <div data-part={FlowerPartId.Choices}>
          <Controls>
            {[FlowerType.Bisexual, FlowerType.Unisexual].map((ft) => (
              <Button
                key={ft}
                label={t(ft === FlowerType.Bisexual ? L.bisexual : L.unisexual)}
                isOn={s.flowerType === ft}
                onClick={() => call(FlowerAction.SetType, { flowerType: ft })}
              />
            ))}
          </Controls>
        </div>
      )}
      {s.canChoose && s.mode === FlowerMode.Pollination && (
        <div data-part={FlowerPartId.Choices}>
          <Controls>
            {[Pollination.Self, Pollination.Cross].map((p) => (
              <Button
                key={p}
                label={t(p === Pollination.Self ? L.self : L.cross)}
                isOn={s.pollination === p}
                onClick={() => call(FlowerAction.SetPollination, { pollination: p })}
              />
            ))}
            {s.pollination === Pollination.Cross &&
              [Agent.Animal, Agent.Wind, Agent.Water].map((a) => (
                <Button
                  key={a}
                  label={t(a === Agent.Animal ? L.animal : a === Agent.Wind ? L.wind : L.water)}
                  isOn={s.agent === a}
                  onClick={() => call(FlowerAction.SetAgent, { agent: a })}
                />
              ))}
          </Controls>
        </div>
      )}
      <Frame w={W} h={H} width={width} label={describeFlower(s)} cls="fl-svg">
        <rect class="fl-bg" x={0} y={0} width={W} height={H} />
        <g data-part={FlowerPartId.Picture} class={s.showNames ? "" : "rp-no-names"}>
          {s.mode === FlowerMode.Parts && <PartsPic s={s} t={t} onTap={onTap} />}
          {s.mode === FlowerMode.Types && <TypesPic s={s} t={t} />}
          {s.mode === FlowerMode.Pollination && <PollinationPic s={s} t={t} />}
          {s.mode === FlowerMode.Fertilisation && <FertilisationPic s={s} t={t} />}
          {s.mode === FlowerMode.Fruit && <FruitPic s={s} t={t} />}
        </g>
      </Frame>
      <Caption text={t(caption)} />
      {s.canStep && FLOWER_STEPS[s.mode] > 1 && (
        <Stepper
          step={s.step}
          count={FLOWER_STEPS[s.mode]}
          locale={locale}
          part={FlowerPartId.Next}
          onNext={() => call(FlowerAction.Next, {})}
          onReset={() => call(FlowerAction.Reset, {})}
        />
      )}
    </div>
  );
}
