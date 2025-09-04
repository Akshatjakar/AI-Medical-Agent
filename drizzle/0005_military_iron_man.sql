CREATE TABLE "sessionChatTable" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sessionChatTable_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sessionId" varchar NOT NULL,
	"notes" text,
	"selectedDoctor" json,
	"conversation" json,
	"report" json,
	"createdBy" varchar,
	"createdOn" varchar
);
--> statement-breakpoint
ALTER TABLE "session_chat" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "session_chat" CASCADE;--> statement-breakpoint
ALTER TABLE "session_messages" ALTER COLUMN "session_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session_messages" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session_messages" ALTER COLUMN "created_on" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session_messages" ALTER COLUMN "created_on" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "session_messages" ALTER COLUMN "created_on" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "credits" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sessionChatTable" ADD CONSTRAINT "sessionChatTable_createdBy_users_email_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;