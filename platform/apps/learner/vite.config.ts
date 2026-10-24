import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import type { ClientRequest, IncomingMessage, ServerResponse } from "node:http";
import { join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { type Plugin, type UserConfig, defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { sourceOf, studioMiddleware } from "./dev-studio";

/** The repo's root, where the one .env lives (see .env.example). */
const ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/**
 * In development, what Jugnu heard and said on the dev shell is appended, one JSON line per
 * model call and per turn, to tmp/jugnu-chat.jsonl at the repo's root: `pnpm --filter
 * @chalk/studio chat-log` prints it readably, so a chat can be read without copying it out.
 */
function devLog(): Plugin {
  // /dev-log: Jugnu's turns (tmp/jugnu-chat.jsonl); /dev-llm-log: every model call exactly as it
  // was sent and answered (tmp/llm-calls.jsonl).
  const appendTo = (file: string) => (req: IncomingMessage, res: ServerResponse) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      mkdirSync(join(ROOT, "tmp"), { recursive: true });
      appendFileSync(join(ROOT, "tmp", file), `${body.trim()}\n`);
      res.statusCode = 204;
      res.end();
    });
  };
  return {
    name: "chalk-dev-log",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/dev-log", appendTo("jugnu-chat.jsonl"));
      server.middlewares.use("/dev-llm-log", appendTo("llm-calls.jsonl"));
    },
  };
}

/**
 * /content/<path>: a file of the built content (build/ at the repo's root), as the server serves it
 * in production. Read fresh on every request, so `pnpm preview` / `build-content` show without a
 * restart. Also in `vite preview`, to try the built app (and its offline cache) on a laptop.
 */
function devContent(): Plugin {
  const dir = join(ROOT, "build");
  const handle = (req: IncomingMessage, res: ServerResponse) => {
    const path = decodeURIComponent((req.url ?? "/").split("?")[0] ?? "/");
    const file = normalize(join(dir, path));
    if (!file.startsWith(dir + sep) || !file.endsWith(".json") || !existsSync(file)) {
      res.statusCode = 404;
      res.end();
      return;
    }
    res.setHeader("content-type", "application/json");
    res.setHeader("cache-control", "no-cache");
    res.end(readFileSync(file));
  };
  return {
    name: "chalk-dev-content",
    configureServer(server) {
      server.middlewares.use("/content", handle);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/content", handle);
    },
  };
}

/**
 * In development, review comments made on `?dev&review` live in content/review/comments.json at the repo's
 * root. GET /dev-review reads them all; POST /dev-review takes one change ({ op: "add" | "reply" |
 * "status" | "remove" }) and writes the file back. Claude reads the same file, writes its
 * proposals and replies into it, and the page shows them.
 */
function devReview(): Plugin {
  const dir = join(ROOT, "content", "review");
  const file = join(dir, "comments.json");
  type Entry = { by: string; at: string; text: string };
  type Comment = { id: string; status: string; thread: Entry[] } & Record<string, unknown>;
  const read = (): Comment[] =>
    existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Comment[]) : [];
  /** Every screen comment names its source file (from build/), so an agent opens it at once. */
  const withSource = (c: Comment): Comment => {
    if (c.source !== undefined || c.board === "plan") return c;
    const found = sourceOf(ROOT, String(c.lessonId), Number(c.boardIndex));
    return found === null ? c : { ...c, source: found.source, sourcePath: found.path };
  };
  const write = (all: Comment[]) => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${file}.tmp`, `${JSON.stringify(all, null, 2)}\n`);
    renameSync(`${file}.tmp`, file);
  };
  return {
    name: "chalk-dev-review",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/dev-review", (req, res) => {
        const send = (all: Comment[]) => {
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify(all));
        };
        if (req.method !== "POST") {
          const all = read();
          const filled = all.map(withSource);
          if (filled.some((c, i) => c !== all[i])) write(filled);
          return send(filled);
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          const change = JSON.parse(body) as {
            op: string;
            id?: string;
            comment?: Record<string, unknown>;
            text?: string;
            status?: string;
          };
          const all = read();
          const at = new Date().toISOString();
          const found = all.find((c) => c.id === change.id);
          if (change.op === "add" && change.comment !== undefined) {
            const id = `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
            all.push(
              withSource({ ...change.comment, id, createdAt: at, status: "open", thread: [] }),
            );
          } else if (change.op === "reply" && found !== undefined && change.text) {
            found.thread.push({ by: "you", at, text: change.text });
            found.status = change.status ?? "open";
          } else if (change.op === "status" && found !== undefined && change.status) {
            found.status = change.status;
          } else if (change.op === "remove" && found !== undefined) {
            all.splice(all.indexOf(found), 1);
          }
          write(all);
          send(all);
        });
      });
    },
  };
}

/** In development, Studio (`?dev&studio`) reads the content tree through /dev-studio; see dev-studio.ts. */
function devStudio(): Plugin {
  return {
    name: "chalk-dev-studio",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/dev-studio", studioMiddleware(ROOT));
    },
  };
}

/**
 * The model servers are called by this machine, not a browser: the page's Origin is dropped, or
 * Anthropic treats the call as one from a browser holding a key.
 */
const dropOrigin = (proxy: { on: (event: "proxyReq", fn: (req: ClientRequest) => void) => void }) =>
  proxy.on("proxyReq", (req) => req.removeHeader("origin"));

