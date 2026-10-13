import { type Emit, type TaskContext, actionsFor, defineProp, set, task, tween } from "@chalk/prop";
import { z } from "zod";
import {
  AXIS_GAP,
  type Window,
  decimalsFor,
  formatValue,
  magnifyTarget,
  ticks,
  valueToX,
  zoomFrame,
} from "./scale";

export const NumberLinePart = {
  Axis: "axis",
  Marker: "marker",
  MarkPrefix: "mark:",
  TickPrefix: "tick:",
  Split: "split",
  SplitPointPrefix: "splitPoint:",
  Lens: "lens",
  ZoomIn: "zoomIn",
  ZoomOut: "zoomOut",
  SplitStepper: "splitStepper",
} as const;

export const NumberLineSignal = {
  MarkerReleased: "markerReleased",
  Zoomed: "zoomed",
  Split: "split",
} as const;

/** The line runs from MIN to MAX; the window shows part of it. */
export const MIN = -10;
export const MAX = 10;
/** The narrowest window: eight successive magnifications of a unit. */
export const MIN_SPAN = 1e-8;
export const MAX_SPAN = 20;
export const MAX_MARKS = 16;
export const MAX_PARTS = 24;
/** How long one magnification glides, in seconds. */
export const MAGNIFY_SECONDS = 1.2;

const value = z.number().min(MIN).max(MAX);

const markSchema = z
  .object({
    at: value,
    /** What the point is called: maths only ("1/2", "√2", "π", "2.665"). */
    label: z.string().min(1).max(24),
  })
  .strict();
export type Mark = z.infer<typeof markSchema>;

const splitSchema = z
  .object({
    from: value,
    to: value,
    /** How many equal parts the stretch is cut into. */
    parts: z.number().int().min(1).max(MAX_PARTS),
  })
  .strict();
export type Split = z.infer<typeof splitSchema>;

const stretch = z.object({ from: value, to: value }).strict();

const numberLineState = z
  .object({
    /** Left end of the window: the stretch of the line on screen. */
    from: value,
    /** Right end of the window. */
    to: value,
    /** Where the learner's marker is. */
    marker: value,
    showMarker: z.boolean(),
    /** Labelled points on the line. Points at the same place stack their labels. */
    marks: z.array(markSchema).max(MAX_MARKS),
    /** A stretch cut into equal parts, or null. */
    split: splitSchema.nullable(),
    /** A tenth of the window picked out to be magnified next, or null. */
    lens: stretch.nullable(),
    /** Whether the learner has zoom buttons. */
    isZoomable: z.boolean(),
    /** Whether the learner can change how many parts the split has. */
    isSplittable: z.boolean(),
  })
  .strict();
export type NumberLineState = z.infer<typeof numberLineState>;

const act = actionsFor<NumberLineState>();

/** The tenth of the window the marker sits in, in words: "1.4 and 1.5" on 1–2. */
function between(s: NumberLineState): string {
  const step = 10 ** Math.floor(Math.log10(s.to - s.from) + 1e-9) / 10;
  const digits = decimalsFor(step);
  const below = Math.floor(s.marker / step + 1e-9) * step;
  return `${formatValue(below, digits)} and ${formatValue(below + step, digits)}`;
}

function isInView(s: Window, at: number): boolean {
  const slack = (s.to - s.from) * 1e-9;
  return at >= s.from - slack && at <= s.to + slack;
}

