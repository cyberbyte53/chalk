import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { Arrow, Crossing } from "./draw";
import {
  LOOP_HALF,
  MAGNET,
  SOLENOID,
  Source,
  X_MAX,
  Y_MAX,
  fieldAt,
  referenceStrength,
  seedsOf,
  strengthOf,
  traceLine,
  wiresOf,
} from "./field";
import {
  FieldAction,
  type FieldState,
  MAX_CURRENT,
  MAX_TURNS,
  describeField,
  hasField,
  needleAngleOf,
  northEndOf,
  strengthAt,
  wiresFor,
} from "./field-prop";
import { type Words, say } from "./words";

const W = 320;
const H = 200;
const K = W / (2 * X_MAX);
const px = (x: number) => W / 2 + x * K;
const py = (y: number) => H / 2 - y * K;

const WORDS = {
  tap: { en: "Tap anywhere to put the compass there", hi: "कंपास रखने के लिए कहीं भी टैप करो" },
  less: { en: "Less current", hi: "कम धारा" },
  more: { en: "More current", hi: "अधिक धारा" },
  reverse: { en: "Reverse current", hi: "धारा उलटो" },
  flip: { en: "Turn magnet round", hi: "चुंबक पलटो" },
  turns: { en: "turns", hi: "फेरे" },
  current: { en: "current", hi: "धारा" },
  noCurrent: { en: "no current: no field", hi: "कोई धारा नहीं: कोई क्षेत्र नहीं" },
  strength: { en: "field here", hi: "यहाँ क्षेत्र" },
  strong: { en: "strong", hi: "प्रबल" },
  medium: { en: "medium", hi: "मध्यम" },
  weak: { en: "weak", hi: "दुर्बल" },
  veryWeak: { en: "very weak", hi: "बहुत दुर्बल" },
  outOf: { en: "current out of the page", hi: "धारा पृष्ठ से बाहर" },
  into: { en: "current into the page", hi: "धारा पृष्ठ के अंदर" },
} as const satisfies Record<string, Words>;

const strengthWords = (k: number): Words =>
  k > 0.5 ? WORDS.strong : k > 0.15 ? WORDS.medium : k > 0.03 ? WORDS.weak : WORDS.veryWeak;

