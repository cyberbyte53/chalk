import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Role, Status, YOU, applyChange } from "./comments";
import { recordOf } from "./content/board-record";
import {
  Step,
  approve,
  checkOutline,
  nextStep,
  readBrief,
  readChapter,
  readFlow,
  readLessons,
  readMatch,
  readObjectives,
} from "./pipeline";
import { passUnder } from "./reviewed";

const BRIEF = `- For: class 9
- Must keep: every figure
`;
const OUTLINE = `- { id: fig3.1, kind: figure }
- { id: fig3.2, kind: figure }
- { id: example1, kind: example }
`;
const TEXT = "See Fig. 3.1 and Fig.3.2. Example 1: plot it.";
const OBJECTIVES = "- **o1** Read a point's coordinates. (fig3.1, example1)\n";
const FLOW = `## coordinates
### reading  (o1; fig3.1)
Purpose: read P.
Needs: a point on a plane, its distances to the axes.
`;
const PROPS = `| Need | Boards | Verdict | Why |
|---|---|---|---|
| a point on a plane | reading | **reuse** coordinatePlane | it does this |
`;

function chapter(): string {
  const root = mkdtempSync(join(tmpdir(), "pipeline-"));
  const dir = join(root, "authoring", "books", "b", "c");
  mkdirSync(join(dir, "source"), { recursive: true });
  writeFileSync(join(dir, "brief.md"), BRIEF);
  writeFileSync(join(dir, "source", "outline.yaml"), OUTLINE);
  writeFileSync(join(dir, "source", "text.txt"), TEXT);
  writeFileSync(join(dir, "objectives.md"), OBJECTIVES);
  writeFileSync(join(dir, "flow.md"), FLOW);
  writeFileSync(join(dir, "props.md"), PROPS);
  const git = (...args: string[]) =>
    execFileSync("git", args, {
      cwd: root,
      stdio: "ignore",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "t",
        GIT_AUTHOR_EMAIL: "t@t",
        GIT_COMMITTER_NAME: "t",
        GIT_COMMITTER_EMAIL: "t@t",
      },
    });
  git("init", "-q");
  git("add", "-A");
  git("commit", "-qm", "files");
  return root;
}
const commit = (root: string, m: string) => {
  const env = {
    ...process.env,
    GIT_AUTHOR_NAME: "t",
    GIT_AUTHOR_EMAIL: "t@t",
    GIT_COMMITTER_NAME: "t",
    GIT_COMMITTER_EMAIL: "t@t",
  };
  execFileSync("git", ["add", "-A"], { cwd: root, env });
  execFileSync("git", ["commit", "-qm", m], { cwd: root, env });
};
const file = (root: string, name: string) => join(root, "authoring", "books", "b", "c", name);
const state = (root: string, step: Step) =>
  readChapter(root, "b", "c").files.find((f) => f.step === step);

describe("reading the planning files", () => {
  it("reads the brief, objectives with what they cite, the flow and the props match", () => {
    expect(readBrief(BRIEF).problems).toEqual([]);
    expect(readBrief("\n").problems).toEqual(["the brief is empty"]);
    expect(readObjectives(OBJECTIVES)).toEqual([
      {
        id: "o1",
        text: "Read a point's coordinates. (fig3.1, example1)",
        cites: ["fig3.1", "example1"],
      },
    ]);
    expect(readFlow(FLOW)).toEqual([
      {
        lesson: "coordinates",
        id: "reading",
        cites: ["o1", "fig3.1"],
        needs: "a point on a plane, its distances to the axes.",
      },
    ]);
    expect(readMatch(PROPS).rows).toEqual([
      { need: "a point on a plane", boards: ["reading"], verdict: "reuse coordinateplane" },
    ]);
  });

  it("checks the outline against the text: every figure, example, activity and exercise", () => {
    expect(checkOutline([{ id: "fig3.1", kind: "figure" }], [TEXT])).toEqual([
      "the text has fig3.2; the outline doesn't",
      "the text has example1; the outline doesn't",
    ]);
  });
});

