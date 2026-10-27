import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { findUp } from "../pronunciations";

/**
 * Stress test for the chalk MCP's read side, against the running service (`pnpm mcp`), the way
 * agents call it: renders at once from one agent and from several, mixed widths and languages,
 * reads during renders, content changing mid-render, `continue` across agents, the snapshot of
 * played boards, and bad names. Each case says what must hold; any that doesn't fails the run.
 * Writes no comments. Briefly appends a comment line to one content file (restored after).
 *
 * Run: `pnpm stress-mcp` (all), or `pnpm stress-mcp rebuild lanes` (some). CHALK_MCP_URL to point
 * elsewhere.
 */

const root = dirname(findUp("pnpm-workspace.yaml", dirname(fileURLToPath(import.meta.url))));
const URL_ = new URL(process.env.CHALK_MCP_URL ?? "http://127.0.0.1:5174/mcp");
const R = "class10-maths/real-numbers";
const BOARDS = [
  `${R}/division-lemma/story`,
  `${R}/division-lemma/lemma`,
  `${R}/euclid-algorithm/method`,
  `${R}/fundamental-theorem/ladder`,
  `${R}/hcf-and-lcm/towers`,
  `${R}/root-two-irrational/proof`,
  `${R}/which-fractions-end/bill`,
  `${R}/which-fractions-end/repeats`,
];
const STORY = `${R}/division-lemma/story`;
const LEMMA = `${R}/division-lemma/lemma`;
const QUESTION = `${R}/questions/which-is-irrational/a3543885`;
const EDITED = join(root, "content", R, "which-fractions-end", "overview.ts");

type Agent = Client;
async function agent(name: string): Promise<Agent> {
  const c = new Client({ name, version: "0" });
  await c.connect(
    new StreamableHTTPClientTransport(URL_, {
      requestInit: {
        headers: { authorization: "Bearer chalk-dev-reviewer", "x-chalk-name": name },
      },
    }),
  );
  return c;
}

type Call = { ok: boolean; ms: number; error?: string; out?: Record<string, unknown> };
async function call(c: Agent, tool: string, args: Record<string, unknown>): Promise<Call> {
  const t = Date.now();
  try {
    const r = (await c.callTool({ name: tool, arguments: args }, undefined, {
      timeout: 300000,
    })) as Record<string, unknown> & { isError?: boolean; content?: { text?: string }[] };
    const ms = Date.now() - t;
    if (r.isError === true) return { ok: false, ms, error: r.content?.[0]?.text ?? "error" };
    return { ok: true, ms, out: r };
  } catch (e) {
    return { ok: false, ms: Date.now() - t, error: String(e instanceof Error ? e.message : e) };
  }
}

type Board = { board: string; nodes: { path: string; setup?: Record<string, unknown> }[] };
const boardsOf = (c: Call): Board[] =>
  ((c.out?.structuredContent as { boards?: Board[] } | undefined)?.boards ?? []) as Board[];
const pngWidths = (c: Call): number[] =>
  ((c.out?.content as { type: string; data?: string }[] | undefined) ?? [])
    .filter((x) => x.type === "image" && x.data !== undefined)
    .map((x) => Buffer.from(x.data ?? "", "base64").readUInt32BE(16));

const failures: string[] = [];
function expect(name: string, isTrue: boolean, detail = ""): void {
  console.log(`  ${isTrue ? "✓" : "✗"} ${name}${detail ? `  ${detail}` : ""}`);
  if (!isTrue) failures.push(`${name}${detail ? ` (${detail})` : ""}`);
}
const allOk = (cs: Call[]) => cs.every((c) => c.ok);
const firstError = (cs: Call[]) => cs.find((c) => !c.ok)?.error?.slice(0, 160) ?? "";
const slowest = (cs: Call[]) => `${Math.max(...cs.map((c) => c.ms))}ms slowest`;
const asked = (c: Call, board: string) => boardsOf(c)[0]?.board === board;

