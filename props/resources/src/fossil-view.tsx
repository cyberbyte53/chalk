import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Button, Controls, Frame, Label, Stepper, type Words, say } from "./draw";
import {
  Air,
  CHOICE_OPTIONS,
  COAL_YEARS,
  CUT_STEP,
  type Choice,
  FossilAction,
  FossilMode,
  FossilPart,
  type FossilState,
  MAX_CUT,
  PETROLEUM_YEARS,
  Product,
  describeFossil,
  poisonousOf,
  productsOf,
  yearsOf,
} from "./fossil";

const W = 320;
const H = 170;
/** Last mode: years shown across the bar area. */
const SPAN = 420;

const PRODUCT_WORDS: Readonly<Record<Product, { f: string; w: Words }>> = {
  carbonDioxide: { f: "CO₂", w: { en: "carbon dioxide", hi: "कार्बन डाइऑक्साइड" } },
  carbonMonoxide: { f: "CO", w: { en: "carbon monoxide", hi: "कार्बन मोनोऑक्साइड" } },
  water: { f: "H₂O", w: { en: "water", hi: "जल" } },
  nitrogenOxides: { f: "NOₓ", w: { en: "oxides of nitrogen", hi: "नाइट्रोजन के ऑक्साइड" } },
  sulphurOxides: { f: "SOₓ", w: { en: "oxides of sulphur", hi: "सल्फ़र के ऑक्साइड" } },
};
const CHOICE_WORDS: Readonly<Record<Choice, Words>> = {
  travel: { en: "Going 2 km to the market", hi: "2 किमी बाज़ार जाना" },
  light: { en: "Lighting the house", hi: "घर की रोशनी" },
  floors: { en: "Going up to the 4th floor", hi: "चौथी मंज़िल तक जाना" },
  cold: { en: "A cold evening", hi: "ठंडी शाम" },
};
const OPTION_WORDS: Readonly<Record<string, Words>> = {
  walkCycle: { en: "walk or cycle", hi: "पैदल या साइकिल" },
  bus: { en: "bus", hi: "बस" },
  ownVehicle: { en: "own scooter or car", hi: "अपना स्कूटर या कार" },
  led: { en: "LED bulbs", hi: "LED बल्ब" },
  tube: { en: "fluorescent tubes", hi: "ट्यूबलाइट" },
  stairs: { en: "stairs", hi: "सीढ़ियाँ" },
  lift: { en: "lift", hi: "लिफ़्ट" },
  sweater: { en: "an extra sweater", hi: "एक और स्वेटर" },
  heater: { en: "a heater or sigri", hi: "हीटर या सिगड़ी" },
};
const WORDS = {
  petroleum: { en: "petroleum", hi: "पेट्रोलियम" },
  coal: { en: "coal", hi: "कोयला" },
  years: { en: "years", hi: "साल" },
  now: { en: "now", hi: "अभी" },
  useLess: { en: "Use less", hi: "कम इस्तेमाल" },
  enough: { en: "Enough air", hi: "पर्याप्त हवा" },
  little: { en: "Too little air", hi: "बहुत कम हवा" },
  fuel: { en: "coal / petrol", hi: "कोयला / पेट्रोल" },
  poison: { en: "poisonous", hi: "ज़हरीला" },
  greenhouse: { en: "greenhouse gas", hi: "ग्रीनहाउस गैस" },
  less: { en: "uses less fuel", hi: "कम ईंधन" },
  more: { en: "uses more fuel", hi: "ज़्यादा ईंधन" },
} as const satisfies Record<string, Words>;

function LastPicture({ s, locale }: { s: FossilState; locale: string }) {
  const x0 = 70;
  const k = (W - x0 - 16) / SPAN;
  const rows: [Words, number, number][] = [
    [WORDS.petroleum, PETROLEUM_YEARS, yearsOf(PETROLEUM_YEARS, s.cut)],
    [WORDS.coal, COAL_YEARS, yearsOf(COAL_YEARS, s.cut)],
  ];
  return (
    <g data-part={FossilPart.Bars}>
      <rect class="rs-bg" x={0} y={0} width={W} height={H} />
      <Label x={x0} y={20} text={say(locale, WORDS.now)} anchor="middle" cls="is-dim" />
      <line class="rs-axis" x1={x0} y1={26} x2={x0} y2={140} />
      {[100, 200, 300, 400].map((t) => (
        <g key={t}>
          <line class="rs-tick" x1={x0 + t * k} y1={136} x2={x0 + t * k} y2={142} />
          <Label x={x0 + t * k} y={156} text={`${t}`} anchor="middle" cls="is-small is-dim" />
        </g>
      ))}
      <Label x={W - 8} y={168} text={say(locale, WORDS.years)} anchor="end" cls="is-small is-dim" />
      {rows.map(([name, base, years], i) => {
        const y = 40 + i * 48;
        return (
          <g key={name.en}>
            <Label x={x0 - 6} y={y + 16} text={say(locale, name)} anchor="end" />
            <rect class="rs-bar-base" x={x0} y={y} width={base * k} height={24} rx={4} />
            {years > base && (
              <rect
                class="rs-bar-extra"
                x={x0 + base * k}
                y={y}
                width={(years - base) * k}
                height={24}
                rx={4}
              />
            )}
            {x0 + years * k > W - 50 ? (
              <Label
                x={x0 + years * k - 6}
                y={y + 17}
                text={`≈${years}`}
                anchor="end"
                cls="is-big rs-in-bar"
              />
            ) : (
              <Label x={x0 + years * k + 6} y={y + 16} text={`≈${years}`} cls="is-big" />
            )}
          </g>
        );
      })}
    </g>
  );
}

