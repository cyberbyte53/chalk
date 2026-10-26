import { Actor, type ChalkEvent, type EventEntry } from "@chalk/content";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createEventBus } from "./bus";
import { makeId } from "./id";

const onBoard = {
  opening: "o1",
  board: "aaaaaaaaaaaaaaaa",
  version: "0123456789abcdef",
} as const;
const select: EventEntry = {
  ...onBoard,
  actor: Actor.Learner,
  node: "bbbbbbbbbbbbbbbb",
  kind: "cause",
  payload: { action: "select", args: { option: "factor" } },
};

describe("createEventBus", () => {
  it("adds the envelope, numbers entries in order and says each one's seq", () => {
    const bus = createEventBus({ commit: "abc", session: "s", now: () => 1000 });
    const seen: ChalkEvent[] = [];
    bus.subscribe((e) => seen.push(e));
    const cause = bus.record(select);
    const signal = bus.record({
      ...onBoard,
      actor: Actor.Learner,
      node: "bbbbbbbbbbbbbbbb",
      kind: "signal",
      payload: { signal: "checked", payload: { status: "wrong" }, from: cause },
    });
    expect([cause, signal]).toEqual([0, 1]);
    expect(seen[0]).toMatchObject({ session: "s", seq: 0, at: 1000, commit: "abc", kind: "cause" });
    expect(seen[1]?.payload).toMatchObject({ from: 0 });
  });

  it("refuses entries that break their kind's shape, without using up a seq", () => {
    const problems: string[] = [];
    const bus = createEventBus({ commit: "abc", onInvalid: (p) => problems.push(p) });
    const seen: ChalkEvent[] = [];
    bus.subscribe((e) => seen.push(e));
    expect(bus.record({ ...select, payload: { signal: "", payload: {} } })).toBe(-1);
    bus.record(select);
    expect(problems).toHaveLength(1);
    expect(seen.map((e) => e.seq)).toEqual([0]);
  });

  it("throws on invalid entries by default", () => {
    expect(() => createEventBus({ commit: "abc" }).record({ ...select, board: "" })).toThrow(
      /Invalid event/,
    );
  });

  it("lets subscribers stop listening", () => {
    const bus = createEventBus({ commit: "abc" });
    const seen: ChalkEvent[] = [];
    bus.subscribe((e) => seen.push(e))();
    bus.record(select);
    expect(seen).toEqual([]);
  });
});

describe("makeId", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("works on insecure pages where crypto.randomUUID is missing", () => {
    vi.stubGlobal("crypto", { getRandomValues: (a: Uint8Array) => a.fill(171) });
    expect(makeId()).toBe("ab".repeat(16));
  });
});