/**
 * The app's settings come from the repo's .env when it is built: the Google client id and Jugnu's
 * on/off. In development, /api goes on to the server (`pnpm dev` runs both); Jugnu thinks on the
 * server, so his model's key never reaches the browser.
 */
export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, ROOT, [
    "GOOGLE_CLIENT_ID",
    "DEV_SIGN_IN",
    "JUGNU_",
    "PORT",
    "ANTHROPIC_API_KEY",
    "CLAUDE_MODELS",
  ]);
  const isDev = mode === "development";
  const primaryProvider = env.JUGNU_PROVIDER === "anthropic" ? "anthropic" : "openai-compatible";
  // Models the dev shell can switch Jugnu between: the .env's own, and Claude's when
  // ANTHROPIC_API_KEY is set (CLAUDE_MODELS, comma-separated, overrides which).
  const claudeModels = (env.CLAUDE_MODELS ?? "claude-haiku-5-5,claude-sonnet-5-5")
    .split(",")
    .map((m) => m.trim())
    .filter((m) => m !== "");
  const devModels = !isDev
    ? []
    : [
        ...(env.JUGNU_MODEL_SERVER !== undefined && env.JUGNU_MODEL
          ? [
              {
                id: env.JUGNU_MODEL,
                provider: primaryProvider,
                path: "/dev-model",
                model: env.JUGNU_MODEL,
                think: env.JUGNU_THINK === "on",
              },
            ]
          : []),
        // Each Claude model twice: thinking off, and on (" +think").
        ...(env.ANTHROPIC_API_KEY
          ? claudeModels.flatMap((model) =>
              [false, true].map((think) => ({
                id: think ? `${model}+think` : model,
                provider: "anthropic",
                path: "/dev-anthropic",
                model,
                think,
              })),
            )
          : []),
      ];
  const chalk = {
    googleClientId: env.GOOGLE_CLIENT_ID ?? "",
    isDevSignIn: mode === "development" && env.DEV_SIGN_IN === "on",
    jugnu: {
      isOn: env.JUGNU_PROVIDER !== "off",
      // In the dev shell Jugnu thinks on this device, calling the model through /dev-model
      // below (the key is added there, never in the page): no server, no sign-in, no database.
      devModels,
    },
  };
  const server = `http://127.0.0.1:${env.PORT ?? "8080"}`;
  return {
    // JSX is compiled by esbuild straight to Preact; no Babel, no plugin.
    esbuild: { jsx: "automatic", jsxImportSource: "preact" },
    define: { __CHALK__: JSON.stringify(chalk) },
    plugins: [
      devLog(),
      devReview(),
      devStudio(),
      devContent(),
      // The app installs to the home screen and works offline: the app and its fonts are cached
      // on first visit, and each chapter's content (and its props' drawing code) the first time
      // it is opened; a new version is fetched in the background and used from the next open.
      // /api and Jugnu always go to the network.
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        includeAssets: ["favicon.svg", "apple-touch-icon.png"],
        manifest: {
          name: "Chalk",
          short_name: "Chalk",
          description: "Don't just learn it. See why it's true.",
          lang: "en",
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          background_color: "#ffffff",
          theme_color: "#ffffff",
          icons: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
            {
              src: "/icon-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          // woff2 only: every phone that runs the app reads it; .woff and .ttf are fallbacks.
          globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
          // The app's own code only: a chapter's pages and questions come from /content/ when the
          // chapter is opened, and are kept below. A bigger main script means content or a prop's
          // drawing code slipped back into it.
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//, /^\/content\//],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              // Every content file is named by its version (?v=), so a kept copy never goes stale:
              // a chapter opened once opens offline after; a new version is a new URL.
              urlPattern: ({ url }) => url.pathname.startsWith("/content/"),
              handler: "CacheFirst",
              options: {
                cacheName: "chalk-content",
                expiration: { maxEntries: 20000, purgeOnQuotaError: true },
                cacheableResponse: { statuses: [200] },
              },
            },
          ],
        },
      }),
    ],
    server: {
      // With dev sign-in on, a phone on the same Wi-Fi can open it at this computer's address.
      host: chalk.isDevSignIn ? true : "localhost",
      fs: { allow: ["../../.."] },
      proxy: {
        "/api": server,
        ...(env.JUGNU_MODEL_SERVER !== undefined
          ? {
              "/dev-model": {
                target: env.JUGNU_MODEL_SERVER,
                changeOrigin: true,
                rewrite: (path: string) => path.replace(/^\/dev-model/, ""),
                headers: !env.JUGNU_API_KEY
                  ? {}
                  : primaryProvider === "anthropic"
                    ? { "x-api-key": env.JUGNU_API_KEY }
                    : { authorization: `Bearer ${env.JUGNU_API_KEY}` },
                configure: dropOrigin,
              },
            }
          : {}),
        ...(env.ANTHROPIC_API_KEY
          ? {
              "/dev-anthropic": {
                target: "https://api.anthropic.com",
                changeOrigin: true,
                rewrite: (path: string) => path.replace(/^\/dev-anthropic/, ""),
                headers: { "x-api-key": env.ANTHROPIC_API_KEY },
                configure: dropOrigin,
              },
            }
          : {}),
      },
    },
  };
});
