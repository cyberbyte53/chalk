import type { LiveConversation, LiveReflectionDone, LiveTurn, LiveTurnDone } from "./live";

/**
 * Jugnu's conversations, the one flow (teacher-view.md): a turn goes on with the conversation
 * going on at its opening (or starts one), is taken, and kept; a conversation is over `quietMs`
 * after his last turn, and then he reflects on it, once. Written once, for everywhere he runs:
 * what differs is only where it is kept (the keeper: the server's database for children, memory
 * for the preview and the sandbox) and the address the request comes to.
 */

/** Where a turn happens: who, the board's opening, its id, version and path, and the build. */
export type Place = {
  account: string;
  opening: string;
  board: string;
  version: string;
  commit: string;
  boardPath: string;
};

/** Where conversations are kept. */
export type Keeper = {
  /** The conversation going on at this place (not over), to go on with. */
  going: (place: Place) => Promise<{ id: string; conversation: LiveConversation } | undefined>;
  /** Keeps a turn (on the conversation going on, or a new one): their ids. */
  keepTurn: (
    place: Place,
    going: string | undefined,
    done: LiveTurnDone,
    at: number,
  ) => Promise<{ conversation: string; turn: string }>;
  /** Ends the conversations with no turn since `before`: their ids. */
  endQuiet: (before: number, at: number) => Promise<string[]>;
  /** Ends a learner's conversations going on at these openings (their set finished): their ids. */
  endAt: (account: string, openings: readonly string[], at: number) => Promise<string[]>;
  /** Conversations over and not yet reflected on (a reflection that failed is tried again). */
  unreflected: () => Promise<string[]>;
  /** A conversation that is over and not yet reflected on, with what it needs to go on. */
  toReflectOn: (
    id: string,
  ) => Promise<{ conversation: LiveConversation; boardPath: string } | undefined>;
  /** Keeps his reflection on it (its turn appended); its id. */
  keepReflection: (
    id: string,
    messagesBefore: number,
    done: LiveReflectionDone,
    at: number,
  ) => Promise<string>;
};

/** Jugnu himself: a turn, and a reflection (live.ts; a stand-in in tests). */
export type Jugnu = {
  turn: (turn: LiveTurn, going: LiveConversation | undefined) => Promise<LiveTurnDone>;
  reflect: (conversation: LiveConversation, boardPath: string) => Promise<LiveReflectionDone>;
};

export type Conversations = {
  /** One turn at a place: his reply and the ids it is kept by. */
  turn: (
    place: Place,
    turn: LiveTurn,
  ) => Promise<LiveTurnDone["reply"] & { conversation: string; turn: string }>;
  /** Ends the quiet ones and reflects on each, and on any not yet reflected on (called often). */
  sweep: () => Promise<void>;
  /** Ends a learner's conversations at these openings and waits for his reflections on them. */
  endAt: (account: string, openings: readonly string[]) => Promise<void>;
};

/** Thrown while a turn at the same place is still being answered. */
export class StillAnswering extends Error {
  constructor() {
    super("Jugnu is still answering the last message");
  }
}

