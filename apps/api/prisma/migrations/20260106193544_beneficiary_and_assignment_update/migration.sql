/*
  Warnings:

  - You are about to drop the column `name` on the `Beneficiary` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relationship` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDCHILD', 'GRANDPARENT', 'FRIEND', 'COLLEAGUE', 'OTHER');

-- DropForeignKey
ALTER TABLE "Beneficiary" DROP CONSTRAINT "Beneficiary_vaultId_fkey";

-- AlterTable
ALTER TABLE "Beneficiary" DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "relationship",
ADD COLUMN     "relationship" "Relationship" NOT NULL;

-- AlterTable
ALTER TABLE "KeepsakeAssignment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "personalMessage" TEXT;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;
