CREATE TABLE "attempts" (
	"account_id" uuid NOT NULL,
	"board" text NOT NULL,
	"node" text NOT NULL,
	"nth" integer NOT NULL,
	"version" text NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"is_right" boolean NOT NULL,
	"is_graded" boolean NOT NULL,
	"chosen" text,
	"tests" text[] NOT NULL,
	"level" text,
	"mode" text,
	"helped" boolean NOT NULL,
	CONSTRAINT "attempts_account_id_board_node_nth_pk" PRIMARY KEY("account_id","board","node","nth")
);
--> statement-breakpoint
CREATE TABLE "mastery" (
	"account_id" uuid NOT NULL,
	"concept" text NOT NULL,
	"model" text NOT NULL,
	"estimate" real NOT NULL,
	"low" real NOT NULL,
	"high" real NOT NULL,
	"band" text NOT NULL,
	"tries" integer NOT NULL,
	"last_at" timestamp with time zone NOT NULL,
	CONSTRAINT "mastery_account_id_concept_model_pk" PRIMARY KEY("account_id","concept","model")
);
--> statement-breakpoint
CREATE TABLE "question_versions" (
	"board" text NOT NULL,
	"version" text NOT NULL,
	"tests" text[] NOT NULL,
	"level" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_versions_board_version_pk" PRIMARY KEY("board","version")
);
--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mastery" ADD CONSTRAINT "mastery_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;