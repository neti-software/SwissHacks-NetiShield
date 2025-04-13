/*
  Warnings:

  - You are about to drop the column `transferTransactionHash` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "transferTransactionHash",
ADD COLUMN     "transferTransactionHashes" TEXT[];
