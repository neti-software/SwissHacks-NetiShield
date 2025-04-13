-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionStatus" ADD VALUE 'SENDER_APPROVED';
ALTER TYPE "TransactionStatus" ADD VALUE 'RECIPIENT_APPROVED';
ALTER TYPE "TransactionStatus" ADD VALUE 'ADMIN_APPROVED';
ALTER TYPE "TransactionStatus" ADD VALUE 'SENDER_REJECTED';
ALTER TYPE "TransactionStatus" ADD VALUE 'RECIPIENT_REJECTED';
ALTER TYPE "TransactionStatus" ADD VALUE 'ADMIN_REJECTED';
