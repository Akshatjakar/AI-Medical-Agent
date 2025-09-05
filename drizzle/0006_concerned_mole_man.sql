CREATE TABLE "session_chat" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"created_by" text NOT NULL,
	"notes" text,
	"conversation" json DEFAULT '[]'::json NOT NULL,
	"report" json DEFAULT '{}'::json NOT NULL,
	"selected_doctor" json DEFAULT '{}'::json NOT NULL,
	"created_on" text NOT NULL
);
--> statement-breakpoint
DROP TABLE "sessionChatTable" CASCADE;