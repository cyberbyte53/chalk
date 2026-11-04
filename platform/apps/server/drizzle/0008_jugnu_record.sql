CREATE TABLE "jugnu_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"opening" text NOT NULL,
	"board" text NOT NULL,
	"version" text NOT NULL,
	"commit" text NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"prompt_name" text NOT NULL,
	"prompt_hash" text NOT NULL,
	"prompt_text" text NOT NULL,
	"lesson_text" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"last_turn_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"ended_by" text,
	"cursor" jsonb
);
--> statement-breakpoint
CREATE TABLE "jugnu_messages" (
	"conversation_id" uuid NOT NULL,
	"n" integer NOT NULL,
	"turn_id" uuid NOT NULL,
	"message" jsonb NOT NULL,
	CONSTRAINT "jugnu_messages_conversation_id_n_pk" PRIMARY KEY("conversation_id","n")
);
--> statement-breakpoint
CREATE TABLE "jugnu_turns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"n" integer NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"ms" integer NOT NULL,
	"requests" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "texts" (
	"hash" text PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jugnu_conversations" ADD CONSTRAINT "jugnu_conversations_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jugnu_conversations" ADD CONSTRAINT "jugnu_conversations_prompt_text_texts_hash_fk" FOREIGN KEY ("prompt_text") REFERENCES "public"."texts"("hash") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jugnu_conversations" ADD CONSTRAINT "jugnu_conversations_lesson_text_texts_hash_fk" FOREIGN KEY ("lesson_text") REFERENCES "public"."texts"("hash") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jugnu_messages" ADD CONSTRAINT "jugnu_messages_conversation_id_jugnu_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."jugnu_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jugnu_messages" ADD CONSTRAINT "jugnu_messages_turn_id_jugnu_turns_id_fk" FOREIGN KEY ("turn_id") REFERENCES "public"."jugnu_turns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jugnu_turns" ADD CONSTRAINT "jugnu_turns_conversation_id_jugnu_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."jugnu_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "jugnu_conversations_account_opening" ON "jugnu_conversations" USING btree ("account_id","opening");--> statement-breakpoint
CREATE INDEX "jugnu_conversations_open" ON "jugnu_conversations" USING btree ("ended_at","last_turn_at");--> statement-breakpoint
CREATE UNIQUE INDEX "jugnu_turns_conversation_n" ON "jugnu_turns" USING btree ("conversation_id","n");