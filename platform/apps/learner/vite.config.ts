import { spawn } from "node:child_process";
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
import { findBoard, siteOf } from "../../studio/src/boards";
import {
  Actor,
  COMMENTS_FILE,
  type Change,
  applyChange,
  readComments,
} from "../../studio/src/comments";
import { studioMiddleware } from "./dev-studio";

/** The one dev server's port (CHALK_DEV_PORT to change it). */
const DEV_PORT = Number(process.env.CHALK_DEV_PORT ?? 5173);

/** The repo's root, where the one .env lives (see .env.example). */
const ROOT = fileURLToPath(new URL("../../..", import.meta.url));
/** The content's source, and where a chunk made only of it is written (and served) in the build. */
const CONTENT_SOURCE = join(ROOT, "content") + sep;
const CONTENT_CHUNKS = "assets/content/";

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
      // build/.built is rewritten last by every build: tell open previews to redraw.
      const sources = join(dir, ".built");
      let timer: NodeJS.Timeout | undefined;
      const changed = (file: string) => {
        if (file !== sources) return;
        clearTimeout(timer);
        timer = setTimeout(() => server.ws.send({ type: "custom", event: "chalk:build" }), 150);
      };
      server.watcher.add(sources);
      server.watcher.on("change", changed);
      server.watcher.on("add", changed);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/content", handle);
    },
  };
}

/**
 * In development, comments (platform/studio/src/comments.ts) are read and written here and only
 * here: the dev server is their one writer, so two writers can never collide and every change
 * follows the lifecycle. GET /dev-review lists them (?problems for anything a file holds that
 * doesn't fit); POST /dev-review applies one change. The caller says who it is with
 * x-chalk-actor ("agent" for the chalk MCP tools; the person otherwise). A comments file that
 * changes on disk is pushed to open previews at once (chalk:comments).
 */
function devReview(): Plugin {
  /** A comment from the older review pages (lessonId and board index): its board and line from build/. */
  const fromReviewPage = (c: Record<string, unknown>): Record<string, unknown> => {
    const piece = typeof c.piece === "string" ? c.piece : undefined;
    const part = typeof c.part === "string" ? c.part : undefined;
    const base = {
      text: String(c.text ?? ""),
      ...(typeof c.snapshot === "string" ? { snapshot: c.snapshot } : {}),
      ...(typeof c.quote === "string" ? { quote: c.quote } : {}),
      ...(piece ? { target: part ? `${piece}/${part}` : piece } : {}),
    };
    if (c.board === "plan") return { ...base, source: `content/${String(c.lessonId)}/plan.md` };
    const on = findBoard(ROOT, String(c.lessonId), Number(c.boardIndex));
    if (on === null) return base;
    const source = siteOf(ROOT, on, piece ?? null);
    return { ...base, board: on, ...(source ? { source } : {}) };
  };
  /** The older pages' changes, in today's terms. */
  const translate = (body: Record<string, unknown>): Change | null => {
    const id = String(body.id ?? "");
    if (body.op === "add" && body.comment !== undefined) {
      const c = body.comment as Record<string, unknown>;
      const isOld = c.lessonId !== undefined && c.board !== undefined && c.target === undefined;
      return { op: "add", comment: (isOld ? fromReviewPage(c) : c) as never };
    }
    if (body.op === "status") {
      if (body.status === "done" || body.status === "closed") return { op: "close", id };
      if (body.status === "declined" || body.status === "withdrawn") return { op: "withdraw", id };
      if (body.status === "open") return { op: "reopen", id };
      return null; // "approved": approval now happens in the agent's chat
    }
    if (body.op === "remove") return { op: "delete", id };
    return body as unknown as Change;
  };
  return {
    name: "chalk-dev-review",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/dev-review", (req, res) => {
        const send = (status: number, value: unknown) => {
          res.statusCode = status;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify(value));
        };
        if (req.method !== "POST") {
          const read = readComments(ROOT);
          return send(200, (req.url ?? "").includes("problems") ? read.problems : read.comments);
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          let change: Change | null;
          try {
            change = translate(JSON.parse(body) as Record<string, unknown>);
          } catch {
            return send(400, { ok: false, error: "not JSON" });
          }
          if (change === null) return send(200, { ok: true });
          const actor = req.headers["x-chalk-actor"] === "agent" ? Actor.Agent : Actor.Person;
          const applied = applyChange(ROOT, change, actor);
          send(applied.ok ? 200 : 409, { ...applied, comments: readComments(ROOT).comments });
          if (applied.ok) server.ws.send({ type: "custom", event: "chalk:comments" });
        });
      });
      // A comments file changed (by this server, or git): open previews reload their comments.
      const isComments = (file: string) => file.endsWith(`${sep}${COMMENTS_FILE}`);
      let timer: NodeJS.Timeout | undefined;
      const changed = (file: string) => {
        if (!isComments(file)) return;
        clearTimeout(timer);
        timer = setTimeout(() => server.ws.send({ type: "custom", event: "chalk:comments" }), 50);
      };
      server.watcher.add([
        join(ROOT, "content", "*", "*", COMMENTS_FILE),
        join(ROOT, "library", "props", "*", COMMENTS_FILE),
      ]);
      for (const event of ["change", "add", "unlink"] as const) server.watcher.on(event, changed);
    },
  };
}