function BurnPicture({ s, locale }: { s: FossilState; locale: string }) {
  const out = productsOf(s.air);
  const bad = poisonousOf(s.air);
  return (
    <g data-part={FossilPart.Flame}>
      <rect class="rs-bg" x={0} y={0} width={W} height={H} />
      <rect class="rs-lump" x={30} y={110} width={64} height={30} rx={8} />
      <Label x={62} y={130} text="C H N S" anchor="middle" cls="is-big rs-on-dark" />
      <Label x={62} y={156} text={say(locale, WORDS.fuel)} anchor="middle" cls="is-small is-dim" />
      <path
        class={s.air === Air.Enough ? "rs-flame" : "rs-flame is-smoky"}
        d="M62 108 q -18 -22 0 -52 q 6 18 14 22 q 6 -12 2 -24 q 16 22 0 54 z"
      />
      {out.map((p, i) => {
        const y = 22 + i * 36;
        const isBad = bad.includes(p);
        return (
          <g key={p}>
            <Arrow x1={110} y1={82} x2={170} y2={y + 4} cls="rs-out" />
            <rect
              class={isBad ? "rs-gas is-bad" : "rs-gas"}
              x={176}
              y={y - 12}
              width={136}
              height={30}
              rx={8}
            />
            <Label x={186} y={y + 4} text={PRODUCT_WORDS[p].f} cls="is-big" />
            <Label
              x={222}
              y={y + 4}
              text={
                p === Product.CarbonDioxide
                  ? say(locale, WORDS.greenhouse)
                  : isBad
                    ? say(locale, WORDS.poison)
                    : say(locale, PRODUCT_WORDS[p].w)
              }
              cls={isBad ? "is-small is-bad" : "is-small"}
            />
          </g>
        );
      })}
    </g>
  );
}

function ChoiceList({
  s,
  locale,
  call,
}: { s: FossilState; locale: string; call: PropViewProps["call"] }) {
  return (
    <ul class="rs-choice-list" data-part={FossilPart.Choices}>
      {s.choices.map((c) => {
        const pick = s.picks.find((p) => p.choice === c);
        const best = CHOICE_OPTIONS[c].best;
        return (
          <li key={c}>
            <span class="rs-choice-ask">{say(locale, CHOICE_WORDS[c])}</span>
            <span class="rs-row">
              {CHOICE_OPTIONS[c].options.map((o) => (
                <Button
                  key={o}
                  label={say(locale, OPTION_WORDS[o] ?? { en: o, hi: o })}
                  isOn={pick?.option === o}
                  isDisabled={!s.canPick}
                  onClick={() => call(FossilAction.Pick, { choice: c, option: o })}
                />
              ))}
            </span>
            {pick !== undefined && (
              <span
                class={pick.option === best ? "rs-choice-note is-good" : "rs-choice-note is-bad"}
              >
                {pick.option === best
                  ? `✓ ${say(locale, WORDS.less)}`
                  : `✗ ${say(locale, WORDS.more)}`}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** How long coal and petroleum last, what burning them gives, and everyday choices. */
export function FossilClockView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as FossilState;
  if (s.mode === FossilMode.Choices)
    return (
      <div class="rs rs-fossil">
        <ChoiceList s={s} locale={locale} call={call} />
      </div>
    );
  return (
    <div class="rs rs-fossil">
      <Frame w={W} h={H} width={width} label={describeFossil(s)} cls="rs-fossil-svg">
        {s.mode === FossilMode.Last ? (
          <LastPicture s={s} locale={locale} />
        ) : (
          <BurnPicture s={s} locale={locale} />
        )}
      </Frame>
      {s.mode === FossilMode.Last && s.canSetCut && (
        <Controls>
          <Stepper
            label={`${say(locale, WORDS.useLess)} (×${CUT_STEP}%)`}
            value={s.cut / CUT_STEP}
            max={MAX_CUT / CUT_STEP}
            onSet={(n) => call(FossilAction.SetCut, { cut: n * CUT_STEP })}
          />
          <span class="rs-cut">{`${s.cut}%`}</span>
        </Controls>
      )}
      {s.mode === FossilMode.Burn && s.canSetAir && (
        <Controls>
          <Button
            label={say(locale, WORDS.enough)}
            isOn={s.air === Air.Enough}
            onClick={() => call(FossilAction.SetAir, { air: Air.Enough })}
          />
          <Button
            label={say(locale, WORDS.little)}
            isOn={s.air === Air.Little}
            onClick={() => call(FossilAction.SetAir, { air: Air.Little })}
          />
        </Controls>
      )}
    </div>
  );
}
