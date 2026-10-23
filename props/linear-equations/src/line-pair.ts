import { type Box, type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  Consistency,
  EquationForm,
  type Line,
  type Point,
  Relation,
  type Window,
  consistencyOf,
  equationOf,
  fracText,
  handlesOf,
  isOnLine,
  leftSide,
  lineThrough,
  niceText,
  ratioTestOf,
  ratiosOf,
  relationOf,
  solutionOf,
  triangleWith,
} from "./algebra";

/**
 * A coordinate plane with one or two straight lines, each the graph of a linear equation
 * a x + b y + c = 0. Every point on a line is a solution of its equation; a point on both lines is
 * a solution of the pair. Two lines meet once, never (parallel) or everywhere (the same line).
 */

export const LinePairAction = {
  SetLine: "setLine",
  MoveHandle: "moveHandle",
  SetCoefficient: "setCoefficient",
  MoveProbe: "moveProbe",
} as const;

export const LinePairSignal = { Changed: "changed", Probed: "probed" } as const;

export const LinePairDerived = {
  Relation: "relation",
  Consistency: "consistency",
  Solution: "solution",
  RatioTest: "ratioTest",
  Equations: "equations",
  ProbeOn: "probeOn",
  Triangle: "triangle",
} as const;

export const LinePairPart = {
  Plane: "plane",
  Line: "line",
  Handle: "handle",
  Meet: "meet",
  Probe: "probe",
  Equations: "equations",
  Tables: "tables",
  Ratios: "ratios",
  Steppers: "steppers",
} as const;

export const Coefficient = { A: "a", B: "b", C: "c" } as const;
export type Coefficient = (typeof Coefficient)[keyof typeof Coefficient];

export const ShadeAxis = { X: "x", Y: "y" } as const;
export type ShadeAxis = (typeof ShadeAxis)[keyof typeof ShadeAxis];

/** How far the plane reaches either way, at most. */
export const MAX_REACH = 60;
const reach = z.number().min(-MAX_REACH).max(MAX_REACH);
const point = z.tuple([reach, reach]);
const number = z.number().finite().min(-1e6).max(1e6);

const lineSchema = z
  .object({ a: number, b: number, c: number })
  .strict()
  .refine((l) => l.a !== 0 || l.b !== 0, "a and b can't both be 0");

const variable = z.string().regex(/^[a-z]$/);

const linePairState = z
  .object({
    /** One or two lines, each a x + b y + c = 0. */
    lines: z.array(lineSchema).min(1).max(2),
    /** The two points each line is held by while dragged; null (or missing): NCERT-style points. */
    handles: z.array(z.tuple([point, point]).nullable()).max(2),
    /** The two variables' letters, x and y unless the problem names them (s and t for ages). */
    variables: z.tuple([variable, variable]),
    /** How the equations are written: a x + b y = k, or a x + b y + c = 0. */
    form: z.nativeEnum(EquationForm),
    /** The part of the plane shown. */
    window: z
      .object({ xMin: reach, xMax: reach, yMin: reach, yMax: reach })
      .strict()
      .refine((w) => w.xMin < w.xMax && w.yMin < w.yMax, "the window is upside down"),
    /** Handles and the probe move in steps of this much. */
    snap: z.number().positive(),
    /** Whether the learner can drag the lines by their two dots. */
    canDrag: z.boolean(),
    /** The line (0 or 1) whose a, b, c the learner can change with − and + buttons; null: none. */
    editLine: z.union([z.literal(0), z.literal(1)]).nullable(),
    /** The equations, colour-matched to their lines, under the plane. */
    showEquations: z.boolean(),
    /** For each line, a small table of the two solutions it is drawn through (NCERT Table 3.1). */
    showTables: z.boolean(),
    /** The point where the lines meet, marked with its coordinates. */
    showSolution: z.boolean(),
    /** a₁/a₂, b₁/b₂, c₁/c₂ compared, and what that says (NCERT Table 3.4). */
    showRatios: z.boolean(),
    /** A point to test: its x, y, and whether it satisfies each equation. Null: no point. */
    probe: point.nullable(),
    /** Whether the learner can drag the test point. */
    canMoveProbe: z.boolean(),
    /** Shade the triangle the two lines make with the x-axis or the y-axis; null: none. */
    shade: z.nativeEnum(ShadeAxis).nullable(),
  })
  .strict();
