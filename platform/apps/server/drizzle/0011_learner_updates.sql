CREATE TABLE "learner_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"set" text NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"prompt_name" text NOT NULL,
	"prompt_hash" text NOT NULL,
	"prompt_text" text NOT NULL,
	"model" text NOT NULL,
	"points" jsonb NOT NULL,
	"requests" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "learner_updates" ADD CONSTRAINT "learner_updates_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_updates" ADD CONSTRAINT "learner_updates_prompt_text_texts_hash_fk" FOREIGN KEY ("prompt_text") REFERENCES "public"."texts"("hash") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "learner_updates_once" ON "learner_updates" USING btree ("account_id","set","prompt_hash");--> statement-breakpoint
CREATE INDEX "learner_updates_account_at" ON "learner_updates" USING btree ("account_id","at");