const toPath = (pts: readonly [number, number][]) =>
  pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${px(x).toFixed(1)} ${py(y).toFixed(1)}`).join(" ");

/** Traced lines, kept by what shapes them (only the current's sign matters, not its size). */
const lineCache = new Map<string, [number, number][][]>();
function linesFor(source: Source, sign: number, isFlipped: boolean): [number, number][][] {
  const key = `${source}|${sign}|${isFlipped}`;
  const hit = lineCache.get(key);
  if (hit !== undefined) return hit;
  const wires = wiresOf(source, sign, { isFlipped, turns: 1 });
  const lines = seedsOf(source).map((seed) => traceLine(wires, seed));
  lineCache.set(key, lines);
  return lines;
}

function Lines({ s }: { s: FieldState }): JSX.Element {
  const sign = Math.sign(s.current) || 1;
  const lines = linesFor(s.source, sign, s.isFlipped);
  const wires = wiresOf(s.source, sign, { isFlipped: s.isFlipped, turns: 1 });
  return (
    <g class="mg-lines" data-part="lines">
      {lines.map((pts, i) => {
        const at = pts[Math.floor(pts.length * 0.27)] ?? pts[0];
        const b = at === undefined ? null : fieldAt(wires, at[0], at[1]);
        const m = b === null ? 0 : strengthOf(b);
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: lines are fixed per source
          <g key={i}>
            <path class="mg-line" d={toPath(pts)} />
            {s.showArrows && at !== undefined && b !== null && m > 0 && (
              <Arrow
                cls="mg-line-arrow"
                x1={px(at[0]) - (5 * b[0]) / m}
                y1={py(at[1]) + (5 * b[1]) / m}
                x2={px(at[0]) + (5 * b[0]) / m}
                y2={py(at[1]) - (5 * b[1]) / m}
                head={6}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

type Dash = { x: number; y: number; dx: number; dy: number; o: number };
const filingCache = new Map<string, Dash[]>();
function filingsFor(s: FieldState): Dash[] {
  const key = `${s.source}|${s.current}|${s.isFlipped}|${s.turns}`;
  const hit = filingCache.get(key);
  if (hit !== undefined) return hit;
  const wires = wiresFor(s);
  const ref = referenceStrength(s.source);
  const out: Dash[] = [];
  for (let x = -X_MAX + 0.4; x <= X_MAX; x += 0.66)
    for (let y = -Y_MAX + 0.35; y <= Y_MAX; y += 0.66) {
      const jx = x + 0.17 * Math.sin(7.1 * y + 3 * x);
      const jy = y + 0.17 * Math.cos(5.3 * x - 2 * y);
      if (
        s.source === Source.BarMagnet &&
        Math.abs(jx) < MAGNET.halfLength + 0.15 &&
        Math.abs(jy) < MAGNET.halfWidth + 0.15
      )
        continue;
      const b = fieldAt(wires, jx, jy);
      const m = strengthOf(b);
      if (m === 0) continue;
      const o = Math.max(0, Math.min(0.9, 0.75 + 0.35 * Math.log10(m / ref)));
      if (o < 0.12) continue;
      out.push({ x: px(jx), y: py(jy), dx: (3.2 * b[0]) / m, dy: (-3.2 * b[1]) / m, o });
    }
  filingCache.set(key, out);
  return out;
}

function Filings({ s }: { s: FieldState }): JSX.Element {
  const dashes = filingsFor(s);
  return (
    <g class="mg-filings">
      {dashes.map((d) => (
        <line
          key={`${d.x}-${d.y}`}
          x1={d.x - d.dx}
          y1={d.y - d.dy}
          x2={d.x + d.dx}
          y2={d.y + d.dy}
          style={{ opacity: d.o }}
        />
      ))}
    </g>
  );
}

function Body({ s, locale }: { s: FieldState; locale: string }): JSX.Element {
  const north = northEndOf(s);
  const poleLabels = (half: number) =>
    s.showPoles && north !== null ? (
      <g class="mg-end-names">
        <text
          x={px(north === "right" ? half : -half) + (north === "right" ? 10 : -10)}
          y={py(0) + 5}
          text-anchor={north === "right" ? "start" : "end"}
        >
          N
        </text>
        <text
          x={px(north === "right" ? -half : half) + (north === "right" ? -10 : 10)}
          y={py(0) + 5}
          text-anchor={north === "right" ? "end" : "start"}
        >
          S
        </text>
      </g>
    ) : null;
  const dir = (c: number): "out" | "in" | "none" => (c === 0 ? "none" : c > 0 ? "out" : "in");
  switch (s.source) {
    case Source.BarMagnet: {
      const l = px(-MAGNET.halfLength);
      const r = px(MAGNET.halfLength);
      const t = py(MAGNET.halfWidth);
      const h = 2 * MAGNET.halfWidth * K;
      const mid = px(0);
      const nLeft = s.isFlipped;
      // With the poles hidden the magnet is one plain colour and unlabelled (a magnet to be named).
      const named = s.showPoles;
      const cls = (n: boolean) => (named ? (n ? "mg-bar is-n" : "mg-bar is-s") : "mg-bar is-plain");
      return (
        <g data-part="source">
          <rect class={cls(nLeft)} x={l} y={t} width={mid - l} height={h} rx={3} />
          <rect class={cls(!nLeft)} x={mid} y={t} width={r - mid} height={h} rx={3} />
          {named && (
            <text class="mg-bar-name" x={(l + mid) / 2} y={py(0) + 5} text-anchor="middle">
              {nLeft ? "N" : "S"}
            </text>
          )}
          {named && (
            <text class="mg-bar-name" x={(mid + r) / 2} y={py(0) + 5} text-anchor="middle">
              {nLeft ? "S" : "N"}
            </text>
          )}
        </g>
      );
    }
    case Source.StraightWire:
      return (
        <g data-part="source">
          <Crossing x={px(0)} y={py(0)} r={8} current={dir(s.current)} />
          {s.current !== 0 && (
            <text class="mg-caption is-halo" x={W / 2} y={H - 8} text-anchor="middle">
              {say(locale, s.current > 0 ? WORDS.outOf : WORDS.into)}
            </text>
          )}
        </g>
      );
    case Source.Loop:
      return (
        <g data-part="source">
          <ellipse class="mg-loop" cx={px(0)} cy={py(0)} rx={9} ry={LOOP_HALF * K} />
          <Crossing x={px(0)} y={py(LOOP_HALF)} r={7} current={dir(s.current)} />
          <Crossing x={px(0)} y={py(-LOOP_HALF)} r={7} current={dir(-s.current)} />
          {s.turns > 1 && (
            <text class="mg-caption is-halo" x={12} y={20}>
              {s.turns} {say(locale, WORDS.turns)}
            </text>
          )}
          {poleLabels(0.9)}
        </g>
      );
    case Source.Solenoid: {
      const xs = Array.from(
        { length: SOLENOID.turns },
        (_, i) => -SOLENOID.halfLength + (2 * SOLENOID.halfLength * i) / (SOLENOID.turns - 1),
      );
      return (
        <g data-part="source">
          <rect
            class="mg-solenoid"
            x={px(-SOLENOID.halfLength) - 6}
            y={py(SOLENOID.halfWidth) - 6}
            width={2 * SOLENOID.halfLength * K + 12}
            height={2 * SOLENOID.halfWidth * K + 12}
            rx={8}
          />
          {xs.map((x) => (
            <g key={x}>
              <Crossing x={px(x)} y={py(SOLENOID.halfWidth)} r={5} current={dir(s.current)} />
              <Crossing x={px(x)} y={py(-SOLENOID.halfWidth)} r={5} current={dir(-s.current)} />
            </g>
          ))}
          {poleLabels(SOLENOID.halfLength + 0.4)}
        </g>
      );
    }
  }
}

function Compass({ s }: { s: FieldState }): JSX.Element | null {
  if (s.compass === null) return null;
  const a = needleAngleOf(s);
  const rot = a === null ? -90 : -a;
  const cx = px(s.compass.x);
  const cy = py(s.compass.y);
  return (
    <g class="mg-compass" data-part="compass" transform={`translate(${cx} ${cy})`}>
      <circle class="mg-compass-case" r={13} />
      <g
        class={a === null ? "mg-compass-needle is-rest" : "mg-compass-needle"}
        transform={`rotate(${rot})`}
      >
        <path class="mg-needle-n" d="M11 0 L 0 -3 L 0 3 Z" />
        <path class="mg-needle-s" d="M-11 0 L 0 -3 L 0 3 Z" />
      </g>
      <circle class="mg-compass-pivot" r={1.6} />
    </g>
  );
}

export function FieldView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as FieldState;
  const k = width / W;
  const height = Math.round(H * k);
  const on = hasField(s);
  const place = (e: MouseEvent) => {
    if (!s.canPlace) return;
    const svg = e.currentTarget as SVGSVGElement;
    const box = svg.getBoundingClientRect();
    const ux = ((e.clientX - box.left) / box.width) * W;
    const uy = ((e.clientY - box.top) / box.height) * H;
    const x = Math.max(-X_MAX, Math.min(X_MAX, (ux - W / 2) / K));
    const y = Math.max(-Y_MAX, Math.min(Y_MAX, (H / 2 - uy) / K));
    call(FieldAction.PlaceCompass, { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  };
  const strength = strengthAt(s);
  const clip = `mg-field-${useId()}`;
  const isWire = s.source !== Source.BarMagnet;
  return (
    <div class="mg-mf">
      <Stage
        label={describeField(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{
          class: s.canPlace ? "mg-svg is-tappable" : "mg-svg",
          onClick: place,
        }}
      >
        <g transform={`scale(${k})`}>
          <clipPath id={clip}>
            <rect x={0} y={0} width={W} height={H} rx={12} />
          </clipPath>
          <rect class="mg-bg" x={0} y={0} width={W} height={H} rx={12} />
          <g clip-path={`url(#${clip})`}>
            {on && s.showFilings && <Filings s={s} />}
            {on && s.showLines && <Lines s={s} />}
          </g>
          <Body s={s} locale={locale} />
          {!on && (
            <text class="mg-note" x={W / 2} y={22} text-anchor="middle">
              {say(locale, WORDS.noCurrent)}
            </text>
          )}
          <Compass s={s} />
        </g>
      </Stage>
      {(s.canPlace || (s.showStrength && s.compass !== null)) && (
        <div class="mg-row">
          {s.canPlace && s.compass === null && (
            <span class="mg-hint">{say(locale, WORDS.tap)}</span>
          )}
          {s.showStrength && s.compass !== null && (
            <span class="mg-meter">
              {say(locale, WORDS.strength)}
              <span class="mg-meter-bar">
                <span style={{ width: `${Math.round(Math.sqrt(strength) * 100)}%` }} />
              </span>
              <b>{say(locale, strengthWords(strength))}</b>
            </span>
          )}
        </div>
      )}
      {((isWire && s.canSetCurrent) ||
        (!isWire && s.canFlip) ||
        (s.source === Source.Loop && s.canSetTurns)) && (
        <div class="mg-controls" data-part="controls">
          {isWire && s.canSetCurrent && (
            <>
              <button
                type="button"
                class="mg-button"
                disabled={Math.abs(s.current) <= 0}
                onClick={() =>
                  call(FieldAction.SetCurrent, { current: s.current - Math.sign(s.current) })
                }
              >
                {say(locale, WORDS.less)}
              </button>
              <button
                type="button"
                class="mg-button"
                disabled={Math.abs(s.current) >= MAX_CURRENT}
                onClick={() =>
                  call(FieldAction.SetCurrent, { current: s.current + (Math.sign(s.current) || 1) })
                }
              >
                {say(locale, WORDS.more)}
              </button>
              <button
                type="button"
                class="mg-button is-primary"
                disabled={s.current === 0}
                onClick={() => call(FieldAction.SetCurrent, { current: -s.current })}
              >
                {say(locale, WORDS.reverse)}
              </button>
            </>
          )}
          {!isWire && s.canFlip && (
            <button
              type="button"
              class="mg-button is-primary"
              onClick={() => call(FieldAction.Flip, {})}
            >
              {say(locale, WORDS.flip)}
            </button>
          )}
          {s.source === Source.Loop && s.canSetTurns && (
            <span class="mg-stepper">
              <button
                type="button"
                class="mg-button is-small"
                disabled={s.turns <= 1}
                onClick={() => call(FieldAction.SetTurns, { turns: s.turns - 1 })}
              >
                −
              </button>
              <span class="mg-stepper-value">
                {s.turns} {say(locale, WORDS.turns)}
              </span>
              <button
                type="button"
                class="mg-button is-small"
                disabled={s.turns >= MAX_TURNS}
                onClick={() => call(FieldAction.SetTurns, { turns: s.turns + 1 })}
              >
                +
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
