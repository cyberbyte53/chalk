import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  type Arrow,
  END_HEIGHT,
  type Layout,
  PILL_HEIGHT,
  fitSize,
  nodeWidth,
  pillLabel,
} from "./layout";
import {
  type ExponentRoutesState,
  NumberField,
  Route,
  type RouteStep,
  canChange,
  layoutFor,
} from "./model";
import { StepKind } from "./surd";

type ExponentRoutesView = ExponentRoutesState & {
  stepCount: number;
  routeRootFirst: RouteStep[];
  routePowerFirst: RouteStep[];
  expressionText: string;
  valueText: string;
  hasRootFirstArrived: boolean;
  hasPowerFirstArrived: boolean;
  haveRoutesMet: boolean;
};

const STEP_ACTION = { [Route.RootFirst]: "stepRootFirst", [Route.PowerFirst]: "stepPowerFirst" };
const PART_PREFIX = {
  [Route.RootFirst]: "routeRootFirst:",
  [Route.PowerFirst]: "routePowerFirst:",
};

/** A tap target in the SVG that a keyboard can reach too (Enter or Space). */
function tapWith(
  action: () => void,
): Pick<JSX.SVGAttributes<SVGRectElement>, "role" | "tabIndex" | "onClick" | "onKeyDown"> {
  return {
    role: "button",
    tabIndex: 0,
    onClick: action,
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        action();
      }
    },
  };
}

/** A value in a node: a whole number, a stacked fraction (1/8), or ≈ a decimal. */
function ValueText(props: {
  text: string;
  cx: number;
  cy: number;
  width: number;
  largest: number;
  className: string;
}): JSX.Element {
  const { text, cx, cy, width, largest, className } = props;
  const fraction = /^(\d+)\/(\d+)$/.exec(text);
  if (fraction !== null) {
    const [, top = "", bottom = ""] = fraction;
    const size = fitSize(bottom.length > top.length ? bottom : top, width, largest * 0.72);
    const half = Math.max(top.length, bottom.length) * size * 0.32 + 4;
    return (
      <g class={className}>
        <text x={cx} y={cy - size * 0.3} class="exr-value" style={{ fontSize: `${size}px` }}>
          {top}
        </text>
        <line x1={cx - half} x2={cx + half} y1={cy} y2={cy} class="exr-value-line" />
        <text x={cx} y={cy + size * 0.98} class="exr-value" style={{ fontSize: `${size}px` }}>
          {bottom}
        </text>
      </g>
    );
  }
  const isApprox = text.startsWith("≈");
  const size = fitSize(text, width, largest);
  return (
    <g class={className}>
      <text x={cx} y={cy + size * 0.36} class="exr-value" style={{ fontSize: `${size}px` }}>
        {isApprox ? (
          <>
            <tspan class="exr-approx">≈ </tspan>
            {text.slice(2)}
          </>
        ) : (
          text
        )}
      </text>
    </g>
  );
}

/** The curve and its arrowhead, pointing along the curve's last stretch. */
function ArrowLine({ arrow, className }: { arrow: Arrow; className: string }): JSX.Element {
  const { from, control, to } = arrow;
  const dx = to.x - control.x;
  const dy = to.y - control.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const head = 7;
  const tip = to;
  const back = { x: tip.x - ux * head, y: tip.y - uy * head };
  const left = { x: back.x - uy * head * 0.6, y: back.y + ux * head * 0.6 };
  const right = { x: back.x + uy * head * 0.6, y: back.y - ux * head * 0.6 };
  return (
    <g class={className}>
      <path
        class="exr-arrow-line"
        d={`M ${from.x} ${from.y} Q ${control.x} ${control.y} ${back.x} ${back.y}`}
      />
      <path
        class="exr-arrow-head"
        d={`M ${tip.x} ${tip.y} L ${left.x} ${left.y} L ${right.x} ${right.y} Z`}
      />
    </g>
  );
}

