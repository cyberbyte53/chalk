import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { AngleArc, RightMark, centreOf, fitPoints } from "./draw";
import { HeightsAction, HeightsPart, type HeightsState, isSolvedOf, stepCountOf } from "./heights";
import { PROBLEMS, type Thing } from "./problems";
import { type Pt, type Words, say } from "./trig";
import { Button } from "./ui";

const WORDS = {
  next: { en: "Next step", hi: "अगला कदम" },
  again: { en: "Start again", hi: "फिर से" },
} as const satisfies Record<string, Words>;

const H = 220;

function ThingView({ t, at }: { t: Thing; at: (name: string) => Pt }): JSX.Element {
  switch (t.kind) {
    case "tower":
    case "chimney":
    case "lighthouse":
    case "building":
    case "wall": {
      const b = at(t.base);
      const top = at(t.top);
      const h = b[1] - top[1];
      if (t.kind === "building") {
        const w = Math.max(16, Math.min(40, h * 0.4));
        return <rect class="tr-building" x={b[0]} y={top[1]} width={w} height={h} />;
      }
      if (t.kind === "wall") {
        const w = Math.max(14, Math.min(26, h * 0.35));
        return <rect class="tr-wall" x={b[0] - w} y={top[1]} width={w} height={h} />;
      }
      if (t.kind === "chimney") {
        const w = Math.max(8, h * 0.12);
        return <rect class="tr-chimney" x={b[0]} y={top[1]} width={w} height={h} />;
      }
      const w = Math.max(10, Math.min(28, h * 0.2));
      const towerPath = `M${b[0] - w / 2} ${b[1]} L${b[0] - w * 0.25} ${top[1]} L${b[0] + w * 0.25} ${top[1]} L${b[0] + w / 2} ${b[1]} Z`;
      return (
        <g>
          <path class={t.kind === "lighthouse" ? "tr-lighthouse" : "tr-tower"} d={towerPath} />
          {t.kind === "lighthouse" && <circle class="tr-lamp" cx={top[0]} cy={top[1] - 3} r={4} />}
          {t.kind === "tower" && (
            <path
              class="tr-battlement"
              d={`M${b[0] - w * 0.32} ${top[1]} v-4 h${w * 0.16} v4 h${w * 0.16} v-4 h${w * 0.16} v4`}
            />
          )}
        </g>
      );
    }
    case "pole": {
      const b = at(t.base);
      const top = at(t.top);
      return <line class="tr-pole" x1={b[0]} y1={b[1]} x2={top[0]} y2={top[1]} />;
    }
    case "temple": {
      const b = at(t.base);
      return (
        <g class="tr-temple">
          <rect x={b[0] - 8} y={b[1] - 12} width={16} height={12} />
          <path d={`M${b[0] - 9} ${b[1] - 12} L${b[0]} ${b[1] - 24} L${b[0] + 9} ${b[1] - 12} Z`} />
          <line class="tr-pole" x1={b[0]} y1={b[1] - 24} x2={b[0]} y2={b[1] - 31} />
        </g>
      );
    }
    case "person": {
      const f = at(t.foot);
      const e = at(t.eye);
      return (
        <g class="tr-person">
          <line x1={f[0]} y1={f[1]} x2={e[0]} y2={e[1] + 3} />
          <circle cx={e[0]} cy={e[1]} r={3} />
        </g>
      );
    }
    case "ladder": {
      const a = at(t.a);
      const b = at(t.b);
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1;
      const nx = (-dy / l) * 3;
      const ny = (dx / l) * 3;
      const rungs = Math.max(3, Math.floor(l / 12));
      return (
        <g class="tr-ladder">
          <line x1={a[0] + nx} y1={a[1] + ny} x2={b[0] + nx} y2={b[1] + ny} />
          <line x1={a[0] - nx} y1={a[1] - ny} x2={b[0] - nx} y2={b[1] - ny} />
          {Array.from({ length: rungs }, (_, i) => {
            const k = (i + 1) / (rungs + 1);
            const p: Pt = [a[0] + dx * k, a[1] + dy * k];
            return <line key={k} x1={p[0] + nx} y1={p[1] + ny} x2={p[0] - nx} y2={p[1] - ny} />;
          })}
        </g>
      );
    }
    case "string":
    case "rope": {
      const a = at(t.a);
      const b = at(t.b);
      return <line class="tr-string" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
    }
    case "kite": {
      const p = at(t.at);
      return (
        <g class="tr-kite">
          <path
            d={`M${p[0]} ${p[1] - 9} L${p[0] + 7} ${p[1]} L${p[0]} ${p[1] + 9} L${p[0] - 7} ${p[1]} Z`}
          />
          <path class="tr-kite-tail" d={`M${p[0]} ${p[1] + 9} q 4 6 0 10 q -4 5 1 9`} />
        </g>
      );
    }
    case "balloon": {
      const p = at(t.at);
      return (
        <g class="tr-balloon">
          <circle cx={p[0]} cy={p[1] - 8} r={8} />
          <rect x={p[0] - 2.5} y={p[1] + 2} width={5} height={4} />
        </g>
      );
    }
    case "ship": {
      const p = at(t.at);
      return (
        <g class="tr-ship">
          <path
            d={`M${p[0] - 10} ${p[1] - 5} L${p[0] + 10} ${p[1] - 5} L${p[0] + 6} ${p[1]} L${p[0] - 6} ${p[1]} Z`}
          />
          <line x1={p[0]} y1={p[1] - 5} x2={p[0]} y2={p[1] - 14} />
        </g>
      );
    }
    case "flag": {
      const p = at(t.at);
      return <path class="tr-flag" d={`M${p[0]} ${p[1]} l14 3.5 l-14 3.5 Z`} />;
    }
    case "water": {
      const a = at(t.a);
      const b = at(t.b);
      return (
        <rect
          class="tr-water"
          x={Math.min(a[0], b[0])}
          y={a[1]}
          width={Math.abs(b[0] - a[0])}
          height={6}
        />
      );
    }
    case "deck": {
      const a = at(t.a);
      const b = at(t.b);
      return <line class="tr-deck" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
    }
  }
}

