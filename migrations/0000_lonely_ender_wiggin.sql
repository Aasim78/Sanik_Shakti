CREATE TABLE "aadhaar_verification_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"aadhaar_number" text,
	"verification_type" text,
	"verification_status" text,
	"error_message" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now(),
	"txn_id" text
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"scheme_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" integer,
	"comments" text
);
--> statement-breakpoint
CREATE TABLE "grievances" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"category" text NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"priority" text NOT NULL,
	"status" text DEFAULT 'filed' NOT NULL,
	"filed_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" integer,
	"resolution" text
);
--> statement-breakpoint
CREATE TABLE "schemes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"amount" integer NOT NULL,
	"eligibility" text NOT NULL,
	"deadline" text NOT NULL,
	"processing_time" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"max_beneficiaries" integer,
	"current_beneficiaries" integer DEFAULT 0,
	"required_documents" text[],
	"application_process" text NOT NULL,
	"benefits" text NOT NULL,
	"funding_source" text,
	"contact_person" text,
	"contact_email" text,
	"contact_phone" text,
	"tags" text[],
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"last_updated" timestamp DEFAULT now(),
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE "sos_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"emergency_type" text NOT NULL,
	"message" text,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"acknowledged_at" timestamp,
	"acknowledged_by" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"service_number" text,
	"role" text NOT NULL,
	"aadhaar_number" text,
	"aadhaar_verified" boolean DEFAULT false,
	"last_verification_date" timestamp,
	"verification_method" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_service_number_unique" UNIQUE("service_number"),
	CONSTRAINT "users_aadhaar_number_unique" UNIQUE("aadhaar_number")
);
--> statement-breakpoint
ALTER TABLE "aadhaar_verification_logs" ADD CONSTRAINT "aadhaar_verification_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schemes" ADD CONSTRAINT "schemes_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;