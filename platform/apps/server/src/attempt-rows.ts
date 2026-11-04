import { localizedSchema } from "@chalk/content";
import type { Attempt } from "@chalk/learning";
import type { attempts } from "./schema";

/** An attempt as its row holds it: what they answered (words in both languages) as JSON text. */
export const rowOf = (a: Attempt, accountId: string): typeof attempts.$inferInsert => ({
  ...a,
  accountId,
  at: new Date(a.at),
  chosen: a.chosen === null ? null : JSON.stringify(a.chosen),
});

/** An attempt from its row. */
export const attemptOf = ({ accountId: _, ...row }: typeof attempts.$inferSelect): Attempt => ({
  ...row,
  at: row.at.getTime(),
  chosen: row.chosen === null ? null : localizedSchema.parse(JSON.parse(row.chosen)),
});
