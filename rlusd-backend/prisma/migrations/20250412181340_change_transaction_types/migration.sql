/*
  Warnings:

  - You are about to drop the column `adminTransferHash` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `adminTransferUuid` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `recipientTransferHash` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `recipientTransferUuid` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `senderTransferHash` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `senderTransferUuid` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "adminTransferHash",
DROP COLUMN "adminTransferUuid",
DROP COLUMN "recipientTransferHash",
DROP COLUMN "recipientTransferUuid",
DROP COLUMN "senderTransferHash",
DROP COLUMN "senderTransferUuid",
ADD COLUMN     "adminSignature" TEXT,
ADD COLUMN     "recipientSignature" TEXT,
ADD COLUMN     "senderSignature" TEXT;
