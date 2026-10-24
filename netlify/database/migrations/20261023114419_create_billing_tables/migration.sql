CREATE TABLE "bills" (
	"id" text PRIMARY KEY,
	"customer_id" text NOT NULL,
	"period" text NOT NULL,
	"previous" integer NOT NULL,
	"current" integer NOT NULL,
	"rate" integer NOT NULL,
	"amount" integer NOT NULL,
	"paid_at" timestamp,
	CONSTRAINT "bills_customer_id_period_unique" UNIQUE("customer_id","period")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"type" text NOT NULL,
	"reading" integer DEFAULT 0 NOT NULL,
	"demo" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");
--> statement-breakpoint
INSERT INTO customers (id,name,address,type,reading,demo) VALUES
('C1001','Aarav Sharma','24, Model Town, Delhi','Residential',1482,1),
('C1002','Meera Patel','18, Green Park, Delhi','Residential',2165,1),
('C1003','Verma General Store','7, Market Road, Delhi','Commercial',4890,1),
('C1004','Riya Malhotra','42, Ashok Vihar, Delhi','Residential',1856,1),
('C1005','Sunrise Print House','12, Station Road, Delhi','Commercial',6248,1);
--> statement-breakpoint
INSERT INTO bills (id,customer_id,period,previous,current,rate,amount,paid_at) VALUES
('EB-1001','C1001','2026-10',1240,1482,5,1210,NULL),
('EB-1002','C1002','2026-10',1978,2165,5,935,'2026-10-18T10:30:00Z'),
('EB-1003','C1003','2026-10',4375,4890,8,4120,NULL),
('EB-1004','C1004','2026-10',1648,1856,5,1040,'2026-10-20T09:15:00Z'),
('EB-1005','C1005','2026-10',5830,6248,8,3344,NULL);
