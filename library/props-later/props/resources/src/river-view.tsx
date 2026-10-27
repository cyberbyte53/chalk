import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Button, Controls, Frame, Label, type Words, say } from "./draw";
import {
  Coliform,
  Fish,
  RiverAction,
  RiverMode,
  RiverPart,
  type RiverState,
  SOURCES,
  type Sample,
  Source,
  coliformOf,
  describeRiver,
  fishOf,
  isToxicOf,
} from "./river";

const W = 320;
const H = 200;

const SOURCE_WORDS: Readonly<Record<Source, Words>> = {
  sewage: { en: "sewage", hi: "सीवेज" },
  garbage: { en: "garbage", hi: "कचरा" },
  bathing: { en: "bathing, washing", hi: "नहाना, धोना" },
  ashes: { en: "ashes", hi: "राख" },
  industry: { en: "factory waste", hi: "कारख़ाने का कचरा" },
};
const COLIFORM_WORDS: Readonly<Record<Coliform, Words>> = {
  low: { en: "low", hi: "कम" },
  high: { en: "high", hi: "ज़्यादा" },
  veryHigh: { en: "very high", hi: "बहुत ज़्यादा" },
};
const FISH_WORDS: Readonly<Record<Fish, Words>> = {
  thriving: { en: "fish thrive", hi: "मछलियाँ ठीक हैं" },
  few: { en: "few fish", hi: "मछलियाँ कम" },
  dying: { en: "fish dying", hi: "मछलियाँ मर रही हैं" },
};
const SAMPLE_WORDS: Readonly<Record<Sample, Words>> = {
  tap: { en: "tap", hi: "नल" },
  pond: { en: "pond", hi: "तालाब" },
  river: { en: "river", hi: "नदी" },
  rain: { en: "rain", hi: "बारिश" },
  drain: { en: "drain", hi: "नाला" },
  well: { en: "well", hi: "कुआँ" },
};
const WORDS = {
  coliform: { en: "coliform", hi: "कोलिफ़ॉर्म" },
  treat: { en: "Sewage treatment plant", hi: "सीवेज शोधन संयंत्र" },
  treated: { en: "treated", hi: "शोधित" },
  toxic: { en: "toxic", hi: "ज़हरीला" },
  town: { en: "town", hi: "शहर" },
  untested: { en: "add indicator", hi: "सूचक डालो" },
  test: { en: "Test", hi: "जाँचो" },
  wash: { en: "Wash the tubes", hi: "नलियाँ धोओ" },
} as const satisfies Record<string, Words>;

/** A small picture for each source on the river bank, centred on (x, y). */
function SourceIcon({
  source,
  x,
  y,
  isOn,
}: { source: Source; x: number; y: number; isOn: boolean }) {
  const cls = isOn ? "rs-src is-on" : "rs-src";
  switch (source) {
    case Source.Sewage:
      return (
        <g class={cls}>
          <rect class="rs-pipe" x={x - 10} y={y - 6} width={20} height={8} rx={2} />
          {isOn && <path class="rs-murk" d={`M${x + 8} ${y} q 4 8 2 18`} />}
        </g>
      );
    case Source.Garbage:
      return (
        <g class={cls}>
          <path class="rs-heap" d={`M${x - 12} ${y + 4} q 12 -18 24 0 z`} />
          <circle class="rs-heap-bit" cx={x - 3} cy={y - 2} r={2} />
          <rect class="rs-heap-bit" x={x + 2} y={y - 4} width={4} height={3} />
        </g>
      );
    case Source.Bathing:
      return (
        <g class={cls}>
          <circle class="rs-person-dot" cx={x} cy={y - 6} r={3.5} />
          <rect class="rs-person-dot" x={x - 3} y={y - 3} width={6} height={8} rx={2} />
          <rect class="rs-cloth" x={x + 5} y={y} width={8} height={4} rx={1} />
        </g>
      );
    case Source.Ashes:
      return (
        <g class={cls}>
          <path class="rs-pot" d={`M${x - 7} ${y - 4} h14 q 0 10 -7 10 q -7 0 -7 -10 z`} />
          <circle class="rs-ash" cx={x} cy={y - 6} r={2.5} />
        </g>
      );
    default:
      return (
        <g class={cls}>
          <path
            class="rs-factory"
            d={`M${x - 12} ${y + 4} v-12 l6 4 v-4 l6 4 v-4 l6 4 v-6 h4 v14 z`}
          />
          {isOn && <path class="rs-toxic" d={`M${x + 12} ${y + 4} q 2 8 -2 16`} />}
        </g>
      );
  }
}

function FishShape({ x, y, isDead }: { x: number; y: number; isDead: boolean }) {
  return (
    <g class={isDead ? "rs-fish is-dead" : "rs-fish"} transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={7} ry={3.5} />
      <path d="M6 0 l5 -4 v8 z" />
      {isDead ? (
        <path class="rs-fish-eye" d="M-4 -2 l2 2 m0 -2 l-2 2" />
      ) : (
        <circle class="rs-fish-eye" cx={-4} cy={-0.8} r={0.9} />
      )}
    </g>
  );
}