/** The points that cut a split, from its start to its end (parts + 1 of them). */
export function splitPoints(split: Split): number[] {
  return Array.from(
    { length: split.parts + 1 },
    (_, i) => split.from + ((split.to - split.from) * i) / split.parts,
  );
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/**
 * Glides the window from where it is to `target`, frame by frame through the one door, scaling
 * evenly in log about the point both windows share. Stops if anything else moves the window.
 */
async function glide(
  c: TaskContext<NumberLineState>,
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
  c.emit(NumberLineSignal.Zoomed, {
    from: target.from,
    to: target.to,
    level: decimalsFor((target.to - target.from) / 10),
  });
}

function canMagnify(target: Window): boolean {
  return target.to - target.from >= MIN_SPAN * 0.999;
}

function splitSignal(split: Split): Emit {
  return {
    signal: NumberLineSignal.Split,
    payload: { parts: split.parts, between: split.parts - 1 },
  };
}

/** A number line you can magnify, mark and cut into equal parts. It knows numbers on a line, nothing more. */
export const numberLine = defineProp<NumberLineState>({
  type: "numberLine",
  describe:
    "A number line showing the window from `from` to `to`. It can show labelled points (marks), a stretch cut into equal parts (split), and a draggable marker. Magnifying picks the tenth of the window that holds a number and zooms into it, one decimal place per step (successive magnification).",
  state: numberLineState,
  defaults: {
    from: 0,
    to: 3,
    marker: 1.5,
    showMarker: false,
    marks: [],
    split: null,
    lens: null,
    isZoomable: false,
    isSplittable: false,
  },
  inputs: ["isZoomable", "isSplittable"],
  derived: {
    between: {
      describe: "The tenths of the window that the marker sits between",
      compute: between,
    },
    level: {
      describe:
        "How many decimal places the ticks go to at this zoom (0 for whole numbers, 1 for tenths, …)",
      compute: (s) => decimalsFor((s.to - s.from) / 10),
    },
    splitParts: {
      describe: "How many equal parts the split has (0 when there is none)",
      compute: (s) => s.split?.parts ?? 0,
    },
    splitPointsBetween: {
      describe:
        "How many cut points lie strictly between the split's two ends (one fewer than the parts)",
      compute: (s) => (s.split === null ? 0 : s.split.parts - 1),
    },
  },
  actions: {
    moveMarker: act({
      describe: "Put the marker at a value (what the learner's finger does)",
      byLearner: true,
      args: z.object({ to: z.number() }).strict(),
      run: (_s, a) => set({ marker: Math.min(MAX, Math.max(MIN, a.to)) }),
    }),
    showMarker: act({
      describe: "Show or hide the draggable marker",
      args: z.object({ isShown: z.boolean() }).strict(),
      run: (_s, a) => set({ showMarker: a.isShown }),
    }),
    zoomTo: act({
      describe: "Show the window from `from` to `to`, gliding there over `over` seconds",
      args: z
        .object({ from: z.number(), to: z.number(), over: z.number().min(0).max(30) })
        .strict(),
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
    showLens: act({
      describe:
        "Pick out the tenth of the window that holds `value`: the stretch the next magnification zooms into",
      args: z.object({ value }).strict(),
      run: (s, a) => set({ lens: magnifyTarget(s, a.value) }),
    }),
    hideLens: act({
      describe: "Stop picking out a tenth",
      args: z.object({}).strict(),
      run: () => set({ lens: null }),
    }),
    magnify: act({
      describe:
        "Zoom ten times into the tenth of the window that holds `value`, gliding: one more decimal place of `value` decided (successive magnification)",
      args: z.object({ value }).strict(),
      run: (s, a) => {
        const target = magnifyTarget(s, a.value);
        if (!canMagnify(target)) return set({});
        return task((c) => {
          c.set({ lens: null });
          return glide(c, target, MAGNIFY_SECONDS);
        });
      },
    }),
    zoomIn: act({
      describe:
        "Zoom ten times into the tenth that holds the marker (or the middle, with no marker), gliding: the learner's + button",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const target = magnifyTarget(s, s.showMarker ? s.marker : (s.from + s.to) / 2);
        if (!canMagnify(target)) return set({});
        return task((c) => {
          c.set({ lens: null });
          return glide(c, target, MAGNIFY_SECONDS * 0.8);
        });
      },
    }),
    zoomOut: act({
      describe:
        "Zoom out ten times around the middle of the window, gliding: the learner's − button",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const span = Math.min(20, (s.to - s.from) * 10);
        const mid = (s.from + s.to) / 2;
        const from = Math.min(MAX - span, Math.max(MIN, mid - span / 2));
        if (Math.abs(from - s.from) < 1e-12 && Math.abs(span - (s.to - s.from)) < 1e-12) {
          return set({});
        }
        return task((c) => {
          c.set({ lens: null });
          return glide(c, { from, to: from + span }, MAGNIFY_SECONDS * 0.8);
        });
      },
    }),
    placeMark: act({
      describe:
        "Show a labelled point on the line (a mark with the same label is moved, not doubled)",
      args: markSchema,
      run: (s, a) => {
        const rest = s.marks.filter((m) => m.label !== a.label);
        return set({ marks: [...rest, a].slice(-MAX_MARKS) });
      },
    }),
    removeMark: act({
      describe: "Remove the mark with this label",
      args: z.object({ label: z.string() }).strict(),
      run: (s, a) => set({ marks: s.marks.filter((m) => m.label !== a.label) }),
    }),
    clearMarks: act({
      describe: "Remove every mark",
      args: z.object({}).strict(),
      run: () => set({ marks: [] }),
    }),
    splitInto: act({
      describe: "Cut the stretch from `from` to `to` into `parts` equal parts",
      args: splitSchema,
      run: (_s, a) => set({ split: a }, splitSignal(a)),
    }),
    changeParts: act({
      describe:
        "Cut the split into one more or one fewer equal parts, keeping its ends: the learner's stepper",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (s.split === null) return set({});
        const parts = Math.min(MAX_PARTS, Math.max(1, s.split.parts + a.by));
        if (parts === s.split.parts) return set({});
        const split = { ...s.split, parts };
        return set({ split }, splitSignal(split));
      },
    }),
    clearSplit: act({
      describe: "Remove the split",
      args: z.object({}).strict(),
      run: () => set({ split: null }),
    }),
  },
  signals: {
    [NumberLineSignal.MarkerReleased]: { describe: "The learner let go of the marker" },
    [NumberLineSignal.Zoomed]: {
      describe:
        "A zoom finished: the new window `from`–`to` and its `level` (decimal places of the ticks)",
    },
    [NumberLineSignal.Split]: {
      describe:
        "The split changed: its `parts`, and how many cut points lie strictly `between` its ends",
    },
  },
  parts: (s) => {
    const view = { from: s.from, to: s.to, width: 1 };
    const out: string[] = [
      NumberLinePart.Axis,
      ...ticks(view).map((v) => `${NumberLinePart.TickPrefix}${v}`),
    ];
    if (s.showMarker) out.push(NumberLinePart.Marker);
    for (const mark of s.marks) {
      if (isInView(s, mark.at)) out.push(`${NumberLinePart.MarkPrefix}${mark.label}`);
    }
    if (s.split !== null) {
      out.push(NumberLinePart.Split);
      splitPoints(s.split).forEach((p, i) => {
        if (isInView(s, p)) out.push(`${NumberLinePart.SplitPointPrefix}${i}`);
      });
    }
    if (s.lens !== null) out.push(NumberLinePart.Lens);
    if (s.isZoomable) out.push(NumberLinePart.ZoomIn, NumberLinePart.ZoomOut);
    if (s.isSplittable && s.split !== null) out.push(NumberLinePart.SplitStepper);
    return out;
  },
  locate: (s, part, width) => {
    const view = { from: s.from, to: s.to, width };
    const at = (v: number) => ({
      x: valueToX(view, v) - 14,
      y: AXIS_GAP - 14,
      width: 28,
      height: 28,
    });
    if (part === NumberLinePart.Axis) return { x: 0, y: AXIS_GAP - 10, width, height: 20 };
    if (part === NumberLinePart.Marker) return s.showMarker ? at(s.marker) : undefined;
    if (part.startsWith(NumberLinePart.MarkPrefix)) {
      const label = part.slice(NumberLinePart.MarkPrefix.length);
      const mark = s.marks.find((m) => m.label === label);
      return mark !== undefined && isInView(s, mark.at) ? at(mark.at) : undefined;
    }
    if (part.startsWith(NumberLinePart.TickPrefix)) {
      const v = Number(part.slice(NumberLinePart.TickPrefix.length));
      const span = s.to - s.from;
      return ticks(view).some((t) => Math.abs(t - v) < span * 1e-9) ? at(v) : undefined;
    }
    if (part === NumberLinePart.Split && s.split !== null) {
      const x1 = valueToX(view, Math.max(s.from, s.split.from));
      const x2 = valueToX(view, Math.min(s.to, s.split.to));
      return { x: x1, y: AXIS_GAP - 16, width: Math.max(8, x2 - x1), height: 32 };
    }
    if (part.startsWith(NumberLinePart.SplitPointPrefix) && s.split !== null) {
      const p = splitPoints(s.split)[Number(part.slice(NumberLinePart.SplitPointPrefix.length))];
      return p !== undefined && isInView(s, p) ? at(p) : undefined;
    }
    if (part === NumberLinePart.Lens && s.lens !== null) {
      const x1 = valueToX(view, s.lens.from);
      return { x: x1, y: AXIS_GAP - 24, width: valueToX(view, s.lens.to) - x1, height: 48 };
    }
    return undefined;
  },
  invariant: (s) => {
    const span = s.to - s.from;
    if (span < MIN_SPAN * 0.999) return `the window must be at least ${MIN_SPAN} wide`;
    if (span > MAX_SPAN * (1 + 1e-9)) return `the window can be at most ${MAX_SPAN} wide`;
    if (s.split !== null && s.split.to <= s.split.from) return "a split must run left to right";
    return undefined;
  },
});
