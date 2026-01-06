-- Add emailVerificationTokenExpiry to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerificationTokenExpiry" TIMESTAMP(3);

-- CreateEnum for KeepsakeStatus (if not exists)
DO $$ BEGIN
    CREATE TYPE "KeepsakeStatus" AS ENUM ('draft', 'scheduled', 'delivered');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for TriggerCondition (if not exists)
DO $$ BEGIN
    CREATE TYPE "TriggerCondition" AS ENUM ('on_death', 'on_date', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for MediaType (if not exists)
DO $$ BEGIN
    CREATE TYPE "MediaType" AS ENUM ('image', 'video', 'document');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to Keepsake
ALTER TABLE "Keepsake" ADD COLUMN IF NOT EXISTS "status" "KeepsakeStatus" NOT NULL DEFAULT 'draft';
ALTER TABLE "Keepsake" ADD COLUMN IF NOT EXISTS "triggerCondition" "TriggerCondition" NOT NULL DEFAULT 'on_death';
ALTER TABLE "Keepsake" ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3);
ALTER TABLE "Keepsake" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);
ALTER TABLE "Keepsake" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- CreateTable for KeepsakeMedia
CREATE TABLE IF NOT EXISTS "KeepsakeMedia" (
    "id" TEXT NOT NULL,
    "keepsakeId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "key" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeepsakeMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for KeepsakeMedia (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS "KeepsakeMedia_key_key" ON "KeepsakeMedia"("key");
CREATE INDEX IF NOT EXISTS "KeepsakeMedia_keepsakeId_idx" ON "KeepsakeMedia"("keepsakeId");

-- CreateIndex for Keepsake deletedAt (if not exists)
CREATE INDEX IF NOT EXISTS "Keepsake_deletedAt_idx" ON "Keepsake"("deletedAt");

-- AddForeignKey for KeepsakeMedia (if not exists)
DO $$ BEGIN
    ALTER TABLE "KeepsakeMedia" ADD CONSTRAINT "KeepsakeMedia_keepsakeId_fkey" FOREIGN KEY ("keepsakeId") REFERENCES "Keepsake"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
