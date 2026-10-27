import { type BoardKit, type BuiltBoard, type Child, buildBoard } from "./board";
import { framesHere, siteFrom } from "./site";

const PAGE = Symbol("page");

/** A theory page: one board of explanation, worked example, animation or sandbox. */
export type Page = {
  readonly [PAGE]: true;
  readonly key: string;
  /** Where the page(...) call is: `content/<path>/overview.ts:12` (for editors; may be absent). */
  readonly site?: string;
  /** Every frame of the author's code the page(...) call was made through (see framesHere). */
  readonly stack?: readonly string[];
  readonly build: () => BuiltBoard;
};

const KEY = /^[a-z][a-z0-9-]*$/;

/** kebab-case → camelCase: "decimal-zoom" → "decimalZoom" (a board's name). */
export function camel(key: string): string {
  return key.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

/**
 * A theory page. `key` names it within its concept's overview (and with the concept's path decides
 * its id). It returns its pieces, top to bottom; it lets the learner go on when its questions are
 * all answered right (at once, with none), unless it says `b.passWhen(…)`.
 */
export function page(key: string, build: (b: BoardKit) => readonly Child[]): Page {
  if (!KEY.test(key)) throw new Error(`Page "${key}": use kebab-case, like decimal-zoom`);
  const stack = framesHere();
  const site = siteFrom(stack);
  return {
    [PAGE]: true,
    key,
    ...(site === undefined ? {} : { site }),
    ...(stack.length === 0 ? {} : { stack }),
    build: () => buildBoard(camel(key), build),
  };
}

export function isPage(value: unknown): value is Page {
  return typeof value === "object" && value !== null && PAGE in value;
}
