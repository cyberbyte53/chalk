import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Button, Controls, Dots, Frame, Label, Person, type Words, say } from "./draw";
import {
  CASE_STEPS,
  type Dependence,
  ForestCase,
  STAKEHOLDERS,
  STAKE_FACTS,
  StakeAction,
  StakeMode,
  StakePart,
  type StakeState,
  Stakeholder,
  describeStakeholders,
  stepCountOf,
} from "./stakeholders";

const W = 320;
const H = 190;

const SHORT: Readonly<Record<Stakeholder, Words>> = {
  local: { en: "local people", hi: "स्थानीय लोग" },
  department: { en: "Forest Dept.", hi: "वन विभाग" },
  industry: { en: "industry", hi: "उद्योग" },
  enthusiast: { en: "nature lovers", hi: "प्रकृति प्रेमी" },
};
const DEP_WORDS: Readonly<Record<Dependence, Words>> = {
  high: { en: "depend on it a lot", hi: "इस पर बहुत निर्भर" },
  some: { en: "depend on it partly", hi: "इस पर कुछ निर्भर" },
  none: { en: "don't depend on this forest", hi: "इस जंगल पर निर्भर नहीं" },
};
const CASE_WORDS: Readonly<Record<ForestCase, Words>> = {
  bishnoi: { en: "Bishnois", hi: "बिश्नोई" },
  himalayan: { en: "Himalayan park", hi: "हिमालयन पार्क" },
  chipko: { en: "Chipko", hi: "चिपको" },
  arabari: { en: "Arabari", hi: "अराबाड़ी" },
};
const WORDS = {
  forest: { en: "forest", hi: "जंगल" },
  tap: { en: "Tap a stakeholder", hi: "किसी हितधारक पर टैप करो" },
  long: { en: "need this forest to last", hi: "इस जंगल का बने रहना ज़रूरी" },
  short: { en: "can move on to another forest", hi: "दूसरे जंगल में जा सकते हैं" },
  next: { en: "Next →", hi: "आगे →" },
  again: { en: "From the start", hi: "शुरू से" },
} as const satisfies Record<string, Words>;

function Tree({
  x,
  y,
  s = 1,
  kind = "round",
}: { x: number; y: number; s?: number; kind?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect class="rs-trunk" x={-1.6} y={-10} width={3.2} height={10} />
      {kind === "pine" ? (
        <path class="rs-leaves" d="M0 -32 L10 -10 L-10 -10 Z" />
      ) : (
        <circle class="rs-leaves" cx={0} cy={-16} r={10} />
      )}
    </g>
  );
}

function StakeIcon({ who, x, y }: { who: Stakeholder; x: number; y: number }) {
  switch (who) {
    case Stakeholder.Local:
      return (
        <g>
          <Person who="mom" x={x - 6} y={y + 14} s={0.6} />
          <path class="rs-basket" d={`M${x + 2} ${y + 4} h12 l-2 8 h-8 z`} />
        </g>
      );
    case Stakeholder.Department:
      return (
        <g>
          <rect class="rs-office" x={x - 12} y={y - 4} width={24} height={18} rx={2} />
          <line class="rs-flagpole" x1={x + 10} y1={y - 4} x2={x + 10} y2={y - 16} />
          <path class="rs-flag" d={`M${x + 10} ${y - 16} h9 v5 h-9 z`} />
        </g>
      );
    case Stakeholder.Industry:
      return (
        <g>
          <path
            class="rs-factory"
            d={`M${x - 14} ${y + 14} v-12 l7 5 v-5 l7 5 v-5 l7 5 v-10 h4 v17 z`}
          />
          <rect class="rs-log" x={x - 16} y={y + 14} width={14} height={4} rx={2} />
        </g>
      );
    default:
      return (
        <g>
          <circle class="rs-lens" cx={x - 5} cy={y + 4} r={5} />
          <circle class="rs-lens" cx={x + 5} cy={y + 4} r={5} />
          <rect class="rs-lens-bar" x={x - 2} y={y + 2} width={4} height={3} />
        </g>
      );
  }
}

const CORNERS: Readonly<Record<Stakeholder, [number, number]>> = {
  local: [50, 40],
  department: [270, 40],
  industry: [270, 140],
  enthusiast: [50, 140],
};

