import { type BoardKit, type BuiltBoard, type Child, buildBoard } from "./board";
import { PassOn } from "./pass";
import { siteHere } from "./site";

export { PassOn };

const PAGE = Symbol("page");

/** A theory page: one board of explanation, worked example, animation or sandbox. */
export type Page = {
  readonly [PAGE]: true;
  readonly key: string;
  /** Where the page(...) call is: `content/<path>/overview.ts:12` (for editors; may be absent). */
  readonly site?: string;
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
 * all answered right (at once, with none), unless it says `b.passWhen(…)`. (A page returning one
 * piece is the older shape: it goes on at once unless `passOn: PassOn.Rules`.)
 */
export function page(
  key: string,
  build: (b: BoardKit) => Child | readonly Child[],
  options: { passOn?: PassOn } = {},
): Page {
  if (!KEY.test(key)) throw new Error(`Page "${key}": use kebab-case, like decimal-zoom`);
  const site = siteHere();
  return {
    [PAGE]: true,
    key,
    ...(site === undefined ? {} : { site }),
    build: () =>
      buildBoard(camel(key), (b) => {
        b.setPassOn(options.passOn);
        return build(b);
      }),
  };
}

export function isPage(value: unknown): value is Page {
  return typeof value === "object" && value !== null && PAGE in value;
}
