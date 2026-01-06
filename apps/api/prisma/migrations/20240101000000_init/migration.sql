-- CreateEnum
CREATE TYPE "VaultStatus" AS ENUM ('active', 'pending_verification', 'unsealed');

-- CreateEnum
CREATE TYPE "KeepsakeType" AS ENUM ('text', 'letter', 'photo', 'video', 'wish', 'scheduled_action');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "totpSecret" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vault" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "VaultStatus" NOT NULL DEFAULT 'active',
    "encryptionSalt" TEXT NOT NULL,
    "unsealedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keepsake" (
    "id" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "type" "KeepsakeType" NOT NULL,
    "title" TEXT NOT NULL,
    "encryptedContent" TEXT NOT NULL,
    "contentIV" TEXT NOT NULL,
    "revealDelay" INTEGER,
    "revealDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Keepsake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "relationship" TEXT,
    "accessToken" TEXT,
    "accessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeepsakeAssignment" (
    "id" TEXT NOT NULL,
    "keepsakeId" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,

    CONSTRAINT "KeepsakeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustedContact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrustedContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeathDeclaration" (
    "id" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "trustedContactId" TEXT NOT NULL,
    "declaredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeathDeclaration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "User"("emailVerificationToken");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "User_emailVerificationToken_idx" ON "User"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "Vault_userId_key" ON "Vault"("userId");

-- CreateIndex
CREATE INDEX "Keepsake_vaultId_idx" ON "Keepsake"("vaultId");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_accessToken_key" ON "Beneficiary"("accessToken");

-- CreateIndex
CREATE INDEX "Beneficiary_vaultId_idx" ON "Beneficiary"("vaultId");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_vaultId_email_key" ON "Beneficiary"("vaultId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "KeepsakeAssignment_keepsakeId_beneficiaryId_key" ON "KeepsakeAssignment"("keepsakeId", "beneficiaryId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedContact_verificationCode_key" ON "TrustedContact"("verificationCode");

-- CreateIndex
CREATE INDEX "TrustedContact_userId_idx" ON "TrustedContact"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedContact_userId_email_key" ON "TrustedContact"("userId", "email");

-- CreateIndex
CREATE INDEX "DeathDeclaration_vaultId_idx" ON "DeathDeclaration"("vaultId");

-- CreateIndex
CREATE UNIQUE INDEX "DeathDeclaration_vaultId_trustedContactId_key" ON "DeathDeclaration"("vaultId", "trustedContactId");

-- AddForeignKey
ALTER TABLE "Vault" ADD CONSTRAINT "Vault_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keepsake" ADD CONSTRAINT "Keepsake_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeepsakeAssignment" ADD CONSTRAINT "KeepsakeAssignment_keepsakeId_fkey" FOREIGN KEY ("keepsakeId") REFERENCES "Keepsake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeepsakeAssignment" ADD CONSTRAINT "KeepsakeAssignment_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustedContact" ADD CONSTRAINT "TrustedContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeathDeclaration" ADD CONSTRAINT "DeathDeclaration_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeathDeclaration" ADD CONSTRAINT "DeathDeclaration_trustedContactId_fkey" FOREIGN KEY ("trustedContactId") REFERENCES "TrustedContact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
