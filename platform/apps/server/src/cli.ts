import { randomInt } from "node:crypto";
import { writeFileSync } from "node:fs";
import { openDb } from "./db";
import { addSchool, jugnuFlag, jugnuFlagList } from "./store";

/**
 * `pnpm --filter @chalk/server add-school "School name"`: adds a school and prints its code.
 * `pnpm --filter @chalk/server flags`: the latest chats with Jugnu someone flagged.
 * `pnpm --filter @chalk/server flags <id>`: writes that one, whole, to jugnu-flag-<id>.json.
 */
const USAGE = `Usage (DATABASE_URL set):
  pnpm --filter @chalk/server add-school "School name"
  pnpm --filter @chalk/server flags [id]`;

const [command, ...rest] = process.argv.slice(2);
const url = process.env.DATABASE_URL;
if (url === undefined || (command !== "add-school" && command !== "flags")) {
  console.error(USAGE);
  process.exit(1);
}
const { db, close } = await openDb(url);
try {
  if (command === "add-school") {
    if (rest.length === 0) {
      console.error(USAGE);
      process.exitCode = 1;
    } else {
      const code = await addSchool(db, rest.join(" "), (n) => randomInt(n));
      console.log(`${rest.join(" ")}: school code ${code}`);
    }
  } else {
    const [id] = rest;
    if (id === undefined) {
      for (const flag of await jugnuFlagList(db, 50))
        console.log(
          `${flag.id}  ${flag.createdAt.toISOString().slice(0, 16)}  ${flag.name}  ${flag.lessonId ?? "-"}  ${flag.note}`,
        );
    } else {
      const body = await jugnuFlag(db, id);
      if (body === undefined) {
        console.error(`No flag ${id}`);
        process.exitCode = 1;
      } else {
        const file = `jugnu-flag-${id}.json`;
        writeFileSync(file, `${JSON.stringify(body, null, 1)}\n`);
        console.log(`Wrote ${file}`);
      }
    }
  }
} finally {
  await close();
}
