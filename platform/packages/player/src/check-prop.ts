import { type Observation, PropRole, QuestionAction } from "@chalk/prop";
import { type AnyProp, Board, prop } from "@chalk/prop";
import type { ZodTypeAny } from "zod";
import { describeView } from "./describe";
import type { PropModule, PropView } from "./prop-module";

/** How many states a check explores, at most, from all its starts together. */
const MOST_STATES = 300;

/** A press: an input's action, by its path inside the prop ("walker.step"), and what it carries. */
type Press = { does: string; args: Readonly<Record<string, unknown>> };

/** The action a dotted path names inside a prop ("walker.step": its walker's step), if it has one. */
function actionAt(def: AnyProp, does: string) {
  const parts = does.split(".");
  const name = parts.pop() as string;
  let at: AnyProp | undefined = def;
  for (const part of parts) at = at?.children?.[part];
  return at?.actions?.[name];
}

/**
 * What a check plays: the prop itself, or, when it needs values (a goal's `isMet`), the prop held
 * the way a board holds it, given the start's values for what it needs. `at` is where the prop is.
 */
function heldOf(def: AnyProp, given: Given): { root: AnyProp; at: string; given: Given } {
  const needs = def.needs as (ZodTypeAny & { shape?: Record<string, ZodTypeAny> }) | undefined;
  const names = new Set(Object.keys(needs?.shape ?? {}));
  if (needs === undefined || names.size === 0) return { root: def, at: "", given };
  const entries = Object.entries(given);
  const root = prop({
    type: `${def.type}Held`,
    describe: `${def.type}, given what it needs`,
    variables: needs,
    start: Object.fromEntries(entries.filter(([k]) => names.has(k))),
    children: { it: def },
    give: { it: Object.fromEntries([...names].map((n) => [n, (me: Given) => me[n]])) },
  } as never);
  return {
    root,
    at: "it",
    given: { it: Object.fromEntries(entries.filter(([k]) => !names.has(k))) },
  };
}
type Given = Readonly<Record<string, unknown>>;

/** Every action the student can do, by its dotted path ("walker.step"), the prop's and its parts'. */
function screenActions(def: AnyProp, prefix = ""): string[] {
  const own = Object.entries(def.actions ?? {})
    .filter(([, spec]) => spec.isFromScreen)
    .map(([name]) => `${prefix}${name}`);
  const parts = Object.entries(def.children ?? {}).flatMap(([name, child]) =>
    screenActions(child, `${prefix}${name}.`),
  );
  return [...own, ...parts];
}

/**
 * Checks a prop the way it will be used: from each start (fields as a lesson places them, part by
 * part), it presses every input that does an action with fixed arguments, again and again, and
 * describes each state it reaches from what the view draws. Problems:
 *
 * - the view can't be described (a part tagged `data-part` that says neither what it does nor what
 *   it shows, two parts with one name);
 * - an input does an action the prop doesn't have, or one the student can't do (`from: "screen"`);
 * - an action the student can do that no input does, in any state reached;
 * - an input's press is refused by the prop.
 *
 * Every prop's tests call it: `expect(checkProp(coordinatePlaneProp, [town, axes])).toEqual([])`.
 */
export function checkProp(
  module: PropModule,
  starts: readonly Readonly<Record<string, unknown>>[] = [{}],
): string[] {
  const def = module.def;
  const problems = new Set<string>();
  const offered = new Set<string>();
  const seen = new Set<string>();
  // A state is its start and the presses that reach it: a board is made again and played to it.
  const queue: { given: Given; presses: readonly Press[] }[] = starts.map((given) => ({
    given,
    presses: [],
  }));
  const reach = (start: Given, presses: readonly Press[]): { board: Board; at: string } => {
    const held = heldOf(def, start);
    const board = new Board(held.root, held.given as never);
    board.runUntilIdle();
    for (const { does, args } of presses) {
      const parts = does.split(".");
      const action = parts.pop() as string;
      board.input([held.at, ...parts].filter((p) => p !== "").join("/"), action, args);
      board.runUntilIdle();
    }
    return { board, at: held.at };
  };
  while (queue.length > 0 && seen.size < MOST_STATES) {
    const { given, presses } = queue.shift() as (typeof queue)[number];
    let reached: { board: Board; at: string };
    try {
      reached = reach(given, presses);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const after = presses.at(-1);
      problems.add(
        after === undefined
          ? `start ${JSON.stringify(given)}: ${message}`
          : `pressing ${after.does} is refused: ${message}`,
      );
      continue;
    }
    const view = reached.board.read(reached.at) as unknown as PropView;
    const key = JSON.stringify(view);
    if (seen.has(key)) continue;
    seen.add(key);
    let described: Observation;
    try {
      described = describeView(module, view);
    } catch (error) {
      problems.add(`${error instanceof Error ? error.message : String(error)} (at ${key})`);
      continue;
    }
    for (const e of described.elements) {
      if (e.does === undefined || e.isOff === true) continue;
      const actions = typeof e.does === "string" ? [e.does] : e.does;
      for (const does of actions) {
        const spec = actionAt(def, does);
        if (spec === undefined) {
          problems.add(`${e.id} does ${does}, which ${def.type} doesn't have`);
          continue;
        }
        if (!spec.isFromScreen)
          problems.add(`${e.id} does ${does}, which the student can't do (mark it from: "screen")`);
        offered.add(does);
      }
      // Press it, when its arguments are on it (a by-hand input works them out when it's used).
      if (e.isByHand === true || actions.length !== 1) continue;
      queue.push({
        given,
        presses: [...presses, { does: actions[0] as string, args: e.args ?? {} }],
      });
    }
  }
  // A question's Try again is the player's own button, under the board.
  if (def.role === PropRole.Question) offered.add(QuestionAction.Retry);
  for (const does of screenActions(def))
    if (!offered.has(does))
      problems.add(`${does} is the student's, but no input does it in any state reached`);
  return [...problems];
}
