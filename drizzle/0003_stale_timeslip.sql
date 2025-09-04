ALTER TABLE "session_chat" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "session_chat" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "session_chat" ALTER COLUMN "conversation" SET DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "session_chat" ALTER COLUMN "createdBy" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP IDENTITY;