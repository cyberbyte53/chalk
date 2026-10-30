import type { Level } from "@chalk/content";
import type { z } from "zod";
import { type BoardKit, type BuiltBoard, type Child, buildBoard } from "./board";
import { camel } from "./page";
import { type Scene, isScene } from "./scene";

const FAMILY = Symbol("family");

/**
 * A question template in a chapter's question bank. Its folder's params.yaml holds the rows; each
 * row, checked against `params`, builds one question. The family never knows its folder.
 */
export type Family<Params extends z.ZodTypeAny = z.ZodTypeAny> = {
  readonly [FAMILY]: true;
  /** The level its questions have unless a row says otherwise. */
  readonly level: Level;
  /** The concepts its questions test, as folder names (the build turns them into ids). */
  readonly tests: readonly string[];
  /** What a row's `params` must look like; `decimal` turns "7.384" into an exact Dec. */
  readonly params: Params;
  /** One question's board, from one row's checked params. */
  readonly build: (params: z.output<Params>, name: string) => BuiltBoard;
};

/**
 * `tests` takes the chapter's generated enum: `tests: [Concept.SuccessiveMagnification]`, with
 * `import { Concept } from "../../concepts.gen"`. A concept renamed or dropped no longer compiles.
 */
export function family<Params extends z.ZodTypeAny, C extends string>(spec: {
  level: Level;
  tests: readonly [C, ...C[]];
  params: Params;
  /** One question's board: its pieces (and rules on `b`), or a scene on the event model. */
  build:
    | ((params: z.output<Params>, b: BoardKit) => readonly Child[])
    | ((params: z.output<Params>) => Scene);
}): Family<Params> {
  return {
    [FAMILY]: true,
    level: spec.level,
    tests: spec.tests,
    params: spec.params,
    build: (params, name) => {
      let made: Scene | undefined;
      const built = buildBoard(camel(name), (b) => {
        const out = (spec.build as (p: unknown, b: BoardKit) => readonly Child[] | Scene)(
          params,
          b,
        );
        if (isScene(out)) {
          made = out;
          return [];
        }
        return out;
      });
      return made === undefined ? built : made.build(camel(name));
    },
  };
}

export function isFamily(value: unknown): value is Family {
  return typeof value === "object" && value !== null && FAMILY in value;
}
