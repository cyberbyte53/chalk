import { z } from "zod";

/**
 * The board model as render_board returns it: its output schema, and what the preview's
 * `__chalkModel` is read as (made by @chalk/player's board-model.ts, in the page).
 */
export const pieceSchema = z.object({
  name: z.string(),
  prop: z.string(),
  source: z.string().optional().describe("Where the piece is placed: file:line."),
  isShown: z.boolean(),
  summary: z.string(),
  layers: z.array(z.string()).optional().describe("A host's layers that are on."),
  children: z
    .array(z.object({ name: z.string(), prop: z.string() }))
    .optional()
    .describe("A composite's children, top to bottom."),
  setup: z.record(z.unknown()).describe("Fixed where placed: nothing on this board changes them."),
  live: z
    .record(z.unknown())
    .describe("Can change on this board (learner, rules, IS), and derived values that follow."),
  elements: z.array(
    z.object({
      id: z.string().describe("What steps, comments and Jugnu call it: piece › id."),
      value: z.unknown().optional(),
      words: z.string().optional().describe("How the screen writes it."),
      does: z.union([z.string(), z.array(z.string())]).optional(),
      drawnAt: z.string().optional().describe("file:line of its drawing."),
    }),
  ),
  studentCan: z.array(
    z.object({
      action: z.string(),
      via: z.array(z.string()),
      takes: z.unknown(),
      codeAt: z.string().optional().describe("file:line of the action."),
    }),
  ),
  noControlNow: z.array(z.string()).optional(),
  hidden: z.record(z.unknown()).optional(),
  problems: z.array(z.string()),
});

export const boardModelSchema = z.object({
  board: z.string(),
  isPassed: z.boolean(),
  isQuestionOpen: z.boolean(),
  pieces: z.array(pieceSchema),
});
export type BoardModel = z.infer<typeof boardModelSchema>;
