import {
  type FramePixels,
  actionsFor,
  defineGroup,
  defineProp,
  initialState,
  set,
  viewOf,
} from "@chalk/prop";
import type { JSX } from "preact";
import { render } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { useFrame, useFrameLabels } from "./frame";
import { groupView } from "./group-view";
import { partPaths } from "./part-paths";
import type { PropViewProps } from "./prop-module";

// A provider (graph paper: owns the window, offers the transform), two children drawing into it,
// and a control below the picture.

const paperState = z
  .object({ xMin: z.number(), xMax: z.number(), yMin: z.number(), yMax: z.number() })
  .strict();
type Paper = z.infer<typeof paperState>;
const pixels = (s: Paper, width: number): FramePixels => {
  const height = 200;
  const sx = width / (s.xMax - s.xMin);
  const sy = height / (s.yMax - s.yMin);
  return {
    width,
    height,
    toPx: (x, y = 0) => [(x - s.xMin) * sx, height - (y - s.yMin) * sy],
    fromPx: (px, py = 0) => [s.xMin + px / sx, s.yMin + (height - py) / sy],
  };
};
const paper = defineProp({
  type: "paper",
  describe: "graph paper",
  state: paperState,
  defaults: { xMin: 0, xMax: 10, yMin: 0, yMax: 10 },
  actions: {},
  frame: { kind: "plane", pixels },
  observe: () => ({ summary: "paper", elements: [{ id: "plane" }] }),
});
function PaperView(): JSX.Element {
  const frame = useFrame();
  return <rect data-part="plane" width={frame?.px.width} height={frame?.px.height} />;
}

const dotState = z.object({ x: z.number(), y: z.number(), name: z.string() }).strict();
const onDot = actionsFor<z.infer<typeof dotState>>();
const dot = defineProp({
  type: "dot",
  describe: "a named point",
  state: dotState,
  defaults: { x: 1, y: 1, name: "P" },
  drawsOn: "plane",
  actions: {
    move: onDot({
      describe: "",
      byLearner: true,
      args: z.object({ x: z.number(), y: z.number() }).strict(),
      changes: ["x", "y"],
      run: (_s, a) => set({ x: a.x, y: a.y }),
    }),
  },
  observe: (s) => ({
    summary: "",
    elements: [
      { id: "dot", value: { x: s.x, y: s.y }, does: "move" },
      { id: "name", value: s.name },
    ],
  }),
});
function DotView({ view }: PropViewProps): JSX.Element {
  const s = view as z.infer<typeof dotState>;
  const frame = useFrame();
  // Its label goes to the frame's one pass, not drawn here.
  useFrameLabels([{ id: "name", at: [s.x, s.y], text: s.name, part: "name" }]);
  const [x, y] = frame?.px.toPx(s.x, s.y) ?? [0, 0];
  return <circle data-part="dot" cx={x} cy={y} r={6} />;
}

const counter = defineProp({
  type: "counter",
  describe: "",
  state: z.object({ n: z.number() }).strict(),
  defaults: { n: 0 },
  actions: {},
  observe: (s) => ({ summary: "", elements: [{ id: "n", value: s.n }] }),
});
function CounterView({ view }: PropViewProps): JSX.Element {
  return <p data-part="n">{String(view.n)}</p>;
}

const twoPoints = defineGroup({
  type: "twoPoints",
  describe: "two points on graph paper",
  children: { paper, p: dot, q: dot, count: counter },
  defaults: { q: { x: 1.2, y: 1.1, name: "Q" } },
  is: { count: (s) => ({ n: s.p.x + s.q.x }) },
  summary: () => "two points",
  layout: { kind: "frame", provider: "paper", children: ["p", "q"], below: ["count"] },
});

const View = groupView(twoPoints, { paper: PaperView, p: DotView, q: DotView, count: CounterView });

function draw(given: Record<string, unknown> = {}) {
  const start = initialState(twoPoints, given);
  if (!start.isOk) throw new Error(start.errors.join());
  return render(
    <View
      view={viewOf(twoPoints, start.state)}
      width={300}
      locale="en"
      call={() => {}}
      signal={() => {}}
    />,
  );
}

describe("frames", () => {
  it("draws the provider and its children in one picture, controls below it", () => {
    const html = draw();
    expect(html.match(/<svg/g)).toHaveLength(1);
    expect(html.indexOf('data-child="count"')).toBeGreaterThan(html.indexOf("</svg>"));
  });

  it("places every child's labels in one pass, under the child's name, apart from each other", () => {
    const html = draw();
    // Both names are found by path, and drawn = described for every part.
    expect([...partPaths(html)].sort()).toEqual([
      "count/n",
      "p/dot",
      "p/name",
      "paper/plane",
      "q/dot",
      "q/name",
    ]);
    const spots = [...html.matchAll(/<text[^>]*x="([\d.]+)" y="([\d.]+)"/g)].map((m) => [
      Number(m[1]),
      Number(m[2]),
    ]);
    expect(spots).toHaveLength(2);
    const [a, b] = spots as [number[], number[]];
    // P and Q are close together; their labels still don't sit on each other.
    expect(Math.hypot((a[0] ?? 0) - (b[0] ?? 0), (a[1] ?? 0) - (b[1] ?? 0))).toBeGreaterThan(12);
  });

  it("refuses a child that draws on another kind of frame", () => {
    const onAxis = { ...dot, type: "onAxis", drawsOn: "axis" as const };
    expect(() =>
      defineGroup({
        type: "bad",
        describe: "",
        children: { paper, p: onAxis },
        summary: () => "",
        layout: { kind: "frame", provider: "paper", children: ["p"] },
      }),
    ).toThrow(/p draws on axis, the frame is plane/);
  });
});
