CREATE TABLE "board_facts" (
	"account_id" uuid NOT NULL,
	"board" text NOT NULL,
	"passed_at" timestamp with time zone,
	"first_at" timestamp with time zone,
	"first_is_right" boolean,
	CONSTRAINT "board_facts_account_id_board_pk" PRIMARY KEY("account_id","board")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"account_id" uuid NOT NULL,
	"id" text NOT NULL,
	"schema_version" integer NOT NULL,
	"session" text NOT NULL,
	"seq" integer NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"commit" text NOT NULL,
	"actor" text NOT NULL,
	"opening" text,
	"board" text,
	"version" text,
	"node" text,
	"kind" text NOT NULL,
	"payload" jsonb NOT NULL,
	CONSTRAINT "events_account_id_id_pk" PRIMARY KEY("account_id","id")
);
--> statement-breakpoint
ALTER TABLE "board_facts" ADD CONSTRAINT "board_facts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_account_order" ON "events" USING btree ("account_id","session","seq");--> statement-breakpoint
CREATE INDEX "events_account_time" ON "events" USING btree ("account_id","at");--> statement-breakpoint
CREATE INDEX "events_board" ON "events" USING btree ("board");