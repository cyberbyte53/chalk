import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Crossing } from "./draw";
import { Carrier, Rule, RuleAction, type RuleState, answerOf, describeRule } from "./rule";
import { DIRS, DIR_SHORT, DIR_WORDS, type Dir, opposite } from "./space";
import { type Words, say } from "./words";

const W = 320;
const H = 210;
const O = { x: 150, y: 108 } as const;
const L = 70;

/** Screen direction of each page direction: out of the page is drawn down and to the left. */
const SCREEN: Readonly<Record<Dir, [number, number]>> = {
  right: [1, 0],
  left: [-1, 0],
  up: [0, -1],
  down: [0, 1],
  out: [-0.62, 0.5],
  in: [0.62, -0.5],
};

const WORDS = {
  left: { en: "LEFT hand", hi: "बायाँ हाथ" },
  right: { en: "RIGHT hand", hi: "दायाँ हाथ" },
  field: { en: "field", hi: "क्षेत्र" },
  current: { en: "current", hi: "धारा" },
  force: { en: "force", hi: "बल" },
  motion: { en: "motion", hi: "गति" },
  induced: { en: "induced current", hi: "प्रेरित धारा" },
  electron: { en: "electron's motion", hi: "इलेक्ट्रॉन की गति" },
  particle: { en: "particle's motion", hi: "कण की गति" },
  point: { en: "the point", hi: "बिंदु" },
  fieldThere: { en: "field there", hi: "वहाँ क्षेत्र" },
  first: { en: "first finger", hi: "तर्जनी" },
  second: { en: "middle finger", hi: "मध्यमा" },
  thumb: { en: "thumb", hi: "अँगूठा" },
  fingers: { en: "fingers", hi: "उँगलियाँ" },
  hidden: { en: "?", hi: "?" },
  none: {
    en: "These lie along one line: no force.",
    hi: "ये एक ही रेखा में हैं: कोई बल नहीं।",
  },
  reveal: { en: "Show the answer", hi: "उत्तर दिखाओ" },
  setField: { en: "Field", hi: "क्षेत्र" },
  setCurrent: { en: "Current", hi: "धारा" },
  setMotion: { en: "Motion", hi: "गति" },
  setPoint: { en: "Point is", hi: "बिंदु" },
} as const satisfies Record<string, Words>;

type Leg = { dir: Dir; name: Words; finger: Words; cls: string };

function legsOf(s: RuleState): { given: [Leg, Leg]; answer: Leg; hand: "left" | "right" } {
  switch (s.rule) {
    case Rule.ThumbRule:
      return {
        given: [
          { dir: s.first, name: WORDS.current, finger: WORDS.thumb, cls: "is-current" },
          { dir: s.second, name: WORDS.point, finger: WORDS.point, cls: "is-point" },
        ],
        answer: { dir: s.first, name: WORDS.fieldThere, finger: WORDS.fingers, cls: "is-field" },
        hand: "right",
      };
    case Rule.FlemingLeft:
      return {
        given: [
          { dir: s.first, name: WORDS.field, finger: WORDS.first, cls: "is-field" },
          {
            dir: s.second,
            name:
              s.carrier === Carrier.Electron
                ? WORDS.electron
                : s.carrier === Carrier.Positive
                  ? WORDS.particle
                  : WORDS.current,
            finger: WORDS.second,
            cls: "is-current",
          },
        ],
        answer: { dir: s.first, name: WORDS.force, finger: WORDS.thumb, cls: "is-force" },
        hand: "left",
      };
    case Rule.FlemingRight:
      return {
        given: [
          { dir: s.first, name: WORDS.field, finger: WORDS.first, cls: "is-field" },
          { dir: s.second, name: WORDS.motion, finger: WORDS.thumb, cls: "is-motion" },
        ],
        answer: { dir: s.first, name: WORDS.induced, finger: WORDS.second, cls: "is-current" },
        hand: "right",
      };
  }
}

function Leg({
  leg,
  locale,
  hidden = false,
  dashed = false,
}: { leg: Leg; locale: string; hidden?: boolean; dashed?: boolean }): JSX.Element {
  const [dx, dy] = SCREEN[leg.dir];
  const len = leg.dir === "out" || leg.dir === "in" ? L * 0.95 : L;
  const x2 = O.x + dx * len;
  const y2 = O.y + dy * len;
  const tx = O.x + dx * (len + 16);
  const ty = O.y + dy * (len + 16);
  const anchor = dx > 0.3 ? "start" : dx < -0.3 ? "end" : "middle";
  return (
    <g class={`mg-leg ${leg.cls}${dashed ? " is-dashed" : ""}`}>
      <Arrow x1={O.x} y1={O.y} x2={x2} y2={y2} head={9} />
      {(leg.dir === "out" || leg.dir === "in") && (
        <Crossing x={x2 + dx * 9} y={y2 + dy * 9} r={5} current={leg.dir} />
      )}
      <text
        class="mg-leg-name"
        x={tx}
        y={ty + (dy < -0.3 ? -6 : dy > 0.3 ? 10 : 4)}
        text-anchor={anchor}
      >
        {hidden ? say(locale, WORDS.hidden) : say(locale, leg.name)}
      </text>
      {!hidden && leg.finger !== leg.name && (
        <text
          class="mg-leg-finger"
          x={tx}
          y={ty + (dy < -0.3 ? 6 : dy > 0.3 ? 22 : 16)}
          text-anchor={anchor}
        >
          ({say(locale, leg.finger)})
        </text>
      )}
    </g>
  );
}

