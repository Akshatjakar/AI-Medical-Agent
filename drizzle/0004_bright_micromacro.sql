ALTER TABLE "session_chat" DROP CONSTRAINT "session_chat_sessionId_unique";--> statement-breakpoint
ALTER TABLE "session_chat" DROP CONSTRAINT "session_chat_createdBy_users_id_fk";
--> statement-breakpoint
ALTER TABLE "session_chat" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "session_chat" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "session_chat_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "session_chat" ALTER COLUMN "conversation" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "session_chat" ADD COLUMN "session_id" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "session_chat" ADD COLUMN "selected_doctor" json;--> statement-breakpoint
ALTER TABLE "session_chat" ADD COLUMN "report" json;--> statement-breakpoint
ALTER TABLE "session_chat" ADD COLUMN "created_by" varchar(255);--> statement-breakpoint
ALTER TABLE "session_chat" ADD COLUMN "created_on" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "session_messages" ADD COLUMN "session_id" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "session_messages" ADD COLUMN "created_on" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "session_chat" ADD CONSTRAINT "session_chat_created_by_users_email_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_chat" DROP COLUMN "sessionId";--> statement-breakpoint
ALTER TABLE "session_chat" DROP COLUMN "selectedDoctor";--> statement-breakpoint
ALTER TABLE "session_chat" DROP COLUMN "createdBy";--> statement-breakpoint
ALTER TABLE "session_chat" DROP COLUMN "createdOn";--> statement-breakpoint
ALTER TABLE "session_messages" DROP COLUMN "sessionId";--> statement-breakpoint
ALTER TABLE "session_messages" DROP COLUMN "createdOn";--> statement-breakpoint
ALTER TABLE "session_chat" ADD CONSTRAINT "session_chat_session_id_unique" UNIQUE("session_id");