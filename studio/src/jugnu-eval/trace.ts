import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { type LlmProvider, ProviderKind, providerFrom } from "@chalk/jugnu";
import { evalCasesSchema } from "./cases";
import { runCase } from "./run";

/**
 * `pnpm --filter @chalk/studio trace <case id> [cases file]`: plays one case and prints every model
 * call in full: his hidden reasoning, his words, each tool call, and what each tool answered. For
 * reading why he does what he does, not for scoring.
 */
const root = resolve(dirname(new URL(import.meta.url).pathname), "../../..");
const [id, file] = process.argv.slice(2);
const env: Record<string, string | undefined> = {
  ...Object.fromEntries(
    readFileSync(join(root, ".env"), "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => /^JUGNU_[A-Z_]+=/.test(l))
      .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
  ),
  ...process.env,
};
const base = providerFrom({
  provider: ProviderKind.OpenAiCompatible,
  url: env.JUGNU_MODEL_SERVER ?? "",
  model: env.JUGNU_MODEL ?? "",
  ...(env.JUGNU_API_KEY ? { apiKey: env.JUGNU_API_KEY } : {}),
  think: env.JUGNU_THINK === "on",
  timeoutSeconds: 180,
});
let call = 0;
let lastModelEnd = 0;
const timing: {
  call: number;
  model: number;
  gap: number;
  input: number;
  cached: number;
  output: number;
}[] = [];
const model: LlmProvider = {
  ...base,
  chat: async (request) => {
    call++;
    // Time since the last model call ended: the tools (and our own code) in between.
    const gap = lastModelEnd === 0 ? 0 : Date.now() - lastModelEnd;
    // What he heard since his last call: the turn's opening, or the tool results.
    const fresh = [];
    for (let i = request.messages.length - 1; i >= 0; i--) {
      const m = request.messages[i];
      if (m === undefined || m.role === "assistant") break;
      fresh.unshift(m);
    }
    for (const m of fresh.filter((x) => x.role !== "system"))
      console.log(
        m.role === "tool"
          ? `   ← ${m.name}: ${m.content}`
          : `\n── heard (${m.role}) ──\n${m.content.replace(/"props":\{.*\}\}/s, '"props":{…}}')}`,
      );
    const started = Date.now();
    const reply = await base.chat(request);
    lastModelEnd = Date.now();
    const u = reply.usage ?? { input: 0, cached: 0, output: 0 };
    timing.push({
      call,
      model: lastModelEnd - started,
      gap,
      input: u.input,
      cached: u.cached,
      output: u.output,
    });
    console.log(
      `\n#${call}  model ${((lastModelEnd - started) / 1000).toFixed(1)} s · tools before it ${gap} ms · in ${u.input} (cached ${u.cached}) · out ${u.output}`,
    );
    if (reply.reasoning)
      console.log(`  THINKS: ${reply.reasoning.trim().replace(/\n+/g, "\n          ")}`);
    if (reply.content.trim()) console.log(`  WRITES: ${reply.content.trim()}`);
    for (const c of reply.toolCalls) console.log(`  CALLS ${c.name} ${c.rawArgs}`);
    return reply;
  },
};
const cases = evalCasesSchema.parse(
  JSON.parse(readFileSync(file ?? join(root, "studio/evals/jugnu-tool-cases.json"), "utf8")),
).cases;
const testCase = cases.find((c) => c.id === id);
if (testCase === undefined) {
  console.error(`No case ${id}. Cases: ${cases.map((c) => c.id).join(", ")}`);
  process.exit(1);
}
console.log(`CASE ${testCase.id}: ${testCase.good}`);
const caseStarted = Date.now();
const result = await runCase(testCase, root, model, undefined);
const total = Date.now() - caseStarted;
const modelMs = timing.reduce((n, t) => n + t.model, 0);
const toolMs = timing.reduce((n, t) => n + t.gap, 0);
const input = timing.reduce((n, t) => n + t.input, 0);
const cached = timing.reduce((n, t) => n + t.cached, 0);
const output = timing.reduce((n, t) => n + t.output, 0);
console.log(
  `\nTIME ${(total / 1000).toFixed(1)} s: model ${(modelMs / 1000).toFixed(1)} s over ${timing.length} call(s), tools ${toolMs} ms, rest ${total - modelMs - toolMs} ms · tokens in ${input} (${Math.round((100 * cached) / Math.max(input, 1))}% cached), out ${output}`,
);
for (const t of result.turns)
  if (t.kind !== "student") console.log(`\nSTUDENT SAW: ${JSON.stringify(t.turn.cues)}`);
console.log(
  `\nFAILED: ${
    result.checks
      .filter((c) => !c.isPassed)
      .map((c) => `${c.name} (${c.detail})`)
      .join("; ") || "nothing"
  }`,
);
process.exit(0);
