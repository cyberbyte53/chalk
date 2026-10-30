import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { importedFiles, recordImports } from "../content/deps";
import { findUp } from "../find-up";
import { type ReadKind, watchReads } from "./reads";

/**
 * Loaded first (`tsx --import ./src/check/trace-step.ts <cli>`) by a `pnpm check` step that is
 * stamped (check/steps.ts): notes every module the step imports and every file it reads, and how,
 * and writes them to $CHALK_TRACE_OUT when the process ends.
 */
const out = process.env.CHALK_TRACE_OUT;
if (out !== undefined && out !== "") {
  const root = dirname(findUp("pnpm-workspace.yaml", process.cwd()));
  const reads = new Map<string, ReadKind>();
  const strength: Record<ReadKind, number> = { presence: 0, listing: 1, content: 2 };
  recordImports();
  watchReads(root, (path, kind) => {
    const was = reads.get(path);
    if (was === undefined || strength[kind] > strength[was]) reads.set(path, kind);
  });
  process.on("exit", () => {
    for (const file of importedFiles()) reads.set(file, "content");
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, JSON.stringify(Object.fromEntries(reads)));
  });
}
