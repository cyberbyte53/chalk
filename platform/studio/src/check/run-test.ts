import { dirname } from "node:path";
import { findUp } from "../find-up";
import { test } from "./test";

/** `tsx src/check/run-test.ts [--force]`: the tests step of `pnpm check` on its own. */
const root = dirname(findUp("pnpm-workspace.yaml", process.cwd()));
const ok = await test(root, { force: process.argv.includes("--force") });
process.exit(ok ? 0 : 1);