export type LinePairState = z.infer<typeof linePairState>;

const act = actionsFor<LinePairState>();

/** The two points line i is held by (stored while dragged, otherwise picked like NCERT's tables). */
export function handlesFor(s: LinePairState, i: number): [Point, Point] {
  const stored = s.handles[i];
  const line = s.lines[i];
  if (stored !== null && stored !== undefined) return stored;
  return line === undefined
    ? [
        [0, 0],
        [1, 1],
      ]
    : handlesOf(line, s.window);
}

const relationIn = (s: LinePairState): Relation | null => {
  const [l1, l2] = s.lines;
  return l1 !== undefined && l2 !== undefined ? relationOf(l1, l2) : null;
};

const solutionIn = (s: LinePairState): [number, number] | null => {
  const [l1, l2] = s.lines;
  if (l1 === undefined || l2 === undefined) return null;
  const p = solutionOf(l1, l2);
  return p === null ? null : [p[0].valueOf(), p[1].valueOf()];
};

const solutionTextIn = (s: LinePairState): string | null => {
  const [l1, l2] = s.lines;
  if (l1 === undefined || l2 === undefined) return null;
  const p = solutionOf(l1, l2);
  return p === null ? null : `(${fracText(p[0])}, ${fracText(p[1])})`;
};

const snapTo = (v: number, step: number) => {
  const r = Math.round(v / step) * step;
  return Object.is(r, -0) ? 0 : Number(r.toFixed(6));
};

const clampTo = (w: Window, x: number, y: number): [number, number] => [
  Math.min(w.xMax, Math.max(w.xMin, x)),
  Math.min(w.yMax, Math.max(w.yMin, y)),
];

function changed(s: LinePairState): Emit {
  return {
    signal: LinePairSignal.Changed,
    payload: {
      equations: s.lines.map((l) => equationOf(l, s.variables, s.form, false)),
      relation: relationIn(s),
      solution: solutionIn(s),
    },
  };
}

const lineWords = (s: LinePairState, i: number) => {
  const line = s.lines[i];
  return line === undefined ? "" : equationOf(line, s.variables, s.form, false);
};

const relationWords: Record<Relation, string> = {
  [Relation.Intersecting]: "intersecting lines: exactly one solution (consistent)",
  [Relation.Parallel]: "parallel lines: no solution (inconsistent)",
  [Relation.Coincident]: "coincident lines: infinitely many solutions (dependent, consistent)",
};

