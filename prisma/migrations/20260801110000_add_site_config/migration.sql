-- CreateTable
CREATE TABLE IF NOT EXISTS "site_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

-- Seed default row
INSERT INTO "site_config" ("id", "isActive", "updatedAt")
VALUES (1, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
