import { Actor, type ChalkEvent, type MachineType } from "@chalk/content";
import { afterEach, describe, expect, it, vi } from "vitest";
import { bindRaise, createEventBus } from "./bus";
import { makeId } from "./id";

const place = { lessonId: "l", contentVersion: "1", boardId: 2 };

describe("createEventBus", () => {
  it("adds the envelope and numbers events in order", () => {
    const bus = createEventBus({ sessionId: "s", now: () => 1000 });
    const seen: ChalkEvent[] = [];
    bus.subscribe((e) => seen.push(e));
    const board = bindRaise<typeof MachineType.Board>(bus.raiserFor(place), {
      type: "board",
      id: 2,
    });
    const question = bindRaise<typeof MachineType.Question>(bus.raiserFor(place), {
      type: "question",
      id: 4,
    });
    board(Actor.Learner, { type: "continue", props: {} }, { phase: "passed" });
    question(
      Actor.Learner,
      { type: "check", submitted: { kind: "choice", optionId: "a" } },
      { status: "wrong", attempts: 1 },
    );
    expect(seen.map((e) => e.envelope.seq)).toEqual([0, 1]);
    expect(seen[0]?.envelope).toMatchObject({
      sessionId: "s",
      producedAt: 1000,
      actor: "learner",
      boardId: 2,
    });
    expect(seen[1]?.machine).toEqual({ type: "question", id: 4 });
  });
  it("refuses events that break their shape, without using up a sequence number", () => {
    const problems: string[] = [];
    const bus = createEventBus({ onInvalid: (p) => problems.push(p) });
    const seen: ChalkEvent[] = [];
    bus.subscribe((e) => seen.push(e));
    const question = bindRaise<typeof MachineType.Question>(bus.raiserFor(place), {
      type: "question",
      id: 4,
    });
    question(
      Actor.Learner,
      { type: "check", submitted: { kind: "choice", optionId: "a" } },
      { status: "wrong", attempts: 0 },
    );
    question(
      Actor.Learner,
      { type: "check", submitted: { kind: "choice", optionId: "a" } },
      { status: "wrong", attempts: 1 },
    );
    expect(problems).toHaveLength(1);
    expect(seen.map((e) => e.envelope.seq)).toEqual([0]);
  });
  it("throws on invalid events by default", () => {
    const board = bindRaise<typeof MachineType.Board>(createEventBus().raiserFor(place), {
      type: "board",
      id: -1,
    });
    expect(() =>
      board(Actor.Learner, { type: "continue", props: {} }, { phase: "passed" }),
    ).toThrow(/Invalid event/);
  });
  it("lets subscribers stop listening", () => {
    const bus = createEventBus();
    const seen: ChalkEvent[] = [];
    const stop = bus.subscribe((e) => seen.push(e));
    stop();
    bindRaise<typeof MachineType.Board>(bus.raiserFor(place), { type: "board", id: 2 })(
      Actor.Learner,
      { type: "continue", props: {} },
      { phase: "passed" },
    );
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
