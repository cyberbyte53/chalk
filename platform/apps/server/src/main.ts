import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { conceptPlansOf } from "@chalk/api";
import { buildIndexSchema, builtFile } from "@chalk/content";
import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { readConfig } from "./config";
import { openDb } from "./db";
import { googleVerifier, withDevSignIn } from "./google";
import { ensureDevClass } from "./store";

const config = readConfig(process.env);
const { db, close } = await openDb(config.DATABASE_URL);
const index = buildIndexSchema.parse(JSON.parse(readFileSync(config.CONTENT_INDEX, "utf8")));
// Dev sign-ins get a school and a class for every course, so a laptop needs no setup by hand.
if (config.DEV_SIGN_IN === "on")
  await ensureDevClass(
    db,
    index.books.map((book) => book.id),
  );

const contentDir = config.CONTENT_DIR ?? dirname(config.CONTENT_INDEX);
// The course tree's plans, for progress: read once, from the same build the app was made with.
const plans = conceptPlansOf(index, (path) =>
  JSON.parse(readFileSync(join(contentDir, builtFile(path)), "utf8")),
);
const app = createApp({
  db,
  verifyGoogle:
    config.DEV_SIGN_IN === "on"
      ? withDevSignIn(googleVerifier(config.GOOGLE_CLIENT_ID))
      : googleVerifier(config.GOOGLE_CLIENT_ID),
  origin: config.ORIGIN,
  isLanAllowed: config.DEV_SIGN_IN === "on",
  commit: index.commit,
  plans,
  courseIds: new Set(index.books.map((book) => book.id)),
  staticDir: config.STATIC_DIR,
  contentDir,
});

const server = serve({ fetch: app.fetch, port: config.PORT }, ({ port }) =>
  console.log(`Chalk server on :${port} for ${config.ORIGIN}`),
);

const stop = () => server.close(() => void close().then(() => process.exit(0)));
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
