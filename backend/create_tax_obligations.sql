CREATE TABLE IF NOT EXISTS "TaxObligations" (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "TaxType" integer NOT NULL,
    "Year" integer NOT NULL,
    "Month" integer NOT NULL,
    "AmountDue" numeric NOT NULL,
    "AmountPaid" numeric NOT NULL,
    "DueDate" timestamp with time zone NULL,
    "Note" text NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_TaxObligations" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_TaxObligations_Tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES "Tenants" ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_TaxObligations_TenantId" ON "TaxObligations" ("TenantId");
