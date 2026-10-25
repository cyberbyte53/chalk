/**
 * The board as agents read it: one snapshot, the same for render_board, Jugnu and tests. A tree of
 * nodes by address (a placed prop, and inside a group its children), each with what was fixed where
 * it was placed (setup), what can change here (live), what is worked out from other values
 * (bound, with where from), what is on screen (parts), and what can be done to it (can). Made from
 * the definitions and the running board; nothing is written by hand. The types live here so every
 * package can read a snapshot; the player makes them.
 */

/** One thing on screen, by its address. */
export type PartSnapshot = {
  path: string;
  value?: unknown;
  words?: string;
  /** For a control: the action(s) touching it does, on its node. */
  does?: string | readonly string[];
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
  /** The controls that reach it, by address. */
  via: readonly string[];
  /** It doesn't run as itself: the group it is in turns it into its own change (a route). */
  routed?: true;
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
  /** Can change on this board, and derived values that follow them. */
  live: Readonly<Record<string, unknown>>;
  /** Worked out from other values (by its group, or the board's rules): never set directly. */
  bound: Readonly<Record<string, BoundSnapshot>>;
  parts: readonly PartSnapshot[];
  can: readonly CanSnapshot[];
  /** What it knows that the screen doesn't show. */
  hidden?: Readonly<Record<string, unknown>>;
  /** Inside a group: its children, in drawing order. */
  children?: readonly NodeSnapshot[];
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

/** Every part under a node (its own and its children's), in drawing order. */
export function partsUnder(node: NodeSnapshot): PartSnapshot[] {
  return [...node.parts, ...(node.children ?? []).flatMap((c) => (c.isShown ? partsUnder(c) : []))];
}

/** A node by address, anywhere in the snapshot. */
export function nodeAt(snapshot: BoardSnapshot, path: string): NodeSnapshot | undefined {
  const walk = (nodes: readonly NodeSnapshot[]): NodeSnapshot | undefined => {
    for (const n of nodes) {
      if (n.path === path) return n;
      if (path.startsWith(`${n.path}/`)) return walk(n.children ?? []);
    }
    return undefined;
  };
  return walk(snapshot.nodes);
}

/** One value that moved, by address ("lens/imageArrow.tip"). */
export type Change = { path: string; was: unknown; now: unknown };

/** Every live or bound value that moved between two snapshots, and nodes shown or hidden. */
export function changesBetween(was: BoardSnapshot, now: BoardSnapshot): Change[] {
  const flat = (nodes: readonly NodeSnapshot[]): NodeSnapshot[] =>
    nodes.flatMap((n) => [n, ...flat(n.children ?? [])]);
  const before = new Map(flat(was.nodes).map((n) => [n.path, n]));
  const valueIn = (n: NodeSnapshot | undefined, field: string) =>
    n === undefined
      ? undefined
      : field in n.live
        ? n.live[field]
        : field in n.bound
          ? n.bound[field]?.value
          : n.setup[field];
  const out: Change[] = [];
  for (const node of flat(now.nodes)) {
    const old = before.get(node.path);
    const fields: [string, unknown][] = [
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
