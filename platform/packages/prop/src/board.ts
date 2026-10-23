import { z } from "zod";
import { actionsFor, defineProp, set } from "./define";

/** Every board has one of these, named `board`. The board is a prop like any other. */
export const BOARD = "board";

export const BoardSignal = { Started: "started", Continued: "continued" } as const;
export type BoardSignal = (typeof BoardSignal)[keyof typeof BoardSignal];

export const BoardAction = {
  Pass: "pass",
  Show: "show",
  Hide: "hide",
  Continue: "continue",
} as const;
export type BoardAction = (typeof BoardAction)[keyof typeof BoardAction];

const boardState = z
  .object({
    /** The learner may move on: the Continue button is showing. */
    isPassed: z.boolean(),
    /** Names of props not shown right now. */
    hidden: z.array(z.string()),
  })
  .strict();
type BoardState = z.infer<typeof boardState>;

const act = actionsFor<BoardState>();
const named = z.object({ name: z.string().min(1) }).strict();

/** The board itself: shows and hides props, opens the way on, and says when it starts. */
export const boardProp = defineProp({
  type: BOARD,
  isExplainer: false,
  describe: "The board: which props are showing, and whether the learner may move on.",
  state: boardState,
  defaults: { isPassed: false, hidden: [] },
  actions: {
    [BoardAction.Pass]: act({
      describe: "Let the learner move on (shows Continue)",
      args: z.object({}).strict(),
      run: () => set({ isPassed: true }),
    }),
    [BoardAction.Show]: act({
      describe: "Show a hidden prop",
      args: named,
      run: (s, a) => set({ hidden: s.hidden.filter((n) => n !== a.name) }),
    }),
    [BoardAction.Hide]: act({
      describe: "Hide a prop",
      args: named,
      run: (s, a) => set({ hidden: s.hidden.includes(a.name) ? s.hidden : [...s.hidden, a.name] }),
    }),
    [BoardAction.Continue]: act({
      describe: "The learner pressed Continue",
      args: z.object({}).strict(),
      run: (s) => (s.isPassed ? set({}, { signal: BoardSignal.Continued }) : set({})),
    }),
  },
  signals: {
    [BoardSignal.Started]: { describe: "The board opened" },
    [BoardSignal.Continued]: { describe: "The learner pressed Continue", isCommit: true },
  },
});
