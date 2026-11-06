import { describe, expect, it } from "vitest";
import type { Filed } from "../comments";
import { changedWords, settledHere, threadsAnswer } from "./threads-text";

/** A thread on a board's piece, with how it stands and its messages. */
const thread = (id: string, status: Filed["status"], messages: Filed["messages"] = []): Filed =>
  ({
    id,
    status,
    by: "reviewer",
    role: "reviewer",
    createdAt: "2026-11-01T00:00:00Z",
    board: "b/c/l/one",
    target: "sheet",
    text: `finding ${id}`,
    messages,
    ...(status === "closed" || status === "withdrawn" ? {} : { turn: "fixer" }),
    home: "b/c",
  }) as Filed;

describe("what comments answers", () => {
  const planned = {
    by: "fixer",
    role: "fixer" as const,
    at: "2026-11-01T01:00:00Z",
    text: "Move the label",
    status: "planned" as const,
  };
  const all = [
    thread("open1", "ready", [planned]),
    thread("old1", "closed"),
    thread("old2", "closed"),
    thread("gone", "withdrawn"),
  ];

  it("the open threads in full; the settled ones counted", () => {
    const text = threadsAnswer(all, all, {});
    expect(text).toContain("open1");
    expect(text).toContain("finding open1");
    expect(text).not.toContain("old1");
    expect(text).toContain("2 closed and 1 withdrawn here, settled");
  });

  it("a plan once: its planned message, not a plan line besides", () => {
    const text = threadsAnswer(all, all, {});
    expect(text.match(/Move the label/g)).toHaveLength(1);
  });

  it("closed: true reads the settled ones too; id reads one in full, settled or not", () => {
    expect(threadsAnswer(all, all, { closed: true })).toContain("finding old2");
    expect(threadsAnswer(all, [], { id: "old1" })).toContain("finding old1");
    expect(threadsAnswer(all, [], { id: "nope" })).toBe("No thread nope.");
  });

  it("nothing open: says so, and still counts what is settled", () => {
    const settled = all.slice(1);
    expect(threadsAnswer(settled, settled, {})).toBe(
      "No open threads match.\n\n2 closed and 1 withdrawn here, settled: `closed: true` to read them, or one by `id`.",
    );
  });
});

describe("weight and options", () => {
  it("a finding says its weight; an ask its options and what he picked", () => {
    const finding = { ...thread("f", "open"), weight: "consider" } as Filed;
    expect(threadsAnswer([finding], [finding], {})).toContain("• f [open, consider]");
    const ask = {
      ...thread("q", "open"),
      by: "fixer",
      role: "fixer",
      text: "Ring or not?",
      turn: "fixer",
      options: [
        { label: "Ring", why: "shows the point" },
        { label: "No ring", why: "less to see" },
      ],
      messages: [{ by: "you", role: "person", at: "2026-11-01T02:00:00Z", text: "No ring" }],
    } as Filed;
    const text = threadsAnswer([ask], [ask], {});
    expect(text).toContain("fixer asks: “Ring or not?”");
    expect(text).toContain("option 1: Ring: shows the point");
    expect(text).toContain("picked: No ring");
  });
});

describe("a new thread where one was settled", () => {
  it("is told of the closed threads on the same thing, latest first, at most three", () => {
    const closer = (at: string, text: string) => [
      { by: "nsr", role: "person" as const, at, text, status: "closed" as const },
    ];
    const settled = [
      thread("a", "closed", closer("2026-11-01T01:00:00Z", "Keep the numbers.")),
      thread("b", "closed", closer("2026-11-01T03:00:00Z", "Labels stay outside.")),
      { ...thread("other", "closed"), target: "title" },
      thread("open", "ready"),
    ];
    const fresh = thread("new", "open");
    expect(settledHere([...settled, fresh], fresh)).toEqual([
      '  settled here before: b, closed (last, nsr): "Labels stay outside."',
      '  settled here before: a, closed (last, nsr): "Keep the numbers."',
    ]);
    expect(settledHere([fresh], fresh)).toEqual([]);
  });
});

describe("changedWords", () => {
  it("names the source files and counts the voice clips", () => {
    expect(
      changedWords([
        "content/b/c/l/overview.ts",
        "content/b/c/sound/0a1b.m4a",
        "content/b/c/sound/sound.json",
        "content/b/c/sound/2c3d.m4a",
      ]),
    ).toBe("content/b/c/l/overview.ts, content/b/c/sound/sound.json, and 2 voice clips");
  });
});
