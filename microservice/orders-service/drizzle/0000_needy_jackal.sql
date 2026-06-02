CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"menu_item_id" integer NOT NULL,
	"item_name" varchar(120) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"requested_by" varchar(120) NOT NULL,
	"payment_status" varchar(30) DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
