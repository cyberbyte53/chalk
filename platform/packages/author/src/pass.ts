/**
 * When a page written before `passWhen` lets the learner go on: at once (reading), or when its own
 * rules say `pass`. A page that returns a list never says: it passes on its questions or `passWhen`.
 */
export const PassOn = { Start: "start", Rules: "rules" } as const;
export type PassOn = (typeof PassOn)[keyof typeof PassOn];
