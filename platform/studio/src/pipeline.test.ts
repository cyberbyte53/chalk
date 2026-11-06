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
  readBoards,
  readChapter,
  readLessons,
  readPlan,
  stampProblems,
  takeBack,
} from "./pipeline";
import { passUnder } from "./reviewed";

const OUTLINE = `- { id: fig3.1, kind: figure }
- { id: fig3.2, kind: figure }
- { id: example1, kind: example }
`;
const TEXT = "See Fig. 3.1 and Fig.3.2. Example 1: plot it.";
const PLAN = `# A chapter

## Goal
Read a point's coordinates.

## Objectives
- **o1** Read a point's coordinates. (fig3.1, example1)

## Skipped
- **fig3.2** the same picture as fig3.1, turned.

## Story
Riya reads a map.

## Lessons
### coordinates  (o1)
Goal: read a point. Does: taps P. Card: a dot and its two distances.

## Chapter art
A dot on a grid.

## Props
- **reuse** \`coordinatePlane\`: a plane with a point. Why: it does this.

## Question families
- **read-it** reads a marked point's coordinates. (o1)
`;
const BOARDS = `# Boards

## coordinates
### reading  (o1; fig3.1)
Purpose: read P.
Beat: Riya finds the well.
Needs: a point on a plane, its distances to the axes.
Props: coordinatePlane

### questions/read-it  (o1; example1)
Purpose: read a marked point.
Needs: a point with its coordinates hidden.
`;

function chapter(): string {
  const root = mkdtempSync(join(tmpdir(), "pipeline-"));
  const dir = join(root, "authoring", "books", "b", "c");
  mkdirSync(join(dir, "source", "en"), { recursive: true });
  writeFileSync(join(dir, "source", "en", "outline.yaml"), OUTLINE);
  writeFileSync(join(dir, "source", "en", "text.txt"), TEXT);
  writeFileSync(join(dir, "plan.md"), PLAN);
  writeFileSync(join(dir, "boards.md"), BOARDS);
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
const texts = (root: string, step: Step) => state(root, step)?.problems.map((p) => p.text);
const edit = (root: string, name: string, from: string | RegExp, to: string) =>
  writeFileSync(file(root, name), readFileSync(file(root, name), "utf8").replace(from, to));
/** A built chapter: its build.yaml's lessons, each with its art.tsx when `art`. */
const build = (root: string, lessons: readonly string[], art = true) => {
  const dir = join(root, "content", "b", "c");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "build.yaml"), `concepts:\n${lessons.map((l) => `  - ${l}\n`).join("")}`);
  for (const l of lessons) {
    mkdirSync(join(dir, l), { recursive: true });
    if (art) writeFileSync(join(dir, l, "art.tsx"), "export const art = 1;\n");
  }
};

describe("reading plan.md and boards.md", () => {
  it("reads the plan's sections: objectives with what they cite, skipped, lessons, families, props", () => {
    const plan = readPlan(PLAN);
    expect(plan.goal).toBe("Read a point's coordinates.");
    expect(plan.objectives).toEqual([
      {
        id: "o1",
        text: "Read a point's coordinates. (fig3.1, example1)",
        cites: ["fig3.1", "example1"],
      },
    ]);
    expect(plan.skipped.map((s) => s.id)).toEqual(["fig3.2"]);
    expect(plan.lessons).toEqual([{ slug: "coordinates", cites: ["o1"] }]);
    expect(plan.families.map((f) => [f.id, f.cites])).toEqual([["read-it", ["o1"]]]);
    expect(plan.props.map((p) => p.id)).toEqual(["reuse"]);
    expect(plan.missing).toEqual([]);
    expect(readPlan("## Goal\nx\n").missing).toContain("Objectives");
  });

  it("reads each board and family with its lesson, what it cites, its purpose and needs", () => {
    expect(readBoards(BOARDS)).toEqual([
      {
        lesson: "coordinates",
        id: "reading",
        cites: ["o1", "fig3.1"],
        purpose: "read P.",
        needs: "a point on a plane, its distances to the axes.",
      },
      {
        lesson: "coordinates",
        id: "questions/read-it",
        cites: ["o1", "example1"],
        purpose: "read a marked point.",
        needs: "a point with its coordinates hidden.",
      },
    ]);
  });

  it("checks the outline against the text: every figure, example, activity and exercise", () => {
    expect(checkOutline([{ id: "fig3.1", kind: "figure" }], [TEXT])).toEqual([
      "the text has fig3.2; the outline doesn't",
      "the text has example1; the outline doesn't",
    ]);
  });
});

