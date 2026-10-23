import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { type LlmProvider, ProviderKind, providerFrom } from "@chalk/jugnu";
import { writeJsonFile } from "../json-file";
import { evalCasesSchema } from "./cases";
import { reportMarkdown, summarize } from "./report";
import { type CaseResult, runCase } from "./run";
import { type Conversation, simulate } from "./simulate";
import { studentsSchema } from "./students";
import { conversationsMarkdown, summarizeConversations } from "./students-report";

/**
 * `pnpm test-jugnu`: plays every test case on its real board, scores what Jugnu said and did, and
 * writes a report to platform/studio/evals/reports/. `pnpm test-jugnu --students`: whole conversations with
 * simulated students instead. See platform/studio/evals/README.md.
 */
const { values } = parseArgs({
  options: {
    model: { type: "string" },
    provider: { type: "string" },
    url: { type: "string" },
    key: { type: "string" },
    "judge-model": { type: "string" },
    "judge-provider": { type: "string" },
    "judge-url": { type: "string" },
    "judge-key": { type: "string" },
    only: { type: "string" },
    think: { type: "boolean", default: false },
    cases: { type: "string" },
    students: { type: "boolean", default: false },
    "student-model": { type: "string" },
    runs: { type: "string", default: "1" },
    baseline: { type: "boolean", default: false },
  },
});

const DEFAULT_URL: Record<string, string> = {
  [ProviderKind.Ollama]: "http://127.0.0.1:11434",
  [ProviderKind.OpenAiCompatible]: "https://api.deepseek.com",
};

