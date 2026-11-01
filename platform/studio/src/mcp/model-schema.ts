import { z } from "zod";

/**
 * The board's snapshot as the page gives it: what the preview's
 * `__chalkModel` is read as (made by @chalk/player's snapshot.ts, in the page). The same snapshot
 * Jugnu and tests read; show adds where things are written (file:line).
 */
const partSchema = z.object({
  path: z.string().describe("Its address: what steps, comments and Jugnu call it."),
  value: z.unknown().optional(),
  words: z.string().optional().describe("How the screen writes it."),
  does: z.union([z.string(), z.array(z.string())]).optional(),
  args: z.record(z.unknown()).optional().describe("What the input sends when pressed."),
  isByHand: z.literal(true).optional().describe("The input works out what it sends when used."),
  isOff: z.literal(true).optional().describe("The input is drawn, but off now."),
  drawnAt: z.string().optional().describe("file:line of its drawing."),
});

const canSchema = z.object({
  action: z.string(),
  takes: z.unknown(),
  who: z.array(z.enum(["learner", "lesson"])),
  via: z.array(z.string()).describe("The controls that reach it, by address."),
  codeAt: z.string().optional().describe("file:line of the action."),
});

export type NodeShape = {
  path: string;
  prop: string;
  source?: string;
  isShown: boolean;
  summary: string;
  setup: Record<string, unknown>;
  given: string[];
  live: Record<string, unknown>;
  atStart?: string[];
  bound: Record<string, { value?: unknown; from: string[] }>;
  parts: z.infer<typeof partSchema>[];
  can: z.infer<typeof canSchema>[];
  hidden?: Record<string, unknown>;
  noControlNow?: string[];
  problems: string[];
};

export const nodeSchema: z.ZodType<NodeShape> = z.lazy(() =>
  z.object({
    path: z.string(),
    prop: z.string(),
    source: z.string().optional().describe("Where the piece is placed: file:line."),
    isShown: z.boolean(),
    summary: z.string(),
    setup: z
      .record(z.unknown())
      .describe("Fixed where placed: nothing on this board changes them."),
    given: z.array(z.string()).describe("The setup fields the board gave; the rest are defaults."),
    live: z
      .record(z.unknown())
      .describe("Can change on this board (learner, rules), and derived values that follow."),
    atStart: z
      .array(z.string())
      .optional()
      .describe("The fields of live still at the prop's own start."),
    bound: z
      .record(z.object({ value: z.unknown().optional(), from: z.array(z.string()) }))
      .describe(
        "Worked out from other values (by its group or the board's rules), with where from.",
      ),
    parts: z.array(partSchema),
    can: z.array(canSchema),
    hidden: z.record(z.unknown()).optional(),
    children: z.array(nodeSchema).optional(),
    noControlNow: z.array(z.string()).optional(),
    problems: z.array(z.string()),
  }),
);

export const boardModelSchema = z.object({
  board: z.string(),
  isPassed: z.boolean(),
  openQuestion: z.string().optional(),
  nodes: z.array(nodeSchema),
});
export type BoardModel = z.infer<typeof boardModelSchema>;
