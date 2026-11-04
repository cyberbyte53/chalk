ALTER TABLE "learner_updates" ADD COLUMN "set_finished_at" timestamp with time zone;--> statement-breakpoint
UPDATE "learner_updates" u SET "set_finished_at" = coalesce((SELECT max(e."at") FROM "events" e WHERE e."account_id" = u."account_id" AND e."kind" = 'set' AND e."payload"->>'what' = 'finished' AND e."payload"->>'set' = u."set"), u."at");--> statement-breakpoint
ALTER TABLE "learner_updates" ALTER COLUMN "set_finished_at" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "learner_updates_account_finished" ON "learner_updates" USING btree ("account_id","set_finished_at");