function Expression({ layout, s }: { layout: Layout; s: ExponentRoutesView }): JSX.Element {
  const { base, power, root } = layout.expression;
  const powerText = s.power < 0 ? `−${-s.power}` : `${s.power}`;
  const lineHalf = root === undefined ? 0 : Math.max(power.box.width, root.box.width) / 2 + 3;
  return (
    <g class={`exr-expression${s.canChangeNumbers ? " is-changeable" : ""}`} data-part="start">
      <text x={base.x} y={base.baseline} class="exr-base" style={{ fontSize: `${base.size}px` }}>
        {s.base}
      </text>
      <text
        x={power.x}
        y={power.baseline}
        class="exr-exponent"
        style={{ fontSize: `${power.size}px` }}
      >
        {powerText}
      </text>
      {root !== undefined && (
        <>
          <line
            class="exr-fraction-line"
            x1={root.x - lineHalf}
            x2={root.x + lineHalf}
            y1={root.lineY}
            y2={root.lineY}
          />
          <text
            x={root.x}
            y={root.baseline}
            class="exr-exponent"
            style={{ fontSize: `${root.size}px` }}
          >
            {s.root}
          </text>
        </>
      )}
    </g>
  );
}

/**
 * The two routes from a^(m/n) to its value, as a diamond: root first down the left, power first
 * down the right, meeting in one node. A tap on a route's next node or operation steps it; the
 * blue − / + buttons under it change a, m and n. It owns no state.
 */