function MapPicture({
  s,
  locale,
  call,
}: { s: StakeState; locale: string; call: PropViewProps["call"] }) {
  return (
    <>
      <rect class="rs-bg" x={0} y={0} width={W} height={H} />
      <g data-part={StakePart.Forest}>
        <ellipse class="rs-forest-floor" cx={160} cy={110} rx={78} ry={52} />
        <Tree x={130} y={110} />
        <Tree x={160} y={96} s={1.2} kind="pine" />
        <Tree x={190} y={112} />
        <Tree x={146} y={140} s={0.9} />
        <Tree x={178} y={142} s={0.9} kind="pine" />
        <Label x={160} y={166} text={say(locale, WORDS.forest)} anchor="middle" cls="is-dim" />
      </g>
      <g data-part={StakePart.Stakeholders}>
        {STAKEHOLDERS.map((who) => {
          const [x, y] = CORNERS[who];
          const isSel = s.selected === who;
          return (
            // biome-ignore lint/a11y/useKeyWithClickEvents: the buttons under the picture do the same
            <g
              key={who}
              class={isSel ? "rs-stake is-sel" : "rs-stake"}
              onClick={() => s.canTap && call(StakeAction.Pick, { who })}
            >
              <rect class="rs-stake-card" x={x - 44} y={y - 26} width={88} height={52} rx={8} />
              <StakeIcon who={who} x={x} y={y - 10} />
              <Label x={x} y={y + 20} text={say(locale, SHORT[who])} anchor="middle" />
              <line
                class={`rs-tie is-${STAKE_FACTS[who].dependence}`}
                x1={x < 160 ? x + 44 : x - 44}
                y1={y}
                x2={x < 160 ? 110 : 210}
                y2={y < 100 ? 90 : 128}
              />
            </g>
          );
        })}
      </g>
    </>
  );
}

function CasePicture({ s, locale }: { s: StakeState; locale: string }) {
  const k = s.step;
  switch (s.case) {
    case ForestCase.Bishnoi:
      return (
        <>
          <rect class="rs-desert" x={0} y={0} width={W} height={H} />
          <rect class="rs-sand" x={0} y={140} width={W} height={50} />
          <Tree x={110} y={150} s={1.5} />
          <Tree x={210} y={150} s={1.3} />
          <Label
            x={110}
            y={170}
            text={say(locale, { en: "khejri", hi: "खेजड़ी" })}
            anchor="middle"
            cls="is-dim"
          />
          {k >= 1 && (
            <>
              <Person who="mom" x={96} y={150} s={0.9} />
              <Person who="riya" x={196} y={150} s={0.85} />
            </>
          )}
          {k >= 2 && (
            <g>
              <circle class="rs-award" cx={270} cy={50} r={18} />
              <Label x={270} y={54} text="★" anchor="middle" cls="is-big" />
            </g>
          )}
        </>
      );
    case ForestCase.Himalayan:
      return (
        <>
          <rect class="rs-sky" x={0} y={0} width={W} height={H} />
          <path class="rs-mountain" d="M0 120 L70 40 L130 100 L200 30 L320 120 Z" />
          <rect class="rs-meadow" x={0} y={120} width={W} height={70} />
          {k === 0 &&
            [60, 110, 160, 210].map((x) => (
              <ellipse key={x} class="rs-sheep" cx={x} cy={150} rx={9} ry={6} />
            ))}
          {k >= 1 && <rect class="rs-fence" x={20} y={128} width={280} height={4} />}
          {k >= 2 &&
            [40, 80, 120, 160, 200, 240, 280].map((x) => (
              <path key={x} class="rs-tall-grass" d={`M${x} 186 q 4 -40 22 -50`} />
            ))}
          {k < 2 &&
            [40, 90, 140, 190, 240, 290].map((x) => (
              <path key={x} class="rs-short-grass" d={`M${x} 186 v-8 m4 8 v-6`} />
            ))}
        </>
      );
    case ForestCase.Chipko:
      return (
        <>
          <rect class="rs-sky" x={0} y={0} width={W} height={H} />
          <rect class="rs-meadow" x={0} y={150} width={W} height={40} />
          <Tree x={90} y={160} s={1.6} kind="pine" />
          <Tree x={170} y={160} s={1.8} kind="pine" />
          <Tree x={250} y={160} s={1.5} kind="pine" />
          {k === 0 && (
            <g>
              <rect class="rs-truck" x={230} y={118} width={60} height={26} rx={4} />
              <circle class="rs-wheel" cx={244} cy={146} r={6} />
              <circle class="rs-wheel" cx={278} cy={146} r={6} />
            </g>
          )}
          {k >= 1 && (
            <>
              <Person who="mom" x={80} y={160} s={0.9} point={[10, -4]} />
              <Person who="riya" x={160} y={160} s={0.85} point={[10, -4]} />
              <Person who="neighbour" x={240} y={160} s={0.9} point={[10, -4]} />
            </>
          )}
          {k >= 2 && (
            <Label
              x={160}
              y={30}
              text={say(locale, { en: "the trees stay", hi: "पेड़ बच गए" })}
              anchor="middle"
              cls="is-big is-good"
            />
          )}
        </>
      );
    default: {
      const green = k >= 3 ? 7 : k >= 2 ? 5 : 2;
      return (
        <>
          <rect class="rs-sky" x={0} y={0} width={W} height={H} />
          <rect class="rs-meadow" x={0} y={150} width={W} height={40} />
          {[40, 80, 120, 160, 200, 240, 280].map((x, i) =>
            i < green ? (
              <Tree key={x} x={x} y={160} s={1.3} />
            ) : (
              <rect key={x} class="rs-stump" x={x - 4} y={148} width={8} height={12} />
            ),
          )}
          {k >= 1 && (
            <>
              <Person who="grandpa" x={60} y={180} s={0.7} />
              <Person who="kabir" x={260} y={180} s={0.7} />
            </>
          )}
          {k >= 3 && (
            <Label x={160} y={30} text="₹12.5 crore" anchor="middle" cls="is-big is-good" />
          )}
          {k === 2 && <Label x={160} y={30} text="25%" anchor="middle" cls="is-big" />}
        </>
      );
    }
  }
}

