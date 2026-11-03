import { fileURLToPath } from "node:url";
import type { RuntimeState } from "@chalk/player";
import { played, questionsSeen, readCases } from "../src/jugnu/cases";

/** `pnpm jugnu-cases [--probe <board>]`: Jugnu's stuck children, played; prints what each sees. */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const at = process.argv.indexOf("--probe");
  if (at !== -1) {
    const runtime = await played(process.argv[at + 1] ?? "", []);
    for (const line of questionsSeen(runtime)) console.log(line);
  } else {
    const cases = readCases();
    for (const c of cases) {
      const runtime = await played(c.board, c.steps);
      const state: RuntimeState = runtime.state();
      console.log(`\n${c.name} · ${c.board}\n  asks: ${c.asks}\n  about: ${c.about}`);
      for (const line of questionsSeen(runtime)) console.log(`  ${line}`);
      console.log(`  state: ${(JSON.stringify(state).length / 1024).toFixed(1)} KB`);
      runtime.dispose();
    }
  }
}
