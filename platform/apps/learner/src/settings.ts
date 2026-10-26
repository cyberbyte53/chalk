/** Set by vite.config.ts from the repo's .env when the app is built. */
declare const __CHALK__: {
  /** The commit the app and its content were built from (build/index.json); `-dirty` locally. */
  commit: string;
  googleClientId: string;
  /** Development only: a sign-in by name, without Google (the server must allow it too). */
  isDevSignIn: boolean;
  /**
   * Whether the app shows Jugnu (JUGNU_PROVIDER isn't "off"); his model is the server's. In
   * development, `devModels` are the models the dev shell can run him on, on this device, through
   * Vite's proxies (the .env's own at /dev-model; Claude's at /dev-anthropic).
   */
  jugnu: { isOn: boolean; devModels: DevModel[] };
};

/** A model the dev shell can switch Jugnu to. */
export type DevModel = {
  id: string;
  provider: "openai-compatible" | "anthropic";
  /** The Vite proxy that adds its key. */
  path: string;
  model: string;
  think: boolean;
};

export const settings = __CHALK__;
