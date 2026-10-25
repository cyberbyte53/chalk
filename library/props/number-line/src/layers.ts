import {
  type Element,
  type Emit,
  FrameKind,
  actionsFor,
  colorSchema,
  defineLayer,
  isInAxis,
  set,
  task,
} from "@chalk/prop";
import { z } from "zod";
import {
  type AxisState,
  MAGNIFY_SECONDS,
  MAX,
  MIN,
  MIN_SPAN,
  glide,
  pointBox,
  value,
} from "./axis";
import { AXIS_GAP, type Window, decimalsFor, formatValue, magnifyTarget } from "./scale";

/**
 * The number line's layers: each one feature on the axis, with its fields, actions, description
 * and parts. Any mix can be on; one left at its defaults shows nothing and isn't described.
 */

export const MAX_MARKS = 16;
/** Enough for seven rounds of halving every gap (127 points) and more. */
export const MAX_DOTS = 256;
export const MAX_PARTS = 24;

// ---- marker ----

export type MarkerState = AxisState & { marker: number; showMarker: boolean };
export const MarkerPart = { Marker: "marker" } as const;
export const MarkerAction = { MoveMarker: "moveMarker", ShowMarker: "showMarker" } as const;
export const MarkerSignal = { MarkerReleased: "markerReleased" } as const;
export const MarkerDerived = { Between: "between" } as const;

/** The tenth of the window the marker sits in, in words: "1.4 and 1.5" on 1–2. */
function between(s: MarkerState): string {
  const step = 10 ** Math.floor(Math.log10(s.to - s.from) + 1e-9) / 10;
  const digits = decimalsFor(step);
  const below = Math.floor(s.marker / step + 1e-9) * step;
  return `${formatValue(below, digits)} and ${formatValue(below + step, digits)}`;
}

const onMarker = actionsFor<MarkerState>();

export const marker = defineLayer({
  name: "marker",
  frame: FrameKind.Axis,
  describe: "A dot the learner drags along the line.",
  fields: { marker: value, showMarker: z.boolean() },
  defaults: { marker: 1.5, showMarker: false },
  derived: {
    [MarkerDerived.Between]: {
      describe: "The tenths of the window that the marker sits between",
      compute: between,
    },
  },
  actions: {
    [MarkerAction.MoveMarker]: onMarker({
      describe: "Put the marker at a value (what the learner's finger does)",
      byLearner: true,
      args: z.object({ to: z.number() }).strict(),
      changes: ["marker"],
      run: (_s, a) => set({ marker: Math.min(MAX, Math.max(MIN, a.to)) }),
    }),
    [MarkerAction.ShowMarker]: onMarker({
      describe: "Show or hide the draggable marker",
      args: z.object({ isShown: z.boolean() }).strict(),
      changes: ["showMarker"],
      run: (_s, a) => set({ showMarker: a.isShown }),
    }),
  },
  signals: { [MarkerSignal.MarkerReleased]: { describe: "The learner let go of the marker" } },
  observe: (s, w) =>
    s.showMarker && isInAxis(w, s.marker)
      ? {
          // The dot: only while it is shown and inside the window.
          elements: [{ id: MarkerPart.Marker, value: s.marker, does: MarkerAction.MoveMarker }],
          summary: `the dot at ${s.marker}`,
        }
      : { elements: [] },
  locate: (s, part, at) =>
    part === MarkerPart.Marker && s.showMarker ? pointBox(at.toX(s.marker)) : undefined,
});

// ---- marks ----

const markSchema = z
  .object({
    at: value,
    /** What the point is called: maths only ("1/2", "√2", "π", "2.665"). */
    label: z.string().min(1).max(24),
    /** Its colour; saffron when not given. */
    color: colorSchema.optional(),
  })
  .strict();
export type Mark = z.infer<typeof markSchema>;
export type MarksState = AxisState & { marks: Mark[] };
export const MarksPart = { MarkPrefix: "mark:" } as const;
export const MarksAction = {
  PlaceMark: "placeMark",
  RemoveMark: "removeMark",
  ClearMarks: "clearMarks",
} as const;
const onMarks = actionsFor<MarksState>();

