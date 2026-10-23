import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Button, Controls, Dots, Frame, Label, type Words, say } from "./draw";
import {
  KULH_VILLAGES,
  SCHEMES,
  SCHEME_FACTS,
  SCHEME_POINTS,
  type Scheme,
  type SchemePoint,
  WaterAction,
  WaterMode,
  WaterPart,
  type WaterState,
  describeWater,
  stepCountOf,
  wateredOf,
  wellLevelOf,
} from "./water";

const W = 320;
const H = 190;

const KHADIN_WORDS: readonly Words[] = [
  { en: "Monsoon rain runs down the slopes.", hi: "मानसून की बारिश ढलानों से बहती है।" },
  {
    en: "The water collects behind the embankment.",
    hi: "पानी मेड़ (बाँध) के पीछे जमा होता है।",
  },
  {
    en: "It soaks in: the groundwater rises and the well fills.",
    hi: "यह ज़मीन में रिसता है: भूजल ऊपर आता है और कुआँ भरता है।",
  },
  {
    en: "A crop grows on the moist bed.",
    hi: "नम ज़मीन पर फ़सल उगती है।",
  },
];
const KULH_WORDS: readonly Words[] = [
  { en: "The kulh brings stream water down the hill.", hi: "कुहल नाले का पानी पहाड़ी से नीचे लाती है।" },
  {
    en: "Planting season: the farthest village gets water first…",
    hi: "बुआई का मौसम: सबसे दूर के गाँव को पहले पानी…",
  },
  { en: "…then the next village up…", hi: "…फिर उससे ऊपर वाले गाँव को…" },
  { en: "…and the next…", hi: "…फिर अगले को…" },
  {
    en: "…and last, the village nearest the source. Shared by agreement.",
    hi: "…और आख़िर में स्रोत के सबसे पास वाले गाँव को। आपसी सहमति से बँटवारा।",
  },
];
const POINT_WORDS: Readonly<Record<SchemePoint, Words>> = {
  storedIn: { en: "Water kept", hi: "पानी कहाँ" },
  evaporates: { en: "Evaporation", hi: "भाप" },
  mosquitoes: { en: "Mosquitoes", hi: "मच्छर" },
  recharges: { en: "Wells", hi: "कुएँ" },
  whoGets: { en: "Who gets it", hi: "किसे मिलता" },
  displaces: { en: "People", hi: "लोग" },
  cost: { en: "Money", hi: "पैसा" },
  forest: { en: "Forest", hi: "जंगल" },
};
const SCHEME_WORDS: Readonly<Record<Scheme, Words>> = {
  bigDam: { en: "Big dam and canal", hi: "बड़ा बाँध और नहर" },
  checkDam: { en: "Local check dams", hi: "स्थानीय रोक बाँध" },
};
const WORDS = {
  next: { en: "Next →", hi: "आगे →" },
  again: { en: "From the start", hi: "शुरू से" },
  source: { en: "stream", hi: "नाला" },
  village: { en: "village", hi: "गाँव" },
  well: { en: "well", hi: "कुआँ" },
  bund: { en: "embankment", hi: "मेड़" },
  ground: { en: "groundwater", hi: "भूजल" },
  pick: { en: "Pick one to compare", hi: "तुलना के लिए एक चुनो" },
} as const satisfies Record<string, Words>;

function KulhPicture({ s, locale }: { s: WaterState; locale: string }) {
  const watered = wateredOf(s);
  // Villages down the slope: 1 nearest the source (top left) … 4 farthest (bottom right).
  const spots: [number, number][] = [
    [80, 62],
    [140, 96],
    [200, 128],
    [262, 160],
  ];
  return (
    <>
      <rect class="rs-sky" x={0} y={0} width={W} height={H} />
      <path class="rs-hill" d="M0 30 L320 175 L320 190 L0 190 Z" />
      <path class="rs-stream" d="M8 12 q 10 10 20 20" />
      {s.showNames && (
        <Label x={10} y={10} text={say(locale, WORDS.source)} cls="is-small is-dim" />
      )}
      <path class="rs-kulh" d="M28 32 L280 168" />
      {s.step > 0 && <path class="rs-flow rs-kulh-water" d="M28 32 L280 168" />}
      {spots.map(([x, y], i) => {
        const n = i + 1;
        const isWet = watered.includes(n);
        return (
          <g key={n}>
            <rect
              class={isWet ? "rs-field is-wet" : "rs-field"}
              x={x - 22}
              y={y + 6}
              width={44}
              height={10}
              rx={3}
            />
            <path class="rs-hut" d={`M${x - 8} ${y + 6} v-8 l8 -7 l8 7 v8 z`} />
            <Label
              x={x}
              y={y - 12}
              text={`${n}`}
              anchor="middle"
              cls={isWet ? "is-good" : "is-dim"}
            />
          </g>
        );
      })}
      {s.showNames && (
        <Label
          x={300}
          y={186}
          text={`${say(locale, WORDS.village)} ${KULH_VILLAGES}`}
          anchor="end"
          cls="is-small is-dim"
        />
      )}
    </>
  );
}