export function HeightsView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as HeightsState;
  const p = PROBLEMS[s.problem];
  const solved = isSolvedOf(s);
  const total = stepCountOf(s);
  const names = Object.keys(p.points);
  const fit = fitPoints(
    names.map((n) => p.points[n] as Pt),
    // Extra room at the sides for length labels such as 4(3 + √3) m.
    { left: 26, top: 6, width: width - 52, height: H - 12 },
    34,
  );
  const at = (n: string): Pt => fit.px(p.points[n] as Pt);
  const ground = fit.y([0, 0]);
  const centre = centreOf(names.map(at));
  return (
    <div class="tr tr-heights">
      {s.showQuestion && (
        <p class="tr-question" data-part={HeightsPart.Question}>
          {say(locale, p.question)}
        </p>
      )}
      <Stage
        label={p.question.en}
        x={[0, width]}
        width={width}
        height={H}
        svg={{ class: "tr-svg" }}
      >
        <g data-part={HeightsPart.Figure}>
          <line class="tr-ground-line" x1={0} y1={ground} x2={width} y2={ground} />
          {p.things
            .filter((t) => t.kind === "water")
            .map((t) => (
              <ThingView key={JSON.stringify(t)} t={t} at={at} />
            ))}
          {p.guides.map(([a, b]) => {
            const pa = at(a);
            const pb = at(b);
            return (
              <line
                key={`g${a}${b}`}
                class="tr-guide"
                x1={pa[0]}
                y1={pa[1]}
                x2={pb[0]}
                y2={pb[1]}
              />
            );
          })}
          {p.horizontals.map(([a, b]) => {
            const pa = at(a);
            const pb = at(b);
            return (
              <line
                key={`h${a}${b}`}
                class="tr-horizontal"
                x1={pa[0]}
                y1={pa[1]}
                x2={pb[0]}
                y2={pa[1]}
              />
            );
          })}
          {p.things
            .filter((t) => t.kind !== "water")
            .map((t) => (
              <ThingView key={JSON.stringify(t)} t={t} at={at} />
            ))}
          {p.sights.map(([a, b]) => {
            const pa = at(a);
            const pb = at(b);
            return (
              <line
                key={`s${a}${b}`}
                class="tr-sight"
                x1={pa[0]}
                y1={pa[1]}
                x2={pb[0]}
                y2={pb[1]}
              />
            );
          })}
          {p.rights.map((r) => (
            <RightMark key={`r${r.at}`} v={at(r.at)} p={at(r.a)} q={at(r.b)} size={7} />
          ))}
          {p.arcs.map((a) => (
            <AngleArc
              key={`a${a.at}${a.b}`}
              v={at(a.at)}
              p={at(a.a)}
              q={at(a.b)}
              r={a.r ?? 22}
              label={a.text}
              cls="tr-arc is-ref"
            />
          ))}
          {p.lengths.map((l) => {
            const pa = at(l.a);
            const pb = at(l.b);
            const dx = pb[0] - pa[0];
            const dy = pb[1] - pa[1];
            const len = Math.hypot(dx, dy) || 1;
            const side = l.side ?? 1;
            // Left of the direction a→b on screen is (dy, −dx).
            const nx = (dy / len) * side;
            const ny = (-dx / len) * side;
            // Short segments (an eye height) sit further out, clear of the point letters.
            const gap = len < 24 ? 20 : 13;
            const x = (pa[0] + pb[0]) / 2 + nx * gap;
            const y = (pa[1] + pb[1]) / 2 + ny * gap + 4;
            const anchor = Math.abs(nx) < 0.35 ? "middle" : nx > 0 ? "start" : "end";
            const isAsk = l.value !== undefined;
            return (
              <text
                key={`l${l.a}${l.b}`}
                class={`tr-length${isAsk ? (solved ? " is-found" : " is-ask") : ""}`}
                x={x}
                y={y}
                text-anchor={anchor}
              >
                {solved && l.value !== undefined ? l.value : l.text}
              </text>
            );
          })}
          {p.labels.map((n) => {
            const q = at(n);
            const dx = q[0] - centre[0];
            const dy = q[1] - centre[1];
            const len = Math.hypot(dx, dy) || 1;
            return (
              <text
                key={`v${n}`}
                class="tr-vertex"
                x={q[0] + (dx / len) * 11}
                y={q[1] + (dy / len) * 11 + 4}
                text-anchor="middle"
              >
                {n}
              </text>
            );
          })}
        </g>
      </Stage>
      {s.step > 0 && (
        <div class="tr-working" data-part={HeightsPart.Working}>
          {p.steps.slice(0, s.step).map((line) => (
            <p key={line}>
              <RichText text={`$${line}$`} />
            </p>
          ))}
        </div>
      )}
      {solved && s.showAnswer && (
        <p class="tr-verdict is-on" data-part={HeightsPart.Answer}>
          {say(locale, p.answer)}
        </p>
      )}
      {s.canStep && (
        <div class="tr-controls">
          <Button
            isWide
            label={say(locale, s.step < total ? WORDS.next : WORDS.again)}
            part={HeightsPart.Next}
            onPress={() => call(s.step < total ? HeightsAction.Next : HeightsAction.Reset, {})}
          >
            {say(locale, s.step < total ? WORDS.next : WORDS.again)}
          </Button>
        </div>
      )}
    </div>
  );
}