function Chooser({
  label,
  value,
  onPick,
  locale,
}: { label: Words; value: Dir; onPick: (d: Dir) => void; locale: string }): JSX.Element {
  return (
    <div class="mg-chooser">
      <span class="mg-chooser-label">{say(locale, label)}</span>
      {DIRS.map((d) => (
        <button
          key={d}
          type="button"
          class={d === value ? "mg-chip is-on" : "mg-chip"}
          aria-pressed={d === value}
          onClick={() => onPick(d)}
        >
          {say(locale, DIR_SHORT[d])}
        </button>
      ))}
    </div>
  );
}

export function RuleView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as RuleState;
  const k = width / W;
  const { given, answer: shape, hand } = legsOf(s);
  const a = answerOf(s);
  const answer = a === null ? null : { ...shape, dir: a };
  const showsCurrentToo = s.rule === Rule.FlemingLeft && s.carrier === Carrier.Electron;
  return (
    <div class="mg-hr">
      <Stage
        label={describeRule(s)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "mg-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="mg-bg" x={0} y={0} width={W} height={H} rx={12} />
          <g class="mg-hand-badge">
            <rect x={10} y={10} width={92} height={24} rx={12} />
            <text x={56} y={27} text-anchor="middle">
              {say(locale, hand === "left" ? WORDS.left : WORDS.right)}
            </text>
          </g>
          {s.rule === Rule.ThumbRule && (
            <g class="mg-wire-axis">
              <line
                x1={O.x - SCREEN[s.first][0] * 52}
                y1={O.y - SCREEN[s.first][1] * 52}
                x2={O.x + SCREEN[s.first][0] * 22}
                y2={O.y + SCREEN[s.first][1] * 22}
              />
            </g>
          )}
          <g data-part="hand">
            <Leg leg={given[0]} locale={locale} />
            <Leg leg={given[1]} locale={locale} />
            {showsCurrentToo && (
              <Leg
                leg={{
                  dir: opposite(s.second),
                  name: WORDS.current,
                  finger: WORDS.second,
                  cls: "is-current",
                }}
                locale={locale}
                dashed
              />
            )}
          </g>
          {answer !== null && s.isRevealed && (
            <g data-part="answer">
              <Leg leg={answer} locale={locale} />
            </g>
          )}
          {!s.isRevealed && (
            <g class="mg-hidden-answer">
              <circle cx={O.x + 26} cy={O.y - 26} r={13} />
              <text x={O.x + 26} y={O.y - 21} text-anchor="middle">
                ?
              </text>
            </g>
          )}
          <circle class="mg-origin" cx={O.x} cy={O.y} r={4} />
          {a === null && (
            <text class="mg-note" x={W / 2} y={H - 12} text-anchor="middle">
              {say(locale, WORDS.none)}
            </text>
          )}
        </g>
      </Stage>
      {s.isRevealed && a !== null && (
        <p class="mg-answer">
          {say(locale, answer?.name ?? WORDS.force)}: <b>{say(locale, DIR_WORDS[a])}</b>
        </p>
      )}
      {(s.canSetFirst || s.canSetSecond || (s.canReveal && !s.isRevealed)) && (
        <div class="mg-controls is-column" data-part="controls">
          {s.canSetFirst && (
            <Chooser
              label={s.rule === Rule.ThumbRule ? WORDS.setCurrent : WORDS.setField}
              value={s.first}
              locale={locale}
              onPick={(dir) => call(RuleAction.SetFirst, { dir })}
            />
          )}
          {s.canSetSecond && (
            <Chooser
              label={
                s.rule === Rule.ThumbRule
                  ? WORDS.setPoint
                  : s.rule === Rule.FlemingRight
                    ? WORDS.setMotion
                    : s.carrier === Carrier.Current
                      ? WORDS.setCurrent
                      : WORDS.setMotion
              }
              value={s.second}
              locale={locale}
              onPick={(dir) => call(RuleAction.SetSecond, { dir })}
            />
          )}
          {s.canReveal && !s.isRevealed && (
            <button
              type="button"
              class="mg-button is-primary"
              onClick={() => call(RuleAction.Reveal, {})}
            >
              {say(locale, WORDS.reveal)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
