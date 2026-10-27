import { type FramePixels, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * The optics kit: an optical bench (a frame: the window, the principal axis, a ruler) and the
 * leaves every instrument on it shares: the points on the axis, the object, the image, the rays,
 * a screen, the learner's "?" marker, a readout, ray buttons and a focal-length stepper. A lens and
 * a spherical mirror are groups of these plus their own element (thinLens, curvedMirror).
 *
 * Every leaf holds only what it draws, in cm on the bench. The instrument works out the physics
 * (the image, each ray, what the screen catches) and binds it in; the leaves the learner moves
 * (object, screen, marker, buttons, stepper) are routed back to the instrument's own actions.
 *
 * The look (the lens's "ln" classes, the mirror's "sm") is the group view's theme, never state, so
 * each instrument keeps its exact drawing while they share the code. Whether a leaf is there right
 * now is the group's `show` link, never a field of the leaf.
 */

export const Look = { Lens: "ln", Mirror: "sm" } as const;
export type Look = (typeof Look)[keyof typeof Look];

const cm = z.number().min(-1000).max(1000);

/** To the nearest half cm: where a dragged part lands. */
const halfCm = (x: number) => Math.round(x * 2) / 2;
const within = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const point = z.tuple([cm, cm]);
export type Pt = z.infer<typeof point>;

/** Room each part's words take in a description: what the instrument says about it. */
const says = z.string().max(400);

// ---- the bench: the frame ----

const windowSchema = z.object({ xMin: cm, xMax: cm, yMax: z.number().positive() }).strict();
export type BenchWindow = z.infer<typeof windowSchema>;

const benchState = z
  .object({
    /** The stretch of axis (cm) and the height either side of it that must fit. */
    window: windowSchema,
    /** The stage's height as a share of its width. */
    aspect: z.number().min(0.2).max(2),
    /** Room kept clear inside the stage's edges, px. */
    pad: z.number().min(0).max(40),
    /** Ruler ticks along the axis (cm from the pole), with numbers on the tens; empty: none. */
    ticks: z.array(cm).max(200),
    /** What the picture shows, for a screen reader. */
    label: z.string().max(300),
  })
  .strict();
export type BenchState = z.infer<typeof benchState>;

/** The ruler's numbers sit on their own row, below the axis points' names, px. */
export const RULER_ROW = 36;

/**
 * Pixels at a width: a fixed-shape stage, the window scaled uniformly to fit inside the pad and
 * centred, so a cm is the same size across and up. (The lens and the mirror drew with this.)
 */
export function benchPixels(s: Pick<BenchState, "window" | "aspect" | "pad">, width: number) {
  const w = s.window;
  const height = Math.round(width * s.aspect);
  const span = w.xMax - w.xMin;
  const scale = Math.min((width - 2 * s.pad) / span, (height - 2 * s.pad) / (2 * w.yMax));
  const left = (width - span * scale) / 2;
  const toCm = (px: number) => w.xMin + (px - left) / scale;
  const pixels: FramePixels & { scale: number; toCm: (px: number) => number } = {
    width,
    height,
    scale,
    toCm,
    domain: { x: [toCm(0), toCm(width)], y: [-height / 2 / scale, height / 2 / scale] },
    toPx: (x, y = 0) => [left + (x - w.xMin) * scale, height / 2 - y * scale],
    fromPx: (px, py = 0) => [toCm(px), (height / 2 - py) / scale],
  };
  return pixels;
}

export const bench = defineProp({
  type: "opticalBench",
  isExplainer: false,
  describe:
    "An optical bench: a window on the principal axis in cm, light travelling left to right, an optional ruler along the axis. Instruments, objects, rays and screens draw on it.",
  state: benchState,
  defaults: {
    window: { xMin: -30, xMax: 30, yMax: 15 },
    aspect: 0.6,
    pad: 8,
    ticks: [],
    label: "An optical bench",
  },
  actions: {},
  frame: { kind: "bench", pixels: benchPixels, label: (s) => s.label },
  anatomy: {
    bench: { is: "drawing" },
    ruler: {
      is: "drawing",
      when: (s) => s.ticks.length > 0,
      value: (s) =>
        `a ruler along the axis, ticks every ${Math.abs((s.ticks[1] ?? 0) - (s.ticks[0] ?? 0))} cm`,
    },
  },
  summary: (s) =>
    `the principal axis from ${Math.round(s.window.xMin)} to ${Math.round(s.window.xMax)} cm`,
});

// ---- points on the axis ----

const axisPoint = z
  .object({ id: z.string().min(1).max(12), x: cm, name: z.string().max(4), says })
  .strict();
export type AxisPoint = z.infer<typeof axisPoint>;

export const axisPoints = defineProp({
  type: "axisPoints",
  isExplainer: false,
  describe: "Named points on the principal axis: a dot each (O, F₁, F₂; P, F, C), named below it.",
  state: z.object({ points: z.array(axisPoint).max(12), showNames: z.boolean() }).strict(),
  defaults: { points: [], showNames: true },
  drawsOn: "bench",
  actions: {},
  anatomy: {
    point: {
      is: "label",
      each: (s) => (s.showNames ? s.points.map((p) => ({ id: p.id, value: p.says })) : []),
    },
  },
  summary: (s) => s.points.map((p) => p.name).join(", "),
});

// ---- the object ----

export const ObjectStyle = { Arrow: "arrow", Phone: "phone" } as const;
export type ObjectStyle = (typeof ObjectStyle)[keyof typeof ObjectStyle];
export const OpticObjectAction = { Move: "move" } as const;
export const OpticObjectSignal = { Released: "released" } as const;

const objectState = z
  .object({
    /** Its foot on the axis, cm, and how tall it stands. */
    x: cm,
    height: z.number().positive().max(200),
    style: z.nativeEnum(ObjectStyle),
    /** Its small name beside it ("object", "phone"); null: no name. */
    name: z.enum(["object", "phone"]).nullable(),
    /** Where the learner may drag it, cm, in half-cm steps; arrow keys move it `nudge` cm. */
    min: cm,
    max: cm,
    nudge: z.number().positive(),
    says,
  })
  .strict();
export type OpticObjectState = z.infer<typeof objectState>;
const onObject = actionsFor<OpticObjectState>();

export const opticObject = defineProp({
  type: "opticObject",
  isExplainer: false,
  describe:
    "The object: an upright arrow (or a phone held upside down) standing on the axis. The learner drags its tip along the axis.",
  state: objectState,
  defaults: {
    x: -30,
    height: 4,
    style: ObjectStyle.Arrow,
    name: "object",
    min: -200,
    max: -0.5,
    nudge: 1,
    says: "",
  },
  drawsOn: "bench",
  actions: {
    [OpticObjectAction.Move]: onObject({
      describe: "Move the object to x cm (the learner dragging it, or an arrow key)",
      byLearner: true,
      args: z.object({ x: cm }).strict(),
      changes: ["x"],
      run: (s, a) => set({ x: Math.min(s.max, Math.max(s.min, a.x)) }),
    }),
  },
  signals: { [OpticObjectSignal.Released]: { describe: "The learner let go of it; `x`" } },
  invariant: (s) => (s.min <= s.max ? undefined : "min must not be above max"),
  anatomy: {
    object: {
      is: "control",
      value: (s) => s.says,
      name: (s) => s.name ?? "object",
      drag: {
        axis: "x",
        at: (s) => ({ x: s.x, y: s.height }),
        place: (s, to) => ({ x: within(halfCm(to.x), s.min, s.max), y: s.height }),
        move: OpticObjectAction.Move,
        release: { signal: OpticObjectSignal.Released },
        step: (s) => s.nudge,
      },
    },
  },
  summary: (s) => s.says,
});

// ---- the image ----

const imageState = z
  .object({
    /** Its tip, cm (height negative: inverted), and whether it is real; null: at infinity. */
    tip: z.object({ x: cm, height: cm, isReal: z.boolean() }).strict().nullable(),
    /** Fainter (half the lens covered: fewer rays make it). */
    isDim: z.boolean(),
    showName: z.boolean(),
    /** What the picture says instead when the image falls outside it, or is at infinity. */
    whenOutside: z.string().max(200),
    whenInfinite: z.string().max(200),
    says,
  })
  .strict();
export type OpticImageState = z.infer<typeof imageState>;

export const opticImage = defineProp({
  type: "opticImage",
  isExplainer: false,
  describe:
    "The image: an arrow at the image's place (dashed when virtual); a line of words instead when it is at infinity or outside the picture.",
  state: imageState,
  defaults: {
    tip: null,
    isDim: false,
    showName: true,
    whenOutside: "",
    whenInfinite: "image at infinity",
    says: "",
  },
  drawsOn: "bench",
  actions: {},
  anatomy: { image: { is: "drawing", when: (s) => s.tip !== null, value: (s) => s.says } },
  summary: (s) => (s.tip !== null ? s.says : ""),
});

// ---- rays ----

/** A ray's id: "ray:parallel". */
export const RAY = "ray:";

/**
 * One straight piece of a ray, cm: from a point to a point, or on along a direction to the edge
 * of the picture (`toward`, `edge`). Solid pieces carry an arrowhead `at` a share of the way.
 */
const piece = z
  .object({
    from: point,
    to: point.optional(),
    /** A direction to go on in, to the picture's left or right edge. */
    toward: point.optional(),
    edge: z.enum(["left", "right"]).optional(),
    /** The line going on to the edge passes through here instead of `from` (drawn from `from`). */
    via: point.optional(),
    /** Starts at the picture's left edge, on the line from `from` to `to` (a ray coming in from off the picture). */
    fromLeftEdge: z.boolean().optional(),
    isDashed: z.boolean().optional(),
    at: z.number().min(0).max(1).optional(),
  })
  .strict();
export type RayPiece = z.infer<typeof piece>;
const ray = z
  .object({
    id: z.string().min(1).max(24),
    pieces: z.array(piece).max(8),
    /** Extra class on the ray's group (a beam's rays look lighter). */
    kind: z.enum(["ray", "beam"]),
    says,
  })
  .strict();
export type OpticRay = z.infer<typeof ray>;

export const opticRays = defineProp({
  type: "opticRays",
  isExplainer: false,
  describe:
    "Rays: straight pieces with arrowheads, dashed where a ray is only traced back or aimed at a point; clipped to the picture.",
  state: z
    .object({
      rays: z.array(ray).max(12),
      /** Bright spots where a beam meets (a concave mirror's F). */
      spots: z.array(point).max(4),
      /** What a beam of sunlight does, in words; empty: no beam. */
      beamSays: says,
    })
    .strict(),
  defaults: { rays: [], spots: [], beamSays: "" },
  drawsOn: "bench",
  actions: {},
  anatomy: {
    beam: { is: "drawing", when: (s) => s.beamSays !== "", value: (s) => s.beamSays },
    ray: {
      is: "drawing",
      each: (s) =>
        s.rays.filter((r) => r.says !== "").map((r) => ({ id: `${RAY}${r.id}`, value: r.says })),
    },
  },
  summary: (s) => `${s.rays.length} ray(s)`,
});

// ---- a screen ----

export const ScreenAction = { Move: "move" } as const;
export const ScreenSignal = { Released: "released" } as const;
const screenState = z
  .object({
    x: cm,
    /** Half its height, cm. */
    half: z.number().positive(),
    canMove: z.boolean(),
    min: cm,
    max: cm,
    nudge: z.number().positive(),
    /** What lands on it: a sharp image, a blurred one (blur: half-height of each point's patch, cm), or only light. */
    caught: z
      .object({
        /** The image's tip's height at the screen, cm. */
        height: cm,
        /** Where the tip's patch is centred, cm. */
        centre: cm,
        blur: z.number().min(0),
        isSharp: z.boolean(),
      })
      .strict()
      .nullable(),
    /** How blurred, cm (for the light-only patch's softness too). */
    blur: z.number().min(0),
    /** The cone of light from the object's tip: thin lines, cm. */
    cone: z.array(piece).max(8),
    says,
  })
  .strict();
export type ScreenState = z.infer<typeof screenState>;
const onScreen = actionsFor<ScreenState>();

export const opticScreen = defineProp({
  type: "opticScreen",
  isExplainer: false,
  describe:
    "A white screen on a stand, standing on the axis: it catches a sharp picture where a real image forms, a blur near it, only light otherwise. The learner can slide it.",
  state: screenState,
  defaults: {
    x: 10,
    half: 5,
    canMove: false,
    min: -200,
    max: 200,
    nudge: 0.5,
    caught: null,
    blur: 0,
    cone: [],
    says: "",
  },
  drawsOn: "bench",
  actions: {
    [ScreenAction.Move]: onScreen({
      describe: "Slide the screen to x cm (the learner's drag, or an arrow key)",
      byLearner: true,
      args: z.object({ x: cm }).strict(),
      changes: ["x"],
      run: (s, a) => set({ x: Math.min(s.max, Math.max(s.min, a.x)) }),
    }),
  },
  signals: { [ScreenSignal.Released]: { describe: "The learner let go of the screen; `x`" } },
  anatomy: {
    screen: {
      is: "control",
      value: (s) => s.says,
      name: () => "screen",
      drag: {
        axis: "x",
        at: (s) => ({ x: s.x, y: 0 }),
        place: (s, to) => ({ x: within(halfCm(to.x), s.min, s.max), y: 0 }),
        move: ScreenAction.Move,
        release: { signal: ScreenSignal.Released },
        step: (s) => s.nudge,
        enabled: (s) => s.canMove,
      },
    },
  },
  summary: (s) => s.says,
});

// ---- the learner's "?" marker ----

export const MarkerAction = { Move: "move" } as const;
export const MarkerSignal = { Released: "released" } as const;
const markerState = z
  .object({
    at: z.object({ x: cm, y: cm }).strict(),
    /** On the image's tip: drawn ✓. */
    isRight: z.boolean(),
    /** Where it may go, cm. */
    bounds: z.object({ xMin: cm, xMax: cm, yMin: cm, yMax: cm }).strict(),
    says,
  })
  .strict();
export type MarkerState = z.infer<typeof markerState>;
const onMarker = actionsFor<MarkerState>();

export const marker = defineProp({
  type: "imageMarker",
  isExplainer: false,
  describe:
    "A “?” the learner drops where they think the image's tip is; it turns to ✓ on the tip.",
  state: markerState,
  defaults: {
    at: { x: 0, y: 0 },
    isRight: false,
    bounds: { xMin: -200, xMax: 200, yMin: -100, yMax: 100 },
    says: "",
  },
  drawsOn: "bench",
  actions: {
    [MarkerAction.Move]: onMarker({
      describe: "Put the marker at (x, y) cm (the learner's drag, or arrow keys)",
      byLearner: true,
      args: z.object({ x: cm, y: cm }).strict(),
      changes: ["at"],
      run: (s, a) =>
        set({
          at: {
            x: Math.min(s.bounds.xMax, Math.max(s.bounds.xMin, a.x)),
            y: Math.min(s.bounds.yMax, Math.max(s.bounds.yMin, a.y)),
          },
        }),
    }),
  },
  signals: { [MarkerSignal.Released]: { describe: "The learner let go of the marker; `x`, `y`" } },
  anatomy: {
    mark: {
      is: "control",
      value: (s) => s.says,
      // Anywhere in its bounds that the picture shows, in half cm.
      drag: {
        axis: "xy",
        at: (s) => s.at,
        place: (s, to, shown) => ({
          x: within(
            halfCm(to.x),
            Math.max(s.bounds.xMin, shown.xMin),
            Math.min(s.bounds.xMax, shown.xMax),
          ),
          y: within(halfCm(to.y), s.bounds.yMin, s.bounds.yMax),
        }),
        move: MarkerAction.Move,
        release: { signal: MarkerSignal.Released },
        step: () => 0.5,
        // Its round face stays whole inside the picture.
        inset: 14,
      },
    },
  },
  summary: (s) => s.says,
});

// ---- under the picture: a readout, ray buttons, a focal-length stepper ----

export const readout = defineProp({
  type: "opticReadout",
  isExplainer: false,
  describe: "A line of numbers under the picture: u, v and f with their signs.",
  state: z.object({ text: z.string().max(200) }).strict(),
  defaults: { text: "" },
  actions: {},
  anatomy: { readout: { is: "readout", value: (s) => s.text, when: (s) => s.text !== "" } },
  summary: (s) => s.text,
});

export const RayButtonsAction = { Toggle: "toggle" } as const;
/** A ray button's id: "button:parallel". */
export const RAY_BUTTON = "button:";
const rayButtonsState = z
  .object({
    /** Each button: the ray it switches, and what it says (English, Hindi). */
    buttons: z
      .array(z.object({ ray: z.string().min(1).max(16), en: z.string(), hi: z.string() }).strict())
      .max(4),
    on: z.array(z.string().min(1).max(16)).max(4),
  })
  .strict();
export type RayButtonsState = z.infer<typeof rayButtonsState>;
const onButtons = actionsFor<RayButtonsState>();

export const rayButtons = defineProp({
  type: "rayButtons",
  isExplainer: false,
  describe: "Buttons 1, 2, 3 (4) that switch each standard ray on or off.",
  state: rayButtonsState,
  defaults: { buttons: [], on: [] },
  actions: {
    [RayButtonsAction.Toggle]: onButtons({
      describe: "Switch one ray on or off",
      byLearner: true,
      args: z.object({ ray: z.string().min(1).max(16) }).strict(),
      changes: ["on"],
      run: (s, a) =>
        set({ on: s.on.includes(a.ray) ? s.on.filter((r) => r !== a.ray) : [...s.on, a.ray] }),
    }),
  },
  anatomy: {
    button: {
      is: "control",
      // One per ray: on or off, and what it says.
      each: (s) =>
        s.buttons.map((b) => ({
          id: `${RAY_BUTTON}${b.ray}`,
          value: s.on.includes(b.ray),
          words: b.en,
        })),
      press: {
        action: RayButtonsAction.Toggle,
        args: (_s, id) => ({ ray: id.slice(RAY_BUTTON.length) }),
      },
    },
  },
  summary: (s) => `ray buttons, on: ${s.on.join(", ") || "none"}`,
});

export const FocalStepperAction = { Change: "change" } as const;
const focalStepperState = z
  .object({
    value: z.number(),
    min: z.number(),
    max: z.number(),
  })
  .strict();
export type FocalStepperState = z.infer<typeof focalStepperState>;
const onFocal = actionsFor<FocalStepperState>();

export const focalStepper = defineProp({
  type: "focalStepper",
  isExplainer: false,
  describe: "− f = 10 cm +: the focal length's size, a cm at a time.",
  state: focalStepperState,
  defaults: { value: 10, min: 4, max: 40 },
  actions: {
    [FocalStepperAction.Change]: onFocal({
      describe: "Set the focal length to `to` cm",
      byLearner: true,
      args: z.object({ to: z.number() }).strict(),
      changes: ["value"],
      run: (s, a) => set({ value: Math.min(s.max, Math.max(s.min, a.to)) }),
    }),
  },
  anatomy: {
    less: {
      is: "control",
      name: () => "shorter focal length",
      press: {
        action: FocalStepperAction.Change,
        args: (s) => ({ to: s.value - 1 }),
        enabled: (s) => s.value - 1 >= s.min,
      },
    },
    value: { is: "readout", value: (s) => s.value, words: (s) => `f = ${s.value} cm` },
    more: {
      is: "control",
      name: () => "longer focal length",
      press: {
        action: FocalStepperAction.Change,
        args: (s) => ({ to: s.value + 1 }),
        enabled: (s) => s.value + 1 <= s.max,
      },
    },
  },
  summary: (s) => `f = ${s.value} cm`,
});