/** JUGNU_* settings from the repo's .env, for whatever the shell doesn't set (the app's own key). */
function appEnv(root: string): Record<string, string> {
  try {
    const text = readFileSync(join(root, ".env"), "utf8");
    return Object.fromEntries(
      text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /^JUGNU_[A-Z_]+=/.test(line))
        .map((line) => {
          const at = line.indexOf("=");
          return [line.slice(0, at), line.slice(at + 1).replace(/^["']|["']$/g, "")];
        }),
    );
  } catch {
    return {};
  }
}

function providerOf(
  model: string,
  kind: string,
  url: string | undefined,
  key: string | undefined,
  think = false,
): LlmProvider {
  if (!Object.values(ProviderKind).includes(kind as ProviderKind))
    throw new Error(`--provider must be one of: ${Object.values(ProviderKind).join(", ")}`);
  return providerFrom({
    provider: kind as ProviderKind,
    url: url ?? DEFAULT_URL[kind] ?? "",
    model,
    apiKey: key,
    timeoutSeconds: 300,
    think,
  });
}

const root = resolve(dirname(new URL(import.meta.url).pathname), "../../../..");
const env = { ...appEnv(root), ...process.env };
const modelName = values.model ?? env.JUGNU_MODEL;
if (modelName === undefined) {
  console.error(
    "Usage: pnpm test-jugnu [--model <name>] [--provider openai-compatible|ollama] [--url …] [--key …]\n" +
      "         [--judge-model <name> --judge-provider … --judge-url … --judge-key …] [--only <id part>]\n" +
      "         [--students [--student-model <name>] [--runs <n>] [--baseline]]\n" +
      "Model, provider, server and key default to JUGNU_MODEL, JUGNU_PROVIDER, JUGNU_MODEL_SERVER and\n" +
      "JUGNU_API_KEY, from the shell or the repo's .env.",
  );
  process.exit(1);
}
const provider = values.provider ?? env.JUGNU_PROVIDER ?? ProviderKind.OpenAiCompatible;
const url = values.url ?? env.JUGNU_MODEL_SERVER;
const key = values.key ?? env.JUGNU_API_KEY;
const model = providerOf(modelName, provider, url, key === "" ? undefined : key, values.think);
const judgeKey = values["judge-key"] ?? env.JUGNU_JUDGE_KEY ?? key;
const judgeModel =
  values["judge-model"] === undefined
    ? undefined
    : providerOf(
        values["judge-model"],
        values["judge-provider"] ?? provider,
        values["judge-url"] ?? url,
        judgeKey === "" ? undefined : judgeKey,
      );
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const reportName = (kind: string) =>
  `${stamp}-${kind}${modelName.replace(/[^A-Za-z0-9.-]+/g, "_")}${values.think ? "-thinking" : ""}`;
const reportsDir = join(root, "platform/studio/evals/reports");
mkdirSync(reportsDir, { recursive: true });

if (values.students) {
  const studentModel = providerOf(
    values["student-model"] ?? modelName,
    provider,
    url,
    key === "" ? undefined : key,
  );
  const students = studentsSchema
    .parse(JSON.parse(readFileSync(join(root, "platform/studio/evals/students.json"), "utf8")))
    .students.filter((s) => values.only === undefined || s.id.includes(values.only));
  const runs = Math.max(1, Number.parseInt(values.runs, 10) || 1);
  console.log(
    `Jugnu ${model.id} with ${students.length} simulated students (played by ${studentModel.id}), ${runs} run(s)${values.baseline ? ", plus a baseline without Jugnu" : ""}${judgeModel ? `, judged by ${judgeModel.id}` : ""}\n`,
  );
  const all: Conversation[] = [];
  for (let run = 1; run <= runs; run++) {
    for (const student of students) {
      for (const withJugnu of values.baseline ? [true, false] : [true]) {
        process.stdout.write(`  ${student.id}${withJugnu ? "" : " (no Jugnu)"}, run ${run} … `);
        const c = await simulate({
          root,
          student,
          run,
          withJugnu,
          jugnu: model,
          studentModel,
          judgeModel,
        });
        all.push(c);
        console.log(
          c.error !== undefined
            ? `error: ${c.error.slice(0, 160)}`
            : `${c.outcome}${c.metrics.solvedInRound ? ` in round ${c.metrics.solvedInRound}` : ""}${c.verdict ? `, experience ${c.verdict.experience}${c.verdict.gaveAnswerAway ? ", GAVE ANSWER AWAY" : ""}` : ""}`,
        );
        if (all.length === 1 && c.error !== undefined) {
          console.error("\nThe first conversation failed to reach a model; stopping.");
          process.exit(1);
        }
      }
    }
  }
  console.log("");
  for (const [k, v] of Object.entries(summarizeConversations(all.filter((c) => c.withJugnu))))
    console.log(`  ${k.padEnd(48)} ${v}`);
  const name = reportName("students-");
  writeFileSync(
    join(reportsDir, `${name}.md`),
    conversationsMarkdown(model.id, studentModel.id, judgeModel?.id, all),
  );
  writeJsonFile(join(reportsDir, `${name}.json`), all);
  console.log(`\nReport: platform/studio/evals/reports/${name}.md`);
  process.exit(0);
}

const casesFile = values.cases ?? join(root, "platform/studio/evals/jugnu-cases.json");
const cases = evalCasesSchema
  .parse(JSON.parse(readFileSync(casesFile, "utf8")))
  .cases.filter((c) => values.only === undefined || c.id.includes(values.only));

console.log(
  `Testing ${model.id} on ${cases.length} cases${judgeModel ? `, judged by ${judgeModel.id}` : ""}\n`,
);
const results: CaseResult[] = [];
for (const testCase of cases) {
  process.stdout.write(`  ${testCase.id} … `);
  const result = await runCase(testCase, root, model, judgeModel);
  results.push(result);
  const failed = result.checks.filter((c) => !c.isPassed).map((c) => c.name);
  console.log(
    result.error !== undefined
      ? `error: ${result.error.slice(0, 160)}`
      : `${result.seconds.toFixed(1)} s${failed.length > 0 ? `  ✗ ${failed.join(", ")}` : "  ✓"}${result.verdict?.givesAnswerAway ? "  (judge: gave answer away)" : ""}`,
  );
  if (results.length === 1 && result.error !== undefined) {
    console.error(
      "\nThe first case failed to reach the model; stopping. Check the URL, the key and the model name.",
    );
    process.exit(1);
  }
}

console.log("");
for (const [k, v] of Object.entries(summarize(results))) console.log(`  ${k.padEnd(32)} ${v}`);
const name = reportName("");
writeFileSync(join(reportsDir, `${name}.md`), reportMarkdown(model.id, judgeModel?.id, results));
writeJsonFile(join(reportsDir, `${name}.json`), results);
console.log(`\nReport: platform/studio/evals/reports/${name}.md`);
