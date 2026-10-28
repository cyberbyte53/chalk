import { readFileSync, utimesSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { findUp } from "../pronunciations";

/**
 * Stress test for the chalk MCP's read side (look, play, affected, comments), against the running
 * service (`pnpm mcp`), the way agents call it: looks at once from one agent and from several,
 * mixed widths and languages, reads during drawing, content changing mid-drawing, `continue`
 * across agents, the snapshot of played and question boards, labels that don't change the
 * picture, a piece cut out, a chapter checked, bad names, and the stdio relay across a restart
 * (platform/docs/seeing-boards.md). Each case says what must hold; any that doesn't fails the run.
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

const textOf = (c: Call): string =>
  ((c.out?.content as { type: string; text?: string }[] | undefined) ?? [])
    .filter((x) => x.type === "text")
    .map((x) => x.text ?? "")
    .join("\n");
const pngs = (c: Call): Buffer[] =>
  ((c.out?.content as { type: string; data?: string }[] | undefined) ?? [])
    .filter((x) => x.type === "image" && x.data !== undefined)
    .map((x) => Buffer.from(x.data ?? "", "base64"));
const pngWidths = (c: Call): number[] => pngs(c).map((b) => b.readUInt32BE(16));

const failures: string[] = [];
function expect(name: string, isTrue: boolean, detail = ""): void {
  console.log(`  ${isTrue ? "✓" : "✗"} ${name}${detail ? `  ${detail}` : ""}`);
  if (!isTrue) failures.push(`${name}${detail ? ` (${detail})` : ""}`);
}
const allOk = (cs: Call[]) => cs.every((c) => c.ok);
const firstError = (cs: Call[]) => cs.find((c) => !c.ok)?.error?.slice(0, 160) ?? "";
const slowest = (cs: Call[]) => `${Math.max(...cs.map((c) => c.ms))}ms slowest`;
/** The answer is the text alone: no second copy for a client to show instead. */
const isTextOnly = (c: Call) => c.out !== undefined && c.out.structuredContent === undefined;
/** Whether the answer is about this board (its first line names it). */
const asked = (c: Call, board: string) =>
  (textOf(c).split("\n")[0] ?? "").split(/[\s#:]/)[0] === board;
/** The pieces a board's answer lists (one line each, with where it's written). */
const piecesListed = (c: Call) => textOf(c).match(/→ content\//g)?.length ?? 0;

const cases: Record<string, () => Promise<void>> = {
  async parallel() {
    const c = await agent("stress-parallel");
    const cs = await Promise.all(BOARDS.map((b) => call(c, "look", { at: b })));
    expect("8 looks at once from one agent all succeed", allOk(cs), firstError(cs));
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
      combos.map((o) =>
        call(c, "look", {
          at: `${R}/which-fractions-end/bill`,
          widths: [o.width],
          locales: [o.locale],
          labels: false,
        }),
      ),
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
              return call(c, "look", { at: board }).then((r) => ({ r, board }));
            }),
          ),
        ),
      )
    ).flat();
    expect(
      "4 agents × 3 looks at once all succeed",
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
    const tap = await call(a, "play", {
      board: LEMMA,
      steps: [{ tap: "qr", text: "q = 5" }],
      shots: "none",
    });
    // The choice is the learner's: it is listed with what changed now, not with the setup.
    const chosen = /now:[\s\S]*selected "right"/;
    const mine = await call(a, "look", { at: `${LEMMA}#qr`, continue: true });
    expect(
      "A taps an option, and sees it chosen, as now",
      tap.ok && mine.ok && chosen.test(textOf(mine)),
      tap.error ?? mine.error ?? "",
    );
    await call(b, "play", { board: LEMMA, steps: [{ tap: "qr", text: "q = 3" }], shots: "none" });
    const on = await call(a, "look", { at: `${LEMMA}#qr`, continue: true });
    expect(
      "B tapping the same board doesn't reach A's: A sees its own choice",
      on.ok && chosen.test(textOf(on)),
      on.error ?? "",
    );
    await call(a, "look", { at: BOARDS[2] });
    const lost = await call(a, "play", { board: LEMMA, steps: [{ wait: 10 }], continue: true });
    expect(
      "continuing a board this agent left fails, saying why",
      !lost.ok && /Can't continue/.test(lost.error ?? ""),
      lost.error?.slice(0, 120) ?? "went ahead",
    );
  },
  async snapshot() {
    const c = await agent("stress-snapshot");
    for (const [name, tool, args] of [
      ["a story, played", "look", { at: STORY, play: true }],
      ["a story, with steps", "play", { board: STORY, steps: [{ wait: 10 }], shots: "none" }],
      ["a question", "look", { at: QUESTION }],
    ] as const) {
      const r = await call(c, tool, args);
      // A look lists the pieces; play says whether the board is passed (read from its snapshot).
      const isRead = tool === "look" ? piecesListed(r) > 0 : /\n(not )?passed/.test(textOf(r));
      expect(
        `the snapshot of ${name} is read, as text only`,
        r.ok && isRead && isTextOnly(r),
        r.error ?? textOf(r).slice(0, 200),
      );
    }
  },
  async pictures() {
    const c = await agent("stress-pictures");
    const clean = await call(c, "look", { at: STORY, labels: false });
    const again = await call(c, "look", { at: STORY, labels: false });
    const named = await call(c, "look", { at: STORY });
    const [a, b, n] = [pngs(clean)[0], pngs(again)[0], pngs(named)[0]];
    expect(
      "the clean picture is the same every time",
      a !== undefined && b !== undefined && a.equals(b),
    );
    expect(
      "names go in a margin: the named picture is wider, the drawing measured the same",
      (n?.readUInt32BE(16) ?? 0) > (a?.readUInt32BE(16) ?? 0) && textOf(named) === textOf(clean),
      `${a?.readUInt32BE(16)} → ${n?.readUInt32BE(16)}`,
    );
    const piece = await call(c, "look", { at: `${STORY}#game`, labels: false });
    expect(
      "a piece is cut out of its board, and says where it's written",
      piece.ok &&
        (pngWidths(piece)[0] ?? 0) <= (a?.readUInt32BE(16) ?? 0) &&
        (pngs(piece)[0]?.readUInt32BE(20) ?? 0) < (a?.readUInt32BE(20) ?? 0) &&
        /written: content\//.test(textOf(piece)),
      piece.error ?? "",
    );
  },
  async reads() {
    const c = await agent("stress-reads");
    const lookFrom = Date.now();
    const lesson = call(c, "look", { at: `${R}/which-fractions-end` });
    await new Promise((r) => setTimeout(r, 200));
    const readsFrom = Date.now();
    const quick = await Promise.all([
      call(c, "comments", { board: R }),
      call(c, "comments", { review: "latest" }),
      call(c, "affected", { props: ["choice"] }),
      call(c, "affected", { changes: ["library/props/primes"] }),
    ]);
    const l = await lesson;
    expect("reads during a lesson look succeed", allOk([...quick, l]), firstError([...quick, l]));
    // Waiting is what's checked, not speed: each read is answered while the look is still drawing.
    // The times are measured and shown, never held to a number (a slow machine is still right).
    const lookEnd = lookFrom + l.ms;
    expect(
      "reads don't wait for the browser: each is answered before the look is done",
      quick.every((q) => readsFrom + q.ms < lookEnd),
      `reads ${quick.map((q) => `${q.ms}ms`).join("/")} · look ${l.ms}ms`,
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
          call(c, "look", { at: board }).then((r) => ({ r, board })),
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
    expect("looks while content changes twice all succeed", allOk(rs), firstError(rs));
    expect(
      "each returns the board it asked for",
      cs.every((x) => asked(x.r, x.board)),
      slowest(rs),
    );
  },
  async names() {
    const c = await agent("stress-names");
    const typo = await call(c, "look", { at: `${R}/divison-lemma/story` });
    expect(
      "a misspelt board fails, naming the nearest boards",
      !typo.ok && /Nearest: .*division-lemma/.test(typo.error ?? ""),
      typo.error?.slice(0, 120) ?? "went ahead",
    );
    const lessonSteps = await call(c, "play", {
      board: `${R}/division-lemma`,
      steps: [{ wait: 10 }],
    });
    expect("play on a lesson fails, saying so", !lessonSteps.ok, lessonSteps.error ?? "");
    const missing = await call(c, "play", {
      board: STORY,
      steps: [{ tap: "nothing-here" }],
      shots: "none",
    });
    const said = `${textOf(missing)} ${missing.error ?? ""}`;
    expect("a step on a missing piece says what's there", said.includes("no piece"), "");
    const noPiece = await call(c, "look", { at: `${STORY}#nothing-here` });
    expect(
      "a missing piece fails, naming the pieces",
      !noPiece.ok && /pieces: /.test(noPiece.error ?? ""),
      noPiece.error?.slice(0, 120) ?? "went ahead",
    );
  },
  async inputs() {
    // Inputs say what they do (does / says): read off the page, without pressing anything.
    const c = await agent("stress-inputs");
    const r = await call(c, "look", { at: `${STORY}#game`, play: true });
    expect(
      "a piece's inputs say what they do: what can be done, by which input",
      r.ok && /giveRound\s+\(learner, via game\/giveRound\)/.test(textOf(r)),
      r.error ??
        textOf(r)
          .split("\n")
          .find((l) => l.startsWith("can:")) ??
        "no can line",
    );
    const p = await call(c, "play", {
      board: STORY,
      steps: [{ tap: "game/giveRound" }],
      shots: "none",
    });
    expect(
      "pressing one runs what it says, and play lists what the student sees change",
      p.ok && /game\/plates "6 friends, 0 sweets each" → "6 friends, 1 sweet each"/.test(textOf(p)),
      p.error ?? textOf(p),
    );
  },
  async relay() {
    // As a harness starts it: the stdio relay (connect.ts), which reaches the service and
    // reconnects when it restarts. The restart is made the way an edit makes it (tsx watch).
    const relay = new Client({ name: "stress-relay", version: "0" });
    await relay.connect(
      new StdioClientTransport({
        command: join(root, "platform", "studio", "node_modules", ".bin", "tsx"),
        args: [
          "--tsconfig",
          join(root, "tsconfig.base.json"),
          join(root, "platform", "studio", "src", "mcp", "connect.ts"),
        ],
        env: { ...(process.env as Record<string, string>), CHALK_TOKEN: "chalk-dev-reviewer" },
        stderr: "ignore",
      }),
    );
    try {
      const first = await call(relay, "look", { at: STORY });
      expect("the relay reaches the service", first.ok && asked(first, STORY), first.error ?? "");
      await call(relay, "play", { board: STORY, steps: [{ wait: 10 }], shots: "none" });
      const main = join(root, "platform", "studio", "src", "mcp", "main.ts");
      const health = new URL("/health", URL_);
      const isUp = () =>
        fetch(health, { signal: AbortSignal.timeout(800) }).then(
          (r) => r.ok,
          () => false,
        );
      const t = new Date();
      utimesSync(main, t, t);
      let wentDown = false;
      for (let i = 0; i < 40 && !wentDown; i++) {
        await new Promise((r) => setTimeout(r, 250));
        wentDown = !(await isUp());
      }
      expect("touching the service's code restarts it (tsx watch)", wentDown);
      const lost = await call(relay, "look", { at: STORY, continue: true });
      expect(
        "after a restart, continue fails, saying why",
        !lost.ok && /Can't continue/.test(lost.error ?? ""),
        lost.error?.slice(0, 120) ?? "went ahead",
      );
      const again = await call(relay, "look", { at: STORY });
      expect(
        "and the next call just works: the relay connected again",
        again.ok,
        again.error ?? "",
      );
    } finally {
      await relay.close().catch(() => {});
    }
  },
  async check() {
    const c = await agent("stress-check");
    const r = await call(c, "look", { at: R });
    const m = /(\d+) boards · (\d+) drawings/.exec(textOf(r));
    const [boards, drawings] = [Number(m?.[1] ?? 0), Number(m?.[2] ?? 0)];
    expect(
      "a chapter is checked: every board in two languages at two widths",
      r.ok && boards > 0 && drawings === boards * 4,
      r.error ?? `${drawings} drawings of ${boards} boards, ${r.ms}ms`,
    );
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
