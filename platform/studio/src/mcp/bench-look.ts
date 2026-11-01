import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { findUp } from "../find-up";

/**
 * How long a reviewer's look at one board takes: both languages on the three check screens (six
 * drawings), through the running chalk service (`pnpm mcp`), the way an agent calls it: on a fresh
 * connection, then again on the same one (the time kept). Its answer (the text, the picture) is kept, so a faster tool (`look2`) can be
 * held to it: the same words, the same pixels.
 *
 *   pnpm bench-look                        look
 *   pnpm bench-look look2                  the same, through look2
 *   pnpm bench-look look --as look-again   kept under another name (is look steady?)
 *   pnpm bench-look --compare look look2   the same words and pixels?
 *
 * Answers go to node_modules/.cache/bench-look/<name>/.
 */

const root = dirname(findUp("pnpm-workspace.yaml", dirname(fileURLToPath(import.meta.url))));
const OUT = join(root, "platform/studio/node_modules/.cache/bench-look");
const URL_ = new URL(process.env.CHALK_MCP_URL ?? "http://127.0.0.1:5174/mcp");
const WORKLOAD = {
  at: "content/class9-maths/coordinate-geometry/two-numbers-for-a-place/street-and-house",
  locales: ["en", "hi"],
  screens: [{ width: 360, height: 640 }, { width: 640 }, { width: 640, height: 720 }],
};

type Content = { type: string; text?: string; data?: string };

async function connect(): Promise<Client> {
  const name = `bench-look-${process.pid}`;
  const c = new Client({ name, version: "0" });
  await c.connect(
    new StreamableHTTPClientTransport(URL_, {
      requestInit: {
        headers: {
          authorization: "Bearer chalk-dev-reviewer",
          "x-chalk-name": "bench-look",
          "x-chalk-agent": name,
        },
      },
    }),
  );
  return c;
}

async function bench(tool: string, as: string): Promise<void> {
  const dir = join(OUT, as);
  mkdirSync(dir, { recursive: true });
  const client = await connect();
  // A reviewer keeps one connection for a pass: its first call, then the next on the same pages.
  const call = async () => {
    const t = performance.now();
    const r = (await client.callTool({ name: tool, arguments: WORKLOAD }, undefined, {
      timeout: 600_000,
    })) as { isError?: boolean; content?: Content[] };
    return { r, ms: performance.now() - t };
  };
  const first = await call();
  const { r, ms } = await call();
  await client.close();
  const content = r.content ?? [];
  const text = content
    .filter((x) => x.type === "text")
    .map((x) => x.text ?? "")
    .join("\n");
  if (first.r.isError === true || r.isError === true)
    throw new Error(`${tool} failed: ${text.slice(0, 300)}`);
  writeFileSync(join(dir, "answer.txt"), text);
  content
    .filter((x) => x.type === "image" && x.data !== undefined)
    .forEach((x, k) => writeFileSync(join(dir, `${k}.png`), Buffer.from(x.data ?? "", "base64")));
  writeFileSync(
    join(dir, "time.json"),
    `${JSON.stringify({ ms: Math.round(ms), first: Math.round(first.ms) })}\n`,
  );
  console.log(
    `${tool}: one board, en + hi on 3 screens: ${(first.ms / 1000).toFixed(1)}s on a fresh connection, then ${(ms / 1000).toFixed(1)}s`,
  );
}

/** The same words, and the same pictures to the pixel. */
function compare(a: string, b: string): void {
  const [da, db] = [join(OUT, a), join(OUT, b)];
  for (const d of [da, db])
    if (!existsSync(d)) throw new Error(`Nothing kept for ${d}: run it first.`);
  const msOf = (d: string) => JSON.parse(readFileSync(join(d, "time.json"), "utf8")).ms as number;
  const notes: string[] = [];
  const [xa, xb] = [da, db].map((d) => readFileSync(join(d, "answer.txt"), "utf8")) as [
    string,
    string,
  ];
  if (xa !== xb) {
    const [la, lb] = [xa.split("\n"), xb.split("\n")];
    const at = la.findIndex((l, i) => l !== lb[i]);
    notes.push(`text differs at line ${at + 1}: "${la[at] ?? ""}" vs "${lb[at] ?? ""}"`);
  }
  const pngs = (d: string) =>
    readdirSync(d)
      .filter((f) => f.endsWith(".png"))
      .sort();
  const [ia, ib] = [pngs(da), pngs(db)];
  if (ia.length !== ib.length) notes.push(`${ia.length} pictures vs ${ib.length}`);
  for (const f of ia.filter((x) => ib.includes(x))) {
    const pa = PNG.sync.read(readFileSync(join(da, f)));
    const pb = PNG.sync.read(readFileSync(join(db, f)));
    if (pa.width !== pb.width || pa.height !== pb.height)
      notes.push(`${f}: ${pa.width}×${pa.height} vs ${pb.width}×${pb.height}`);
    else {
      const diff = new PNG({ width: pa.width, height: pa.height });
      const n = pixelmatch(pa.data, pb.data, diff.data, pa.width, pa.height, { threshold: 0 });
      if (n > 0) {
        // The two side by side, and where they differ in red: a | b | diff.
        const w = pa.width;
        const side = new PNG({ width: w * 3, height: pa.height });
        for (const [k, img] of [pa, pb, diff].entries())
          PNG.bitblt(img, side, 0, 0, w, pa.height, k * w, 0);
        const out = join(OUT, `diff-${a}-${b}-${f}`);
        writeFileSync(out, PNG.sync.write(side));
        notes.push(`${f}: ${n} pixels differ (${out})`);
      }
    }
  }
  const s = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
  console.log(
    `${notes.length === 0 ? "✓ same" : "✗ differs"}  ${a} ${s(msOf(da))} → ${b} ${s(msOf(db))}`,
  );
  for (const n of notes) console.log(`  ${n}`);
  if (notes.length > 0) process.exitCode = 1;
}

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : i;
};
const c = flag("compare");
if (c !== undefined) compare(args[c + 1] ?? "", args[c + 2] ?? "");
else {
  const tool = args.find((x, i) => !x.startsWith("--") && args[i - 1] !== "--as") ?? "look";
  const a = flag("as");
  await bench(tool, a === undefined ? tool : (args[a + 1] ?? tool));
}