const cases: Record<string, () => Promise<void>> = {
  async parallel() {
    const c = await agent("stress-parallel");
    const cs = await Promise.all(BOARDS.map((b) => call(c, "render_board", { board: b })));
    expect("8 renders at once from one agent all succeed", allOk(cs), firstError(cs));
    expect(
      "each returns the board it asked for",
      cs.every((r, i) => asked(r, BOARDS[i] ?? "")),
      slowest(cs),
    );
  },
  async settings() {
    const c = await agent("stress-settings");
    const combos = [360, 390, 640].flatMap((width) =>
      (["en", "hi"] as const).map((locale) => ({ width, locale })),
    );
    const cs = await Promise.all(
      combos.map((o) => call(c, "render_board", { board: `${R}/which-fractions-end/bill`, ...o })),
    );
    expect("3 widths × 2 languages at once all succeed", allOk(cs), firstError(cs));
    expect(
      "each picture is drawn at its own width (2× pixels)",
      cs.every((r, i) => pngWidths(r)[0] === (combos[i]?.width ?? 0) * 2),
      cs.map((r) => pngWidths(r)[0]).join("/"),
    );
  },
  async agents() {
    const cs4 = await Promise.all([1, 2, 3, 4].map((i) => agent(`stress-agent${i}`)));
    const cs = (
      await Promise.all(
        cs4.map((c, i) =>
          Promise.all(
            [0, 1, 2].map((k) => {
              const board = BOARDS[(i * 3 + k) % BOARDS.length] ?? "";
              return call(c, "render_board", { board }).then((r) => ({ r, board }));
            }),
          ),
        ),
      )
    ).flat();
    expect(
      "4 agents × 3 renders at once all succeed",
      allOk(cs.map((x) => x.r)),
      firstError(cs.map((x) => x.r)),
    );
    expect(
      "each returns the board it asked for",
      cs.every((x) => asked(x.r, x.board)),
      slowest(cs.map((x) => x.r)),
    );
  },
  async lanes() {
    const a = await agent("stress-laneA");
    const b = await agent("stress-laneB");
    const selected = (r: Call) =>
      boardsOf(r)[0]?.nodes.find((n) => n.path === "qr")?.setup?.selected ?? null;
    const tap = await call(a, "render_board", {
      board: LEMMA,
      steps: [{ tap: "qr", text: "q = 5" }],
      shots: "none",
    });
    expect("A taps an option", tap.ok && selected(tap) === "right", tap.error ?? "");
    await call(b, "render_board", {
      board: LEMMA,
      steps: [{ tap: "qr", text: "q = 3" }],
      shots: "none",
    });
    const on = await call(a, "render_board", {
      board: LEMMA,
      steps: [{ wait: 10 }],
      shots: "none",
      continue: true,
    });
    expect(
      "B tapping the same board doesn't reach A's: A continues with its own choice",
      on.ok && selected(on) === "right",
      on.error ?? String(selected(on)),
    );
    await call(a, "render_board", { board: BOARDS[2] });
    const lost = await call(a, "render_board", {
      board: LEMMA,
      steps: [{ wait: 10 }],
      continue: true,
    });
    expect(
      "continuing a board this agent left fails, saying why",
      !lost.ok && /Can't continue/.test(lost.error ?? ""),
      lost.error?.slice(0, 120) ?? "went ahead",
    );
  },
  async snapshot() {
    const c = await agent("stress-snapshot");
    for (const [name, args] of [
      ["a story, played", { board: STORY, play: true }],
      ["a story, with steps", { board: STORY, steps: [{ wait: 10 }], shots: "none" }],
      ["a question", { board: QUESTION }],
    ] as const) {
      const r = await call(c, "render_board", args);
      const n = boardsOf(r)[0]?.nodes.length ?? 0;
      expect(`the snapshot of ${name} has its pieces`, r.ok && n > 0, r.error ?? `${n} nodes`);
    }
  },
  async reads() {
    const c = await agent("stress-reads");
    const lesson = call(c, "render_board", { board: `${R}/which-fractions-end` });
    await new Promise((r) => setTimeout(r, 200));
    const quick = await Promise.all([
      call(c, "comments", { board: R }),
      call(c, "comments", { review: "latest" }),
      call(c, "affected", { props: ["choice"] }),
      call(c, "affected", { files: ["library/props/primes"] }),
    ]);
    const l = await lesson;
    expect("reads during a lesson render succeed", allOk([...quick, l]), firstError([...quick, l]));
    expect(
      "reads don't wait for the browser (each under 1s)",
      quick.every((q) => q.ms < 1000),
      quick.map((q) => `${q.ms}ms`).join("/"),
    );
  },
  async rebuild() {
    const c = await agent("stress-rebuild");
    const before = readFileSync(EDITED, "utf8");
    const restore = () => writeFileSync(EDITED, before);
    process.once("SIGINT", () => {
      restore();
      process.exit(130);
    });
    const cs: { r: Call; board: string }[] = [];
    const wave = () =>
      Promise.all(
        BOARDS.slice(0, 6).map((board) =>
          call(c, "render_board", { board }).then((r) => ({ r, board })),
        ),
      );
    try {
      writeFileSync(EDITED, `${before}\n// stress-mcp\n`);
      const first = wave();
      await new Promise((r) => setTimeout(r, 1500));
      writeFileSync(EDITED, `${before}\n// stress-mcp 2\n`);
      cs.push(...(await first), ...(await wave()));
    } finally {
      restore();
    }
    cs.push(...(await wave()));
    const rs = cs.map((x) => x.r);
    expect("renders while content changes twice all succeed", allOk(rs), firstError(rs));
    expect(
      "each returns the board it asked for",
      cs.every((x) => asked(x.r, x.board)),
      slowest(rs),
    );
  },
  async names() {
    const c = await agent("stress-names");
    const typo = await call(c, "render_board", { board: `${R}/divison-lemma/story` });
    expect(
      "a misspelt board fails, naming the nearest boards",
      !typo.ok && /Nearest: .*division-lemma/.test(typo.error ?? ""),
      typo.error?.slice(0, 120) ?? "went ahead",
    );
    const lessonSteps = await call(c, "render_board", {
      board: `${R}/division-lemma`,
      steps: [{ wait: 10 }],
    });
    expect("steps on a lesson fail, saying so", !lessonSteps.ok, lessonSteps.error ?? "");
    const missing = await call(c, "render_board", {
      board: STORY,
      steps: [{ tap: "nothing-here" }],
      shots: "none",
    });
    const said = JSON.stringify(missing.out?.content ?? missing.error ?? "");
    expect("a step on a missing piece says what's there", said.includes("no piece"), "");
  },
};

const pick = process.argv.slice(2);
const unknown = pick.filter((p) => !(p in cases));
if (unknown.length > 0) {
  console.error(`No case ${unknown.join(", ")}. Cases: ${Object.keys(cases).join(", ")}`);
  process.exit(2);
}
const t0 = Date.now();
for (const [name, run] of Object.entries(cases)) {
  if (pick.length > 0 && !pick.includes(name)) continue;
  console.log(`\n${name}`);
  try {
    await run();
  } catch (e) {
    expect(`${name} ran`, false, String(e));
  }
}
console.log(
  `\n${failures.length === 0 ? "✓ every case held" : `✗ ${failures.length} failed:\n  ${failures.join("\n  ")}`} (${Math.round((Date.now() - t0) / 1000)}s)`,
);
process.exit(failures.length === 0 ? 0 : 1);
