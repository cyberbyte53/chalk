import {
  type FramePixels,
  PropRole,
  actionsFor,
  defineGroup,
  defineProp,
  initialState,
  set,
  shows,
  viewOf,
} from "@chalk/prop";
import type { JSX } from "preact";
import { render } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { checkProp } from "./check-prop";
import { describeView } from "./describe";
import { useDrags } from "./drag";
import { useFrame, useFrameLabels } from "./frame";
import { type PartDrawing, groupView } from "./group-view";
import { type PropViewProps, propModule } from "./prop-module";

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
  role: PropRole.Explainer,
  describe: "graph paper",
  state: paperState,
  defaults: { xMin: 0, xMax: 10, yMin: 0, yMax: 10 },
  actions: {},
  frame: { kind: "plane", pixels },
});
function PaperView({ view }: PropViewProps<typeof paper>): JSX.Element {
  const frame = useFrame();
  return (
    <rect
      {...shows("plane", { x: [view.xMin, view.xMax], y: [view.yMin, view.yMax] })}
      width={frame?.px.width}
      height={frame?.px.height}
    />
  );
}

const dotState = z.object({ x: z.number(), y: z.number(), name: z.string() }).strict();
const onDot = actionsFor<z.infer<typeof dotState>>();
const dot = defineProp({
  type: "dot",
  role: PropRole.Explainer,
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
});
function DotView({ view: s }: PropViewProps<typeof dot>): JSX.Element {
  const frame = useFrame();
  const drag = useDrags();
  // Its label goes to the frame's one pass, not drawn here.
  useFrameLabels([{ id: "name", at: [s.x, s.y], text: s.name, part: "name" }]);
  const [x, y] = frame?.px.toPx(s.x, s.y) ?? [0, 0];
  return (
    <circle
      {...shows("dot", { x: s.x, y: s.y })}
      {...drag({ axis: "xy", at: { x: s.x, y: s.y }, move: dot.actions.move, step: 0.1 })}
      cx={x}
      cy={y}
      r={6}
    />
  );
}

const counter = defineProp({
  type: "counter",
  role: PropRole.Explainer,
  describe: "",
  state: z.object({ n: z.number() }).strict(),
  defaults: { n: 0 },
  actions: {},
});
function CounterView({ view }: PropViewProps<typeof counter>): JSX.Element {
  return <p {...shows("n", view.n)}>{String(view.n)}</p>;
}

const twoPoints = defineGroup({
  type: "twoPoints",
  role: PropRole.Explainer,
  describe: "two points on graph paper",
  children: { paper, p: dot, q: dot, count: counter },
  defaults: { q: { x: 1.2, y: 1.1, name: "Q" } },
  is: { count: (s) => ({ n: s.p.x + s.q.x }) },
  summary: () => "two points",
  layout: { kind: "frame", provider: "paper", children: ["p", "q"], below: ["count"] },
});

const parts = {
  paper: PaperView,
  p: DotView,
  q: DotView,
  count: CounterView,
} as unknown as Parameters<typeof groupView>[1];
const View = groupView(twoPoints, parts);
const module = propModule(twoPoints, View);

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

describe("groups drawn", () => {
  it("names each child's parts under it, and its inputs do the child's action by path", () => {
    const start = initialState(twoPoints, {});
    if (!start.isOk) throw new Error(start.errors.join());
    const seen = describeView(module, viewOf(twoPoints, start.state));
    expect(seen.summary).toBe("two points");
    expect(seen.elements.map((e) => e.id)).toEqual([
      "paper/plane",
      "p/move",
      "q/move",
      "p/name",
      "q/name",
      "count/n",
    ]);
    expect(seen.elements.find((e) => e.id === "p/move")).toMatchObject({
      does: "p.move",
      isByHand: true,
      value: { x: 1, y: 1 },
    });
    expect(seen.elements.find((e) => e.id === "count/n")?.value).toBeCloseTo(2.2);
  });
});

describe("a drag outside any frame", () => {
  it("is refused as the view draws, so the prop's own check reports it", () => {
    // The dot alone: its drag has no frame to turn pixels into units.
    const alone = propModule(dot, DotView as never);
    expect(checkProp(alone, [{}])[0]).toMatch(/a drag is drawn inside a frame/);
  });
});

