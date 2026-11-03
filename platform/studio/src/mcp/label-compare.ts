import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findUp } from "../find-up";
import { type Drawn, type Step, closeBrowser, shoot } from "./app-driver";
import type { LabelAudit } from "./label-audit";

/**
 * Every plane's labels in a chapter, read by the label audit (label-audit.ts), so two placings can
 * be compared on the same drawings (platform/docs/plans/label-placement.md):
 *
 *   tsx label-compare.ts run before        every board's start (en, hi; 360, 640) and its witness
 *                                          played (en, hi; 360), each step read
 *   tsx label-compare.ts run try --quick   only QUICK's boards: where labels meet (a minute less;
 *                                          the whole run is still the check before a commit)
 *   tsx label-compare.ts compare before after
 *
 * Kept in node_modules/.cache/label-compare/<name>/: audits.json, and pictures of each witness's end.
 */

const root = dirname(findUp("pnpm-workspace.yaml", dirname(fileURLToPath(import.meta.url))));
const OUT = join(root, "platform/studio/node_modules/.cache/label-compare");
const CHAPTER = "class9-maths/coordinate-geometry";
const WORKERS = 6;

type Drawing = {
  board: string;
  /** "start en 360", or "witness en 360 step 4", or "witness en 360 end". */
  what: string;
  audit: LabelAudit;
};

/**
 * The boards where labels meet: every board with two or more at once, the turned plane, the
 * walker in her town, and one question of each family. Compared with a whole run, only the
 * drawings both have are counted.
 */
const QUICK = [
  "plotting-points/plot-from-a-table",
  "plotting-points/swap-the-numbers",
  "plotting-points/graphs-you-know",
  "plotting-points/plot-a-point",
  "plotting-points/treasure-trail",
  "the-cartesian-plane/town-grows",
  "coordinates-of-a-point/distances-from-axes",
  "coordinates-of-a-point/points-on-axes",
  "coordinates-of-a-point/writing-coordinates",
  "coordinates-of-a-point/any-axes",
  "two-numbers-for-a-place/street-and-house",
];
const QUICK_FAMILIES = [
  "bus-to-stop",
  "fig-3-14",
  "place-the-dot",
  "plot-the-point",
  "read-a-point",
];

function quick(all: string[]): string[] {
  const one = (family: string) => all.find((b) => b.includes(`/questions/${family}/`));
  return [
    ...all.filter((b) => QUICK.some((q) => b.endsWith(`/${q}`))),
    ...QUICK_FAMILIES.flatMap((f) => one(f) ?? []),
  ];
}

function boards(): string[] {
  const base = join(root, "build/witness");
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory()
        ? walk(join(dir, e.name))
        : e.name.endsWith(".json")
          ? [
              join(dir, e.name)
                .slice(base.length + 1)
                .replace(/\.json$/, ""),
            ]
          : [],
    );
  return walk(join(base, CHAPTER));
}

function witnessSteps(board: string): Step[] {
  const file = join(root, "build/witness", `${board}.json`);
  if (!existsSync(file)) return [];
  const { witness } = JSON.parse(readFileSync(file, "utf8")) as {
    witness: { kind?: string; prop?: string; action?: string; args?: Record<string, unknown> }[];
  };
  return witness.flatMap((w) =>
    w.kind === "act" && w.prop !== undefined && w.action !== undefined
      ? [{ act: { prop: w.prop, action: w.action, args: w.args ?? {} } }]
      : [],
  );
}

