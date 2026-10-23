import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { quadTex, say } from "./quad";
import { SplitAction, SplitPart, type SplitState, isRightPick, pairsOf, workingOf } from "./split";
import { Button } from "./ui";

const WORDS = {
  find: {
    en: "Find two numbers that multiply to $ac$ and add to $b$:",
    hi: "ऐसी दो संख्याएँ खोजो जिनका गुणनफल $ac$ और योग $b$ हो:",
  },
  multiply: { en: "multiply to", hi: "गुणनफल" },
  add: { en: "add to", hi: "योग" },
  pick: { en: "Tap a pair to try it:", hi: "किसी जोड़ी पर टैप करके आज़माओ:" },
  right: { en: "Both match!", hi: "दोनों मिलते हैं!" },
  wrong: { en: "Not this pair.", hi: "यह जोड़ी नहीं।" },
  none: {
    en: "No pair of whole numbers works here, so this one doesn't factorise this way.",
    hi: "यहाँ पूर्ण संख्याओं की कोई जोड़ी काम नहीं करती, इसलिए इसके इस तरह गुणनखंड नहीं होते।",
  },
  so: { en: "So", hi: "इसलिए" },
  or: { en: "or", hi: "या" },
} as const;

const sign = (n: number) => (n < 0 ? `(${n})` : String(n));
/** A number with a real minus sign, for the buttons. */
const minus = (n: number) => (n < 0 ? `−${-n}` : String(n));

export function SplitView({ view, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as SplitState & { hasWholeSplit: boolean };
  const v = s.variable;
  const ac = s.a * s.c;
  const pairs = pairsOf(s);
  const w = workingOf(s);
  const isRight = isRightPick(s);
  return (
    <div class="qd-split">
      <p class="qd-split-equation" data-part={SplitPart.Equation}>
        <RichText text={`$${quadTex(s.a, s.b, s.c, v)} = 0$`} />
      </p>
      <div class="qd-split-target" data-part={SplitPart.Target}>
        <p>
          <RichText text={say(locale, WORDS.find)} />
        </p>
        <p class="qd-split-goal">
          <RichText
            text={`$p \\times q = ${sign(s.a)} \\times ${sign(s.c)} = ${ac}, \\quad p + q = ${s.b}$`}
          />
        </p>
      </div>
      {s.canPick && pairs.length > 0 && (
        <div class="qd-split-pick">
          <p class="qd-note">{say(locale, WORDS.pick)}</p>
          <div class="qd-chips" data-part={SplitPart.Pairs}>
            {pairs.map(([p, q]) => (
              <Button
                key={`${p},${q}`}
                label={`${p} and ${q}`}
                isWide
                isOn={s.picked !== null && s.picked[0] === p && s.picked[1] === q}
                onPress={() => call(SplitAction.Pick, { p, q })}
              >
                {minus(p)} × {q < 0 ? `(${minus(q)})` : q}
              </Button>
            ))}
          </div>
        </div>
      )}
      {!s.hasWholeSplit && <p class="qd-note">{say(locale, WORDS.none)}</p>}
      {s.picked !== null && (
        <p class={isRight ? "qd-check is-right" : "qd-check is-wrong"} data-part={SplitPart.Check}>
          <RichText
            text={`$${sign(s.picked[0])} \\times ${sign(s.picked[1])} = ${s.picked[0] * s.picked[1]},\\; ${s.picked[0]} + ${sign(s.picked[1])} = ${s.picked[0] + s.picked[1]}$`}
          />{" "}
          {say(locale, isRight ? WORDS.right : WORDS.wrong)}
        </p>
      )}
      {w !== null && s.showWorking && (
        <div class="qd-working" data-part={SplitPart.Working}>
          <p>
            <RichText text={`$${quadTex(s.a, s.b, s.c, v)}$`} />
          </p>
          <p>
            <RichText text={`$= ${w.split}$`} />
          </p>
          <p>
            <RichText text={`$= ${w.grouped}$`} />
          </p>
          <p>
            <RichText text={`$= ${w.factored}$`} />
          </p>
        </div>
      )}
      {w !== null && s.showRoots && (
        <p class="qd-roots" data-part={SplitPart.Roots}>
          {say(locale, WORDS.so)}{" "}
          <RichText
            text={`$${v} = ${w.roots[0]}$ ${say(locale, WORDS.or)} $${v} = ${w.roots[1]}$`}
          />
        </p>
      )}
    </div>
  );
}
