import type { PropModule } from "@chalk/player";
import { basicProps } from "@chalk/prop-basics";
import { coordinateProps } from "@chalk/prop-coordinates";

/**
 * Every prop with its view, loaded now: for Node (the server's copy of a board for Jugnu, the content
 * build, tests), where describing a prop means drawing it. The app loads views with chapters
 * instead (`propLibrary`).
 */
export const propModules: Readonly<Record<string, PropModule>> = Object.fromEntries(
  [...basicProps, ...coordinateProps].map((m) => [m.def.type, m] as const),
);