export function ExponentRoutesView({ view, width, call }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as ExponentRoutesView;
  const layout = layoutFor(s, width);
  const count = s.stepCount;
  const w = nodeWidth(width);

  const routes = [
    {
      route: Route.RootFirst,
      steps: s.routeRootFirst,
      shown: s.rootFirstStep,
      at: layout.rootFirst,
    },
    {
      route: Route.PowerFirst,
      steps: s.routePowerFirst,
      shown: s.powerFirstStep,
      at: layout.powerFirst,
    },
  ];
  const hasArrived = s.hasRootFirstArrived || s.hasPowerFirstArrived;
  const isEndShown = count === 0 || hasArrived;

  /** Which route a tap on the meeting node steps: one whose next step leads there. */
  const endRoute =
    s.rootFirstStep === count - 1
      ? Route.RootFirst
      : s.powerFirstStep === count - 1
        ? Route.PowerFirst
        : undefined;

  const arrows: JSX.Element[] = [];
  const pills: JSX.Element[] = [];
  const nodes: JSX.Element[] = [];

  for (const { route, steps, shown, at } of routes) {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const arrow = at.arrows[i];
      if (step === undefined || arrow === undefined) continue;
      const isLast = i === count - 1;
      const isNext = i === shown;
      const tap = isNext ? () => call(STEP_ACTION[route]) : undefined;
      const arrowClass = [
        "exr-arrow",
        step.isShown ? "is-shown" : "is-hidden",
        isLast && s.haveRoutesMet ? "is-met" : "",
      ].join(" ");
      arrows.push(<ArrowLine key={`${route}-a${i}`} arrow={arrow} className={arrowClass} />);

      const label = { ...arrow.label, ...pillLabel(step.operation) };
      const pillClass = [
        "exr-pill",
        step.isShown ? "is-shown" : "",
        isNext ? "is-next" : "",
        step.kind === StepKind.Reciprocal ? "is-reciprocal" : "",
      ].join(" ");
      pills.push(
        <g key={`${route}-p${i}`} class={pillClass} data-part={`${PART_PREFIX[route]}${i + 1}`}>
          <rect
            x={label.x}
            y={label.y}
            width={label.width}
            height={label.height}
            rx={PILL_HEIGHT / 2}
            class="exr-pill-box"
          />
          <text x={label.x + label.width / 2} y={label.y + label.height / 2} class="exr-op">
            {label.before !== "" && <tspan>{label.before}</tspan>}
            <tspan class="exr-x">x</tspan>
            {label.after !== "" && <tspan>{label.after}</tspan>}
          </text>
          {tap !== undefined && (
            <rect
              class="exr-hit"
              x={label.x + label.width / 2 - 24}
              y={label.y + label.height / 2 - 22}
              width={48}
              height={44}
              {...tapWith(tap)}
            >
              <title>{step.operation}</title>
            </rect>
          )}
        </g>,
      );

      const node = at.nodes[i];
      if (node === undefined) continue; // the last step leads to the meeting node
      const nodeClass = [
        "exr-node",
        step.isShown ? "is-shown" : "is-hidden",
        isNext ? "is-next" : "",
      ].join(" ");
      nodes.push(
        <g key={`${route}-n${i}`} class={nodeClass}>
          <rect
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            rx={12}
            class="exr-node-box"
          />
          {step.isShown ? (
            <ValueText
              key={`${step.valueText}`}
              text={step.valueText}
              cx={node.x + node.width / 2}
              cy={node.y + node.height / 2}
              width={w - 18}
              largest={22}
              className="exr-reveal"
            />
          ) : (
            <text x={node.x + node.width / 2} y={node.y + node.height / 2 + 7} class="exr-unknown">
              ?
            </text>
          )}
          {tap !== undefined && (
            <rect
              class="exr-hit"
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              {...tapWith(tap)}
            >
              <title>?</title>
            </rect>
          )}
        </g>,
      );
    }
  }

  const { end } = layout;
  const endClass = [
    "exr-node exr-end",
    isEndShown ? "is-shown" : "is-hidden",
    endRoute !== undefined ? "is-next" : "",
    s.haveRoutesMet && count > 0 ? "is-met" : "",
  ].join(" ");

  const stepper = (field: NumberField, action: string, label: JSX.Element) => (
    <div class="exr-stepper" data-part={`${field}Stepper`}>
      <span class="exr-step-label">{label}</span>
      <span class="exr-step-buttons">
        <button
          type="button"
          class="exr-step-button"
          aria-label="−"
          disabled={!canChange(s, field, -1)}
          onClick={() => call(action, { by: -1 })}
        >
          −
        </button>
        <button
          type="button"
          class="exr-step-button"
          aria-label="+"
          disabled={!canChange(s, field, 1)}
          onClick={() => call(action, { by: 1 })}
        >
          +
        </button>
      </span>
    </div>
  );

  return (
    <div class="exr">
      <svg
        class="exr-figure"
        width={width}
        height={layout.height}
        viewBox={`0 0 ${width} ${layout.height}`}
        role="img"
        aria-label={s.haveRoutesMet ? `${s.expressionText} = ${s.valueText}` : s.expressionText}
      >
        <Expression layout={layout} s={s} />
        {arrows}
        {pills}
        {nodes}
        <g class={endClass} data-part="end">
          <rect
            x={end.x}
            y={end.y}
            width={end.width}
            height={END_HEIGHT}
            rx={16}
            class="exr-node-box"
          />
          {isEndShown ? (
            <ValueText
              key={s.valueText}
              text={s.valueText}
              cx={end.x + end.width / 2}
              cy={end.y + END_HEIGHT / 2}
              width={end.width - 20}
              largest={30}
              className="exr-reveal exr-end-value"
            />
          ) : (
            <text x={end.x + end.width / 2} y={end.y + END_HEIGHT / 2 + 8} class="exr-unknown">
              ?
            </text>
          )}
          {endRoute !== undefined && (
            <rect
              class="exr-hit"
              x={end.x}
              y={end.y}
              width={end.width}
              height={END_HEIGHT}
              {...tapWith(() => call(STEP_ACTION[endRoute]))}
            >
              <title>?</title>
            </rect>
          )}
        </g>
      </svg>
      {s.canChangeNumbers && (
        <div class="exr-steppers">
          {stepper(NumberField.Base, "changeBase", <span class="exr-step-base">{s.base}</span>)}
          {stepper(
            NumberField.Power,
            "changePower",
            <span class="exr-step-power">{s.power < 0 ? `−${-s.power}` : s.power}</span>,
          )}
          {stepper(NumberField.Root, "changeRoot", <span class="exr-step-root">{s.root}</span>)}
        </div>
      )}
    </div>
  );
}