export const marks = defineLayer({
  name: "marks",
  frame: FrameKind.Axis,
  describe: "Labelled points on the line. Points at the same place stack their labels.",
  fields: { marks: z.array(markSchema).max(MAX_MARKS) },
  defaults: { marks: [] },
  actions: {
    [MarksAction.PlaceMark]: onMarks({
      describe:
        "Show a labelled point on the line (a mark with the same label is moved, not doubled)",
      args: markSchema,
      changes: ["marks"],
      run: (s, a) => {
        const rest = s.marks.filter((m) => m.label !== a.label);
        return set({ marks: [...rest, a].slice(-MAX_MARKS) });
      },
    }),
    [MarksAction.RemoveMark]: onMarks({
      describe: "Remove the mark with this label",
      args: z.object({ label: z.string() }).strict(),
      changes: ["marks"],
      run: (s, a) => set({ marks: s.marks.filter((m) => m.label !== a.label) }),
    }),
    [MarksAction.ClearMarks]: onMarks({
      describe: "Remove every mark",
      args: z.object({}).strict(),
      changes: ["marks"],
      run: () => set({ marks: [] }),
    }),
  },
  observe: (s, w) => ({
    elements: s.marks
      .filter((m) => isInAxis(w, m.at))
      .map((m) => ({ id: `${MarksPart.MarkPrefix}${m.label}`, value: m.at })),
  }),
  locate: (s, part, at) => {
    if (!part.startsWith(MarksPart.MarkPrefix)) return undefined;
    const mark = s.marks.find((m) => m.label === part.slice(MarksPart.MarkPrefix.length));
    return mark !== undefined && isInAxis(s, mark.at) ? pointBox(at.toX(mark.at)) : undefined;
  },
});

// ---- dots ----

const dotSchema = z
  .object({
    at: value,
    /** Its colour; ink when not given. */
    color: colorSchema.optional(),
  })
  .strict();
export type Dot = z.infer<typeof dotSchema>;
export type DotsState = AxisState & { dots: Dot[] };
export const DotsPart = { Dots: "dots" } as const;
export const DotsAction = { PlaceDot: "placeDot", ClearDots: "clearDots" } as const;
export const DotsDerived = { DotCount: "dotCount" } as const;
const onDots = actionsFor<DotsState>();

export const dots = defineLayer({
  name: "dots",
  frame: FrameKind.Axis,
  describe:
    "Points with no label, for when there are too many to name (the line filling up). A student can't tell one from another, so they are one element: where they all are.",
  fields: { dots: z.array(dotSchema).max(MAX_DOTS) },
  defaults: { dots: [] },
  derived: {
    [DotsDerived.DotCount]: {
      describe: "How many dots are on the line",
      compute: (s) => s.dots.length,
    },
  },
  actions: {
    [DotsAction.PlaceDot]: onDots({
      describe:
        "Put an unlabelled dot on the line (a dot already there is recoloured, not doubled)",
      args: dotSchema,
      changes: ["dots"],
      run: (s, a) => {
        const at = s.dots.findIndex((d) => Math.abs(d.at - a.at) < 1e-12);
        if (at >= 0) return set({ dots: s.dots.map((d, i) => (i === at ? a : d)) });
        return s.dots.length >= MAX_DOTS ? set({}) : set({ dots: [...s.dots, a] });
      },
    }),
    [DotsAction.ClearDots]: onDots({
      describe: "Remove every dot",
      args: z.object({}).strict(),
      changes: ["dots"],
      run: () => set({ dots: [] }),
    }),
  },
  observe: (s, w) => {
    const shown = s.dots.filter((d) => isInAxis(w, d.at)).map((d) => d.at);
    return shown.length === 0
      ? { elements: [] }
      : {
          elements: [{ id: DotsPart.Dots, value: shown.sort((a, b) => a - b) }],
          summary: `${shown.length} dot${shown.length === 1 ? "" : "s"}`,
        };
  },
});

// ---- split ----

const splitSchema = z
  .object({
    from: value,
    to: value,
    /** How many equal parts the stretch is cut into. */
    parts: z.number().int().min(1).max(MAX_PARTS),
  })
  .strict();
export type Split = z.infer<typeof splitSchema>;
export type SplitState = AxisState & { split: Split | null; isSplittable: boolean };
export const SplitPart = {
  Split: "split",
  SplitPointPrefix: "splitPoint:",
  SplitStepper: "splitStepper",
} as const;
export const SplitAction = {
  SplitInto: "splitInto",
  ChangeParts: "changeParts",
  ClearSplit: "clearSplit",
} as const;
export const SplitSignal = { Split: "split" } as const;
export const SplitDerived = {
  SplitParts: "splitParts",
  SplitPointsBetween: "splitPointsBetween",
} as const;