function KhadinPicture({ s, locale }: { s: WaterState; locale: string }) {
  const k = s.step;
  const well = wellLevelOf(s);
  return (
    <>
      <rect class="rs-sky" x={0} y={0} width={W} height={H} />
      {k === 0 &&
        [40, 70, 100, 130].map((x) => <path key={x} class="rs-rain" d={`M${x} 10 l-4 12`} />)}
      <path class="rs-slope" d="M0 60 L130 118 L130 130 L0 130 Z" />
      {k === 0 && <path class="rs-flow rs-runoff" d="M10 70 L120 116" />}
      <rect class="rs-soil" x={0} y={130} width={W} height={60} />
      <path class="rs-bund" d="M230 130 q 10 -24 22 -24 q 12 0 22 24 z" />
      {s.showNames && (
        <Label x={252} y={100} text={say(locale, WORDS.bund)} anchor="middle" cls="is-small" />
      )}
      {k === 1 && <path class="rs-pond" d="M130 130 L230 130 L230 116 Q 180 110 130 120 Z" />}
      {k >= 3 &&
        [150, 170, 190, 210].map((x) => (
          <path key={x} class="rs-crop" d={`M${x} 130 v-14 m0 4 l-5 -4 m5 6 l5 -4`} />
        ))}
      <rect
        class={`rs-groundwater is-${well}`}
        x={0}
        y={well >= 2 ? 150 : well >= 1 ? 162 : 174}
        width={W}
        height={40}
      />
      {s.showNames && <Label x={8} y={186} text={say(locale, WORDS.ground)} cls="is-small" />}
      {k >= 2 && <path class="rs-flow rs-seep" d="M180 132 L180 150" />}
      <g>
        <rect class="rs-well" x={286} y={112} width={20} height={70} rx={2} />
        <rect
          class={`rs-well-water is-${well}`}
          x={288}
          y={well >= 2 ? 150 : well >= 1 ? 162 : 174}
          width={16}
          height={well >= 2 ? 30 : well >= 1 ? 18 : 6}
        />
        {s.showNames && (
          <Label x={296} y={106} text={say(locale, WORDS.well)} anchor="middle" cls="is-small" />
        )}
      </g>
    </>
  );
}

function CompareTable({ s, locale }: { s: WaterState; locale: string }) {
  if (s.choice === null) return <p class="rs-caption is-dim">{say(locale, WORDS.pick)}</p>;
  const f = SCHEME_FACTS[s.choice];
  return (
    <ul class="rs-water-table" data-part={WaterPart.Table}>
      {SCHEME_POINTS.map((p) => (
        <li key={p} class={f[p].good ? "is-good" : "is-bad"}>
          <span class="rs-water-point">{say(locale, POINT_WORDS[p])}</span>
          <span>{`${f[p].good ? "✓" : "✗"} ${say(locale, f[p].w)}`}</span>
        </li>
      ))}
    </ul>
  );
}

/** Kulhs, a khadin, or a big dam vs check dams. */
export function WaterHarvestView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as WaterState;
  if (s.mode === WaterMode.Compare) {
    return (
      <div class="rs rs-harvest">
        <CompareTable s={s} locale={locale} />
        {s.canPick && (
          <Controls>
            {SCHEMES.map((x) => (
              <Button
                key={x}
                label={say(locale, SCHEME_WORDS[x])}
                isOn={s.choice === x}
                onClick={() => call(WaterAction.Pick, { scheme: x })}
              />
            ))}
          </Controls>
        )}
      </div>
    );
  }
  const count = stepCountOf(s.mode);
  const line = (s.mode === WaterMode.Kulh ? KULH_WORDS : KHADIN_WORDS)[s.step];
  return (
    <div class="rs rs-harvest">
      <Frame w={W} h={H} width={width} label={describeWater(s)} cls="rs-water-svg">
        <g data-part={WaterPart.Picture}>
          {s.mode === WaterMode.Kulh ? (
            <KulhPicture s={s} locale={locale} />
          ) : (
            <KhadinPicture s={s} locale={locale} />
          )}
        </g>
      </Frame>
      <p class="rs-caption">{line === undefined ? "" : say(locale, line)}</p>
      {s.canStep && (
        <Controls>
          <Dots step={s.step} count={count} />
          {s.step < count - 1 ? (
            <Button label={say(locale, WORDS.next)} onClick={() => call(WaterAction.Next, {})} />
          ) : (
            <Button label={say(locale, WORDS.again)} onClick={() => call(WaterAction.Reset, {})} />
          )}
        </Controls>
      )}
    </div>
  );
}
