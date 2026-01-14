-- CreateTable
CREATE TABLE "BeneficiaryAccessToken" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastAccessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeneficiaryAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BeneficiaryAccessToken_token_key" ON "BeneficiaryAccessToken"("token");

-- CreateIndex
CREATE INDEX "BeneficiaryAccessToken_token_idx" ON "BeneficiaryAccessToken"("token");

-- CreateIndex
CREATE INDEX "BeneficiaryAccessToken_beneficiaryId_idx" ON "BeneficiaryAccessToken"("beneficiaryId");

-- CreateIndex
CREATE INDEX "BeneficiaryAccessToken_expiresAt_idx" ON "BeneficiaryAccessToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "BeneficiaryAccessToken" ADD CONSTRAINT "BeneficiaryAccessToken_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
