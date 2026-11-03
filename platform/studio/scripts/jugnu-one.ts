import { runJugnu } from "../src/jugnu/run";

/** `pnpm jugnu-one <case>`: Jugnu on one stuck child; prints his run (the preview's ?dev&jugnu shows it). */
const run = await runJugnu(process.argv[2] ?? "plot-swapped");
console.log(`=== ${run.case.name}: she asks "${run.case.asks}"\nabout: ${run.case.about}\n`);
for (const m of run.moves)
  console.log(
    m.kind === "try"
      ? `TRY (from ${m.from}) ${JSON.stringify(m.steps)}\n  → ${JSON.stringify(m.saw).slice(0, 300)}`
      : `${m.kind.toUpperCase()}: ${m.text}`,
  );
console.log(`\nREPLY: ${run.reply.words}\nGLOW: ${run.reply.glow}`);
console.log(
  `${run.model}: ${run.usage.requests} requests, ${run.usage.ms} ms, ${run.usage.input} in, ${run.usage.output} out`,
);
