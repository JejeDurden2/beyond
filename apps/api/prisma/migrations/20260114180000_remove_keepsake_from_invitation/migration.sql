-- Remove keepsakeId from BeneficiaryInvitation
-- Invitations are now per-beneficiary, not per-keepsake

-- Drop the foreign key constraint first
ALTER TABLE "BeneficiaryInvitation" DROP CONSTRAINT IF EXISTS "BeneficiaryInvitation_keepsakeId_fkey";

-- Drop the index
DROP INDEX IF EXISTS "BeneficiaryInvitation_keepsakeId_idx";

-- Drop the column
ALTER TABLE "BeneficiaryInvitation" DROP COLUMN IF EXISTS "keepsakeId";
