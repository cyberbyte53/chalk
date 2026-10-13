import { type Box, type Emit, actionsFor, defineProp, set, task } from "@chalk/prop";
import { z } from "zod";
import { type Layout, layoutOf, unionOf } from "./layout";
import {
  MAX_BASE,
  MAX_POWER,
  MAX_ROOT,
  MIN_BASE,
  MIN_ROOT,
  type Step,
  exponentValue,
  expressionTextOf,
  isExactSurd,
  isShowable,
  nextPower,
  numberOf,
  routeOf,
  textOf,
} from "./surd";

export const Route = { RootFirst: "rootFirst", PowerFirst: "powerFirst" } as const;
export type Route = (typeof Route)[keyof typeof Route];

export const ExponentRoutesSignal = { Stepped: "stepped", RoutesMet: "routesMet" } as const;

export const ExponentRoutesPart = {
  Start: "start",
  End: "end",
  Exponent: "exponent",
  Base: "base",
  Power: "power",
  Root: "root",
  RootFirstPrefix: "routeRootFirst:",
  PowerFirstPrefix: "routePowerFirst:",
} as const;

/** Seconds between steps when `showBoth` plays the routes. */
export const STEP_SECONDS = 0.7;
/** The most steps a route can have: root, power, 1/x. */
export const MAX_STEPS = 3;

const exponentRoutesState = z
  .object({
    /** a, the base. */
    base: z.number().int().min(MIN_BASE).max(MAX_BASE),
    /** m, the power (top of the exponent). */
    power: z
      .number()
      .int()
      .min(-MAX_POWER)
      .max(MAX_POWER)
      .refine((m) => m !== 0, "the power can't be 0"),
    /** n, the root (bottom of the exponent). */
    root: z.number().int().min(MIN_ROOT).max(MAX_ROOT),
    /** Steps of the root-first route shown. */
    rootFirstStep: z.number().int().min(0).max(MAX_STEPS),
    /** Steps of the power-first route shown. */
    powerFirstStep: z.number().int().min(0).max(MAX_STEPS),
    /** Whether the learner's − / + buttons for a, m and n are on. */
    canChangeNumbers: z.boolean(),
  })
  .strict();
export type ExponentRoutesState = z.infer<typeof exponentRoutesState>;

/** One step of a route as read from the state. */
export type RouteStep = Step & { isShown: boolean };

type Numbers = Pick<ExponentRoutesState, "base" | "power" | "root">;

const act = actionsFor<ExponentRoutesState>();

function stepsOf(s: Numbers, route: Route): Step[] {
  return routeOf(s.base, s.power, s.root, route === Route.RootFirst);
}

/** Steps on each route (the same on both). */
export function stepCountOf(s: Pick<ExponentRoutesState, "power" | "root">): number {
  return (s.root > 1 ? 1 : 0) + (Math.abs(s.power) > 1 ? 1 : 0) + (s.power < 0 ? 1 : 0);
}

function shownOf(s: ExponentRoutesState, route: Route): number {
  return route === Route.RootFirst ? s.rootFirstStep : s.powerFirstStep;
}

function haveMet(s: ExponentRoutesState): boolean {
  const count = stepCountOf(s);
  return s.rootFirstStep >= count && s.powerFirstStep >= count;
}

function finalText(s: Numbers): string {
  return textOf(exponentValue(s.base, s.power, s.root));
}

/** The patch and signals for one more step of a route (nothing once it has arrived). */
function stepOn(
  s: ExponentRoutesState,
  route: Route,
): { patch: Partial<ExponentRoutesState>; emit: Emit[] } {
  const shown = shownOf(s, route);
  if (shown >= stepCountOf(s)) return { patch: {}, emit: [] };
  const step = shown + 1;
  const patch = route === Route.RootFirst ? { rootFirstStep: step } : { powerFirstStep: step };
  const emit: Emit[] = [{ signal: ExponentRoutesSignal.Stepped, payload: { route, step } }];
  if (!haveMet(s) && haveMet({ ...s, ...patch })) {
    emit.push({ signal: ExponentRoutesSignal.RoutesMet, payload: { valueText: finalText(s) } });
  }
  return { patch, emit };
}

const HIDDEN = { rootFirstStep: 0, powerFirstStep: 0 } as const;

export const NumberField = { Base: "base", Power: "power", Root: "root" } as const;
export type NumberField = (typeof NumberField)[keyof typeof NumberField];

/** Where a change by `by` takes the numbers: held to the ends, m skipping 0. */
function movedBy(s: Numbers, field: NumberField, by: number): Numbers {
  const now = { base: s.base, power: s.power, root: s.root };
  const clamp = (v: number, low: number, high: number) => Math.min(high, Math.max(low, v));
  if (field === NumberField.Base) return { ...now, base: clamp(s.base + by, MIN_BASE, MAX_BASE) };
  if (field === NumberField.Power) return { ...now, power: nextPower(s.power, by) };
  return { ...now, root: clamp(s.root + by, MIN_ROOT, MAX_ROOT) };
}

