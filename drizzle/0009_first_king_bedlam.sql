CREATE TABLE "session_chat_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "session_chat_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"session_id" varchar NOT NULL,
	"notes" text,
	"selected_doctor" json,
	"conversation" json,
	"report" json,
	"created_by" varchar,
	"created_on" varchar
);
--> statement-breakpoint
DROP TABLE "sessionChatTable" CASCADE;--> statement-breakpoint
ALTER TABLE "session_chat_table" ADD CONSTRAINT "session_chat_table_created_by_users_email_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;