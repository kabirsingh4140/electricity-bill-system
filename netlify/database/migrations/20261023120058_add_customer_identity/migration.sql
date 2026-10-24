ALTER TABLE "customers" ADD COLUMN "identity_id" text;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_identity_id_key" UNIQUE("identity_id");