/**
 * Whether the learner's button for `field` would change anything now (for the view to dim it):
 * false when the numbers are fixed, it is held at an end, or the result would be too big.
 */
export function canChange(s: ExponentRoutesState, field: NumberField, by: number): boolean {
  const next = movedBy(s, field, by);
  const isSame = next.base === s.base && next.power === s.power && next.root === s.root;
  return s.canChangeNumbers && !isSame && isShowable(next.base, next.power);
}

/** A change of a, m or n from the learner's buttons: refused when they're off or it won't fit. */
function changeBy(s: ExponentRoutesState, field: NumberField, by: number) {
  if (!s.canChangeNumbers) throw new Error("the numbers can't be changed here");
  const next = movedBy(s, field, by);
  if (next.base === s.base && next.power === s.power && next.root === s.root) return set({});
  if (!isShowable(next.base, next.power)) {
    throw new Error(`${next.base}^${Math.abs(next.power)} is more than 10^12, too big to show`);
  }
  return set({ ...next, ...HIDDEN });
}

const byArgs = z.object({ by: z.number().int().min(-1000).max(1000) }).strict();

/** The diamond drawn at `width` for this state. */
export function layoutFor(s: Numbers, width: number): Layout {
  const ops = (route: Route) => stepsOf(s, route).map((step) => step.operation);
  return layoutOf(width, s.base, s.power, s.root, ops(Route.RootFirst), ops(Route.PowerFirst));
}

function routePart(prefix: string, part: string, count: number): number | undefined {
  if (!part.startsWith(prefix)) return undefined;
  const i = Number(part.slice(prefix.length));
  return Number.isInteger(i) && i >= 1 && i <= count ? i : undefined;
}

