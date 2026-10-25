import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { buildIndexSchema } from "@chalk/content";
import { providerFrom } from "@chalk/jugnu";
import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { contentBoards } from "./boards";
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
const app = createApp({
  db,
  verifyGoogle:
    config.DEV_SIGN_IN === "on"
      ? withDevSignIn(googleVerifier(config.GOOGLE_CLIENT_ID))
      : googleVerifier(config.GOOGLE_CLIENT_ID),
  origin: config.ORIGIN,
  isLanAllowed: config.DEV_SIGN_IN === "on",
  courseIds: new Set(index.books.map((book) => book.id)),
  jugnu:
    config.JUGNU_MODEL_SERVER === undefined || config.JUGNU_MODEL === undefined
      ? undefined
      : providerFrom({
          provider: config.JUGNU_PROVIDER,
          url: config.JUGNU_MODEL_SERVER,
          model: config.JUGNU_MODEL,
          ...(config.JUGNU_API_KEY !== undefined ? { apiKey: config.JUGNU_API_KEY } : {}),
          think: config.JUGNU_THINK === "on",
        }),
  staticDir: config.STATIC_DIR,
  contentDir,
  boards: contentBoards(contentDir),
});

const server = serve({ fetch: app.fetch, port: config.PORT }, ({ port }) =>
  console.log(`Chalk server on :${port} for ${config.ORIGIN}`),
);

const stop = () => server.close(() => void close().then(() => process.exit(0)));
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
