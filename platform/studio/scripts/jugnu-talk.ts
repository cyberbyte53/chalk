import { runDialogue } from "../src/jugnu/dialogue";

/** `pnpm jugnu-talk <case> <student> [note]`: Jugnu and a simulated child, back and forth; kept, and printed. */
const d = await runDialogue(
  process.argv[2] ?? "plot-swapped",
  process.argv[3] ?? "up-first",
  process.argv[4] ?? "",
);
console.log(`=== ${d.case.name} · ${d.student.name}: she believes "${d.student.believes}"\n`);
for (const t of d.turns) {
  if (t.who === "jugnu") {
    for (const th of t.thinking) console.log(`  [Jugnu thinks] ${th.replace(/\s+/g, " ")}`);
    for (const tr of t.tries)
      console.log(
        `  [Jugnu tries] ${tr.steps.map((s) => `${s.prop}.${s.action}${s.args ? JSON.stringify(s.args) : ""}`).join(" → ")}`,
      );
    console.log(`  [his diagnosis] ${t.diagnosis}`);
    console.log(
      `JUGNU: ${t.says}${t.choices.length ? `   [${t.choices.join(" | ")}]` : ""}${t.glow ? `   (glows ${t.glow})` : ""}\n`,
    );
  } else {
    for (const th of t.thinking) console.log(`  [she thinks] ${th.replace(/\s+/g, " ")}`);
    if (t.did.length)
      console.log(
        `  [she does] ${t.did.map((s) => `${s.prop}.${s.action}${s.args ? JSON.stringify(s.args) : ""}`).join(" → ")}`,
      );
    console.log(
      `${t.transfer ? "HER, ALONE ON THE NEXT QUESTION" : "HER"}: ${t.says}${t.isRight ? "   ✓ RIGHT" : ""}${t.isLeaving ? "   (SHE LEAVES)" : ""}\n`,
    );
  }
}
console.log(
  `${d.isRight ? "Her question right." : d.isLeft ? "She left." : "Not solved."}${d.transfer ? (d.transfer.isRight ? " Next one alone: RIGHT." : " Next one alone: WRONG.") : ""} ${d.models.jugnu} / ${d.models.student}: ${(d.usage.ms / 1000).toFixed(1)} s, input: ${d.usage.input} new + ${d.usage.cacheRead ?? 0} read from cache (${d.usage.cacheWrite ?? 0} written), ${d.usage.output} out`,
);