async function run(name: string, isQuick: boolean): Promise<void> {
  const dir = join(OUT, name);
  mkdirSync(join(dir, "pictures"), { recursive: true });
  const drawings: Drawing[] = [];
  const jobs: (() => Promise<void>)[] = [];
  for (const board of isQuick ? quick(boards()) : boards()) {
    for (const locale of ["en", "hi"] as const)
      for (const width of [360, 640])
        jobs.push(async () => {
          const d = await shoot(
            root,
            board,
            { locale, width, pictures: "none", speed: Number.POSITIVE_INFINITY },
            undefined,
            `labels:${board}:${locale}:${width}`,
          );
          const audit = d.shots[0]?.labels;
          if (audit !== undefined)
            drawings.push({ board, what: `start ${locale} ${width}`, audit });
        });
    const steps = witnessSteps(board);
    if (steps.length > 0)
      for (const locale of ["en", "hi"] as const)
        jobs.push(async () => {
          const d: Drawn = await shoot(
            root,
            board,
            { locale, width: 360, play: true, speed: Number.POSITIVE_INFINITY },
            { steps, shots: "last" },
            `labels:${board}:witness:${locale}`,
          );
          for (const [i, s] of d.steps.entries())
            if (s.labels !== undefined && s.labels.labels.length > 0)
              drawings.push({
                board,
                what: `witness ${locale} 360 ${i === d.steps.length - 1 ? "end" : `step ${i + 1}`}`,
                audit: s.labels,
              });
          const end = d.steps.at(-1)?.picture;
          if (end !== undefined && d.steps.at(-1)?.labels?.labels.length)
            writeFileSync(
              join(dir, "pictures", `${board.split("/").slice(-2).join("--")}--${locale}.png`),
              end.png,
            );
        });
  }
  let done = 0;
  await Promise.all(
    Array.from({ length: WORKERS }, async () => {
      for (let job = jobs.shift(); job !== undefined; job = jobs.shift()) {
        await job().catch((e) => console.error(String(e).split("\n")[0]));
        if (++done % 20 === 0) console.error(`${done} drawn`);
      }
    }),
  );
  drawings.sort((a, b) =>
    (a.board + a.what).localeCompare(b.board + b.what, "en", { numeric: true }),
  );
  // The problems solved, apart (each once): to time the solver on its own (main thread, workers).
  const problems = new Set(drawings.flatMap((d) => d.audit.problems ?? []));
  for (const d of drawings) d.audit.problems = [];
  writeFileSync(join(dir, "problems.json"), JSON.stringify([...problems]));
  writeFileSync(join(dir, "audits.json"), JSON.stringify(drawings, null, 1));
  console.log(`${drawings.length} drawings with labels, kept in ${dir}`);
  await closeBrowser();
}

/** The numbers for one run: the plan's table. */
function numbers(drawings: Drawing[]) {
  const all = drawings.flatMap((d) => d.audit.labels);
  const shown = all.filter((l) => !l.isHidden);
  const median = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    return s.length === 0 ? 0 : (s[Math.floor(s.length / 2)] ?? 0);
  };
  const worst = (xs: number[]) => (xs.length === 0 ? 0 : Math.max(...xs));
  const isBad = (d: Drawing) =>
    d.audit.labels.some(
      (l) =>
        l.isHidden ||
        l.onLabels > 0 ||
        l.onMarks > 0 ||
        l.onLines > 0 ||
        l.isNearerOther ||
        l.isOff,
    );
  // Labels moved when one step was taken: the same label (by kind and words) at another place.
  const moved: number[] = [];
  const byPlay = new Map<string, Drawing[]>();
  for (const d of drawings)
    if (d.what.startsWith("witness")) {
      const key = `${d.board} ${d.what.split(" ").slice(0, 3).join(" ")}`;
      byPlay.set(key, [...(byPlay.get(key) ?? []), d]);
    }
  for (const play of byPlay.values()) {
    const ordered = play.sort((a, b) => order(a.what) - order(b.what));
    for (let i = 1; i < ordered.length; i++) {
      const was = new Map(
        (ordered[i - 1]?.audit.labels ?? [])
          .filter((l) => !l.isHidden)
          .map((l) => [`${l.kind} ${l.text}`, l.at]),
      );
      const now = (ordered[i]?.audit.labels ?? []).filter(
        (l) => !l.isHidden && l.kind !== "walker",
      );
      moved.push(
        now.filter((l) => {
          const at = was.get(`${l.kind} ${l.text}`);
          return at !== undefined && Math.hypot(at[0] - l.at[0], at[1] - l.at[1]) > 2;
        }).length,
      );
    }
  }
  const placing = drawings.map((d) => d.audit.placingMs);
  const reads = drawings.map((d) => d.audit.boxReads);
  const distances = shown.filter((l) => l.distance >= 0).map((l) => l.distance);
  return {
    drawings: drawings.length,
    labels: all.length,
    "label on label": shown.reduce((s, l) => s + l.onLabels, 0),
    "label on a dot or word": shown.reduce((s, l) => s + l.onMarks, 0),
    "label on a line": shown.reduce((s, l) => s + l.onLines, 0),
    "nearer another dot": shown.filter((l) => l.isNearerOther).length,
    "off the plane": shown.filter((l) => l.isOff).length,
    "hidden labels": all.filter((l) => l.isHidden).length,
    "drawings with any problem": drawings.filter(isBad).length,
    "distance to own dot, px (median / worst)": `${median(distances)} / ${worst(distances)}`,
    "labels moved per step (median / worst)": `${median(moved)} / ${worst(moved)}`,
    "steps where a label moved": `${moved.filter((m) => m > 0).length} of ${moved.length}`,
    "placing per drawing, ms (median / worst)": `${median(placing).toFixed(2)} / ${worst(placing).toFixed(2)}`,
    "of which solving, ms (median / worst)": `${median(drawings.map((d) => d.audit.solvingMs ?? 0)).toFixed(2)} / ${worst(drawings.map((d) => d.audit.solvingMs ?? 0)).toFixed(2)}`,
    "boxes read per drawing (median / worst)": `${median(reads)} / ${worst(reads)}`,
  };
}

