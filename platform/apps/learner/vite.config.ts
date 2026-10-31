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
import { ensureStudio } from "../../studio/start.mjs";

/** The one dev server's port (CHALK_DEV_PORT to change it). */
const DEV_PORT = Number(process.env.CHALK_DEV_PORT ?? 5173);

/** The repo's root, where the one .env lives (see .env.example). */
const ROOT = fileURLToPath(new URL("../../..", import.meta.url));
/** The commit build/ was made from (pnpm build-content writes it into build/index.json). */
function builtCommit(): string {
  try {
    const index = JSON.parse(readFileSync(join(ROOT, "build", "index.json"), "utf8"));
    return typeof index.commit === "string" ? index.commit : "unknown";
  } catch {
    return "unknown";
  }
}
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
 * In development, threads, approvals and plan state live in the studio service
 * (platform/studio/src/dev-endpoints.ts): /dev-review and /dev-pipeline are passed on to it, as
 * they are, and it is started first if it isn't running (platform/studio/start.mjs). Nothing of the
 * studio's code runs in this config, so this server can't fail to start because of it. If the
 * studio service can't come up, the page gets its log's last lines, not an empty view.
 *
 * A threads or reviews file that changes on disk (written by the studio service, or git) is pushed
 * to open previews at once (chalk:comments).
 */
function devStudio(): Plugin {
  const bodyOf = (req: IncomingMessage): Promise<string> =>
    new Promise((resolve) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => resolve(body));
    });
  const forward = async (req: IncomingMessage, res: ServerResponse) => {
    const send = (status: number, text: string) => {
      res.statusCode = status;
      res.setHeader("content-type", "application/json");
      res.end(text);
    };
    try {
      const base = await ensureStudio();
      const answer = await fetch(new URL(req.url ?? "/", base), {
        method: req.method ?? "GET",
        headers: { "content-type": "application/json" },
        ...(req.method === "POST" ? { body: await bodyOf(req) } : {}),
      });
      send(answer.status, await answer.text());
    } catch (error) {
      send(
        503,
        JSON.stringify({
          ok: false,
          error: String(error instanceof Error ? error.message : error),
        }),
      );
    }
  };
  return {
    name: "chalk-dev-studio",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        if (
          url.startsWith("/dev-review") ||
          url.startsWith("/dev-pipeline") ||
          url.startsWith("/dev-voice")
        )
          void forward(req, res);
        else next();
      });
      const isThreads = (file: string) =>
        file.endsWith(`${sep}comments.yaml`) ||
        (file.includes(`${sep}authoring${sep}reviews${sep}`) && file.endsWith(".yaml"));
      let timer: NodeJS.Timeout | undefined;
      const changed = (file: string) => {
        if (!isThreads(file)) return;
        clearTimeout(timer);
        timer = setTimeout(() => server.ws.send({ type: "custom", event: "chalk:comments" }), 50);
      };
      server.watcher.add([
        join(ROOT, "authoring", "books", "*", "*", "comments.yaml"),
        join(ROOT, "authoring", "props", "*", "comments.yaml"),
        join(ROOT, "authoring", "reviews", "*.yaml"),
      ]);
      for (const event of ["change", "add", "unlink"] as const) server.watcher.on(event, changed);
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
    commit: builtCommit(),
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
