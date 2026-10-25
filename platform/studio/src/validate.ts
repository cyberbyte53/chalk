import {
  type Board,
  LOCALES,
  type Lesson,
  type Readings,
  type Script,
  argExpression,
  lessonSchema,
  propPieces,
  spokenText,
  unspeakable,
  walkPieces,
} from "@chalk/content";
import { richProblems } from "@chalk/player";
import {
  type AnyPropDef,
  BOARD,
  BoardAction,
  PropRole,
  SAY,
  type StoredState,
  applyPatch,
  compileExpression,
  compileRule,
  compileTemplate,
  hostOf,
  initialState,
  viewOf,
} from "@chalk/prop";

export type Problem = { where: string; message: string };

type Defs = Readonly<Record<string, AnyPropDef>>;

/** A hand-made run of boards (a test lesson): its format, unique board names, and each board. */
export function validateLesson(input: unknown, defs: Defs, readings: Readings): Problem[] {
  const parsed = lessonSchema.safeParse(input);
  if (!parsed.success) {
    return parsed.error.issues.map((issue) => ({
      where: issue.path.join("."),
      message: issue.message,
    }));
  }
  const lesson: Lesson = parsed.data;
  const problems: Problem[] = [];
  const boardNames = new Set<string>();
  for (const board of lesson.boards) {
    if (boardNames.has(board.name))
      problems.push({ where: board.name, message: "duplicate board name" });
    boardNames.add(board.name);
    problems.push(...validateBoard(board, defs, readings));
  }
  return problems;
}

/** Every `call` in a script, in order. */
function callsIn(script: Script): { call: string; args: Record<string, unknown> }[] {
  if (Array.isArray(script)) return script.flatMap(callsIn);
  if ("seq" in script) return script.seq.flatMap(callsIn);
  if ("par" in script) return script.par.flatMap(callsIn);
  if ("wait" in script) return [];
  return [{ call: script.call, args: script.args ?? {} }];
}

function split(target: string): { prop: string; member: string } | undefined {
  const dot = target.indexOf(".");
  return dot <= 0 || dot === target.length - 1
    ? undefined
    : { prop: target.slice(0, dot), member: target.slice(dot + 1) };
}