export const linePair = defineProp({
  type: "linePair",
  describe:
    "A coordinate plane with one or two straight lines, each the graph of a linear equation in two variables, a x + b y + c = 0. Every solution (x, y) of an equation is a point on its line, and every point on the line is a solution. A pair of lines meets at exactly one point (intersecting: one solution, consistent), never (parallel: no solution, inconsistent) or everywhere (coincident: infinitely many solutions, dependent). Comparing a₁/a₂, b₁/b₂ and c₁/c₂ tells which without drawing: a₁/a₂ ≠ b₁/b₂ intersect; a₁/a₂ = b₁/b₂ ≠ c₁/c₂ parallel; all three equal coincident. The learner can drag a line by two dots, change one line's a, b, c with buttons, or drag a test point to see whether it satisfies each equation. It can show each line's table of two solutions, the meeting point, the ratios, and the triangle two lines make with an axis.",
  state: linePairState,
  defaults: {
    lines: [
      { a: 1, b: -2, c: 0 },
      { a: 3, b: 4, c: -20 },
    ],
    handles: [],
    variables: ["x", "y"],
    form: EquationForm.Equals,
    window: { xMin: -2, xMax: 8, yMin: -2, yMax: 7 },
    snap: 1,
    canDrag: false,
    editLine: null,
    showEquations: true,
    showTables: false,
    showSolution: true,
    showRatios: false,
    probe: null,
    canMoveProbe: false,
    shade: null,
  },
  inputs: [
    "showEquations",
    "showTables",
    "showSolution",
    "showRatios",
    "canDrag",
    "canMoveProbe",
    "editLine",
    "shade",
  ],
  derived: {
    [LinePairDerived.Relation]: {
      describe:
        "How the two lines sit: intersecting, parallel or coincident (null with only one line)",
      compute: relationIn,
    },
    [LinePairDerived.Consistency]: {
      describe:
        "consistent (one solution), inconsistent (none) or dependent (infinitely many); null with one line",
      compute: (s) => {
        const r = relationIn(s);
        return r === null ? null : consistencyOf(r);
      },
    },
    [LinePairDerived.Solution]: {
      describe: "The one common solution [x, y], or null when there isn't exactly one",
      compute: solutionIn,
    },
    [LinePairDerived.RatioTest]: {
      describe: "Which ratio case the pair is in: 'a≠b', 'a=b≠c' or 'a=b=c' (null with one line)",
      compute: (s) => {
        const [l1, l2] = s.lines;
        return l1 !== undefined && l2 !== undefined ? ratioTestOf(l1, l2) : null;
      },
    },
    [LinePairDerived.Equations]: {
      describe: "The equations as written, in order",
      compute: (s) => s.lines.map((l) => equationOf(l, s.variables, s.form, false)),
    },
    [LinePairDerived.ProbeOn]: {
      describe:
        "For each line, whether the test point satisfies its equation (empty without a point)",
      compute: (s) => {
        const p = s.probe;
        return p === null ? [] : s.lines.map((l) => isOnLine(l, p[0], p[1]));
      },
    },
    [LinePairDerived.Triangle]: {
      describe: "The corners of the triangle the lines make with the shaded axis, as text, or null",
      compute: (s) => {
        const [l1, l2] = s.lines;
        if (s.shade === null || l1 === undefined || l2 === undefined) return null;
        const t = triangleWith(l1, l2, s.shade);
        return t === null ? null : t.map(([x, y]) => `(${fracText(x)}, ${fracText(y)})`);
      },
    },
  },
  actions: {
    [LinePairAction.SetLine]: act({
      describe: "Show another line for equation i: a x + b y + c = 0 (the lesson's move)",
      args: z
        .object({ index: z.union([z.literal(0), z.literal(1)]), a: number, b: number, c: number })
        .strict(),
      run: (s, a) => {
        if (a.a === 0 && a.b === 0) return set({});
        if (a.index > s.lines.length) return set({});
        const lines = [...s.lines];
        lines[a.index] = { a: a.a, b: a.b, c: a.c };
        const handles = lines.map((_, i) => (i === a.index ? null : (s.handles[i] ?? null)));
        return set({ lines, handles }, changed({ ...s, lines }));
      },
    }),
    [LinePairAction.MoveHandle]: act({
      describe:
        "Drag one of the two dots a line is held by (the learner's drag): the line turns to pass through the dot's new place and the other dot; its equation changes to match, with whole-number coefficients",
      byLearner: true,
      args: z
        .object({
          line: z.union([z.literal(0), z.literal(1)]),
          handle: z.union([z.literal(0), z.literal(1)]),
          x: reach,
          y: reach,
        })
        .strict(),
      run: (s, a) => {
        if (!s.canDrag || s.lines[a.line] === undefined) return set({});
        const [x, y] = clampTo(s.window, snapTo(a.x, s.snap), snapTo(a.y, s.snap));
        const held = handlesFor(s, a.line);
        const other = held[a.handle === 0 ? 1 : 0];
        if (other[0] === x && other[1] === y) return set({});
        const mine = held[a.handle];
        if (mine[0] === x && mine[1] === y) return set({});
        const moved: [Point, Point] = a.handle === 0 ? [[x, y], other] : [other, [x, y]];
        const lines = [...s.lines];
        lines[a.line] = lineThrough(moved[0], moved[1]);
        const handles: ([Point, Point] | null)[] = s.lines.map((_, i) => s.handles[i] ?? null);
        handles[a.line] = moved;
        const next = { ...s, lines, handles: handles as LinePairState["handles"] };
        return set({ lines, handles: next.handles }, changed(next));
      },
    }),
    [LinePairAction.SetCoefficient]: act({
      describe:
        "Change a, b or c of the editable line (the learner's − / + buttons); a and b can't both become 0",
      byLearner: true,
      args: z
        .object({
          line: z.union([z.literal(0), z.literal(1)]),
          coefficient: z.nativeEnum(Coefficient),
          value: number,
        })
        .strict(),
      run: (s, a) => {
        const line = s.lines[a.line];
        if (s.editLine !== a.line || line === undefined) return set({});
        const next: Line = { ...line, [a.coefficient]: a.value };
        if (next.a === 0 && next.b === 0) return set({});
        if (next.a === line.a && next.b === line.b && next.c === line.c) return set({});
        const lines = [...s.lines];
        lines[a.line] = next;
        const handles = lines.map((_, i) => (i === a.line ? null : (s.handles[i] ?? null)));
        return set({ lines, handles }, changed({ ...s, lines }));
      },
    }),
    [LinePairAction.MoveProbe]: act({
      describe:
        "Drag the test point to (x, y) (the learner's drag); it says whether the point satisfies each equation",
      byLearner: true,
      args: z.object({ x: reach, y: reach }).strict(),
      run: (s, a) => {
        if (!s.canMoveProbe || s.probe === null) return set({});
        const probe = clampTo(s.window, snapTo(a.x, s.snap), snapTo(a.y, s.snap));
        if (probe[0] === s.probe[0] && probe[1] === s.probe[1]) return set({});
        const on = s.lines.map((l) => isOnLine(l, probe[0], probe[1]));
        return set(
          { probe },
          {
            signal: LinePairSignal.Probed,
            payload: {
              x: probe[0],
              y: probe[1],
              on,
              isOnBoth: on.length === 2 && on.every(Boolean),
            },
          },
        );
      },
    }),
  },
  signals: {
    [LinePairSignal.Changed]: {
      describe: "A line changed: `equations`, `relation` and `solution` ([x, y] or null)",
    },
    [LinePairSignal.Probed]: {
      describe:
        "The test point moved: `x`, `y`, `on` (per line, whether it satisfies that equation) and `isOnBoth`",
    },
  },
  invariant: (s) => {
    if (s.handles.length > s.lines.length) return "more handle pairs than lines";
    for (const [i, held] of s.handles.entries()) {
      const line = s.lines[i];
      if (held === null || line === undefined) continue;
      if (held[0][0] === held[1][0] && held[0][1] === held[1][1])
        return "a line's two dots coincide";
      if (!isOnLine(line, held[0][0], held[0][1]) || !isOnLine(line, held[1][0], held[1][1]))
        return `line ${i + 1}'s dots are not on it`;
    }
    if (s.editLine !== null && s.lines[s.editLine] === undefined) return "editLine has no line";
    return undefined;
  },
  observe: (s) => {
    const relation = relationIn(s);
    const meet = solutionTextIn(s);
    const elements: Element[] = s.lines.map((_, i) => ({
      id: `${LinePairPart.Line}:${i}`,
      value: `line ${i + 1}: ${lineWords(s, i)}${s.canDrag ? ", draggable by two dots" : ""}`,
    }));
    if (s.canDrag) {
      s.lines.forEach((_, i) => {
        handlesFor(s, i).forEach((p, h) => {
          elements.push({
            id: `${LinePairPart.Handle}:${i}:${h}`,
            value: `(${niceText(p[0])}, ${niceText(p[1])})`,
          });
        });
      });
    }
    if (s.showSolution && relation !== null) {
      elements.push({
        id: LinePairPart.Meet,
        value:
          relation === Relation.Intersecting
            ? `they meet at ${meet}`
            : relation === Relation.Parallel
              ? "they never meet"
              : "every point is on both",
      });
    }
    if (s.probe !== null) {
      const [x, y] = s.probe;
      const parts = s.lines.map((l, i) => {
        const value = fracText(leftSide(l, x, y));
        return `line ${i + 1}: ${isOnLine(l, x, y) ? "satisfies it" : `does not (a x + b y + c = ${value})`}`;
      });
      elements.push({
        id: LinePairPart.Probe,
        value: `(${niceText(x)}, ${niceText(y)}): ${parts.join("; ")}${s.canMoveProbe ? ", draggable" : ""}`,
      });
    }
    if (s.showTables) {
      elements.push({
        id: LinePairPart.Tables,
        value: s.lines
          .map((_, i) => {
            const [p, q] = handlesFor(s, i);
            return `(${i + 1}): (${niceText(p[0])}, ${niceText(p[1])}) and (${niceText(q[0])}, ${niceText(q[1])})`;
          })
          .join("; "),
      });
    }
    const [l1, l2] = s.lines;
    if (s.showRatios && l1 !== undefined && l2 !== undefined) {
      const r = ratiosOf(l1, l2);
      const t = (f: typeof r.a) => (f === null ? "undefined" : fracText(f));
      elements.push({
        id: LinePairPart.Ratios,
        value: `a₁/a₂ = ${t(r.a)}, b₁/b₂ = ${t(r.b)}, c₁/c₂ = ${t(r.c)}: ${relation === null ? "" : relationWords[relation]}`,
      });
    }
    if (s.editLine !== null) {
      const line = s.lines[s.editLine];
      if (line !== undefined)
        elements.push({
          id: LinePairPart.Steppers,
          value: `a = ${niceText(line.a)}, b = ${niceText(line.b)}, c = ${niceText(line.c)} of line ${s.editLine + 1}, each with − and + buttons`,
        });
    }
    const which =
      relation === null
        ? `one line, ${lineWords(s, 0)}`
        : `two lines, ${lineWords(s, 0)} and ${lineWords(s, 1)}: ${relationWords[relation]}${relation === Relation.Intersecting ? `, meeting at ${meet}` : ""}`;
    return {
      summary: which,
      elements,
      hidden: { consistency: relation === null ? null : consistencyOf(relation) },
    };
  },
  parts: (s) => [
    LinePairPart.Plane,
    ...s.lines.map((_, i) => `${LinePairPart.Line}:${i}`),
    ...(s.canDrag
      ? s.lines.flatMap((_, i) => [
          `${LinePairPart.Handle}:${i}:0`,
          `${LinePairPart.Handle}:${i}:1`,
        ])
      : []),
    ...(s.showSolution && s.lines.length === 2 ? [LinePairPart.Meet] : []),
    ...(s.probe !== null ? [LinePairPart.Probe] : []),
  ],
  locate: (s, part, width): Box | undefined => {
    const box = planeBox(s, width);
    const at = ([x, y]: Point, size = 44) => {
      const [px, py] = box.toPixel(x, y);
      return { x: px - size / 2, y: py - size / 2, width: size, height: size };
    };
    if (part === LinePairPart.Plane || part.startsWith(`${LinePairPart.Line}:`))
      return { x: 0, y: 0, width, height: box.height };
    const handle = /^handle:(\d):(\d)$/.exec(part);
    if (handle !== null) {
      const p = handlesFor(s, Number(handle[1]))[Number(handle[2]) as 0 | 1];
      return at(p);
    }
    if (part === LinePairPart.Meet) {
      const p = solutionIn(s);
      return p === null ? undefined : at(p);
    }
    if (part === LinePairPart.Probe && s.probe !== null) return at(s.probe);
    return undefined;
  },
});

/** The plane's size at a width, and plane-to-pixel. The view draws exactly this. */
export function planeBox(s: Pick<LinePairState, "window">, width: number) {
  const { xMin, xMax, yMin, yMax } = s.window;
  // Keep a square grid when it fits, so slopes look like they are; never too flat or too tall.
  const height = Math.round(Math.min(400, Math.max(220, (width * (yMax - yMin)) / (xMax - xMin))));
  return {
    width,
    height,
    toPixel: (x: number, y: number): [number, number] => [
      ((x - xMin) / (xMax - xMin)) * width,
      ((yMax - y) / (yMax - yMin)) * height,
    ],
  };
}

export { Consistency, Relation };
