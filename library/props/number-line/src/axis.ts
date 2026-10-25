import {
  type Element,
  FrameKind,
  type TaskContext,
  actionsFor,
  colorSchema,
  defineLayer,
  set,
  task,
  tween,
} from "@chalk/prop";
import { z } from "zod";
import {
  AXIS_GAP,
  PAD,
  type Window,
  decimalsFor,
  formatValue,
  magnifyTarget,
  ticks,
  valueToX,
  zoomFrame,
} from "./scale";

/** The line runs from MIN to MAX; the window shows part of it, at most MAX_SPAN wide. */
export const MIN = -1_000_000;
export const MAX = 1_000_000;
/** The narrowest window: eight successive magnifications of a unit. */
export const MIN_SPAN = 1e-8;
export const MAX_SPAN = 20;
/** How long one magnification glides, in seconds. */
export const MAGNIFY_SECONDS = 1.2;

export const value = z.number().min(MIN).max(MAX);

/** The axis: the window on the line, its ticks and their numbers. Every layer draws on it. */
export type AxisState = {
  /** Left end of the window: the stretch of the line on screen. */
  from: number;
  /** Right end of the window. */
  to: number;
  /** Whether the ticks and their numbers are drawn (off when only the marks should speak). */
  showTicks: boolean;
  /** The colour of the tick numbers (blue for the natural numbers, say), or null for none. */
  color: string | null;
  /** The tenth picked out to be magnified next; the axis clears it whenever the window moves. */
  lens: { from: number; to: number } | null;
};

export const AxisPart = { Axis: "axis", TickPrefix: "tick:", Lens: "lens" } as const;
export const AxisAction = { ZoomTo: "zoomTo", ShowLens: "showLens", HideLens: "hideLens" } as const;
export const AxisSignal = { Zoomed: "zoomed" } as const;
export const AxisDerived = { Level: "level" } as const;

/** Decimal places the ticks go to at this window (0 for whole numbers, 1 for tenths, …). */
export const levelOf = (w: Window): number => decimalsFor((w.to - w.from) / 10);

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/**
 * Glides the window from where it is to `target`, frame by frame through the one door, scaling
 * evenly in log about the point both windows share. Stops if anything else moves the window.
 */
export async function glide(
  c: TaskContext<AxisState>,
  target: Window,
  seconds: number,
): Promise<void> {
  const start = { from: c.get().from, to: c.get().to };
  const frames = Math.max(1, Math.round(seconds * 60));
  let last = start;
  for (let i = 1; i <= frames; i++) {
    await c.wait(seconds / frames);
    const now = c.get();
    if (now.from !== last.from || now.to !== last.to) return;
    last = i === frames ? target : zoomFrame(start, target, easeInOut(i / frames));
    c.set(last);
  }
  c.emit(AxisSignal.Zoomed, { from: target.from, to: target.to, level: levelOf(target) });
}

const act = actionsFor<AxisState>();

export const axis = defineLayer({
  name: "axis",
  frame: FrameKind.Axis,
  describe:
    "The window on the line from `from` to `to`, with ticks and their numbers, and the lens: a tenth of the window picked out (any change of window clears it).",
  fields: {
    from: value,
    to: value,
    showTicks: z.boolean(),
    color: colorSchema.nullable(),
    lens: z.object({ from: value, to: value }).strict().nullable(),
  },
  defaults: { from: 0, to: 3, showTicks: true, color: null, lens: null },
  inputs: ["showTicks"],
  derived: {
    [AxisDerived.Level]: {
      describe:
        "How many decimal places the ticks go to at this zoom (0 for whole numbers, 1 for tenths, …)",
      compute: levelOf,
    },
  },
  actions: {
    [AxisAction.ZoomTo]: act({
      describe: "Show the window from `from` to `to`, gliding there over `over` seconds",
      args: z
        .object({ from: z.number(), to: z.number(), over: z.number().min(0).max(30) })
        .strict(),
      changes: ["from", "to", "lens"],
      run: (s, a) => {
        if (a.over === 0) return set({ from: a.from, to: a.to, lens: null });
        const isSameSize = Math.abs(Math.log10((a.to - a.from) / (s.to - s.from))) < 0.01;
        if (isSameSize) return tween(a.over, { from: a.from, to: a.to });
        return task((c) => {
          c.set({ lens: null });
          return glide(c, { from: a.from, to: a.to }, a.over);
        });
      },
    }),
    [AxisAction.ShowLens]: act({
      describe:
        "Pick out the tenth of the window that holds `value`: the stretch the next magnification zooms into",
      args: z.object({ value }).strict(),
      changes: ["lens"],
      run: (s, a) => set({ lens: magnifyTarget(s, a.value) }),
    }),
    [AxisAction.HideLens]: act({
      describe: "Stop picking out a tenth",
      args: z.object({}).strict(),
      changes: ["lens"],
      run: () => set({ lens: null }),
    }),
  },
  signals: {
    [AxisSignal.Zoomed]: {
      describe:
        "A zoom finished: the new window `from`–`to` and its `level` (decimal places of the ticks)",
    },
  },
  observe: (s) => {
    const level = levelOf(s);
    const elements: Element[] = [
      { id: AxisPart.Axis, value: { from: s.from, to: s.to }, words: `${s.from} to ${s.to}` },
    ];
    if (s.showTicks)
      for (const v of ticks({ from: s.from, to: s.to, width: 1 }))
        elements.push({ id: `${AxisPart.TickPrefix}${v}`, value: v, words: formatValue(v, level) });
    if (s.lens !== null) elements.push({ id: AxisPart.Lens, value: { ...s.lens } });
    return {
      summary: `a number line from ${s.from} to ${s.to}${s.showTicks ? ` (ticks every ${formatValue((s.to - s.from) / 10, level)})` : ""}`,
      elements,
    };
  },
  locate: (s, part, at) => {
    if (part === AxisPart.Axis) return { x: 0, y: AXIS_GAP - 10, width: at.width, height: 20 };
    if (part === AxisPart.Lens && s.lens !== null) {
      const x1 = at.toX(s.lens.from);
      return { x: x1, y: AXIS_GAP - 24, width: at.toX(s.lens.to) - x1, height: 48 };
    }
    if (!part.startsWith(AxisPart.TickPrefix) || !s.showTicks) return undefined;
    const v = Number(part.slice(AxisPart.TickPrefix.length));
    const span = s.to - s.from;
    const isTick = ticks({ from: s.from, to: s.to, width: at.width }).some(
      (t) => Math.abs(t - v) < span * 1e-9,
    );
    return isTick ? pointBox(at.toX(v)) : undefined;
  },
  invariant: (s) => {
    const span = s.to - s.from;
    if (span < MIN_SPAN * 0.999) return `the window must be at least ${MIN_SPAN} wide`;
    if (span > MAX_SPAN * (1 + 1e-9)) return `the window can be at most ${MAX_SPAN} wide`;
    return undefined;
  },
});

/** The box a point on the line is pointed at by. */
export const pointBox = (x: number) => ({ x: x - 14, y: AXIS_GAP - 14, width: 28, height: 28 });

/** The axis in pixels at a width: what the view draws with and `locate` measures with. */
export function axisPixels(s: Window, width: number) {
  const view = { from: s.from, to: s.to, width };
  return {
    from: s.from,
    to: s.to,
    width,
    y: AXIS_GAP,
    toX: (v: number) => valueToX(view, v),
    pad: PAD,
  };
}
