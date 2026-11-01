/**
 * The board as agents read it: one snapshot, the same for the chalk MCP's show, Jugnu and
 * tests. Each placed prop by address, with what was fixed where it was placed (setup), what can
 * change here (live), what is worked out from other values (bound, with where from), what is on
 * screen (parts, read from what its view draws), and what can be done to it (can). The types live here so every
 * package can read a snapshot; the player makes them.
 */

/** One thing on screen, by its address. */
export type PartSnapshot = {
  path: string;
  value?: unknown;
  words?: string;
  /** For an input: the action(s) touching it does, on its node (when it's on: see isOff). */
  does?: string | readonly string[];
  /** For an input that does an action with fixed arguments: those arguments. */
  args?: Readonly<Record<string, unknown>>;
  /** For an input whose own handler works out the arguments when it's used. */
  isByHand?: true;
  /** For an input: drawn, but turned off now. */
  isOff?: true;
  /** Where its drawing is written: file:line (in the dev preview). */
  drawnAt?: string;
};

/** Something that can be done to a node on this board. */
export type CanSnapshot = {
  action: string;
  /** What it takes, in a few words per argument (with limits). */
  takes: unknown;
  /** Who does it here: the learner (a control on screen), the lesson (its rules), or both. */
  who: readonly ("learner" | "lesson")[];
  /** The inputs that reach it, by address. */
  via: readonly string[];
};

/** A field worked out from other values: its value now, and what it is worked out from. */
export type BoundSnapshot = { value: unknown; from: readonly string[] };

export type NodeSnapshot = {
  path: string;
  /** Its prop type. */
  prop: string;
  /** There now: a placed prop not hidden by the board; a child shown by its group. */
  isShown: boolean;
  summary: string;
  /** Fixed where it was placed: nothing on this board changes them. */
  setup: Readonly<Record<string, unknown>>;
  /** The fields the board gave where it placed the prop; the rest of `setup` are the prop's defaults. */
  given: readonly string[];
  /** Can change on this board, and derived values that follow them. */
  live: Readonly<Record<string, unknown>>;
  /** The fields of `live` still as the prop starts them (its own start): nothing has moved them. */
  atStart?: readonly string[];
  /** Worked out from other values (by its group, or the board's rules): never set directly. */
  bound: Readonly<Record<string, BoundSnapshot>>;
  parts: readonly PartSnapshot[];
  can: readonly CanSnapshot[];
  /** What it knows that the screen doesn't show. */
  hidden?: Readonly<Record<string, unknown>>;
  /** The learner's actions no control on screen offers right now. */
  noControlNow?: readonly string[];
  /** Where the description and the screen disagree, and other gaps. */
  problems: readonly string[];
};

export type BoardSnapshot = {
  board: string;
  isPassed: boolean;
  /** The question still open on the board (by address), if one is. */
  openQuestion?: string;
  nodes: readonly NodeSnapshot[];
};

/** A node by address. */
export function nodeAt(snapshot: BoardSnapshot, path: string): NodeSnapshot | undefined {
  return snapshot.nodes.find((n) => n.path === path);
}

/** One value that moved, by address ("lens/imageArrow.tip"). */
export type Change = { path: string; was: unknown; now: unknown };

/** A part as the student sees it: its words (or value), and for an input whether it's on. */
function seenOf(p: PartSnapshot | undefined): unknown {
  if (p === undefined) return undefined;
  const shown = p.words ?? p.value;
  if (p.does === undefined && p.isOff !== true) return shown ?? null;
  const state = p.isOff === true ? "off" : "on";
  if (shown === undefined) return state;
  return `${typeof shown === "string" ? shown : JSON.stringify(shown)} (${state})`;
}

/**
 * What the student sees that changed between two snapshots: each part whose words, value or
 * on/off moved (one that appeared was nothing, one that went is nothing), what each prop knows but
 * doesn't show, and pieces shown or hidden. Read from the parts every view tags, so it holds for
 * every prop.
 */
export function seenBetween(was: BoardSnapshot, now: BoardSnapshot): Change[] {
  const before = new Map(was.nodes.map((n) => [n.path, n]));
  const out: Change[] = [];
  for (const node of now.nodes) {
    const old = before.get(node.path);
    if (old !== undefined && old.isShown !== node.isShown)
      out.push({
        path: node.path,
        was: old.isShown ? "shown" : "hidden",
        now: node.isShown ? "shown" : "hidden",
      });
    const oldParts = new Map((old?.parts ?? []).map((p) => [p.path, p]));
    const paths = [
      ...new Set([...(old?.parts ?? []).map((p) => p.path), ...node.parts.map((p) => p.path)]),
    ];
    const nowParts = new Map(node.parts.map((p) => [p.path, p]));
    for (const p of paths) {
      const then = seenOf(oldParts.get(p));
      const value = seenOf(nowParts.get(p));
      if (JSON.stringify(then) !== JSON.stringify(value))
        out.push({ path: p, was: then, now: value });
    }
    const keys = new Set([...Object.keys(old?.hidden ?? {}), ...Object.keys(node.hidden ?? {})]);
    for (const k of keys) {
      const then = old?.hidden?.[k];
      const value = node.hidden?.[k];
      if (JSON.stringify(then) !== JSON.stringify(value))
        out.push({ path: `${node.path}.${k} (hidden)`, was: then, now: value });
    }
  }
  return out;
}

/** Every value that moved between two snapshots (setup, live or bound), and nodes shown or hidden. */
export function changesBetween(was: BoardSnapshot, now: BoardSnapshot): Change[] {
  const before = new Map(was.nodes.map((n) => [n.path, n]));
  const valueIn = (n: NodeSnapshot | undefined, field: string) =>
    n === undefined
      ? undefined
      : field in n.live
        ? n.live[field]
        : field in n.bound
          ? n.bound[field]?.value
          : n.setup[field];
  const out: Change[] = [];
  for (const node of now.nodes) {
    const old = before.get(node.path);
    // Setup too: a value described as fixed that moved is a change all the same (and a sign the
    // prop doesn't say which control does it).
    const fields: [string, unknown][] = [
      ...Object.entries(node.setup),
      ...Object.entries(node.live),
      ...Object.entries(node.bound).map(([k, b]) => [k, b.value] as [string, unknown]),
    ];
    for (const [field, value] of fields) {
      const then = valueIn(old, field);
      if (JSON.stringify(then) !== JSON.stringify(value))
        out.push({ path: `${node.path}.${field}`, was: then, now: value });
    }
    if (old !== undefined && old.isShown !== node.isShown)
      out.push({
        path: node.path,
        was: old.isShown ? "shown" : "hidden",
        now: node.isShown ? "shown" : "hidden",
      });
  }
  return out;
}
