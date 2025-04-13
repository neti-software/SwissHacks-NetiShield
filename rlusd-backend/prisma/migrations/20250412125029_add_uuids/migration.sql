-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "adminTransferUuid" TEXT,
ADD COLUMN     "recipientTransferUuid" TEXT,
ADD COLUMN     "senderTransferUuid" TEXT;
