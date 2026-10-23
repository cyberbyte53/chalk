import { z } from "zod";

/** The server's settings, all from the environment (a `.env` on the box, never in git). */
export const configSchema = z.object({
  DATABASE_URL: z.string().min(1),
  /** The OAuth Web client id from Google Cloud; sign-in tokens must be made for it. */
  GOOGLE_CLIENT_ID: z.string().min(1),
  /** Where the app is served from, e.g. https://chalk1.centralindia.cloudapp.azure.com. */
  ORIGIN: z.string().url(),
  PORT: z.coerce.number().int().positive().default(8080),
  /** The built learner app (apps/learner/dist); unset in development, where Vite serves it. */
  STATIC_DIR: z.string().optional(),
  /** The built content's index, for the courses a group may be for. */
  CONTENT_INDEX: z.string().default("../../../build/index.json"),
  /** The built content the app fetches from /content/; by default the index's own folder. */
  CONTENT_DIR: z.string().optional(),
  /** Jugnu's model API: "openai-compatible" (DeepSeek, Foundry) or "anthropic" (Claude). */
  JUGNU_PROVIDER: z.enum(["openai-compatible", "anthropic", "ollama"]).default("openai-compatible"),
  /**
   * Jugnu's model server (base URL without /v1, e.g. https://api.anthropic.com), its key and model;
   * without a server and a model, Jugnu is off.
   */
  JUGNU_MODEL_SERVER: z.string().url().optional(),
  JUGNU_API_KEY: z.string().optional(),
  JUGNU_MODEL: z.string().optional(),
  /** "on": the model thinks before answering (slower, often better). */
  JUGNU_THINK: z.enum(["on", "off"]).default("off"),
  /** "on": sign in as anyone with "dev:<id>:<name>", for trying the app on a laptop. Localhost only. */
  DEV_SIGN_IN: z.enum(["on", "off"]).default("off"),
});
export type Config = z.infer<typeof configSchema>;

export function readConfig(env: NodeJS.ProcessEnv): Config {
  const parsed = configSchema.safeParse(env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Server settings are wrong:\n  ${problems.join("\n  ")}`);
  }
  const config = parsed.data;
  const host = new URL(config.ORIGIN).hostname;
  if (config.DEV_SIGN_IN === "on" && host !== "localhost" && host !== "127.0.0.1")
    throw new Error(`DEV_SIGN_IN is only for localhost, not ${config.ORIGIN}`);
  return config;
}
