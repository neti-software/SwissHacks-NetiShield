/*
  Warnings:

  - You are about to drop the column `transferTransactionHashes` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "transferTransactionHashes",
ADD COLUMN     "adminTransferHash" TEXT,
ADD COLUMN     "recipientTransferHash" TEXT,
ADD COLUMN     "senderTransferHash" TEXT;
