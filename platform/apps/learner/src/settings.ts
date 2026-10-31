/** Set by vite.config.ts from the repo's .env when the app is built. */
declare const __CHALK__: {
  /** The commit the app and its content were built from (build/index.json); `-dirty` locally. */
  commit: string;
  googleClientId: string;
  /** Development only: a sign-in by name, without Google (the server must allow it too). */
  isDevSignIn: boolean;
};

export const settings = __CHALK__;