describe("a chapter's checks", () => {
  it("hold when every citation exists, every outline item is covered and every objective served", () => {
    const root = chapter();
    const c = readChapter(root, "b", "c");
    expect(c.files.flatMap((f) => f.problems)).toEqual([]);
    expect(c.files.map((f) => [f.file, f.status, f.isApprovable])).toEqual([
      ["source/en/outline.yaml", "approved", false],
      ["plan.md", "draft", true],
      ["boards.md", "approved", false],
    ]);
    expect(nextStep(c)?.step).toBe(Step.Plan);
  });

  it("fail where an outline item is neither covered nor skipped, or skipped without a reason", () => {
    const root = chapter();
    edit(root, "plan.md", "- **fig3.2** the same picture as fig3.1, turned.", "");
    expect(texts(root, Step.Plan)).toEqual([
      'no objective covers fig3.2, and it isn\'t skipped ("## Skipped": "- **<id>** why")',
    ]);
    edit(root, "plan.md", "## Skipped\n", "## Skipped\n- **fig3.2**\n- **fig9.9** gone\n");
    expect(texts(root, Step.Plan)).toEqual([
      "fig3.2 is skipped without a reason",
      "fig9.9 is skipped, but isn't in the outline",
    ]);
  });

  it("fail where the plan cites what isn't there, misses a section or gives a prop no verdict", () => {
    const root = chapter();
    edit(root, "plan.md", "- **o1** Read", "- **o2** Plot one. (fig9.9)\n- **o1** Read");
    edit(root, "plan.md", "### coordinates  (o1)", "### coordinates  (o1, o7)");
    edit(root, "plan.md", "- **reuse**", "- **configure**");
    edit(root, "plan.md", "## Chapter art\nA dot on a grid.\n", "");
    expect(texts(root, Step.Plan)).toEqual([
      'plan.md has no "## Chapter art"',
      "o2 cites fig9.9, not in the outline",
      "lesson coordinates cites o7: not an objective",
      "\"configure\" isn't a prop's verdict: one of reuse, extend, new",
    ]);
    // An objective no board or family serves fails in boards.md.
    expect(texts(root, Step.Boards)).toEqual(["no board or family serves o2"]);
  });

  it("fail where a board isn't in a lesson of the plan, cites what isn't there, or says no need", () => {
    const root = chapter();
    edit(
      root,
      "boards.md",
      "### questions/read-it",
      "### plotting  (o9)\nPurpose: p.\n\n## elsewhere\n### questions/plot-it  (o1)\nPurpose: q.\nNeeds: r.\n\n### questions/read-it",
    );
    expect(texts(root, Step.Boards)).toEqual([
      "plotting serves no objective",
      "plotting cites o9: not an objective or in the outline",
      "plotting says nothing it needs (Needs:)",
      "questions/plot-it is under elsewhere: not a lesson in plan.md",
      "questions/plot-it isn't a question family in plan.md",
      "questions/read-it is under elsewhere: not a lesson in plan.md",
    ]);
  });

  it("fail where a family of the plan has no entry in boards.md", () => {
    const root = chapter();
    edit(root, "boards.md", /### questions\/read-it[\s\S]*$/, "");
    expect(texts(root, Step.Boards)).toEqual(["questions/read-it is in plan.md, not in boards.md"]);
  });

  it("hold while build.yaml has a part of the plan's lessons in order, each with its art", () => {
    const root = chapter();
    edit(root, "plan.md", "## Chapter art", "### plotting  (o1)\n\n## Chapter art");
    build(root, ["plotting"]);
    expect(texts(root, Step.Boards)).toEqual([]);
    build(root, ["plotting", "coordinates", "extra"], false);
    // plotting keeps its art from before; the others have none.
    expect(texts(root, Step.Boards)).toEqual([
      "build.yaml has coordinates out of the plan's order",
      "coordinates has no art.tsx (its card)",
      "build.yaml has extra: not a lesson in plan.md",
      "extra has no art.tsx (its card)",
    ]);
  });

  it("want every lesson built, and the chapter's tile, once the plan says the chapter is ready", () => {
    const root = chapter();
    edit(root, "plan.md", "## Chapter art", "### plotting  (o1)\n\n## Chapter art");
    writeFileSync(
      file(root, "plan.md"),
      `---\nready: true\n---\n${readFileSync(file(root, "plan.md"), "utf8")}`,
    );
    build(root, ["coordinates"]);
    expect(texts(root, Step.Boards)).toEqual([
      "the chapter is ready, but build.yaml doesn't have plotting",
      "the chapter is ready, but has no art.tsx (its tile)",
    ]);
    build(root, ["coordinates", "plotting"]);
    writeFileSync(join(root, "content", "b", "c", "art.tsx"), "export const art = 1;\n");
    expect(texts(root, Step.Boards)).toEqual([]);
  });
});

describe("approving the plan", () => {
  it("approves only plan.md, only what is committed, and records the commit", () => {
    const root = chapter();
    expect(() => approve(root, "b", "c", Step.Boards)).toThrow(/checked by the machine/);
    expect(() => approve(root, "b", "c", Step.Outline)).toThrow(/checked by the machine/);
    const at = approve(root, "b", "c", Step.Plan);
    expect(readFileSync(file(root, "plan.md"), "utf8")).toMatch(
      new RegExp(`^---\napproved: ${at}\n---\n`),
    );
    expect(state(root, Step.Plan)).toMatchObject({ status: "approved", approvedAt: at });
    commit(root, "plan approved");
    edit(root, "plan.md", "Riya reads", "Riya reads and walks");
    expect(state(root, Step.Plan)?.status).toBe("changed");
    expect(() => approve(root, "b", "c", Step.Plan)).toThrow(/not committed/);
  });

  it("doesn't approve the plan while its checks fail, or the outline's do", () => {
    const root = chapter();
    edit(root, "plan.md", "(fig3.1, example1)", "(fig9.9)");
    commit(root, "a bad cite");
    expect(() => approve(root, "b", "c", Step.Plan)).toThrow(/plan.md's checks fail/);
    const bad = chapter();
    writeFileSync(
      file(bad, "source/en/outline.yaml"),
      `${OUTLINE}- { id: fig3.9, kind: figure }\n`,
    );
    commit(bad, "an outline the text doesn't have");
    expect(() => approve(bad, "b", "c", Step.Plan)).toThrow(
      /the agent fixes source\/en\/outline.yaml first/,
    );
  });

  it("a draft plan's failing checks don't fail the check; an approved plan's do", async () => {
    const { pipelineLines } = await import("./pipeline");
    const root = chapter();
    edit(root, "plan.md", "- **fig3.2** the same picture as fig3.1, turned.", "");
    expect(pipelineLines([readChapter(root, "b", "c")]).failed).toBe(0);
    commit(root, "skip removed");
    const ok = chapter();
    approve(ok, "b", "c", Step.Plan);
    commit(ok, "plan approved");
    edit(ok, "plan.md", "- **fig3.2** the same picture as fig3.1, turned.", "");
    expect(pipelineLines([readChapter(ok, "b", "c")]).failed).toBe(1);
  });

  it("takes the approval back: the line removed, nothing else; only plan.md has one", () => {
    const root = chapter();
    approve(root, "b", "c", Step.Plan);
    takeBack(root, "b", "c", Step.Plan);
    expect(readFileSync(file(root, "plan.md"), "utf8")).toBe(PLAN);
    expect(() => takeBack(root, "b", "c", Step.Boards)).toThrow(/nothing to take back/);
  });

  it("doesn't approve the plan while a thread on it is open", () => {
    const root = chapter();
    const asked = applyChange(
      root,
      {
        op: "start",
        thread: { source: "authoring/books/b/c/plan.md:4", quote: "Read a point", text: "which?" },
      },
      { name: "fixer", role: Role.Fixer },
    );
    if (!asked.ok || asked.thread === undefined) throw new Error("not started");
    expect(() => approve(root, "b", "c", Step.Plan)).toThrow(/still open on plan.md/);
    applyChange(root, { op: "write", id: asked.thread.id, text: "", status: Status.Closed }, YOU);
    expect(() => approve(root, "b", "c", Step.Plan)).not.toThrow();
  });

  it("an approved plan whose outline changed since is to be checked again", () => {
    const root = chapter();
    approve(root, "b", "c", Step.Plan);
    commit(root, "plan approved");
    expect(state(root, Step.Plan)).toMatchObject({ status: "approved", recheck: [] });
    writeFileSync(
      file(root, "source/en/outline.yaml"),
      OUTLINE.replace("kind: example", "kind: example, page: 2"),
    );
    expect(state(root, Step.Plan)?.recheck).toEqual([Step.Outline]);
  });
});

describe("a lesson waits on a self-review", () => {
  const lesson = (root: string) => {
    mkdirSync(join(root, "content", "b", "c", "first"), { recursive: true });
    writeFileSync(join(root, "content", "b", "c", "build.yaml"), "concepts:\n  - first\n");
    writeFileSync(join(root, "content", "b", "c", "first", "overview.ts"), "export const o = 1;\n");
  };
  /** What the build writes for a board: its record (board-record.ts) and what made it (reach). */
  const built = (root: string, key: string, words: string, under = "first") => {
    const dir = join(root, "build", "review", "b", "c", under);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${key}.json`), JSON.stringify(recordOf({ words })));
    const file = join(root, "build", "reach.json");
    let reach = { boards: {} as Record<string, unknown>, modules: {} };
    try {
      reach = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      // the first board
    }
    reach.boards[`b/c/${under}/${key}`] = {
      module: `content/b/c/${under}/overview.ts`,
      pieces: {},
    };
    writeFileSync(file, JSON.stringify(reach));
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

  it("each board and family of boards.md is planned, built or reviewed, worked out from the build", () => {
    const root = chapter();
    const boards = () => readChapter(root, "b", "c").boards.map((b) => [b.id, b.status]);
    expect(boards()).toEqual([
      ["reading", "planned"],
      ["questions/read-it", "planned"],
    ]);
    build(root, ["coordinates"]);
    built(root, "reading", "Read P", "coordinates");
    built(root, "q1", "Read Q", "questions/read-it");
    expect(boards()).toEqual([
      ["reading", "built"],
      ["questions/read-it", "built"],
    ]);
    passUnder(root, "b/c", "reviewer");
    expect(boards()).toEqual([
      ["reading", "reviewed"],
      ["questions/read-it", "reviewed"],
    ]);
    built(root, "q2", "Read R", "questions/read-it");
    expect(boards()).toEqual([
      ["reading", "reviewed"],
      ["questions/read-it", "built"],
    ]);
  });
});

describe("an approval's commit", () => {
  it("holds when it is committed alone; fails when committed together with an edit", () => {
    const root = chapter();
    approve(root, "b", "c", Step.Plan);
    commit(root, "plan approved");
    const chapters = () => [readChapter(root, "b", "c")];
    expect(stampProblems(root, chapters())).toEqual([]);
    // An edit to the text, committed with the approval it came with: which text was approved?
    takeBack(root, "b", "c", Step.Plan);
    commit(root, "taken back");
    approve(root, "b", "c", Step.Plan);
    edit(root, "plan.md", "Riya reads a map.", "Riya reads a map, then walks.");
    commit(root, "plan approved, and its story changed");
    expect(stampProblems(root, chapters())).toEqual([
      expect.stringMatching(
        /plan\.md: its approval .* committed together with changes to its text/,
      ),
    ]);
  });
});