function RiverPicture({ s, locale }: { s: RiverState; locale: string }) {
  const coliform = coliformOf(s);
  const fish = fishOf(s);
  const xs = [44, 104, 164, 224, 284];
  return (
    <>
      <rect class="rs-sky" x={0} y={0} width={W} height={H} />
      <rect class="rs-bank" x={0} y={34} width={W} height={52} />
      <g data-part={RiverPart.Town}>
        <Label x={10} y={14} text={say(locale, WORDS.town)} cls="is-dim" />
        {SOURCES.map((src, i) => (
          <g key={src}>
            <SourceIcon source={src} x={xs[i] ?? 0} y={62} isOn={s.sources.includes(src)} />
            {s.showNames && (
              <Label
                x={xs[i] ?? 0}
                y={44}
                text={say(locale, SOURCE_WORDS[src])}
                anchor="middle"
                cls={s.sources.includes(src) ? "is-small" : "is-small is-dim"}
              />
            )}
          </g>
        ))}
        {s.isTreated && (
          <g>
            <rect class="rs-plant" x={4} y={70} width={24} height={14} rx={3} />
            <Label x={16} y={81} text="STP" anchor="middle" cls="is-small" />
          </g>
        )}
      </g>
      <g data-part={RiverPart.River}>
        <rect
          class={`rs-river is-${coliform}${isToxicOf(s) ? " is-toxic" : ""}`}
          x={0}
          y={86}
          width={W}
          height={84}
        />
        <path class="rs-flow rs-ripple" d="M10 110 h300" />
        <path class="rs-flow rs-ripple" d="M10 146 h300" />
        {fish === Fish.Thriving && (
          <>
            <FishShape x={70} y={124} isDead={false} />
            <FishShape x={150} y={136} isDead={false} />
            <FishShape x={230} y={120} isDead={false} />
          </>
        )}
        {fish === Fish.Few && <FishShape x={150} y={130} isDead={false} />}
        {fish === Fish.Dying && (
          <>
            <FishShape x={90} y={96} isDead={true} />
            <FishShape x={210} y={98} isDead={true} />
          </>
        )}
        <rect class="rs-meter" x={8} y={174} width={W - 16} height={20} rx={6} />
        <Label
          x={16}
          y={188}
          text={`${say(locale, WORDS.coliform)}: ${say(locale, COLIFORM_WORDS[coliform])}`}
          cls={coliform === Coliform.Low ? "is-good" : "is-bad"}
        />
        <Label
          x={W - 16}
          y={188}
          text={`${say(locale, FISH_WORDS[fish])}${isToxicOf(s) ? ` · ${say(locale, WORDS.toxic)}` : ""}`}
          anchor="end"
          cls={fish === Fish.Thriving ? "is-good" : "is-bad"}
        />
      </g>
    </>
  );
}

function PhPicture({ s, locale }: { s: RiverState; locale: string }) {
  const n = s.samples.length;
  const step = W / (n + 1);
  return (
    <>
      <rect class="rs-bg" x={0} y={0} width={W} height={H} />
      <g data-part={RiverPart.Samples}>
        <rect class="rs-rack" x={20} y={150} width={W - 40} height={10} rx={3} />
        {s.samples.map((x, i) => {
          const cx = step * (i + 1);
          const isTested = s.tested.includes(x.sample);
          const ph = Math.max(0, Math.min(14, Math.round(x.ph)));
          return (
            <g key={x.sample}>
              <path class="rs-tube" d={`M${cx - 12} 40 v92 a12 12 0 0 0 24 0 v-92`} />
              <path
                class={isTested ? `rs-liquid rs-ph-${ph}` : "rs-liquid is-plain"}
                d={`M${cx - 11} 80 v52 a11 11 0 0 0 22 0 v-52 z`}
              />
              <Label x={cx} y={30} text={say(locale, SAMPLE_WORDS[x.sample])} anchor="middle" />
              <Label
                x={cx}
                y={178}
                text={isTested ? `pH ${x.ph}` : say(locale, WORDS.untested)}
                anchor="middle"
                cls={isTested ? "is-big" : "is-dim is-small"}
              />
            </g>
          );
        })}
      </g>
    </>
  );
}

/** The river and its town, or the pH bench (Activity 16.3). */
export function RiverHealthView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as RiverState;
  return (
    <div class="rs rs-river-prop">
      <Frame w={W} h={H} width={width} label={describeRiver(s)} cls="rs-river-svg">
        {s.mode === RiverMode.Ph ? (
          <PhPicture s={s} locale={locale} />
        ) : (
          <RiverPicture s={s} locale={locale} />
        )}
      </Frame>
      {s.mode === RiverMode.River && (s.canToggle || s.canTreat) && (
        <Controls>
          {s.canToggle && (
            <span class="rs-row">
              {SOURCES.map((src) => (
                <Button
                  key={src}
                  label={say(locale, SOURCE_WORDS[src])}
                  isOn={s.sources.includes(src)}
                  onClick={() =>
                    call(RiverAction.SetSource, { source: src, on: !s.sources.includes(src) })
                  }
                />
              ))}
            </span>
          )}
          {s.canTreat && (
            <Button
              label={say(locale, WORDS.treat)}
              isOn={s.isTreated}
              onClick={() => call(RiverAction.SetTreatment, { on: !s.isTreated })}
            />
          )}
        </Controls>
      )}
      {s.mode === RiverMode.Ph && s.canTest && (
        <Controls>
          <span class="rs-row">
            {s.samples.map((x) => (
              <Button
                key={x.sample}
                label={`${say(locale, WORDS.test)}: ${say(locale, SAMPLE_WORDS[x.sample])}`}
                isOn={s.tested.includes(x.sample)}
                onClick={() => call(RiverAction.Test, { sample: x.sample })}
              />
            ))}
          </span>
          {s.tested.length > 0 && (
            <Button label={say(locale, WORDS.wash)} onClick={() => call(RiverAction.Clear, {})} />
          )}
        </Controls>
      )}
    </div>
  );
}
