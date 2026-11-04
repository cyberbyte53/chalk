-- Attempts are worked out from the events (computed): cleared here, worked out again by
-- `pnpm --filter @chalk/server work-out` (or on the learner's next upload), now with their opening.
DELETE FROM "attempts";--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "opening" text NOT NULL;
