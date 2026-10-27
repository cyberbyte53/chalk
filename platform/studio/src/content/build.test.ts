import { mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { type BoardItem, ContentFile, boardOf, moduleOf } from "@chalk/author";
import {
  builtChapterSchema,
  builtConceptSchema,
  builtFamilySchema,
  builtFile,
  builtPageSchema,
  builtQuestionSchema,
} from "@chalk/content";
import { propDefs } from "@chalk/library";
import { propModules } from "@chalk/library/modules";
import { afterAll, describe, expect, it } from "vitest";
import { stringify as stringifyYaml } from "yaml";
import { PRONUNCIATIONS_FILE, findUp, loadReadings } from "../pronunciations";
import { buildContent } from "./build";
import { MODULES_FILE, boardModules, conceptsModule, modulesModule } from "./concepts";

const contentDir = join(dirname(findUp("pnpm-workspace.yaml", import.meta.dirname)), "content");
const readings = loadReadings(join(contentDir, "..", "authoring", PRONUNCIATIONS_FILE));
const fixturesDir = join(import.meta.dirname, ".fixtures");
const CHAPTER = "book/chapter";
/** The concept the fixtures' family tests. */
const CONCEPT = `${CHAPTER}/reading-decimals`;
const BASICS = join(contentDir, "../library/props/basics/src/index.ts");

/**
 * A family for the fixtures: pick the option that reads the target decimal, between two whole
 * numbers. The other option swaps its last two digits, and says so when picked. The answer is the
 * option that reads the target, so a target whose swap changes nothing (7.388) has a "wrong"
 * option that is right: the build catches it.
 */
const pickDecimal = (from: (file: string) => string) => `
import { decimal, family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceDef } from "${from(BASICS)}";
import { z } from "zod";
export const pickDecimal = family({
  level: Level.Medium,
  tests: ["reading-decimals"],
  params: z.object({ target: decimal, from: z.number(), to: z.number() }).strict(),
  build: ({ target, from, to }, b) => {
    const swapped = target.swapLastTwo();
    const options = [
      { id: "swapped", label: t(String(swapped), String(swapped)), feedback: t(\`That's \${swapped}.\`, \`यह \${swapped} है।\`) },
      { id: "target", label: t(String(target), String(target)) },
    ];
    const answer = options.find((o) => o.label.en === String(target))?.id ?? "target";
    const ask = b.prop(choiceDef, "ask", {
      prompt: t(\`Between \${from} and \${to}: which is \${target}?\`, \`\${from} और \${to} के बीच: \${target} कौन-सा है?\`),
      options,
      answer,
    });
    b.witness(ask.learner.select({ option: answer }), ask.learner.check());
    b.noteCheck({
      steps: [ask.learner.select({ option: "swapped" }), ask.learner.check()],
      feedback: options[0]!.feedback!,
    });
    return [ask];
  },
});
`;

/** A params.yaml with one good row, for fixtures about something else. */
const ONE_ROW = [{ params: { target: "7.384", from: 7, to: 8 } }];

/** A page asking two yes/no questions; it passes once both are right. Its witness answers `answered`. */
const twoQuestions = (answered: readonly string[]) => (basics: string) =>
  `
import { page, t } from "@chalk/author";
import { choiceDef } from "${basics}";
const options = [{ id: "yes", label: t("Yes", "हाँ") }, { id: "no", label: t("No", "नहीं") }];
export const overview = [
  page("two", (b) => {
    const qs = ["first", "second"].map((name) =>
      b.prop(choiceDef, name, { prompt: t("Ask?", "पूछो?"), options, answer: "yes" }),
    );
    for (const q of qs.filter((q) => ${JSON.stringify(answered)}.includes(q.name)))
      b.witness(q.learner.select({ option: "yes" }), q.learner.check());
    return qs;
  }),
];
`;

afterAll(() => rmSync(fixturesDir, { recursive: true, force: true }));

let fixtureCount = 0;

/**
 * A small content tree: one book, one chapter with one overview-less concept, and a bank holding
 * pick-decimal whose params.yaml rows are given.
 */
function fixture(spec: {
  rows: unknown[];
  /** The chapter's build.yaml after its title. */
  chapter?: string;
  /** Overrides concepts.gen.ts (otherwise it matches the chapter's concepts). */
  conceptsModule?: string;
  extraFolders?: string[];
  graph?: string;
  /** The concept's overview.ts, given the path to import @chalk/prop-basics from. */
  overview?: (basics: string) => string;
}): string {
  const dir = join(fixturesDir, `t${++fixtureCount}`);
  const chapter = spec.chapter ?? "concepts: [reading-decimals]\nquestions: all\n";
  const concepts = /concepts: \[([^\]]*)\]/.exec(chapter)?.[1]?.split(", ") ?? [];
  const familyDir = `${CHAPTER}/questions/pick`;
  const files: Record<string, string> = {
    "build.yaml": "books: [book]\n",
    "book/build.yaml": "title: { en: Book, hi: पुस्तक }\nchapters: [chapter]\n",
    [`${CHAPTER}/build.yaml`]: `title: { en: Chapter, hi: अध्याय }\n${chapter}`,
    [`${CHAPTER}/concepts.gen.ts`]: spec.conceptsModule ?? conceptsModule(concepts),
    [`${CONCEPT}/build.yaml`]: "title: { en: Concept, hi: अवधारणा }\n",
    [`${CONCEPT}/overview.ts`]:
      spec.overview?.(relative(join(dir, CONCEPT), BASICS).replace(/\.ts$/, "")) ??
      "export const overview = [];\n",
    [`${familyDir}/family.ts`]: pickDecimal((file) =>
      relative(join(dir, familyDir), file).replace(/\.ts$/, ""),
    ),
    [`${familyDir}/${ContentFile.Params}`]: stringifyYaml(spec.rows),
  };
  for (const folder of spec.extraFolders ?? [])
    files[`${folder}/build.yaml`] = "title: { en: X, hi: X }\n";
  if (spec.graph !== undefined) files["graph.yaml"] = spec.graph;
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  return withModules(dir);
}