/** The points that cut a split, from its start to its end (parts + 1 of them). */
export function splitPoints(split: Split): number[] {
  return Array.from(
    { length: split.parts + 1 },
    (_, i) => split.from + ((split.to - split.from) * i) / split.parts,
  );
}

function splitSignal(split: Split): Emit {
  return { signal: SplitSignal.Split, payload: { parts: split.parts, between: split.parts - 1 } };
}
const onSplit = actionsFor<SplitState>();

export const split = defineLayer({
  name: "split",
  frame: FrameKind.Axis,
  describe:
    "A stretch cut into equal parts; with `isSplittable`, the learner changes how many with a stepper.",
  fields: { split: splitSchema.nullable(), isSplittable: z.boolean() },
  defaults: { split: null, isSplittable: false },
  inputs: ["isSplittable"],
  derived: {
    [SplitDerived.SplitParts]: {
      describe: "How many equal parts the split has (0 when there is none)",
      compute: (s) => s.split?.parts ?? 0,
    },
    [SplitDerived.SplitPointsBetween]: {
      describe:
        "How many cut points lie strictly between the split's two ends (one fewer than the parts)",
      compute: (s) => (s.split === null ? 0 : s.split.parts - 1),
    },
  },
  actions: {
    [SplitAction.SplitInto]: onSplit({
      describe: "Cut the stretch from `from` to `to` into `parts` equal parts",
      args: splitSchema,
      changes: ["split"],
      run: (_s, a) => set({ split: a }, splitSignal(a)),
    }),
    [SplitAction.ChangeParts]: onSplit({
      describe:
        "Cut the split into one more or one fewer equal parts, keeping its ends: the learner's stepper",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      changes: ["split"],
      run: (s, a) => {
        if (s.split === null) return set({});
        const parts = Math.min(MAX_PARTS, Math.max(1, s.split.parts + a.by));
        if (parts === s.split.parts) return set({});
        const next = { ...s.split, parts };
        return set({ split: next }, splitSignal(next));
      },
    }),
    [SplitAction.ClearSplit]: onSplit({
      describe: "Remove the split",
      args: z.object({}).strict(),
      changes: ["split"],
      run: () => set({ split: null }),
    }),
  },
  signals: {
    [SplitSignal.Split]: {
      describe:
        "The split changed: its `parts`, and how many cut points lie strictly `between` its ends",
    },
  },
  observe: (s, w) => {
    if (s.split === null) return { elements: [] };
    const elements: Element[] = [
      {
        id: SplitPart.Split,
        value: { ...s.split },
        words: `${s.split.from} to ${s.split.to} in ${s.split.parts} equal parts`,
      },
    ];
    // The cuts are unlabelled: the student sees the 1st, 2nd, … cut, not a number.
    splitPoints(s.split).forEach((p, i) => {
      if (isInAxis(w, p))
        elements.push({ id: `${SplitPart.SplitPointPrefix}${i}`, value: i, words: `cut ${i}` });
    });
    if (s.isSplittable)
      elements.push({
        id: SplitPart.SplitStepper,
        value: s.split.parts,
        does: SplitAction.ChangeParts,
      });
    return {
      elements,
      // Where the cuts fall is not written on screen.
      hidden: { splitPoints: splitPoints(s.split).map((p) => Number(p.toPrecision(10))) },
      summary: `${s.split.from} to ${s.split.to} cut into ${s.split.parts} equal parts`,
    };
  },
  locate: (s, part, at) => {
    if (s.split === null) return undefined;
    if (part === SplitPart.Split) {
      const x1 = at.toX(Math.max(s.from, s.split.from));
      const x2 = at.toX(Math.min(s.to, s.split.to));
      return { x: x1, y: AXIS_GAP - 16, width: Math.max(8, x2 - x1), height: 32 };
    }
    if (part.startsWith(SplitPart.SplitPointPrefix)) {
      const p = splitPoints(s.split)[Number(part.slice(SplitPart.SplitPointPrefix.length))];
      return p !== undefined && isInAxis(s, p) ? pointBox(at.toX(p)) : undefined;
    }
    return undefined;
  },
  invariant: (s) =>
    s.split !== null && s.split.to <= s.split.from ? "a split must run left to right" : undefined,
});

// ---- zoom ----

export type ZoomState = MarkerState & { isZoomable: boolean };
export const ZoomPart = { ZoomIn: "zoomIn", ZoomOut: "zoomOut" } as const;
export const ZoomAction = { Magnify: "magnify", ZoomIn: "zoomIn", ZoomOut: "zoomOut" } as const;

