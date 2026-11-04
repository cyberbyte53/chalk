import { describe, expect, it } from "vitest";
import {
  type Jugnu,
  type Place,
  StillAnswering,
  conversations,
  memoryKeeper,
} from "./conversations";

const place: Place = {
  account: "a",
  opening: "o1",
  board: "b1",
  version: "v1",
  commit: "c1",
  boardPath: "book/ch/ask",
};
const turn = { session: "o1", board: "book/ch/ask", state: {} as never, did: [], said: "why?" };

/** A stand-in Jugnu: each turn adds two messages; a reflection names how many it saw. */
function standIn(): Jugnu & { reflections: number } {
  const j = {
    reflections: 0,
    turn: async (t: typeof turn, going: { messages: unknown[] } | undefined) => {
      const messages = [...(going?.messages ?? []), { said: t.said }, { says: "a question" }];
      return {
        reply: { says: "a question", glow: null, choices: [], isHandBack: false, model: "m" },
        conversation: { messages, cursor: { n: messages.length } },
        added: messages.slice(-2),
        requests: [],
        ms: 1,
      } as never;
    },
    reflect: async (c: { messages: unknown[] }) => {
      j.reflections++;
      return { points: [`saw ${c.messages.length}`], gotThere: "partly" } as never;
    },
  };
  return j as never;
}

describe("Jugnu's conversations, the one flow", () => {
  it("goes on at an opening, is over after the quiet time, and is reflected on once", async () => {
    let clock = 0;
    const kept = memoryKeeper();
    const jugnu = standIn();
    const talks = conversations({
      keeper: kept,
      jugnu,
      quietMs: 1000,
      now: () => clock,
      onError: (m) => {
        throw new Error(m);
      },
    });
    const first = await talks.turn(place, turn);
    const second = await talks.turn(place, { ...turn, said: "and?" });
    expect(second.conversation).toBe(first.conversation);
    expect(kept.held.get(first.conversation)?.conversation.messages).toHaveLength(4);
    // Another opening, another conversation.
    const other = await talks.turn({ ...place, opening: "o2" }, turn);
    expect(other.conversation).not.toBe(first.conversation);

    clock += 1001;
    await talks.sweep();
    await new Promise((r) => setTimeout(r, 0));
    const c = kept.held.get(first.conversation);
    expect(c?.endedAt).toBe(clock);
    expect(c?.reflections.map((r) => r.points)).toEqual([["saw 4"]]);
    // Swept again: nothing is reflected on twice.
    await talks.sweep();
    await new Promise((r) => setTimeout(r, 0));
    expect(jugnu.reflections).toBe(2);
    // The opening's next turn, after it was over, starts a new one.
    const after = await talks.turn(place, turn);
    expect(after.conversation).not.toBe(first.conversation);
  });

  it("takes one turn at a time at a place", async () => {
    let release: () => void = () => undefined;
    const slow = standIn();
    const turnOf = slow.turn;
    slow.turn = async (t, g) => {
      await new Promise<void>((r) => {
        release = r;
      });
      return turnOf(t, g);
    };
    const talks = conversations({
      keeper: memoryKeeper(),
      jugnu: slow,
      quietMs: 1000,
      now: () => 0,
      onError: () => undefined,
    });
    const going = talks.turn(place, turn);
    await new Promise((r) => setTimeout(r, 0));
    await expect(talks.turn(place, turn)).rejects.toBeInstanceOf(StillAnswering);
    release();
    await going;
  });
});