/** The tree's modules.gen.ts, as pnpm build-content writes it. */
function withModules(dir: string): string {
  writeFileSync(join(dir, MODULES_FILE), modulesModule(boardModules(dir), "."));
  return dir;
}

/** A built item's board, made from its module as the app makes it. */
async function boardFrom(dir: string, item: BoardItem) {
  const module = await import(pathToFileURL(join(dir, moduleOf(item))).href);
  return boardOf(item, module, (type) => propDefs[type]?.role);
}

/**
 * The real Class 10 Maths book, alone: a root manifest listing only it, the book linked in. (The
 * whole real content is built and checked by the content step of `pnpm check`; these tests are
 * about what the builder writes, so one real book is enough.)
 */
function realBook(): string {
  const dir = join(fixturesDir, `real${++fixtureCount}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "build.yaml"), "books: [class10-maths]\n");
  symlinkSync(join(contentDir, "class10-maths"), join(dir, "class10-maths"), "dir");
  return withModules(dir);
}

const build = (dir: string, commit = "test") =>
  buildContent({
    contentDir: dir,
    modules: propModules,
    readings,
    commit,
    modulesFile: join(dir, MODULES_FILE),
  });
const messages = (result: Awaited<ReturnType<typeof build>>) =>
  result.problems.map((p) => `${p.where}: ${p.message}`).join("\n");

describe("building content", () => {
  it("a real book builds, and every witness and note works on the real props", async () => {
    const result = await build(realBook());
    expect(result.problems).toEqual([]);
    const chapter = builtChapterSchema.parse(
      result.files.get(builtFile("class10-maths/real-numbers")),
    );
    expect(chapter.concepts).toHaveLength(6);
    const ids = new Set(chapter.concepts.map((c) => c.id));
    expect(chapter.questions.length).toBeGreaterThan(50);
    expect(chapter.questions.every((q) => q.tests.every((id) => ids.has(id)))).toBe(true);
    const lemma = builtConceptSchema.parse(
      result.files.get(builtFile("class10-maths/real-numbers/division-lemma")),
    );
    expect(lemma.overview.length).toBeGreaterThan(2);
    expect(lemma.overview[0]?.path).toBe("class10-maths/real-numbers/division-lemma/story");
  }, 60_000);

  it("a page's questions are about its concept, ungraded; a bank question is graded", async () => {
    const dir = realBook();
    const result = await build(dir);
    const hcf = "class10-maths/real-numbers/hcf-and-lcm";
    const concept = builtConceptSchema.parse(result.files.get(builtFile(hcf)));
    const first = builtPageSchema.parse(result.files.get(builtFile(`${hcf}/story`)));
    expect(first.path).toBe(`${hcf}/story`);
    expect(JSON.stringify(await boardFrom(dir, first))).toContain(
      `"concepts":["${concept.id}"],"isGraded":false`,
    );
  }, 60_000);

  it("ids and versions are stable: the same content gives the same files, whatever the commit", async () => {
    const book = realBook();
    const a = await build(book, "aaaaaaa");
    const b = await build(book, "bbbbbbb");
    const ids = (r: typeof a) =>
      [...r.files.values()].map((f) => {
        const item = f as { id?: string; version?: string };
        return `${item.id}@${item.version}`;
      });
    expect(ids(a)).toEqual(ids(b));
  }, 60_000);

  it("a question carries the concepts it tests, its family, level and where it came from", async () => {
    const dir = fixture({ rows: [{ params: { target: "7.384", from: 7, to: 8 }, level: "hard" }] });
    const result = await build(dir);
    expect(result.problems).toEqual([]);
    const file = [...result.files.keys()].find((k) => k.startsWith(`${CHAPTER}/questions/pick/`));
    const q = builtQuestionSchema.parse(result.files.get(file ?? ""));
    expect(q.path).toMatch(new RegExp(`^${CHAPTER}/questions/pick/[0-9a-f]{8}$`));
    expect(q.level).toBe("hard");
    expect(q.params).toEqual({ target: "7.384", from: 7, to: 8 });
    expect(q.source).toEqual({
      path: `${CHAPTER}/questions/pick`,
      file: ContentFile.Params,
      row: 0,
    });
    const concept = builtConceptSchema.parse(result.files.get(builtFile(CONCEPT)));
    expect(q.tests).toEqual([concept.id]);
    expect(JSON.stringify(await boardFrom(dir, q))).toContain(
      `"concepts":["${concept.id}"],"isGraded":true`,
    );
    const family = builtFamilySchema.parse(
      result.files.get(builtFile(`${CHAPTER}/questions/pick`)),
    );
    expect(family.tests).toEqual([concept.id]);
    expect(concept.props).toEqual([]); // the explainers its questions use: a choice is not one
  }, 60_000);

  it("a board may ask several questions; its witness must answer every one", async () => {
    const both = await build(
      fixture({ rows: ONE_ROW, overview: twoQuestions(["first", "second"]) }),
    );
    expect(messages(both)).toBe("");
    const one = await build(fixture({ rows: ONE_ROW, overview: twoQuestions(["first"]) }));
    expect(messages(one)).toContain('doesn\'t answer "second" correctly');
  }, 60_000);

  it("a row whose 'wrong' answer is the right one is caught (7.388: swapping the last two digits changes nothing)", async () => {
    const result = await build(
      fixture({ rows: [{ params: { target: "7.388", from: 7, to: 8 } }] }),
    );
    expect(messages(result)).toMatch(/row 0: note .*a wrong answer got Continue/);
  }, 60_000);

  it("a row the family can't make, or with wrong params, is reported, and the other rows still build", async () => {
    const result = await build(
      fixture({
        rows: [
          { params: { target: "7.3", from: 7, to: 8 } },
          { params: { target: "7.384", from: "seven", to: 8 } },
          { params: { target: "2.665", from: 2, to: 3 } },
        ],
      }),
    );
    expect(messages(result)).toMatch(/row 0: .*fewer than 2 decimal places/);
    expect(messages(result)).toMatch(/row 1: params\.from/);
    const questions = [...result.files.keys()].filter((k) => k.includes("/questions/pick/"));
    expect(questions).toHaveLength(1);
  }, 60_000);

  it("an unquoted decimal is refused: YAML would read a float and drop trailing zeros", async () => {
    const result = await build(fixture({ rows: [{ params: { target: 7.3, from: 7, to: 8 } }] }));
    expect(messages(result)).toMatch(/row 0: params\.target: write a decimal as quoted text/);
  }, 60_000);

  it("an excluded row stays in params.yaml, out of the build", async () => {
    const result = await build(
      fixture({
        rows: [
          { params: { target: "2.665", from: 2, to: 3 } },
          { params: { target: "7.384", from: 7, to: 8 }, exclude: true },
        ],
      }),
    );
    expect(result.problems).toEqual([]);
    expect(result.notices.join("\n")).toMatch(/excluded: .*row 1/);
  }, 60_000);

  it("the same params twice are one question, refused", async () => {
    const row = { params: { target: "2.665", from: 2, to: 3 } };
    const result = await build(fixture({ rows: [row, row] }));
    expect(messages(result)).toMatch(/row 1: the same params as row 0/);
  }, 60_000);

  it("manifests: a listed folder must exist, an unlisted one is reported, and exclude only goes with all", async () => {
    const missing = await build(
      fixture({
        rows: [{ params: { target: "2.665", from: 2, to: 3 } }],
        chapter: "concepts: [reading-decimals, ghost]\nquestions: all\n",
      }),
    );
    expect(messages(missing)).toMatch(/lists "ghost", but there is no folder/);
    const unlisted = await build(
      fixture({
        rows: [{ params: { target: "2.665", from: 2, to: 3 } }],
        extraFolders: ["book/chapter/spare"],
      }),
    );
    expect(unlisted.notices.join("\n")).toMatch(/not included: book\/chapter\/spare\//);
    const both = await build(
      fixture({
        rows: [{ params: { target: "2.665", from: 2, to: 3 } }],
        chapter: "concepts: [reading-decimals]\nquestions: [pick]\nexclude: [pick]\n",
      }),
    );
    expect(messages(both)).toMatch(/`exclude` only goes with `questions: all`/);
  }, 60_000);

  it("the graph: edges must join built concepts and never loop", async () => {
    const result = await build(
      fixture({
        rows: [{ params: { target: "2.665", from: 2, to: 3 } }],
        graph: `edges:\n  - { concept: ${CONCEPT}, parents: [${CONCEPT}] }\n  - { concept: ${CONCEPT}, parents: [book/chapter/nowhere] }\n`,
      }),
    );
    expect(messages(result)).toMatch(/a loop/);
    expect(messages(result)).toMatch(/"book\/chapter\/nowhere" is not a built concept/);
  }, 60_000);

  it("concepts.gen.ts must match build.yaml", async () => {
    const stale = await build(
      fixture({
        rows: [{ params: { target: "2.665", from: 2, to: 3 } }],
        conceptsModule: conceptsModule(["something-else"]),
      }),
    );
    expect(messages(stale)).toMatch(/concepts\.gen\.ts: out of date with build\.yaml/);
  }, 60_000);

  it("a family testing a concept the chapter doesn't list is refused", async () => {
    const dir = fixture({ rows: [{ params: { target: "2.665", from: 2, to: 3 } }] });
    // The concept's folder is still there, but the chapter no longer lists it.
    writeFileSync(
      join(dir, CHAPTER, "build.yaml"),
      "title: { en: C, hi: अ }\nconcepts: []\nquestions: all\n",
    );
    writeFileSync(join(dir, CHAPTER, "concepts.gen.ts"), conceptsModule([]));
    const result = await build(dir);
    expect(messages(result)).toMatch(
      /tests "reading-decimals", which isn't a concept of book\/chapter/,
    );
  }, 60_000);

  it("a question bank inside a concept is refused: banks live at the chapter", async () => {
    const dir = fixture({ rows: [{ params: { target: "2.665", from: 2, to: 3 } }] });
    mkdirSync(join(dir, CONCEPT, "questions"), { recursive: true });
    const result = await build(dir);
    expect(messages(result)).toMatch(/question families live in the chapter's questions\/ folder/);
  }, 60_000);
});
