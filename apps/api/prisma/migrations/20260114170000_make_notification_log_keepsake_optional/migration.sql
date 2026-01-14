-- AlterTable
ALTER TABLE "NotificationLog" ALTER COLUMN "keepsakeId" DROP NOT NULL;

-- AddColumn
ALTER TABLE "NotificationLog" ADD COLUMN "vaultId" TEXT;

-- CreateIndex
CREATE INDEX "NotificationLog_vaultId_idx" ON "NotificationLog"("vaultId");