describe("a chapter's gates", () => {
  it("holds when every citation exists and every objective and board is served", () => {
    const root = chapter();
    const c = readChapter(root, "b", "c");
    expect(c.files.flatMap((f) => f.problems)).toEqual([]);
    expect(c.files.map((f) => f.status)).toEqual(["draft", "approved", "draft", "draft", "draft"]);
    expect(state(root, Step.Objectives)?.notes).toEqual(["no objective cites: fig3.2"]);
    expect(nextStep(c)?.step).toBe(Step.Brief);
  });

  it("fails where a citation is missing, an objective has no board, or a board has no verdict", () => {
    const root = chapter();
    writeFileSync(file(root, "objectives.md"), `${OBJECTIVES}- **o2** Plot one. (fig9.9)\n`);
    writeFileSync(
      file(root, "flow.md"),
      `${FLOW}### plotting  (o1)\nPurpose: p.\nNeeds: a plane.\n`,
    );
    expect(state(root, Step.Objectives)?.problems).toEqual([
      { text: "o2 cites fig9.9, not in the outline", about: "o2" },
    ]);
    expect(state(root, Step.Flow)?.problems).toEqual([{ text: "no board serves o2" }]);
    expect(state(root, Step.Props)?.problems).toEqual([
      { text: "board plotting's need has no verdict" },
    ]);
  });
});

describe("approval and what a change reaches", () => {
  it("approves in order, only what is committed, and records the commit", () => {
    const root = chapter();
    expect(() => approve(root, "b", "c", Step.Objectives)).toThrow(/brief.md comes first/);
    const at = approve(root, "b", "c", Step.Brief);
    expect(readFileSync(file(root, "brief.md"), "utf8")).toMatch(
      new RegExp(`^---\napproved: ${at}\n---\n`),
    );
    commit(root, "brief approved");
    writeFileSync(file(root, "objectives.md"), OBJECTIVES.replace("Read", "Read off"));
    expect(() => approve(root, "b", "c", Step.Objectives)).toThrow(/not committed/);
  });

  it("doesn't approve a file while a thread on it is open", () => {
    const root = chapter();
    const asked = applyChange(
      root,
      {
        op: "start",
        thread: { source: "authoring/books/b/c/brief.md:1", quote: "class 9", text: "which term?" },
      },
      { name: "fixer", role: Role.Fixer },
    );
    if (!asked.ok || asked.thread === undefined) throw new Error("not started");
    expect(() => approve(root, "b", "c", Step.Brief)).toThrow(/still open on brief.md/);
    applyChange(root, { op: "write", id: asked.thread.id, text: "", status: Status.Closed }, YOU);
    expect(() => approve(root, "b", "c", Step.Brief)).not.toThrow();
  });

  it("a changed file says so, and what was written from it is to be checked again", () => {
    const root = chapter();
    for (const step of [Step.Brief, Step.Objectives, Step.Flow]) {
      approve(root, "b", "c", step);
      commit(root, `${step} approved`);
    }
    expect(state(root, Step.Flow)).toMatchObject({ status: "approved", recheck: [] });
    writeFileSync(
      file(root, "objectives.md"),
      readFileSync(file(root, "objectives.md"), "utf8").replace("Read", "Read and say"),
    );
    expect(state(root, Step.Objectives)?.status).toBe("changed");
    expect(state(root, Step.Flow)?.recheck).toEqual([Step.Objectives]);
  });
});

describe("a lesson waits on a self-review", () => {
  const lesson = (root: string) => {
    mkdirSync(join(root, "content", "b", "c", "first"), { recursive: true });
    writeFileSync(join(root, "content", "b", "c", "build.yaml"), "concepts:\n  - first\n");
  };
  /** What the build writes for a board (board-record.ts). */
  const built = (root: string, key: string, words: string) => {
    const dir = join(root, "build", "review", "b", "c", "first");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${key}.json`), JSON.stringify(recordOf({ words }, { text: "v1" })));
  };
  const first = (root: string) => readLessons(root, "b", "c")[0];

  it("waits while a board is new or changed since passed, naming those boards", () => {
    const root = chapter();
    lesson(root);
    built(root, "story", "Here is a dot");
    built(root, "desk", "A desk");
    expect(first(root)).toMatchObject({
      slug: "first",
      isToSelfReview: true,
      why: "desk (new), story (new)",
    });
    passUnder(root, "b/c/first", "reviewer");
    expect(first(root)).toEqual({ slug: "first", isToSelfReview: false });
    built(root, "story", "In the town, the roads told Riya where to go");
    expect(first(root)).toMatchObject({ isToSelfReview: true, why: "story (changed)" });
  });
});
