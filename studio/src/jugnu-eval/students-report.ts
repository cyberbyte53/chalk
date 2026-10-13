import { stepText } from "./run";
import type { Conversation } from "./simulate";

const pct = (n: number, of: number) => (of === 0 ? "–" : `${Math.round((100 * n) / of)}%`);
const mean = (values: readonly number[]) =>
  values.length === 0 ? "–" : (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

/** The headline numbers for a set of conversations (all with Jugnu, or all without). */
export function summarizeConversations(all: readonly Conversation[]): Record<string, string> {
  const ok = all.filter((c) => c.outcome !== "error");
  const solved = ok.filter((c) => c.metrics.isSolved);
  const judged = ok.flatMap((c) => (c.verdict === undefined ? [] : [c.verdict]));
  const out: Record<string, string> = {
    "conversations (no error)": `${ok.length}/${all.length}`,
    "solved by the student": pct(solved.length, ok.length),
    "rounds to solve (mean)": mean(solved.flatMap((c) => c.metrics.solvedInRound ?? [])),
    "wrong checks (mean)": mean(ok.map((c) => c.metrics.wrongChecks)),
    "gave up": pct(ok.filter((c) => c.outcome === "gaveUp").length, ok.length),
  };
  if (judged.length > 0) {
    out["judge: misconception fixed"] = pct(
      judged.filter((v) => v.isMisconceptionFixed).length,
      judged.length,
    );
    out["judge: student did the work"] = pct(
      judged.filter((v) => v.didStudentDoTheWork).length,
      judged.length,
    );
    out["judge: experience (1-5)"] = mean(judged.map((v) => v.experience));
  }
  if (ok.some((c) => c.withJugnu)) {
    out["Jugnu turns per conversation"] = mean(ok.map((c) => c.metrics.jugnuTurns));
    out["Jugnu words per turn (mean)"] = mean(ok.map((c) => c.metrics.wordsPerTurn.mean));
    out["Jugnu messages per turn"] = mean(ok.map((c) => c.metrics.messagesPerTurn));
    out["tools: acted / pointed / calculated / handed back"] = (
      ["act", "point", "calculate", "wait"] as const
    )
      .map((k) => ok.reduce((n, c) => n + c.metrics.tools[k], 0))
      .join(" / ");
    out["refused / undone"] =
      `${ok.reduce((n, c) => n + c.metrics.refusals, 0)} / ${ok.reduce((n, c) => n + c.metrics.undone, 0)}`;
    if (judged.length > 0) {
      out["judge: gave answer away"] = pct(
        judged.filter((v) => v.gaveAnswerAway).length,
        judged.length,
      );
      out["judge: maths correct"] = pct(judged.filter((v) => v.isCorrect).length, judged.length);
      out["judge: too much talk"] = pct(
        judged.filter((v) => v.isTooMuchTalk).length,
        judged.length,
      );
      out["judge: board use (1-5)"] = mean(judged.map((v) => v.boardUse));
      const rungs = new Map<string, number>();
      for (const v of judged) rungs.set(v.highestRung, (rungs.get(v.highestRung) ?? 0) + 1);
      out["judge: highest help used"] = [...rungs].map(([r, n]) => `${r} ${n}`).join(", ");
    }
    out["seconds of Jugnu per conversation"] = mean(ok.map((c) => c.metrics.seconds));
  }
  return out;
}

/** The ones to read first: leaks, not getting there, chatter. */
function toRead(all: readonly Conversation[]): string[] {
  const label = (c: Conversation) => `${c.student.id} (run ${c.run})`;
  const out: string[] = [];
  for (const c of all) {
    if (!c.withJugnu) continue;
    if (c.verdict?.gaveAnswerAway) out.push(`${label(c)}: gave the answer away`);
    else if (!c.metrics.isSolved)
      out.push(`${label(c)}: the student didn't get there (${c.outcome})`);
    else if (c.verdict?.isMisconceptionFixed === false)
      out.push(`${label(c)}: solved, but the misconception stayed`);
    else if (c.verdict?.isTooMuchTalk || c.metrics.wordsPerTurn.max > 40)
      out.push(`${label(c)}: too much talk`);
  }
  return out.slice(0, 10);
}

export function conversationsMarkdown(
  jugnuId: string,
  studentId: string,
  judgeId: string | undefined,
  all: readonly Conversation[],
): string {
  const withJugnu = all.filter((c) => c.withJugnu);
  const without = all.filter((c) => !c.withJugnu);
  const a = summarizeConversations(withJugnu);
  const b = without.length > 0 ? summarizeConversations(without) : undefined;
  const lines = [
    `# Jugnu with simulated students: ${jugnuId}`,
    "",
    `${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC · students played by ${studentId} · judge: ${judgeId ?? "none"}`,
    "",
    b === undefined ? "| | with Jugnu |" : "| | with Jugnu | without (baseline) |",
    b === undefined ? "|---|---|" : "|---|---|---|",
    ...Object.entries(a).map(([k, v]) =>
      b === undefined ? `| ${k} | ${v} |` : `| ${k} | ${v} | ${b[k] ?? ""} |`,
    ),
    "",
    "## Read these first",
    "",
    ...(toRead(all).length === 0 ? ["Nothing stood out."] : toRead(all).map((line) => `- ${line}`)),
    "",
    "## Conversations",
    "",
  ];
  for (const c of all) {
    lines.push(
      `### ${c.student.id}, run ${c.run}${c.withJugnu ? "" : " (no Jugnu)"}: ${c.outcome}${c.metrics.solvedInRound ? ` in round ${c.metrics.solvedInRound}` : ""}`,
      "",
      `*Belief:* ${c.student.belief}`,
      "",
    );
    for (const event of c.events) {
      if (event.who === "student") {
        if (event.kind === "said") lines.push(`**Student:** ${event.text}`, "");
        if (event.kind === "did")
          lines.push(
            `*Student did:* \`${event.call} ${JSON.stringify(event.args)}\`${event.result ? ` → ${event.result}` : ""}`,
            "",
          );
        if (event.kind === "gaveUp") lines.push("*Student gave up.*", "");
        continue;
      }
      if (event.isContinued) lines.push("*(Jugnu saw the move and went on)*", "");
      for (const e of event.turn.events) {
        if (e.kind === "say") {
          if (lines.at(-1)?.startsWith("- ")) lines.push("");
          lines.push(`**Jugnu:** ${e.text}`, "");
        } else lines.push(`- \`${stepText(e)}\``);
      }
      if (lines.at(-1)?.startsWith("- ")) lines.push("");
    }
    if (c.error !== undefined) lines.push(`**Error:** ${c.error}`, "");
    lines.push(`*Explanation afterwards:* ${c.explanation || "(none)"}`, "");
    if (c.verdict !== undefined)
      lines.push(
        `**Judge:** misconception fixed ${c.verdict.isMisconceptionFixed ? "yes" : "NO"}, gave answer away ${c.verdict.gaveAnswerAway ? "YES" : "no"}, maths ${c.verdict.isCorrect ? "ok" : "WRONG"}, highest help ${c.verdict.highestRung}, too much talk ${c.verdict.isTooMuchTalk ? "YES" : "no"}, board use ${c.verdict.boardUse}, experience ${c.verdict.experience}. ${c.verdict.note}`,
        "",
      );
  }
  return lines.join("\n");
}
