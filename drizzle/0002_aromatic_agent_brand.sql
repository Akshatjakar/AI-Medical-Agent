CREATE TABLE "session_chat" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "session_chat_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sessionId" varchar(100) NOT NULL,
	"notes" text,
	"selectedDoctor" json,
	"conversation" json,
	"createdBy" integer,
	"createdOn" timestamp DEFAULT now(),
	CONSTRAINT "session_chat_sessionId_unique" UNIQUE("sessionId")
);
--> statement-breakpoint
ALTER TABLE "payments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sessionChatTable" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscriptions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "payments" CASCADE;--> statement-breakpoint
DROP TABLE "sessionChatTable" CASCADE;--> statement-breakpoint
DROP TABLE "subscriptions" CASCADE;--> statement-breakpoint
ALTER TABLE "session_messages" ALTER COLUMN "role" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "credits" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "session_messages" ADD COLUMN "sessionId" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "session_messages" ADD COLUMN "createdOn" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "session_chat" ADD CONSTRAINT "session_chat_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_messages" DROP COLUMN "session_id";--> statement-breakpoint
ALTER TABLE "session_messages" DROP COLUMN "created_on";