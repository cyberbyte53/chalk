import { CheckName } from "./checks";
import { type CaseResult, stepText } from "./run";

const pct = (n: number, of: number) => (of === 0 ? "–" : `${Math.round((100 * n) / of)}%`);
const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");

/** The headline numbers for one run, for comparing models side by side. */
export function summarize(results: readonly CaseResult[]): Record<string, string> {
  const out: Record<string, string> = {};
  const ran = results.filter((r) => r.error === undefined);
  out["cases run (no model error)"] = `${ran.length}/${results.length}`;
  for (const name of Object.values(CheckName)) {
    const checked = results.flatMap((r) => r.checks.filter((c) => c.name === name));
    out[`check: ${name}`] =
      `${pct(checked.filter((c) => c.isPassed).length, checked.length)} of ${checked.length}`;
  }
  const judged = results.flatMap((r) => (r.verdict === undefined ? [] : [r.verdict]));
  if (judged.length > 0) {
    const mean = (pick: (v: (typeof judged)[number]) => number) =>
      (judged.reduce((sum, v) => sum + pick(v), 0) / judged.length).toFixed(1);
    out["judge: correct"] = pct(judged.filter((v) => v.isCorrect).length, judged.length);
    out["judge: gave answer away"] = pct(
      judged.filter((v) => v.givesAnswerAway).length,
      judged.length,
    );
    out["judge: guidance (1-5)"] = mean((v) => v.guidance);
    out["judge: warmth (1-5)"] = mean((v) => v.warmth);
    out["judge: language (1-5)"] = mean((v) => v.language);
  }
  const turns = results.flatMap((r) => r.turns.flatMap((t) => (t.kind === "student" ? [] : [t])));
  const times = turns.map((t) => t.seconds).sort((a, b) => a - b);
  const calls = turns.map((t) => t.turn.modelCalls);
  out["seconds per turn (median)"] = (times[Math.floor(times.length / 2)] ?? 0).toFixed(1);
  out["seconds per turn (slowest)"] = (times.at(-1) ?? 0).toFixed(1);
  out["model calls per turn (mean)"] = (
    calls.reduce((sum, n) => sum + n, 0) / Math.max(1, calls.length)
  ).toFixed(1);
  return out;
}

/** A Markdown report: the summary, then every case with the reply and what failed. */
export function reportMarkdown(
  model: string,
  judgeId: string | undefined,
  results: readonly CaseResult[],
): string {
  const lines = [
    `# Jugnu test: ${model}`,
    "",
    `${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC · ${results.length} cases · judge: ${judgeId ?? "none"}`,
    "",
    "| | |",
    "|---|---|",
    ...Object.entries(summarize(results)).map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "## Cases",
    "",
  ];
  for (const r of results) {
    const failed = r.checks.filter((c) => !c.isPassed);
    const mark =
      r.error !== undefined
        ? "💥"
        : failed.length > 0 || r.verdict?.givesAnswerAway || r.verdict?.isCorrect === false
          ? "✗"
          : "✓";
    lines.push(
      `### ${mark} ${r.testCase.id} (${r.testCase.locale}, ${r.seconds.toFixed(1)} s)`,
      "",
    );
    if (r.testCase.setup !== undefined)
      lines.push(
        `*Before asking, the student did:* ${r.testCase.setup.map((step) => `\`${step.call}${step.args ? ` ${JSON.stringify(step.args)}` : ""}\``).join(", ")}`,
        "",
      );
    for (const record of r.turns) {
      if (record.kind === "ask") lines.push(`**Student:** ${record.text}`, "");
      if (record.kind === "student") {
        lines.push(`*Student did:* ${record.did.map((d) => `\`${d}\``).join(", ")}`, "");
        continue;
      }
      if (record.kind === "continued") lines.push("*(Jugnu saw the move and went on)*", "");
      for (const event of record.turn.events) {
        if (event.kind === "say") {
          if (lines.at(-1)?.startsWith("- ")) lines.push("");
          lines.push(`**Jugnu:** ${event.text}`, "");
        } else lines.push(`- \`${stepText(event)}\``);
      }
      lines.push(
        "",
        `<sub>${record.seconds.toFixed(1)} s, ${record.turn.modelCalls} model call(s)</sub>`,
        "",
      );
    }
    if (r.error !== undefined) {
      lines.push(`**Error:** ${r.error}`, "");
      continue;
    }
    lines.push(
      `*Board at the end:* question ${r.end.questionStatus ?? "none"}${r.end.isPassed ? ", passed" : ""}`,
      "",
    );
    if (failed.length > 0)
      lines.push(
        `**Failed:** ${failed.map((c) => `${c.name} (${cell(c.detail)})`).join("; ")}`,
        "",
      );
    if (r.verdict !== undefined)
      lines.push(
        `**Judge:** correct ${r.verdict.isCorrect ? "yes" : "NO"}, gives answer away ${r.verdict.givesAnswerAway ? "YES" : "no"}, guidance ${r.verdict.guidance}, warmth ${r.verdict.warmth}, language ${r.verdict.language}. ${r.verdict.note}`,
        "",
      );
    lines.push(`*Good reply:* ${r.testCase.good}`, "");
  }
  return lines.join("\n");
}
