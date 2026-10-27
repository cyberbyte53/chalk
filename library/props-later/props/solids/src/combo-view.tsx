import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { ComboAction, ComboPart, type ComboState, Sum, groupsOf, sumsOf } from "./combo";
import {
  type Combo,
  type ComboMark,
  type ComboPart as Part,
  comboOf,
  extentOfCombo,
  totalOf,
} from "./combos";
import {
  AxisMark,
  Box,
  Cone,
  Cylinder,
  type Frame,
  HeightMark,
  Hemisphere,
  Look,
  RadiusMark,
  SlantMark,
  Sphere,
  fit,
} from "./draw";
import { type Words, answerTex, say } from "./solids";
import { Button, Chips } from "./ui";

const WORDS = {
  apart: { en: "Pull apart", hi: "अलग करो" },
  join: { en: "Join", hi: "जोड़ो" },
  next: { en: "Next part", hi: "अगला भाग" },
  done: { en: "All added", hi: "सब जुड़ गए" },
  sums: { en: "Find", hi: "निकालो" },
  surface: { en: "Surface area", hi: "पृष्ठीय क्षेत्रफल" },
  volume: { en: "Volume", hi: "आयतन" },
  total: { en: "Total", hi: "कुल" },
} as const satisfies Record<string, Words>;

/** A part moved up by dy (pulled apart). */
function shifted(p: Part, dy: number): Part {
  switch (p.shape) {
    case "cylinder":
    case "box":
      return { ...p, y0: p.y0 + dy, y1: p.y1 + dy };
    case "cone":
      return { ...p, yBase: p.yBase + dy, yApex: p.yApex + dy };
    case "dome":
      return { ...p, yFlat: p.yFlat + dy };
    case "sphere":
      return { ...p, yc: p.yc + dy };
  }
}

/** The parts as drawn: pulled apart (see-through containers stay put), all faces shown when apart. */
export function partsOf(c: Combo, isApart: boolean): Part[] {
  if (!isApart) return c.parts;
  const e = extentOfCombo(c);
  const gap = (e.y1 - e.y0) * 0.22;
  let i = 0;
  return c.parts.map((p) => {
    if (p.look === Look.Ghost) return p;
    const q = shifted(p, gap * i);
    i += 1;
    switch (q.shape) {
      case "cylinder":
      case "box":
        return { ...q, hasTop: true };
      case "cone":
        return { ...q, hasBase: true };
      case "dome":
        return { ...q, hasFace: true };
      default:
        return q;
    }
  });
}

function PartShape({ f, p }: { f: Frame; p: Part }): JSX.Element {
  switch (p.shape) {
    case "cylinder":
      return (
        <Cylinder
          f={f}
          y0={p.y0}
          y1={p.y1}
          r={p.r}
          look={p.look}
          tone={p.tone}
          hasTop={p.hasTop ?? true}
        />
      );
    case "cone":
      return (
        <Cone
          f={f}
          yBase={p.yBase}
          yApex={p.yApex}
          r={p.r}
          look={p.look}
          tone={p.tone}
          hasBase={p.hasBase ?? true}
        />
      );
    case "dome":
      return (
        <Hemisphere
          f={f}
          yFlat={p.yFlat}
          r={p.r}
          isUp={p.isUp}
          look={p.look}
          tone={p.tone}
          hasFace={p.hasFace ?? true}
        />
      );
    case "sphere":
      return <Sphere f={f} yc={p.yc} r={p.r} look={p.look} tone={p.tone} />;
    case "box":
      return (
        <Box
          f={f}
          y0={p.y0}
          y1={p.y1}
          l={p.side}
          b={p.side}
          look={p.look}
          tone={p.tone}
          hasTop={p.hasTop ?? true}
        />
      );
  }
}

function Mark({ f, m }: { f: Frame; m: ComboMark }): JSX.Element {
  switch (m.kind) {
    case "radius":
      return <RadiusMark f={f} y={m.y} r={m.r} label={m.text} isBelow={m.isBelow ?? false} />;
    case "height":
      return (
        <HeightMark f={f} y0={m.y0} y1={m.y1} x={m.x} label={m.text} side={m.side ?? "right"} />
      );
    case "axis":
      return <AxisMark f={f} y0={m.y0} y1={m.y1} label={m.text} />;
    case "slant":
      return (
        <SlantMark
          f={f}
          yLow={m.yLow}
          rLow={m.rLow}
          yHigh={m.yHigh}
          rHigh={m.rHigh}
          label={m.text}
        />
      );
  }
}

