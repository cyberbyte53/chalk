import type { Locale } from "@chalk/content";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { type Placement, type Point, layoutFor, placeAll } from "./layout";
import { type CircuitReadings, type CircuitState, type Component, ComponentKind } from "./model";

/** The prop's own words (everything else on screen comes from the lesson). */
const UI_TEXT = {
  diagram: { en: "Circuit diagram", hi: "परिपथ आरेख" },
  short: {
    en: "Short circuit! The two ends of a cell are joined with nothing in between to resist the current.",
    hi: "लघुपथन! सेल के दोनों सिरे बीच में बिना किसी प्रतिरोध के सीधे जुड़ गए हैं।",
  },
  open: { en: "open", hi: "खुला" },
  closed: { en: "closed", hi: "बंद" },
  glowing: { en: "glowing", hi: "जल रहा है" },
  dark: { en: "not glowing", hi: "नहीं जल रहा" },
  takenOut: { en: "taken out", hi: "निकाला हुआ" },
} as const satisfies Record<string, Record<Locale, string>>;

/** How far each symbol reaches along its component, at most. */
const SYMBOL_HALF: Record<ComponentKind, number> = {
  [ComponentKind.Cell]: 5,
  [ComponentKind.Bulb]: 13,
  [ComponentKind.Resistor]: 16,
  [ComponentKind.Switch]: 14,
  [ComponentKind.Wire]: 0,
  [ComponentKind.Ammeter]: 13,
  [ComponentKind.Voltmeter]: 13,
};
/** One dash and its gap, in px: the moving dashes advance this far each cycle. */
const DASH_PERIOD = 16;

const pointsOf = (points: readonly Point[]): string => points.map((p) => `${p.x},${p.y}`).join(" ");
const offset = (p: Point, d: Point, by: number): Point => ({
  x: p.x + d.x * by,
  y: p.y + d.y * by,
});

/** Seconds for the dashes to move one period: faster for more current. */
function flowSeconds(amps: number): number {
  const speed = Math.min(160, Math.max(14, 55 * Math.sqrt(amps))); // px per second
  return DASH_PERIOD / speed;
}

const formatReading = (value: number, unit: string): string => `${value.toFixed(2)} ${unit}`;

/** The two leads either side of a symbol, which sits in the middle of the path's middle segment. */
function leads(place: Placement, half: number): [Point[], Point[]] {
  const { path, mid, angle } = place;
  const along = { x: Math.cos((angle * Math.PI) / 180), y: Math.sin((angle * Math.PI) / 180) };
  const start = offset(mid, along, -half);
  const end = offset(mid, along, half);
  const first = path[0] ?? mid;
  const last = path[path.length - 1] ?? mid;
  if (path.length === 4) {
    const [, a2, b2] = path;
    return [
      [first, a2 ?? first, start],
      [end, b2 ?? last, last],
    ];
  }
  return [
    [first, start],
    [end, last],
  ];
}

function ComponentSymbol({
  c,
  half,
  brightness,
}: { c: Component; half: number; brightness: number }): JSX.Element | null {
  switch (c.kind) {
    case ComponentKind.Cell:
      // Long thin plate is +, short thick plate is −; the `to` end (+x here) is +.
      return (
        <g class="cc-cell">
          <line class="cc-plate-minus" x1={-half} y1={-6} x2={-half} y2={6} />
          <line class="cc-plate-plus" x1={half} y1={-13} x2={half} y2={13} />
        </g>
      );
    case ComponentKind.Bulb:
      if (!c.isInSocket) {
        return <circle class="cc-socket" r={half} />;
      }
      return (
        <g class="cc-bulb">
          <circle class="cc-glow" r={half + 14 * brightness} opacity={0.45 * brightness} />
          <circle class="cc-bulb-glass" r={half} />
          <circle class="cc-bulb-light" r={half} opacity={brightness} />
          <path
            class={brightness > 0 ? "cc-filament is-lit" : "cc-filament"}
            d={`M ${-half} 0 L ${-half * 0.45} 0 C ${-half * 0.45} ${-half * 0.9}, ${half * 0.45} ${-half * 0.9}, ${half * 0.45} 0 L ${half} 0`}
          />
        </g>
      );
    case ComponentKind.Resistor: {
      const steps = 6;
      const zig = Array.from({ length: steps + 1 }, (_, i) => ({
        x: -half + (2 * half * i) / steps,
        y: i === 0 || i === steps ? 0 : i % 2 === 1 ? -6 : 6,
      }));
      return <polyline class="cc-resistor" points={pointsOf(zig)} />;
    }
    case ComponentKind.Switch: {
      const tip = c.isClosed
        ? { x: half, y: 0 }
        : { x: -half + 2 * half * Math.cos(Math.PI / 6), y: -2 * half * Math.sin(Math.PI / 6) };
      return (
        <g class={c.isClosed ? "cc-switch is-closed" : "cc-switch"}>
          <line class="cc-lever" x1={-half} y1={0} x2={tip.x} y2={tip.y} />
          <circle class="cc-contact" cx={-half} cy={0} r={3} />
          <circle class="cc-contact" cx={half} cy={0} r={3} />
        </g>
      );
    }
    case ComponentKind.Ammeter:
    case ComponentKind.Voltmeter:
      return <circle class="cc-meter" r={half} />;
    case ComponentKind.Wire:
      return null;
  }
}

