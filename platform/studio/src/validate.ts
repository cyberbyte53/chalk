import {
  type Board,
  type BoardAt,
  type CallArgs,
  LOCALES,
  type Lesson,
  type Script,
  lessonSchema,
  propPieces,
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
  initialState,
  viewOf,
} from "@chalk/prop";
import { said } from "./sound/voice/said";

export type Problem = { where: string; message: string };

type Defs = Readonly<Record<string, AnyPropDef>>;

/** A hand-made run of boards (a test lesson): its format, unique board names, and each board. */
export function validateLesson(input: unknown, defs: Defs): Problem[] {
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
    problems.push(...validateBoard(board, defs));
  }
  return problems;
}

/** Every `call` in a script, in order. */
function callsIn(script: Script): { call: string; args: CallArgs }[] {
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
export function validateBoard(board: Board, allDefs: Defs): Problem[] {
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
  const fields = (name: string): Set<string> => {
    const def = defs.get(name);
    return def === undefined
      ? new Set()
      : new Set([...Object.keys(def.defaults), ...Object.keys(def.derived ?? {})]);
  };
  /**
   * How a rule reads the board as it opens: each field it reads is noted, and one the piece hasn't
   * is reported.
   */
  const reading =
    (where: string, reads: Set<string>): BoardAt =>
    (piece) => {
      const name = typeof piece === "string" ? piece : piece.name;
      const def = defs.get(name);
      const state = states.get(name);
      if (def === undefined || state === undefined)
        throw new Error(`no prop "${name}" on this board`);
      return new Proxy(viewOf(def, state), {
        get(target, key, receiver) {
          if (typeof key === "string" && key !== "toJSON") {
            if (key in target) reads.add(`${name}.${key}`);
            else
              report(
                where,
                `${name} has no field "${key}" (fields: ${[...fields(name)].join(", ")})`,
              );
          }
          return Reflect.get(target, key, receiver);
        },
      });
    };
  /** Runs a rule on the board as it opens: what it gave, or nothing when it threw (reported). */
  const tryOn = <T>(
    where: string,
    reads: Set<string>,
    run: (at: BoardAt) => T,
  ): { value: T } | undefined => {
    try {
      return { value: run(reading(where, reads)) };
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
  /** What each IS gave on the board as it opens: its words are checked below. */
  const liveTexts: [where: string, value: unknown][] = [];
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
    // Tried on the board as it opens: what it reads, and a value the prop accepts.
    const reads = new Set<string>();
    const result = tryOn(where, reads, rule.to);
    for (const read of reads) edges.set(read, (edges.get(read) ?? new Set()).add(rule.set));
    if (result === undefined) return;
    liveTexts.push([`is ${rule.set}`, result.value]);
    const state = states.get(target.prop);
    if (state === undefined) return;
    const check = applyPatch(def, state, { [target.member]: result.value });
    if (!check.isOk) for (const e of check.errors) report(where, e);
    else states.set(target.prop, check.state);
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
    const test = rule.if;
    if (test !== undefined) tryOn(`${where} if`, new Set(), test);
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
      // Arguments worked out from the board are tried on it as it opens, and checked like any.
      const given = step.args;
      const sample =
        typeof given === "function"
          ? tryOn(`${where} ${step.call}`, new Set(), given)?.value
          : given;
      if (sample === undefined) continue;
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
        const name = sample.name;
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
  for (const [where, value] of liveTexts) checkRich(where, value);
  for (const rule of board.when) {
    for (const call of callsIn(rule.do))
      if (typeof call.args !== "function") checkRich(`when ${rule.on} → ${call.call}`, call.args);
  }

  // Voice: a line said aloud is said in words a person wrote: its screen words when they are words,
  // else its spoken words (`speak`). Nothing is turned into words for it.
  for (const name of spokenProps) {
    const def = defs.get(name);
    const state = states.get(name);
    const line = def === undefined || state === undefined ? undefined : def.speech?.(state);
    if (line === undefined) continue;
    for (const locale of LOCALES) {
      const what = said(
        { own: line.say, ...(line.speak === undefined ? {} : { says: line.speak }) },
        locale,
      );
      if (what !== undefined && "needs" in what)
        report(
          name,
          `the ${locale} voice can't say it as shown (${what.needs}); write how it is said, as the line's "speak"`,
        );
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