/** The combination's picture, fitted to width × height. Exported for the scene and the sheet. */
export function ComboPicture({
  c,
  width,
  height,
  isApart,
  showMarks,
}: {
  c: Combo;
  width: number;
  height: number;
  isApart: boolean;
  showMarks: boolean;
}): JSX.Element {
  const parts = partsOf(c, isApart);
  const e = extentOfCombo({ ...c, parts });
  const f = fit([e], width, height, 18, 25, 30);
  return (
    <Stage label={c.name.en} x={[0, width]} width={width} height={height} svg={{ class: "so-svg" }}>
      <g class="so-solid" data-part={ComboPart.Picture}>
        {parts.map((p, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: the parts are positional
          <PartShape key={i} f={f} p={p} />
        ))}
        {showMarks &&
          !isApart &&
          c.marks.map((m) => <Mark key={`${m.kind}-${m.text}`} f={f} m={m} />)}
      </g>
    </Stage>
  );
}

export function ComboView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ComboState;
  const c = comboOf(s.kind);
  const groups = groupsOf(s);
  const total = groups.reduce((n, g) => n + g.terms.length, 0);
  const height = Math.round(Math.min(280, width * 0.72));
  let left = s.revealed;
  return (
    <div class="so-combo">
      <ComboPicture
        c={c}
        width={width}
        height={height}
        isApart={s.isApart}
        showMarks={s.showMarks}
      />
      {s.revealed > 0 && (
        <div class="so-terms" data-part={ComboPart.Terms}>
          {groups.map((g) => {
            const shown = Math.max(0, Math.min(left, g.terms.length));
            left -= g.terms.length;
            if (shown === 0) return null;
            return (
              <div class="so-group" key={g.label.en}>
                <div class="so-group-name">{say(locale, g.label)}</div>
                <ol class="so-term-list">
                  {g.terms.slice(0, shown).map((t, i) => (
                    <li key={t.label.en} class={`so-term${t.sign < 0 ? " is-minus" : ""}`}>
                      <span class="so-sign">{t.sign < 0 ? "−" : i === 0 ? "" : "+"}</span>
                      <span class="so-term-name">{say(locale, t.label)}</span>
                      <RichText text={`$${t.tex} ${answerTex(t.value, c.pi, g.unit, g.power)}$`} />
                    </li>
                  ))}
                </ol>
                {shown === g.terms.length && (
                  <div class="so-group-total">
                    <span class="so-term-name">{say(locale, WORDS.total)}</span>
                    <RichText text={`$${answerTex(totalOf(g), c.pi, g.unit, g.power)}$`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {s.canSwitch && sumsOf(s.kind).length > 1 && (
        <Chips
          part={ComboPart.Measures}
          label={say(locale, WORDS.sums)}
          value={s.sum}
          options={sumsOf(s.kind).map((m) => ({
            id: m,
            text: say(locale, m === Sum.Surface ? WORDS.surface : WORDS.volume),
          }))}
          onPick={(sum) => call(ComboAction.Show, { sum })}
        />
      )}
      {(s.canSplit || s.canReveal) && (
        <div class="so-controls">
          {s.canSplit && (
            <Button
              isWide
              isOn={s.isApart}
              part={ComboPart.Split}
              label={say(locale, s.isApart ? WORDS.join : WORDS.apart)}
              onPress={() => call(ComboAction.Split, { apart: !s.isApart })}
            >
              {say(locale, s.isApart ? WORDS.join : WORDS.apart)}
            </Button>
          )}
          {s.canReveal && (
            <Button
              isWide
              part={ComboPart.Reveal}
              isEnabled={s.revealed < total}
              label={say(locale, s.revealed >= total ? WORDS.done : WORDS.next)}
              onPress={() => call(ComboAction.Reveal, {})}
            >
              {say(locale, s.revealed >= total ? WORDS.done : WORDS.next)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