/** The forest and its stakeholders, or one of NCERT's forest stories stepped through. */
export function ForestStakeholdersView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as StakeState;
  const sel = s.selected;
  if (s.mode === StakeMode.Cases) {
    const count = stepCountOf(s.case);
    const line = CASE_STEPS[s.case][s.step];
    return (
      <div class="rs rs-stake-prop">
        <Frame w={W} h={H} width={width} label={describeStakeholders(s)} cls="rs-stake-svg">
          <g data-part={StakePart.Story}>
            <CasePicture s={s} locale={locale} />
          </g>
        </Frame>
        <p class="rs-caption">{line === undefined ? "" : say(locale, line)}</p>
        <Controls>
          <Dots step={s.step} count={count} />
          {s.canStep && s.step < count - 1 && (
            <Button label={say(locale, WORDS.next)} onClick={() => call(StakeAction.Next, {})} />
          )}
          {s.canStep && s.step === count - 1 && count > 1 && (
            <Button label={say(locale, WORDS.again)} onClick={() => call(StakeAction.Reset, {})} />
          )}
        </Controls>
        {s.canPickCase && s.cases.length > 1 && (
          <Controls>
            {s.cases.map((c) => (
              <Button
                key={c}
                label={say(locale, CASE_WORDS[c])}
                isOn={s.case === c}
                onClick={() => call(StakeAction.SetCase, { case: c })}
              />
            ))}
          </Controls>
        )}
      </div>
    );
  }
  return (
    <div class="rs rs-stake-prop">
      <Frame w={W} h={H} width={width} label={describeStakeholders(s)} cls="rs-stake-svg">
        <MapPicture s={s} locale={locale} call={call} />
      </Frame>
      {sel === null ? (
        <p class="rs-caption is-dim">{say(locale, WORDS.tap)}</p>
      ) : (
        <div class="rs-stake-panel">
          <strong>{say(locale, STAKE_FACTS[sel].name)}</strong>
          {s.showNeeds && <span>{say(locale, STAKE_FACTS[sel].needs)}</span>}
          <span class={`rs-stake-dep is-${STAKE_FACTS[sel].dependence}`}>
            {`${say(locale, DEP_WORDS[STAKE_FACTS[sel].dependence])} · ${say(
              locale,
              STAKE_FACTS[sel].longStake ? WORDS.long : WORDS.short,
            )}`}
          </span>
        </div>
      )}
      {s.canTap && (
        <Controls>
          {STAKEHOLDERS.map((who) => (
            <Button
              key={who}
              label={say(locale, SHORT[who])}
              isOn={sel === who}
              onClick={() => call(StakeAction.Pick, { who })}
            />
          ))}
        </Controls>
      )}
    </div>
  );
}
