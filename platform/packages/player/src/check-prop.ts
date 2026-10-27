import {
  type Observation,
  PropRole,
  QuestionAction,
  type StoredState,
  initialState,
  prepareAction,
  settle,
  viewOf,
} from "@chalk/prop";
import { describeView } from "./describe";
import type { PropModule } from "./prop-module";

/** How many states a check explores, at most, from all its starts together. */
const MOST_STATES = 300;

/**
 * Checks a prop the way it will be used: from each start (fields as a lesson would place them), it
 * presses every input that does an action with fixed arguments, again and again, and describes each
 * state it reaches from what the view draws. Problems:
 *
 * - the view can't be described (a part tagged `data-part` that says neither what it does nor what
 *   it shows, two parts with one name);
 * - an input does an action the prop doesn't have, or one that isn't the learner's (`byLearner`);
 * - a learner's action no input does, in any state reached;
 * - an input's press is refused by the prop.
 *
 * Every prop's tests call it: `expect(checkProp(sweetShareProp, [{}, { isEditable: true }])).toEqual([])`.
 */
export function checkProp(
  module: PropModule,
  starts: readonly Readonly<Record<string, unknown>>[] = [{}],
): string[] {
  const def = module.def;
  const problems = new Set<string>();
  const offered = new Set<string>();
  const seen = new Set<string>();
  const queue: StoredState[] = [];
  for (const given of starts) {
    const start = initialState(def, given);
    if (!start.isOk) problems.add(`start ${JSON.stringify(given)}: ${start.errors.join("; ")}`);
    else queue.push(start.state);
  }
  while (queue.length > 0 && seen.size < MOST_STATES) {
    const state = queue.shift() as StoredState;
    const key = JSON.stringify(state);
    if (seen.has(key)) continue;
    seen.add(key);
    let described: Observation;
    try {
      described = describeView(module, viewOf(def, state));
    } catch (error) {
      problems.add(`${error instanceof Error ? error.message : String(error)} (at ${key})`);
      continue;
    }
    for (const e of described.elements) {
      if (e.does === undefined) continue;
      const actions = typeof e.does === "string" ? [e.does] : e.does;
      for (const action of actions) {
        const spec = def.actions[action];
        if (spec === undefined) {
          problems.add(`${e.id} does ${action}, which ${def.type} doesn't have`);
          continue;
        }
        if (spec.byLearner !== true)
          problems.add(`${e.id} does ${action}, which isn't the learner's (mark it byLearner)`);
        offered.add(action);
      }
      // Press it, when its arguments are on it (a by-hand input works them out when it's used).
      if (e.isByHand === true || actions.length !== 1) continue;
      const prepared = prepareAction(def, state, actions[0] as string, e.args ?? {});
      if (!prepared.isOk) {
        problems.add(`pressing ${e.id} is refused: ${prepared.errors.join("; ")} (at ${key})`);
        continue;
      }
      const next = settle(def, state, prepared.effect);
      if (next.isOk) queue.push(next.state);
    }
  }
  // A question's Try again is the player's own button, under the board.
  if (def.role === PropRole.Question) offered.add(QuestionAction.Retry);
  for (const [action, spec] of Object.entries(def.actions))
    if (spec.byLearner === true && !offered.has(action))
      problems.add(`${action} is the learner's, but no input does it in any state reached`);
  return [...problems];
}
