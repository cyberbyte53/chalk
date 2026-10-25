import { type PropViewProps, useFrame } from "@chalk/player";
import type { JSX } from "preact";
import { Head } from "./kit-view";
import { KindToggleAction, MirrorFaceKind } from "./mirror-parts";

const pt = (p: readonly [number, number]): string => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;

export function CurvedMirrorView({ view }: PropViewProps): JSX.Element | null {
  const s = view as unknown as { face: [number, number][] };
  const frame = useFrame();
  if (frame === null) return null;
  const d = s.face
    .map((p, k) => `${k === 0 ? "M" : "L"}${pt(frame.px.toPx(p[0], p[1]))}`)
    .join(" ");
  return (
    <g data-part="mirror">
      {/* A shaded back behind the reflecting face. */}
      <path class="sm-back" d={d} transform="translate(5 0)" />
      <path class="sm-face" d={d} />
    </g>
  );
}

/** The New Cartesian sign convention at P: +x right, −x left, +y up, −y down, light from the left. */
export function SignConventionView(): JSX.Element | null {
  const frame = useFrame();
  if (frame === null) return null;
  const [px, py] = frame.px.toPx(0, 0);
  const L = 52;
  const V = Math.min(46, frame.px.height / 2 - 26);
  const look = "sm" as const;
  return (
    <g class="sm-signs" data-part="signs">
      <circle cx={px} cy={py} r={4.5} />
      <g class="sm-sign-pos">
        <line x1={px} y1={py} x2={px + L} y2={py} />
        <Head x={px + L} y={py} dx={1} dy={0} look={look} />
        <text x={px + L - 2} y={py - 8} text-anchor="end">
          +x
        </text>
        <line x1={px} y1={py} x2={px} y2={py - V} />
        <Head x={px} y={py - V} dx={0} dy={-1} look={look} />
        <text x={px + 8} y={py - V + 6}>
          +y
        </text>
      </g>
      <g class="sm-sign-neg">
        <line x1={px} y1={py} x2={px - L} y2={py} />
        <Head x={px - L} y={py} dx={-1} dy={0} look={look} />
        <text x={px - L + 2} y={py - 8}>
          −x
        </text>
        <line x1={px} y1={py} x2={px} y2={py + V} />
        <Head x={px} y={py + V} dx={0} dy={1} look={look} />
        <text x={px + 8} y={py + V}>
          −y
        </text>
      </g>
      <g class="sm-light-dir">
        <line x1={16} y1={22} x2={78} y2={22} />
        <Head x={78} y={22} dx={1} dy={0} look={look} />
        <text x={16} y={14}>
          light
        </text>
      </g>
    </g>
  );
}

const KIND_WORDS = {
  concave: { en: "concave", hi: "अवतल" },
  convex: { en: "convex", hi: "उत्तल" },
} as const;

/** A tiny concave or convex arc for the kind switch (the label is for screen readers). */
function MirrorIcon({ kind }: { kind: "concave" | "convex" }): JSX.Element {
  const d = kind === MirrorFaceKind.Concave ? "M14 3 Q6 12 14 21" : "M8 3 Q16 12 8 21";
  return (
    <svg width="22" height="24" viewBox="0 0 22 24" role="img" aria-label={kind}>
      <path d={d} fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    </svg>
  );
}

export function KindToggleView({ view, call, locale }: PropViewProps): JSX.Element | null {
  const s = view as unknown as { kind: "concave" | "convex" };
  return (
    <fieldset class="sm-toggle" data-part="kindToggle" aria-label="mirror kind">
      {([MirrorFaceKind.Concave, MirrorFaceKind.Convex] as const).map((kind) => (
        <button
          key={kind}
          type="button"
          class={kind === s.kind ? "sm-button is-on" : "sm-button"}
          aria-pressed={kind === s.kind}
          onClick={() => kind !== s.kind && call(KindToggleAction.Set, { kind })}
        >
          <MirrorIcon kind={kind} />
          <span class="sm-kind-word">
            {locale === "hi" ? KIND_WORDS[kind].hi : KIND_WORDS[kind].en}
          </span>
        </button>
      ))}
    </fieldset>
  );
}
