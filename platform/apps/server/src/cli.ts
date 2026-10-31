import { randomInt } from "node:crypto";
import { openDb } from "./db";
import { addSchool, rebuildBoardFacts } from "./store";

/**
 * `pnpm --filter @chalk/server add-school "School name"`: adds a school and prints its code.
 * `pnpm --filter @chalk/server rebuild-facts`: makes the processors' tables again from the events.
 */
const USAGE = `Usage (DATABASE_URL set):
  pnpm --filter @chalk/server add-school "School name"
  pnpm --filter @chalk/server rebuild-facts`;

const [command, ...rest] = process.argv.slice(2);
const url = process.env.DATABASE_URL;
const COMMANDS = ["add-school", "rebuild-facts"];
if (url === undefined || command === undefined || !COMMANDS.includes(command)) {
  console.error(USAGE);
  process.exit(1);
}
const { db, close } = await openDb(url);
try {
  if (command === "rebuild-facts") {
    await rebuildBoardFacts(db);
    console.log("✓ board facts made again from the events");
  } else {
    if (rest.length === 0) {
      console.error(USAGE);
      process.exitCode = 1;
    } else {
      const code = await addSchool(db, rest.join(" "), (n) => randomInt(n));
      console.log(`${rest.join(" ")}: school code ${code}`);
    }
  }
} finally {
  await close();
}
