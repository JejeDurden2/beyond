/*
  Warnings:

  - A unique constraint covering the columns `[invitationToken]` on the table `Beneficiary` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('VAULT_OWNER', 'BENEFICIARY', 'BOTH');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'VIEWED', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('trusted_person_alert', 'beneficiary_invitation', 'account_creation');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'scheduled', 'sent', 'failed', 'cancelled');

-- AlterTable
ALTER TABLE "Beneficiary" ADD COLUMN     "beneficiaryProfileId" TEXT,
ADD COLUMN     "invitationAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "invitationSentAt" TIMESTAMP(3),
ADD COLUMN     "invitationToken" TEXT,
ADD COLUMN     "isTrustedPerson" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'VAULT_OWNER';

-- CreateTable
CREATE TABLE "BeneficiaryProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeneficiaryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeneficiaryInvitation" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "keepsakeId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "resentBy" TEXT,
    "resentAt" TIMESTAMP(3),
    "resentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeneficiaryInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeneficiaryPortalAccess" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "keepsakeId" TEXT,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeneficiaryPortalAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationConfig" (
    "id" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "trustedPersonDelayHours" INTEGER NOT NULL DEFAULT 72,
    "beneficiaryDelayHours" INTEGER NOT NULL DEFAULT 168,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "keepsakeId" TEXT NOT NULL,
    "beneficiaryId" TEXT,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'pending',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BeneficiaryProfile_userId_key" ON "BeneficiaryProfile"("userId");

-- CreateIndex
CREATE INDEX "BeneficiaryProfile_userId_idx" ON "BeneficiaryProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BeneficiaryInvitation_token_key" ON "BeneficiaryInvitation"("token");

-- CreateIndex
CREATE INDEX "BeneficiaryInvitation_token_idx" ON "BeneficiaryInvitation"("token");

-- CreateIndex
CREATE INDEX "BeneficiaryInvitation_beneficiaryId_idx" ON "BeneficiaryInvitation"("beneficiaryId");

-- CreateIndex
CREATE INDEX "BeneficiaryInvitation_keepsakeId_idx" ON "BeneficiaryInvitation"("keepsakeId");

-- CreateIndex
CREATE INDEX "BeneficiaryInvitation_status_idx" ON "BeneficiaryInvitation"("status");

-- CreateIndex
CREATE INDEX "BeneficiaryPortalAccess_beneficiaryId_idx" ON "BeneficiaryPortalAccess"("beneficiaryId");

-- CreateIndex
CREATE INDEX "BeneficiaryPortalAccess_keepsakeId_idx" ON "BeneficiaryPortalAccess"("keepsakeId");

-- CreateIndex
CREATE INDEX "BeneficiaryPortalAccess_accessedAt_idx" ON "BeneficiaryPortalAccess"("accessedAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationConfig_vaultId_key" ON "NotificationConfig"("vaultId");

-- CreateIndex
CREATE INDEX "NotificationConfig_vaultId_idx" ON "NotificationConfig"("vaultId");

-- CreateIndex
CREATE INDEX "NotificationLog_keepsakeId_idx" ON "NotificationLog"("keepsakeId");

-- CreateIndex
CREATE INDEX "NotificationLog_beneficiaryId_idx" ON "NotificationLog"("beneficiaryId");

-- CreateIndex
CREATE INDEX "NotificationLog_status_scheduledFor_idx" ON "NotificationLog"("status", "scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_invitationToken_key" ON "Beneficiary"("invitationToken");

-- CreateIndex
CREATE INDEX "Beneficiary_email_idx" ON "Beneficiary"("email");

-- CreateIndex
CREATE INDEX "Beneficiary_invitationToken_idx" ON "Beneficiary"("invitationToken");

-- CreateIndex
CREATE INDEX "Beneficiary_beneficiaryProfileId_idx" ON "Beneficiary"("beneficiaryProfileId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_beneficiaryProfileId_fkey" FOREIGN KEY ("beneficiaryProfileId") REFERENCES "BeneficiaryProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryProfile" ADD CONSTRAINT "BeneficiaryProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryInvitation" ADD CONSTRAINT "BeneficiaryInvitation_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryInvitation" ADD CONSTRAINT "BeneficiaryInvitation_keepsakeId_fkey" FOREIGN KEY ("keepsakeId") REFERENCES "Keepsake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryPortalAccess" ADD CONSTRAINT "BeneficiaryPortalAccess_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryPortalAccess" ADD CONSTRAINT "BeneficiaryPortalAccess_keepsakeId_fkey" FOREIGN KEY ("keepsakeId") REFERENCES "Keepsake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationConfig" ADD CONSTRAINT "NotificationConfig_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_keepsakeId_fkey" FOREIGN KEY ("keepsakeId") REFERENCES "Keepsake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;
