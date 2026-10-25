import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  type Comment,
  chapterOf,
  formatComment,
  listComments,
  parseComment,
  writeComment,
} from "./comments";

const sample: Comment = {
  id: "c1",
  status: "open",
  chapter: "class10-maths/polynomials",
  on: "class10-maths/polynomials/what-is-a-polynomial/overview/names",
  piece: "which",
  source: "content/class10-maths/polynomials/what-is-a-polynomial/overview.ts:205",
  createdAt: "2026-10-24T05:21:44.000Z",
  thread: [{ by: "agent", at: "2026-10-24T06:00:00Z", text: "Proposal: shorter options." }],
  proposal: { summary: "s", changes: [{ before: "a: b", after: "c\nd" }] },
  someNewField: 3,
  text: "equations are not getting contained in the button",
};

describe("comments files", () => {
  it("round-trips every field, unknown ones included", () => {
    expect(parseComment(formatComment(sample), sample.chapter)).toEqual(sample);
  });

  it("puts the comment in the body and where it points first", () => {
    const text = formatComment(sample);
    expect(text.split("\n").slice(0, 3)).toEqual(["---", "id: c1", "status: open"]);
    expect(text.trimEnd().endsWith(sample.text)).toBe(true);
  });

  it("files each comment in its chapter's comments folder and lists them", () => {
    const root = mkdtempSync(join(tmpdir(), "fb-"));
    const file = writeComment(root, sample);
    expect(file).toBe("content/class10-maths/polynomials/.comments/c1.md");
    expect(readFileSync(join(root, file), "utf8")).toContain("which");
    expect(listComments(root).map((f) => f.id)).toEqual(["c1"]);
  });

  it("files a comment on a prop with the prop, and lists it with the rest", () => {
    const root = mkdtempSync(join(tmpdir(), "fb-"));
    writeComment(root, sample);
    const onProp: Comment = {
      ...sample,
      id: "c2",
      chapter: "library/props/polynomials",
      prop: "valueMachine",
      part: "stepper",
      createdAt: "2026-10-24T06:21:44.000Z",
    };
    const file = writeComment(root, onProp);
    expect(file).toBe("library/props/polynomials/.comments/c2.md");
    const listed = listComments(root);
    expect(listed.map((f) => [f.id, f.chapter, f.prop])).toEqual([
      ["c1", "class10-maths/polynomials", undefined],
      ["c2", "library/props/polynomials", "valueMachine"],
    ]);
    expect(readFileSync(join(root, file), "utf8").split("\n")[3]).toBe("prop: valueMachine");
  });

  it("knows a comment's chapter from its board, its source or a plan's lesson id", () => {
    expect(chapterOf({ on: "a/b/c/overview/x" })).toBe("a/b");
    expect(chapterOf({ source: "content/a/b/c/overview.ts:3" })).toBe("a/b");
    expect(chapterOf({ lessonId: "class9-science/motion", board: "plan" })).toBe(
      "class9-science/motion",
    );
    expect(chapterOf({ lessonId: "concept/abc" })).toBeUndefined();
  });
});