const order = (what: string) =>
  what.endsWith("end") ? Number.POSITIVE_INFINITY : Number(what.split(" ").at(-1));

function compare(names: string[]): void {
  const read = names.map(
    (n) => [n, JSON.parse(readFileSync(join(OUT, n, "audits.json"), "utf8")) as Drawing[]] as const,
  );
  // Only the drawings every run has (a quick run against a whole one).
  const keyOf = (d: Drawing) => `${d.board} ${d.what}`;
  const sets = read.map(([, ds]) => new Set(ds.map(keyOf)));
  const shared = new Set([...(sets[0] ?? [])].filter((k) => sets.every((set) => set.has(k))));
  const runs = read.map(([n, ds]) => [n, ds.filter((d) => shared.has(keyOf(d)))] as const);
  const groups: [string, (d: Drawing) => boolean][] = [
    ["every drawing", () => true],
    ...[
      "the-cartesian-plane",
      "two-numbers-for-a-place",
      "coordinates-of-a-point",
      "plotting-points",
      "questions",
    ].map(
      (l) => [l, (d: Drawing) => d.board.includes(`/${l}/`)] as [string, (d: Drawing) => boolean],
    ),
  ];
  for (const [group, isIn] of groups) {
    const tables = runs.map(([n, ds]) => [n, numbers(ds.filter(isIn))] as const);
    console.log(`\n## ${group}\n`);
    console.log(`| | ${tables.map(([n]) => n).join(" | ")} |`);
    console.log(`|---|${tables.map(() => "---").join("|")}|`);
    for (const row of Object.keys(tables[0]?.[1] ?? {}))
      console.log(
        `| ${row} | ${tables.map(([, t]) => String(t[row as keyof typeof t])).join(" | ")} |`,
      );
  }
  // The drawings whose problems differ, for pictures side by side.
  const [first, ...rest] = runs;
  if (first === undefined) return;
  const problems = (d: Drawing) =>
    d.audit.labels
      .filter(
        (l) => l.isHidden || l.onLabels || l.onMarks || l.onLines || l.isNearerOther || l.isOff,
      )
      .map(
        (l) =>
          `${l.kind} ${l.text}${l.isHidden ? " hidden" : ""}${l.onLabels ? " on-label" : ""}${l.onMarks ? " on-mark" : ""}${l.onLines ? " on-line" : ""}${l.isNearerOther ? " nearer-other" : ""}${l.isOff ? " off" : ""}`,
      );
  for (const [n, ds] of rest) {
    const there = new Map(ds.map((d) => [`${d.board} ${d.what}`, d]));
    const differ = first[1].filter((d) => {
      const o = there.get(`${d.board} ${d.what}`);
      return o !== undefined && problems(d).join() !== problems(o).join();
    });
    console.log(`\n## Drawings whose problems differ, ${first[0]} → ${n}: ${differ.length}\n`);
    for (const d of differ.slice(0, 40)) {
      const o = there.get(`${d.board} ${d.what}`) as Drawing;
      console.log(
        `- ${d.board.split("/").slice(-2).join("/")} · ${d.what}\n  ${first[0]}: ${problems(d).join("; ") || "none"}\n  ${n}: ${problems(o).join("; ") || "none"}`,
      );
    }
  }
}

const [command, ...names] = process.argv.slice(2);
if (command === "run" && names[0] !== undefined)
  await run(names[0], process.argv.includes("--quick"));
else if (command === "compare" && names.length >= 2) compare(names);
else console.error("tsx label-compare.ts run <name> | compare <name> <name>…");
