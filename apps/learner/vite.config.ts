import { type UserConfig, defineConfig, loadEnv } from "vite";

/**
 * Jugnu's model, from the environment or apps/learner/.env (see .env.example). The browser only
 * ever calls /jugnu-model; this dev server passes it on to the model server and adds the key, so a
 * key never reaches the browser.
 */
export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, new URL(".", import.meta.url).pathname, "JUGNU_");
  // DeepSeek Flash unless .env says otherwise (see .env.example).
  const server = env.JUGNU_MODEL_SERVER ?? "https://api.deepseek.com";
  const jugnu = {
    provider: env.JUGNU_PROVIDER ?? "openai-compatible",
    model: env.JUGNU_MODEL ?? "deepseek-flash",
    think: env.JUGNU_THINK === "on",
  };
  const headers: Record<string, string> =
    env.JUGNU_API_KEY === undefined || env.JUGNU_API_KEY === ""
      ? {}
      : { authorization: `Bearer ${env.JUGNU_API_KEY}` };
  return {
    // JSX is compiled by esbuild straight to Preact; no Babel, no plugin.
    esbuild: { jsx: "automatic", jsxImportSource: "preact" },
    define: { __JUGNU__: JSON.stringify(jugnu) },
    server: {
      fs: { allow: ["../.."] },
      proxy: {
        "/jugnu-model": {
          target: server,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/jugnu-model/, ""),
          headers,
          // Say why in the chat, not only in this terminal.
          configure: (proxy) => {
            proxy.on("error", (error, _request, response) => {
              if (!("writeHead" in response) || response.headersSent) return;
              response.writeHead(502, { "content-type": "application/json" });
              response.end(
                JSON.stringify({
                  error: `can't reach the model server at ${server}: ${error.message}`,
                }),
              );
            });
          },
        },
      },
    },
  };
});
