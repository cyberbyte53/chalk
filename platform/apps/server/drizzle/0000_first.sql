CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_sub" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"picture" text,
	"role" text,
	"school_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"set_up_at" timestamp with time zone,
	CONSTRAINT "accounts_google_sub_unique" UNIQUE("google_sub"),
	CONSTRAINT "accounts_role" CHECK ("accounts"."role" in ('learner', 'teacher'))
);
--> statement-breakpoint
CREATE TABLE "events" (
	"account_id" uuid NOT NULL,
	"id" text NOT NULL,
	"session_id" text NOT NULL,
	"seq" integer NOT NULL,
	"produced_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor" text NOT NULL,
	"machine_type" text NOT NULL,
	"machine_id" text NOT NULL,
	"lesson_id" text,
	"body" jsonb NOT NULL,
	CONSTRAINT "events_account_id_id_pk" PRIMARY KEY("account_id","id")
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"course_id" text NOT NULL,
	"join_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "groups_join_code_unique" UNIQUE("join_code")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"group_id" uuid NOT NULL,
	"learner_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"removed_at" timestamp with time zone,
	CONSTRAINT "members_group_id_learner_id_pk" PRIMARY KEY("group_id","learner_id")
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "schools_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sign_ins" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"account_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_teacher_id_accounts_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_learner_id_accounts_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sign_ins" ADD CONSTRAINT "sign_ins_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_account_time" ON "events" USING btree ("account_id","produced_at");--> statement-breakpoint
CREATE INDEX "groups_teacher" ON "groups" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "members_learner" ON "members" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "sign_ins_account" ON "sign_ins" USING btree ("account_id");