describe("frames", () => {
  it("draws the provider and its children in one picture, controls below it", () => {
    const html = draw();
    expect(html.match(/<svg/g)).toHaveLength(1);
    expect(html.indexOf('data-child="count"')).toBeGreaterThan(html.indexOf("</svg>"));
  });

  it("places every child's labels in one pass, under the child's name, apart from each other", () => {
    const html = draw();
    const spots = [...html.matchAll(/<text[^>]*x="([\d.]+)" y="([\d.]+)"/g)].map((m) => [
      Number(m[1]),
      Number(m[2]),
    ]);
    expect(spots).toHaveLength(2);
    const [a, b] = spots as [number[], number[]];
    // P and Q are close together; their labels still don't sit on each other.
    expect(Math.hypot((a[0] ?? 0) - (b[0] ?? 0), (a[1] ?? 0) - (b[1] ?? 0))).toBeGreaterThan(12);
  });
});

describe("a part drawing in several places", () => {
  // The dot draws a shadow behind the paper's lines, itself on them, and its name in words below.
  const shadow = ({ view: s }: PropViewProps<typeof dot>) => {
    const [x, y] = useFrame()?.px.toPx(s.x, s.y) ?? [0, 0];
    return <circle class="shadow" {...shows("shadow", true)} cx={x} cy={y} r={9} />;
  };
  const words = ({ view: s }: PropViewProps<typeof dot>) => (
    <p class="where" {...shows("where", s.name)}>{`${s.name} is here`}</p>
  );
  const button = () => (
    <button type="button" {...shows("go", true)}>
      go
    </button>
  );
  const layered = defineGroup({
    type: "layered",
    role: PropRole.Explainer,
    describe: "a dot drawn in several places",
    children: { paper, p: dot, q: dot },
    summary: () => "layered",
    layout: {
      kind: "frame",
      provider: "paper",
      children: ["p", "q"],
      order: { on: ["paper", "q", "p"] },
    },
  });
  const drawing: PartDrawing = {
    back: shadow as never,
    on: DotView as never,
    below: words as never,
    controls: button,
  };
  const views = { paper: PaperView, p: drawing, q: DotView } as unknown as Parameters<
    typeof groupView
  >[1];
  const LayeredView = groupView(layered, views);
  const start = initialState(layered, {});
  if (!start.isOk) throw new Error(start.errors.join());
  const html = render(
    <LayeredView
      view={viewOf(layered, start.state)}
      width={300}
      locale="en"
      call={() => {}}
      signal={() => {}}
    />,
  );

  it("draws each place in its turn: behind, on the lines, then words and buttons below", () => {
    const at = (s: string) => html.indexOf(s);
    expect(at('class="shadow"')).toBeGreaterThan(-1);
    expect(at('class="shadow"')).toBeLessThan(at('data-child="paper"'));
    // Inside the picture: p's back, then on the lines in the layout's order (paper, q, p), then
    // the frame's labels (each under its child).
    const picture = html.slice(at("<svg"), at("</svg>"));
    expect([...picture.matchAll(/data-child="(\w+)"/g)].map((m) => m[1])).toEqual([
      "p",
      "paper",
      "q",
      "p",
      "q",
      "p",
    ]);
    expect(at('class="where"')).toBeGreaterThan(at("</svg>"));
    expect(at('class="group-controls"')).toBeGreaterThan(at('class="where"'));
  });

  it("names everything it draws under the part, wherever it draws it", () => {
    const seen = describeView(propModule(layered, LayeredView), viewOf(layered, start.state));
    expect(seen.elements.map((e) => e.id)).toEqual(
      expect.arrayContaining(["p/shadow", "p/move", "p/where", "p/go", "q/move"]),
    );
  });

  it("refuses an order naming a child the frame doesn't draw", () => {
    expect(() =>
      defineGroup({
        type: "bad",
        role: PropRole.Explainer,
        describe: "",
        children: { paper, p: dot, count: counter },
        summary: () => "",
        layout: { kind: "frame", provider: "paper", children: ["p"], order: { on: ["count"] } },
      }),
    ).toThrow(/order.on names "count"/);
  });
});