/**
 * In development, the content rebuild runs inside the dev server (one watcher, one build/): every
 * save under content/ rebuilds what it touched, and open previews redraw (see devContent).
 * Whoever starts the dev server (the editor, the chalk MCP server, `pnpm dev`) gets it.
 */
function devRebuild(): Plugin {
  return {
    name: "chalk-dev-rebuild",
    apply: "serve",
    configureServer(server) {
      if (process.env.VITEST || process.env.CHALK_NO_REBUILD) return;
      const studio = join(ROOT, "platform", "studio");
      const child = spawn(
        join(studio, "node_modules", ".bin", "tsx"),
        [
          "--tsconfig",
          "../../tsconfig.base.json",
          "--import",
          "./src/content/record-imports.ts",
          "src/content/cli.ts",
          "preview",
        ],
        { cwd: studio, stdio: ["ignore", "inherit", "inherit"] },
      );
      const stop = () => {
        if (child.exitCode === null) child.kill();
      };
      server.httpServer?.on("close", stop);
      process.on("exit", stop);
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
    build: {
      rollupOptions: {
        output: {
          // Chapters ship as code: a chunk made only of content/ goes under assets/content/, kept
          // out of the install (below) and fetched the first time its chapter is opened.
          chunkFileNames: (chunk) =>
            chunk.moduleIds.length > 0 &&
            chunk.moduleIds.every((id) => id.startsWith(CONTENT_SOURCE))
              ? `${CONTENT_CHUNKS}[name]-[hash].js`
              : "assets/[name]-[hash].js",
        },
      },
    },
    define: { __CHALK__: JSON.stringify(chalk) },
    plugins: [
      devLog(),
      devRebuild(),
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
          globIgnores: [`${CONTENT_CHUNKS}**`],
          // The app's own code only: a chapter's pages and questions come from /content/ when the
          // chapter is opened, and are kept below. A bigger main script means content or a prop's
          // drawing code slipped back into it.
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//, /^\/content\//],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              // A chapter's code, named by its hash: kept the first time it is opened, like its files.
              urlPattern: ({ url }) => url.pathname.startsWith(`/${CONTENT_CHUNKS}`),
              handler: "CacheFirst",
              options: {
                cacheName: "chalk-content-code",
                expiration: { maxEntries: 5000, purgeOnQuotaError: true },
                cacheableResponse: { statuses: [200] },
              },
            },
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
      // One dev server for everything (the editor, the chalk MCP tools, the browser): a fixed
      // port, and never another one. A second start finds this one already there.
      port: DEV_PORT,
      strictPort: true,
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