/** Checks a board against the content formats, every prop's contract, and its own wiring. */
export function validateBoard(board: Board, allDefs: Defs, readings: Readings): Problem[] {
  const problems: Problem[] = [];
  const report = (where: string, message: string) =>
    problems.push({ where: `${board.name}/${where}`, message });

  // Names: unique, and `board` is the board's own.
  const names = new Set<string>();
  for (const piece of walkPieces(board.root)) {
    if (piece.name === BOARD)
      report(piece.name, `"${BOARD}" is the board's own name; pick another`);
    if (names.has(piece.name)) report(piece.name, "duplicate name");
    names.add(piece.name);
  }

  // Props: known type, and a starting state that passes the prop's one door.
  const defs = new Map<string, AnyPropDef>();
  const states = new Map<string, StoredState>();
  const boardDef = allDefs[BOARD];
  if (boardDef === undefined) throw new Error("The library must include the board prop");
  defs.set(BOARD, boardDef);
  states.set(BOARD, boardDef.defaults);
  for (const piece of propPieces(board.root)) {
    const def = piece.prop === BOARD ? undefined : allDefs[piece.prop];
    if (def === undefined) {
      report(
        piece.name,
        `unknown prop type "${piece.prop}" (library: ${Object.keys(allDefs)
          .filter((t) => t !== BOARD)
          .join(", ")})`,
      );
      continue;
    }
    const start = initialState(def, piece.with);
    if (!start.isOk) for (const e of start.errors) report(piece.name, e);
    else {
      defs.set(piece.name, def);
      states.set(piece.name, start.state);
    }
  }
  // Layers that exclude each other can't both be on: from where it's placed, or the actions its rules call.
  const called = board.when.flatMap((rule) => callsIn(rule.do));
  for (const [name, def] of defs) {
    const host = hostOf(def);
    const state = states.get(name);
    if (host === undefined || state === undefined) continue;
    const used = called.flatMap((c) => {
      const t = split(c.call);
      return t?.prop === name ? [t.member] : [];
    });
    for (const clash of host.clashes(state, used)) report(name, clash);
  }
  const fields = (name: string): Set<string> => {
    const def = defs.get(name);
    return def === undefined
      ? new Set()
      : new Set([...Object.keys(def.defaults), ...Object.keys(def.derived ?? {})]);
  };
  const checkRefs = (where: string, refs: readonly (readonly string[])[]) => {
    for (const [prop, field] of refs) {
      if (prop === undefined || !defs.has(prop)) report(where, `no prop "${prop}" on this board`);
      else if (field === undefined)
        report(where, `"${prop}" needs a field, e.g. ${prop}.something`);
      else if (!fields(prop).has(field))
        report(where, `${prop} has no field "${field}" (fields: ${[...fields(prop)].join(", ")})`);
    }
  };
  const compile = <T>(where: string, make: () => T): T | undefined => {
    try {
      return make();
    } catch (error) {
      report(where, error instanceof Error ? error.message : String(error));
      return undefined;
    }
  };

  // Questions: any number per board; a goal points at a prop on the board.
  const questions = [...defs]
    .filter(([, def]) => def.role === PropRole.Question)
    .map(([name]) => name);
  for (const name of questions) {
    const about = states.get(name)?.about;
    if (typeof about === "string" && !defs.has(about))
      report(name, `asks about "${about}", which isn't a prop on this board`);
  }

  // IS: owns an input of a real prop, once; reads real fields; no loops; and gives a value the prop accepts.
  const writers = new Map<string, number>();
  const edges = new Map<string, Set<string>>();
  /** Each IS text that compiled, with its live values as 0: its maths is checked below. */
  const liveTexts: [where: string, skeletons: Record<string, string>][] = [];
  const scope = (name: string) => {
    const def = defs.get(name);
    const state = states.get(name);
    if (def === undefined || state === undefined) throw new Error(`no prop "${name}"`);
    return viewOf(def, state);
  };
  board.is.forEach((rule, i) => {
    const where = `is[${i}] ${rule.set}`;
    const target = split(rule.set);
    const def = target === undefined ? undefined : defs.get(target.prop);
    if (target === undefined || def === undefined) {
      report(where, `"${rule.set}" should be <prop>.<field> on this board`);
      return;
    }
    if (!(def.inputs ?? []).includes(target.member)) {
      report(
        where,
        `${def.type}.${target.member} can't be set by IS (inputs: ${(def.inputs ?? []).join(", ") || "none"})`,
      );
    }
    writers.set(rule.set, (writers.get(rule.set) ?? 0) + 1);
    const expression = "to" in rule ? compile(where, () => compileRule(rule.to, scope)) : undefined;
    const templates =
      "text" in rule
        ? compile(where, () =>
            Object.entries(rule.text).map(
              ([locale, source]) => [locale, compileTemplate(source)] as const,
            ),
          )
        : undefined;
    if (expression === undefined && templates === undefined) return;
    if (templates !== undefined)
      liveTexts.push([
        `is ${rule.set}`,
        Object.fromEntries(templates.map(([locale, template]) => [locale, template.skeleton])),
      ]);
    const refs = expression?.refs ?? (templates ?? []).flatMap(([, template]) => template.refs);
    checkRefs(where, refs);
    for (const [prop, field] of refs)
      edges.set(`${prop}.${field}`, (edges.get(`${prop}.${field}`) ?? new Set()).add(rule.set));
    // Try it on the board as it opens: the value must be one the prop accepts.
    const state = states.get(target.prop);
    if (state === undefined) return;
    try {
      const result =
        expression !== undefined
          ? expression.evaluate(scope)
          : Object.fromEntries(
              (templates ?? []).map(([locale, template]) => [locale, template.render(scope)]),
            );
      const check = applyPatch(def, state, { [target.member]: result });
      if (!check.isOk) for (const e of check.errors) report(where, e);
      else states.set(target.prop, check.state);
    } catch (error) {
      report(where, error instanceof Error ? error.message : String(error));
    }
  });
  for (const [target, count] of writers)
    if (count > 1) report(`is ${target}`, `${count} IS rules set ${target}; one field, one writer`);
  const visiting = new Set<string>();
  const done = new Set<string>();
  const hasLoop = (node: string): boolean => {
    if (visiting.has(node)) return true;
    if (done.has(node)) return false;
    visiting.add(node);
    const isLoop = [...(edges.get(node) ?? [])].some(hasLoop);
    visiting.delete(node);
    done.add(node);
    return isLoop;
  };
  for (const node of edges.keys())
    if (hasLoop(node)) report(`is ${node}`, "IS rules feed each other in a loop");

  // studentOnly: real actions on this board.
  for (const entry of board.studentOnly) {
    const target = split(entry);
    const def = target === undefined ? undefined : defs.get(target.prop);
    if (target === undefined || def === undefined)
      report("studentOnly", `"${entry}" should be <prop>.<action> on this board`);
    else if (def.actions[target.member] === undefined)
      report("studentOnly", `${def.type} has no action "${target.member}"`);
  }

  // WHEN: real signals, real conditions, real actions with real arguments.
  const spokenProps = new Set<string>();
  let canPass = false;
  board.when.forEach((rule, i) => {
    const where = `when[${i}] ${rule.on}`;
    const on = split(rule.on);
    const def = on === undefined ? undefined : defs.get(on.prop);
    if (on === undefined || def === undefined)
      report(where, `"${rule.on}" should be <prop>.<signal> on this board`);
    else if (def.signals?.[on.member] === undefined) {
      report(
        where,
        `${def.type} has no signal "${on.member}" (signals: ${Object.keys(def.signals ?? {}).join(", ") || "none"})`,
      );
    }
    if (rule.if !== undefined) {
      const test = rule.if;
      const condition = compile(`${where} if`, () => compileRule(test, scope));
      if (condition !== undefined) checkRefs(`${where} if`, condition.refs);
    }
    for (const step of callsIn(rule.do)) {
      const call = split(step.call);
      const target = call === undefined ? undefined : defs.get(call.prop);
      if (call === undefined || target === undefined) {
        report(where, `"${step.call}" should be <prop>.<action> on this board`);
        continue;
      }
      const action = target.actions[call.member];
      if (action === undefined) {
        report(
          where,
          `${target.type} has no action "${call.member}" (actions: ${Object.keys(target.actions).join(", ")})`,
        );
        continue;
      }
      // Expression arguments are checked like IS rules, then tried on the board as it opens,
      // so their type is checked against the action's arguments too.
      const sample: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(step.args)) {
        const source = argExpression(value);
        if (source === undefined) {
          sample[key] = value;
          continue;
        }
        const expression = compile(`${where} ${step.call}(${key})`, () =>
          compileExpression(source),
        );
        if (expression === undefined) continue;
        checkRefs(`${where} ${step.call}(${key})`, expression.refs);
        try {
          sample[key] = expression.evaluate(scope);
        } catch (error) {
          report(
            `${where} ${step.call}(${key})`,
            error instanceof Error ? error.message : String(error),
          );
        }
      }
      const args = action.args.safeParse(sample);
      if (!args.success)
        for (const issue of args.error.issues)
          report(where, `${step.call}(${issue.path.join(".")}): ${issue.message}`);
      if (action.reveals === true && questions.length > 0)
        report(where, `${step.call} reveals the answer on a board with a question`);
      if (call.prop === BOARD && call.member === BoardAction.Pass) canPass = true;
      if (
        call.prop === BOARD &&
        (call.member === BoardAction.Show || call.member === BoardAction.Hide)
      ) {
        const name = step.args.name;
        if (typeof name === "string" && !names.has(name))
          report(where, `no "${name}" on this board to show or hide`);
      }
      if (call.member === SAY) spokenProps.add(call.prop);
    }
  });
  if (!canPass) report("when", "nothing ever calls board.pass, so the learner can't move on");

  // Rich text: every learner-facing string (a prop's starting words, words an IS keeps, words a
  // script hands an action) must parse, and its maths must typeset.
  const checkRich = (where: string, value: unknown) =>
    forEachText(value, (path, text) => {
      for (const problem of richProblems(text)) report(where, `${path}: ${problem}`);
    });
  for (const piece of propPieces(board.root)) checkRich(piece.name, piece.with ?? {});
  for (const [where, skeletons] of liveTexts) checkRich(where, skeletons);
  for (const rule of board.when) {
    for (const call of callsIn(rule.do)) checkRich(`when ${rule.on} → ${call.call}`, call.args);
  }

  // Voice: every line that is said must reach the voice as plain words. Anything else needs a `speak`
  // line or a pronunciation rule; unknown characters are refused, not guessed.
  for (const name of spokenProps) {
    const def = defs.get(name);
    const state = states.get(name);
    const line = def === undefined || state === undefined ? undefined : def.speech?.(state);
    if (line === undefined) continue;
    for (const locale of LOCALES) {
      const said = spokenText(line, locale, readings);
      const odd = said === undefined ? [] : unspeakable(said);
      if (odd.length > 0) {
        report(
          name,
          `the ${locale} voice would get "${odd.join(" ")}" it can't read ("${said}"); add a "speak" line in plain words, or a rule to content/pronunciations.json`,
        );
      }
    }
  }
  return problems;
}

/** Calls `visit` for every text in every language inside `value` (a `{ en, hi }` anywhere in it). */
function forEachText(value: unknown, visit: (path: string, text: string) => void, path = ""): void {
  if (Array.isArray(value)) {
    value.forEach((item, i) => forEachText(item, visit, `${path}[${i}]`));
    return;
  }
  if (value === null || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  const isLocalized = LOCALES.every((locale) => typeof record[locale] === "string");
  for (const [key, child] of Object.entries(record)) {
    const at = path === "" ? key : `${path}.${key}`;
    if (isLocalized && typeof child === "string") visit(at, child);
    else forEachText(child, visit, at);
  }
}

/** The props a lesson's scripts ever tell to `say`, by board: these are the lines that need audio. */
export function spokenPropsOf(board: Board): Set<string> {
  const out = new Set<string>();
  for (const rule of board.when) {
    for (const step of callsIn(rule.do)) {
      const call = split(step.call);
      if (call !== undefined && call.member === SAY) out.add(call.prop);
    }
  }
  return out;
}
