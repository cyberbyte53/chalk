CREATE TABLE "jugnu_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"board" text NOT NULL,
	"version" text NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jugnu_notes" ADD CONSTRAINT "jugnu_notes_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "jugnu_notes_account_at" ON "jugnu_notes" USING btree ("account_id","at");