function canMagnify(target: Window): boolean {
  return target.to - target.from >= MIN_SPAN * 0.999;
}
const onZoom = actionsFor<ZoomState>();

export const zoom = defineLayer({
  name: "zoom",
  frame: FrameKind.Axis,
  describe:
    "Successive magnification: zooming ten times into the tenth of the window that holds a number, one decimal place per step; with `isZoomable`, the learner has + and − buttons.",
  // + zooms into the tenth that holds the marker, when it is shown.
  needs: ["marker"],
  fields: { isZoomable: z.boolean() },
  defaults: { isZoomable: false },
  inputs: ["isZoomable"],
  actions: {
    [ZoomAction.Magnify]: onZoom({
      describe:
        "Zoom ten times into the tenth of the window that holds `value`, gliding: one more decimal place of `value` decided (successive magnification)",
      args: z.object({ value }).strict(),
      changes: ["from", "to", "lens"],
      run: (s, a) => {
        const target = magnifyTarget(s, a.value);
        if (!canMagnify(target)) return set({});
        return task((c) => {
          c.set({ lens: null });
          return glide(c, target, MAGNIFY_SECONDS);
        });
      },
    }),
    [ZoomAction.ZoomIn]: onZoom({
      describe:
        "Zoom ten times into the tenth that holds the marker (or the middle, with no marker), gliding: the learner's + button",
      byLearner: true,
      args: z.object({}).strict(),
      changes: ["from", "to", "lens"],
      run: (s) => {
        const target = magnifyTarget(s, s.showMarker ? s.marker : (s.from + s.to) / 2);
        if (!canMagnify(target)) return set({});
        return task((c) => {
          c.set({ lens: null });
          return glide(c, target, MAGNIFY_SECONDS * 0.8);
        });
      },
    }),
    [ZoomAction.ZoomOut]: onZoom({
      describe:
        "Zoom out ten times around the middle of the window, gliding: the learner's − button",
      byLearner: true,
      args: z.object({}).strict(),
      changes: ["from", "to", "lens"],
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
  },
  observe: (s) =>
    s.isZoomable
      ? {
          elements: [
            { id: ZoomPart.ZoomIn, does: ZoomAction.ZoomIn },
            { id: ZoomPart.ZoomOut, does: ZoomAction.ZoomOut },
          ],
        }
      : { elements: [] },
});

// ---- pan ----

const panSchema = z
  .object({
    /** The furthest left the window's left end can go. */
    min: value,
    /** The furthest right the window's right end can go. */
    max: value,
  })
  .strict();
export type Pan = z.infer<typeof panSchema>;
export type PanState = AxisState & { pan: Pan | null };
export const PanPart = { Pan: "pan" } as const;
export const PanAction = { PanTo: "panTo" } as const;
export const PanSignal = { Panned: "panned" } as const;

/** The window slid to start at `from`, keeping its width, kept inside the pan. */
export function panned(s: Window, pan: Pan, from: number): Window {
  const span = s.to - s.from;
  const left = Math.min(pan.max - span, Math.max(pan.min, from));
  return { from: left, to: left + span };
}
const onPan = actionsFor<PanState>();

export const pan = defineLayer({
  name: "pan",
  frame: FrameKind.Axis,
  describe: "The learner slides the line by dragging it, within `pan`.",
  fields: { pan: panSchema.nullable() },
  defaults: { pan: null },
  actions: {
    [PanAction.PanTo]: onPan({
      describe:
        "Slide the line so the window starts at `from`, keeping its width, inside `pan` (what dragging the line does)",
      byLearner: true,
      args: z.object({ from: z.number() }).strict(),
      changes: ["from", "to"],
      run: (s, a) => (s.pan === null ? set({}) : set(panned(s, s.pan, a.from))),
    }),
  },
  signals: {
    [PanSignal.Panned]: {
      describe: "The learner let go after sliding the line: the window `from`–`to` it rests on",
    },
  },
  observe: (s) =>
    s.pan === null
      ? { elements: [] }
      : { elements: [{ id: PanPart.Pan, value: { ...s.pan }, does: PanAction.PanTo }] },
  locate: (s, part, at) =>
    part === PanPart.Pan && s.pan !== null
      ? { x: 0, y: 0, width: at.width, height: AXIS_GAP + 30 }
      : undefined,
  invariant: (s) =>
    s.pan !== null && s.pan.max - s.pan.min < s.to - s.from
      ? "the pan must be wider than the window"
      : undefined,
});
