ALTER TABLE "sessionChatTable" DROP CONSTRAINT "sessionChatTable_createdBy_users_email_fk";
--> statement-breakpoint
ALTER TABLE "sessionChatTable" ALTER COLUMN "selected_doctor" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "sessionChatTable" ALTER COLUMN "selected_doctor" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sessionChatTable" ADD COLUMN "session_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "sessionChatTable" ADD COLUMN "created_by" varchar;--> statement-breakpoint
ALTER TABLE "sessionChatTable" ADD COLUMN "created_on" varchar;--> statement-breakpoint
ALTER TABLE "sessionChatTable" ADD CONSTRAINT "sessionChatTable_created_by_users_email_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessionChatTable" DROP COLUMN "sessionId";--> statement-breakpoint
ALTER TABLE "sessionChatTable" DROP COLUMN "createdBy";--> statement-breakpoint
ALTER TABLE "sessionChatTable" DROP COLUMN "createdOn";