/** Draws the circuit diagram. It owns no state: every tap is an action through `call`. */
export function CircuitView({ view, width, locale, call }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as CircuitState & CircuitReadings;
  const layout = layoutFor(s.nodes, width);
  const places = placeAll(layout, s.nodes, s.components);
  const shorted = new Set(s.shortedCells);
  const nameOf = (c: Component) => c.label?.[locale] ?? c.id;

  const pieces = s.components.map((c) => {
    const place = places.get(c.id);
    if (place === undefined) return null;
    const half = Math.min(place.half, SYMBOL_HALF[c.kind]);
    const amps = s.current[c.id] ?? 0;
    const direction = s.direction[c.id] ?? 0;
    const brightness = s.brightness[c.id] ?? 0;
    const flowPath = direction < 0 ? [...place.path].reverse() : place.path;
    const [leadIn, leadOut] = leads(place, half);
    const text = (by: number) => offset(place.mid, place.outward, by);
    const isMeter = c.kind === ComponentKind.Ammeter || c.kind === ComponentKind.Voltmeter;
    const labelAt = text(isMeter ? 46 : 28);
    const label = c.label?.[locale];

    let hit: JSX.Element | null = null;
    if (c.kind === ComponentKind.Switch || c.kind === ComponentKind.Bulb) {
      const isSwitch = c.kind === ComponentKind.Switch;
      const state = isSwitch
        ? UI_TEXT[c.isClosed ? "closed" : "open"][locale]
        : !c.isInSocket
          ? UI_TEXT.takenOut[locale]
          : UI_TEXT[brightness > 0 ? "glowing" : "dark"][locale];
      const act = () =>
        isSwitch
          ? call("toggleSwitch", { component: c.id })
          : call(c.isInSocket ? "takeOutBulb" : "putBackBulb", { component: c.id });
      hit = (
        <g
          class="cc-hit"
          role={isSwitch ? "switch" : "button"}
          aria-checked={isSwitch ? c.isClosed : undefined}
          aria-label={`${nameOf(c)}: ${state}`}
          tabIndex={0}
          onClick={act}
          onKeyDown={(event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            act();
          }}
        >
          <rect x={place.mid.x - 24} y={place.mid.y - 24} width={48} height={48} rx={10} />
        </g>
      );
    }

    return (
      <g key={c.id} class={`cc-component cc-${c.kind}${shorted.has(c.id) ? " is-shorted" : ""}`}>
        {c.kind === ComponentKind.Wire ? (
          <polyline class="cc-lead" points={pointsOf(place.path)} />
        ) : (
          <>
            <polyline class="cc-lead" points={pointsOf(leadIn)} />
            <polyline class="cc-lead" points={pointsOf(leadOut)} />
          </>
        )}
        {amps > 0 && (
          <polyline
            class="cc-flow"
            points={pointsOf(flowPath)}
            style={{ animationDuration: `${flowSeconds(amps).toFixed(3)}s` }}
          />
        )}
        {amps > 0 && c.kind === ComponentKind.Wire && (
          <polygon
            class="cc-arrow"
            points="-5,-5 5,0 -5,5"
            transform={`translate(${place.mid.x} ${place.mid.y}) rotate(${place.angle + (direction < 0 ? 180 : 0)})`}
          />
        )}
        <g transform={`translate(${place.mid.x} ${place.mid.y}) rotate(${place.angle})`}>
          <ComponentSymbol c={c} half={half} brightness={brightness} />
        </g>
        {c.kind === ComponentKind.Cell && (
          <text
            class="cc-sign"
            {...pos(offset(offset(place.mid, place.outward, 18), along(place), half + 7))}
          >
            +
          </text>
        )}
        {isMeter && (
          <>
            <text class="cc-meter-letter" {...pos(place.mid)}>
              {c.kind === ComponentKind.Ammeter ? "A" : "V"}
            </text>
            <text class="cc-reading" {...pos(text(28))}>
              {formatReading(s.reading[c.id] ?? 0, c.kind === ComponentKind.Ammeter ? "A" : "V")}
            </text>
          </>
        )}
        {label !== undefined && (
          <text class="cc-label" {...pos(labelAt)}>
            {label}
          </text>
        )}
        {hit}
      </g>
    );
  });

  const centre = layoutCentre(s.nodes.map((n) => layout.at(n)));
  return (
    <div class="cc">
      <svg class="cc-svg" viewBox={`0 0 ${width} ${layout.height}`} width="100%">
        <title>{UI_TEXT.diagram[locale]}</title>
        {pieces}
        {s.nodes.map((n) => {
          const p = layout.at(n);
          const out = unit({ x: p.x - centre.x, y: p.y - centre.y });
          return (
            <g key={n.id} class="cc-node">
              <circle cx={p.x} cy={p.y} r={3.5} />
              {n.label !== undefined && (
                <text class="cc-node-label" {...pos(offset(p, out, 16))}>
                  {n.label[locale]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {s.isShortCircuit && (
        <p class="cc-warning" role="alert">
          {UI_TEXT.short[locale]}
        </p>
      )}
    </div>
  );
}

function along(place: Placement): Point {
  const r = (place.angle * Math.PI) / 180;
  return { x: Math.cos(r), y: Math.sin(r) };
}

function pos(p: Point): {
  x: number;
  y: number;
  "text-anchor": string;
  "dominant-baseline": string;
} {
  return { x: p.x, y: p.y, "text-anchor": "middle", "dominant-baseline": "central" };
}

function unit(p: Point): Point {
  const length = Math.hypot(p.x, p.y);
  return length === 0 ? { x: -0.7, y: -0.7 } : { x: p.x / length, y: p.y / length };
}

function layoutCentre(points: readonly Point[]): Point {
  const count = Math.max(1, points.length);
  return {
    x: points.reduce((sum, p) => sum + p.x, 0) / count,
    y: points.reduce((sum, p) => sum + p.y, 0) / count,
  };
}