/** a^(m/n) of a positive whole number along two routes that meet. Knows exponents, no lesson. */
export const exponentRoutes = defineProp<ExponentRoutesState>({
  type: "exponentRoutes",
  describe:
    "a^(m/n) for a whole number a > 0, worked out two ways that always meet: route one (left) takes the nth root then the mth power, route two (right) the mth power then the nth root; a negative m adds a last step 1/x on both. Steps are shown one at a time; an unshown node is a '?'.",
  state: exponentRoutesState,
  defaults: {
    base: 27,
    power: 2,
    root: 3,
    rootFirstStep: 0,
    powerFirstStep: 0,
    canChangeNumbers: false,
  },
  derived: {
    stepCount: { describe: "Steps on each route (0 to 3)", compute: stepCountOf },
    routeRootFirst: {
      describe:
        "Route one (nth root first): its steps { kind, operation, value, valueText, isExact, isShown }",
      compute: (s): RouteStep[] =>
        stepsOf(s, Route.RootFirst).map((step, i) => ({ ...step, isShown: i < s.rootFirstStep })),
    },
    routePowerFirst: {
      describe:
        "Route two (mth power first): its steps { kind, operation, value, valueText, isExact, isShown }",
      compute: (s): RouteStep[] =>
        stepsOf(s, Route.PowerFirst).map((step, i) => ({ ...step, isShown: i < s.powerFirstStep })),
    },
    expressionText: {
      describe: "The expression as text, e.g. 27^(2/3)",
      compute: (s) => expressionTextOf(s.base, s.power, s.root),
    },
    value: {
      describe: "a^(m/n) as a number",
      compute: (s) => numberOf(exponentValue(s.base, s.power, s.root)),
    },
    valueText: { describe: "a^(m/n) as shown: 9, 1/5, ≈ 1.414", compute: finalText },
    isExact: {
      describe: "Whether a^(m/n) is rational (shown without ≈)",
      compute: (s) => isExactSurd(exponentValue(s.base, s.power, s.root)),
    },
    hasRootFirstArrived: {
      describe: "Every step of route one is shown",
      compute: (s) => s.rootFirstStep >= stepCountOf(s),
    },
    hasPowerFirstArrived: {
      describe: "Every step of route two is shown",
      compute: (s) => s.powerFirstStep >= stepCountOf(s),
    },
    haveRoutesMet: { describe: "Both routes are fully shown", compute: haveMet },
  },
  inputs: ["canChangeNumbers"],
  offScreen: ["value", "valueText", "isExact", "canChangeNumbers"],
  actions: {
    stepRootFirst: act({
      describe: "Show the next step of route one (root first); nothing once it has arrived",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const { patch, emit } = stepOn(s, Route.RootFirst);
        return set(patch, ...emit);
      },
    }),
    stepPowerFirst: act({
      describe: "Show the next step of route two (power first); nothing once it has arrived",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const { patch, emit } = stepOn(s, Route.PowerFirst);
        return set(patch, ...emit);
      },
    }),
    showBoth: act({
      describe: `Step the two routes in turn, ${STEP_SECONDS} s apart, until they meet (gives the value away)`,
      reveals: true,
      args: z.object({}).strict(),
      run: () =>
        task(async (context) => {
          let route: Route = Route.RootFirst;
          let isFirst = true;
          while (!haveMet(context.get())) {
            const { patch, emit } = stepOn(context.get(), route);
            if (Object.keys(patch).length > 0) {
              if (!isFirst) await context.wait(STEP_SECONDS);
              isFirst = false;
              // The learner may have stepped during the wait: work the step out again.
              const now = stepOn(context.get(), route);
              context.set(now.patch);
              for (const e of now.emit) context.emit(e.signal, e.payload);
            }
            route = route === Route.RootFirst ? Route.PowerFirst : Route.RootFirst;
          }
        }),
    }),
    hideSteps: act({
      describe: "Hide every step of both routes",
      args: z.object({}).strict(),
      run: () => set({ ...HIDDEN }),
    }),
    setNumbers: act({
      describe: "A new a^(m/n) (base a, power m, root n), with no steps shown",
      args: z
        .object({
          base: z.number().int().min(MIN_BASE).max(MAX_BASE),
          power: z.number().int().min(-MAX_POWER).max(MAX_POWER),
          root: z.number().int().min(MIN_ROOT).max(MAX_ROOT),
        })
        .strict(),
      run: (_s, a) => set({ base: a.base, power: a.power, root: a.root, ...HIDDEN }),
    }),
    changeBase: act({
      describe: "Change a by `by` (held to 1–1000), steps hidden; the learner's − / +",
      byLearner: true,
      args: byArgs,
      run: (s, a) => changeBy(s, NumberField.Base, a.by),
    }),
    changePower: act({
      describe:
        "Move m by `by` places along −6…−1, 1…6 (skips 0), steps hidden; the learner's − / +",
      byLearner: true,
      args: byArgs,
      run: (s, a) => changeBy(s, NumberField.Power, a.by),
    }),
    changeRoot: act({
      describe: "Change n by `by` (held to 1–6), steps hidden; the learner's − / +",
      byLearner: true,
      args: byArgs,
      run: (s, a) => changeBy(s, NumberField.Root, a.by),
    }),
  },
  signals: {
    [ExponentRoutesSignal.Stepped]: {
      describe:
        "One more step of a route is shown; `route` is rootFirst or powerFirst, `step` from 1",
    },
    [ExponentRoutesSignal.RoutesMet]: {
      describe: "The second route has arrived: both show the same value, `valueText`",
    },
  },
  parts: (s) => {
    const count = stepCountOf(s);
    const steps = (prefix: string) => Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`);
    return [
      ExponentRoutesPart.Start,
      ExponentRoutesPart.Exponent,
      ExponentRoutesPart.Base,
      ExponentRoutesPart.Power,
      ...(s.root > 1 ? [ExponentRoutesPart.Root] : []),
      ...steps(ExponentRoutesPart.RootFirstPrefix),
      ...steps(ExponentRoutesPart.PowerFirstPrefix),
      ExponentRoutesPart.End,
    ];
  },
  locate: (s, part, width): Box | undefined => {
    const layout = layoutFor(s, width);
    const { expression } = layout;
    if (part === ExponentRoutesPart.Start) return expression.box;
    if (part === ExponentRoutesPart.Exponent) return expression.exponent;
    if (part === ExponentRoutesPart.Base) return expression.base.box;
    if (part === ExponentRoutesPart.Power) return expression.power.box;
    if (part === ExponentRoutesPart.Root) return expression.root?.box;
    if (part === ExponentRoutesPart.End) return layout.end;
    const count = stepCountOf(s);
    const routes = [
      [ExponentRoutesPart.RootFirstPrefix, layout.rootFirst],
      [ExponentRoutesPart.PowerFirstPrefix, layout.powerFirst],
    ] as const;
    for (const [prefix, route] of routes) {
      const i = routePart(prefix, part, count);
      if (i === undefined) continue;
      const label = route.arrows[i - 1]?.label;
      const node = route.nodes[i - 1];
      return unionOf([label, node].filter((b): b is Box => b !== undefined));
    }
    return undefined;
  },
  invariant: (s) => {
    if (!isShowable(s.base, s.power)) {
      return `${s.base}^${Math.abs(s.power)} is more than 10^12, too big to show`;
    }
    const count = stepCountOf(s);
    if (s.rootFirstStep > count || s.powerFirstStep > count) {
      return `each route has only ${count} step${count === 1 ? "" : "s"}`;
    }
    return undefined;
  },
});
