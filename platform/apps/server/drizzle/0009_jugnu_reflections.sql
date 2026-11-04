CREATE TABLE "jugnu_reflections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"turn_id" uuid NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"prompt_name" text NOT NULL,
	"prompt_hash" text NOT NULL,
	"prompt_text" text NOT NULL,
	"model" text NOT NULL,
	"points" text[] NOT NULL,
	"got_there" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jugnu_turns" ADD COLUMN "kind" text DEFAULT 'reply' NOT NULL;--> statement-breakpoint
ALTER TABLE "jugnu_reflections" ADD CONSTRAINT "jugnu_reflections_conversation_id_jugnu_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."jugnu_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jugnu_reflections" ADD CONSTRAINT "jugnu_reflections_turn_id_jugnu_turns_id_fk" FOREIGN KEY ("turn_id") REFERENCES "public"."jugnu_turns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jugnu_reflections" ADD CONSTRAINT "jugnu_reflections_prompt_text_texts_hash_fk" FOREIGN KEY ("prompt_text") REFERENCES "public"."texts"("hash") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "jugnu_reflections_conversation" ON "jugnu_reflections" USING btree ("conversation_id");