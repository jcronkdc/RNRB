-- Make recoveryEmail column nullable in EmailAccount table
-- This allows existing accounts to not have a recovery email set
-- Password resets will fall back to the user's platform email if no recovery email is set

-- AlterTable
ALTER TABLE "EmailAccount" ALTER COLUMN "recoveryEmail" DROP NOT NULL;