export function conversations(o: {
  keeper: Keeper;
  jugnu: Jugnu;
  /** How long after his last turn a conversation is over (`jugnu.yaml`'s reflectAfterMinutes). */
  quietMs: number;
  now: () => number;
  onError: (message: string, error: unknown) => void;
}): Conversations {
  // One turn at a time per place (working state: a turn in flight).
  const answering = new Set<string>();
  const reflectOn = async (id: string) => {
    try {
      const found = await o.keeper.toReflectOn(id);
      if (found === undefined) return;
      const done = await o.jugnu.reflect(found.conversation, found.boardPath);
      await o.keeper.keepReflection(id, found.conversation.messages.length, done, o.now());
    } catch (error) {
      o.onError(`Jugnu's reflection on ${id} failed`, error);
    }
  };
  // One reflection at a time per conversation (a sweep and a set's end may both reach it).
  const reflecting = new Map<string, Promise<void>>();
  const reflectOnce = (id: string) => {
    const going = reflecting.get(id);
    if (going !== undefined) return going;
    const r = reflectOn(id).finally(() => reflecting.delete(id));
    reflecting.set(id, r);
    return r;
  };
  const sweep = async () => {
    try {
      await o.keeper.endQuiet(o.now() - o.quietMs, o.now());
      for (const id of await o.keeper.unreflected()) void reflectOnce(id);
    } catch (error) {
      o.onError("Ending quiet conversations failed", error);
    }
  };
  return {
    sweep,
    endAt: async (account, openings) => {
      await o.keeper.endAt(account, openings, o.now());
      await Promise.all((await o.keeper.unreflected()).map(reflectOnce));
    },
    turn: async (place, turn) => {
      const key = `${place.account}:${place.opening}:${place.board}`;
      if (answering.has(key)) throw new StillAnswering();
      answering.add(key);
      try {
        await sweep();
        const going = await o.keeper.going(place);
        const done = await o.jugnu.turn(turn, going?.conversation);
        const ids = await o.keeper.keepTurn(place, going?.id, done, o.now());
        return { ...done.reply, ...ids };
      } finally {
        answering.delete(key);
      }
    },
  };
}

/** A keeper in memory: the preview's and the sandbox's (nothing written; gone with the process). */
export function memoryKeeper(): Keeper & {
  /** What it holds, to look at (the preview's, a test's). */
  held: Map<
    string,
    {
      place: Place;
      conversation: LiveConversation;
      lastTurnAt: number;
      endedAt: number | null;
      turns: number;
      reflections: (LiveReflectionDone & { id: string; at: number })[];
    }
  >;
} {
  const held = new Map<
    string,
    {
      place: Place;
      conversation: LiveConversation;
      lastTurnAt: number;
      endedAt: number | null;
      turns: number;
      reflections: (LiveReflectionDone & { id: string; at: number })[];
    }
  >();
  let made = 0;
  const same = (a: Place, b: Place) =>
    a.account === b.account && a.opening === b.opening && a.board === b.board;
  return {
    held,
    going: async (place) => {
      for (const [id, c] of held)
        if (c.endedAt === null && same(c.place, place)) return { id, conversation: c.conversation };
      return undefined;
    },
    keepTurn: async (place, going, done, at) => {
      const id = going ?? `c${++made}`;
      const before = held.get(id);
      held.set(id, {
        place,
        conversation: done.conversation,
        lastTurnAt: at,
        endedAt: null,
        turns: (before?.turns ?? 0) + 1,
        reflections: before?.reflections ?? [],
      });
      return { conversation: id, turn: `${id}.t${(before?.turns ?? 0) + 1}` };
    },
    endQuiet: async (before, at) => {
      const ended: string[] = [];
      for (const [id, c] of held)
        if (c.endedAt === null && c.lastTurnAt < before) {
          c.endedAt = at;
          ended.push(id);
        }
      return ended;
    },
    endAt: async (account, openings, at) => {
      const ended: string[] = [];
      for (const [id, c] of held)
        if (
          c.endedAt === null &&
          c.place.account === account &&
          openings.includes(c.place.opening)
        ) {
          c.endedAt = at;
          ended.push(id);
        }
      return ended;
    },
    unreflected: async () =>
      [...held].flatMap(([id, c]) =>
        c.endedAt !== null && c.reflections.length === 0 ? [id] : [],
      ),
    toReflectOn: async (id) => {
      const c = held.get(id);
      return c === undefined || c.endedAt === null || c.reflections.length > 0
        ? undefined
        : { conversation: c.conversation, boardPath: c.place.boardPath };
    },
    keepReflection: async (id, _before, done, at) => {
      const c = held.get(id);
      const made = `${id}.r${(c?.reflections.length ?? 0) + 1}`;
      c?.reflections.push({ ...done, id: made, at });
      return made;
    },
  };
}
