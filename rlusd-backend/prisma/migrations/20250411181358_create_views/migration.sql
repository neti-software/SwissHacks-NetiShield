CREATE OR REPLACE VIEW "latest_vendor_verification_status_log_view" AS
SELECT DISTINCT ON ("vendorVerificationId") 
  "id",
  "vendorVerificationId",
  "status",
  "createdAt"
FROM "VendorVerificationStatusLog"
ORDER BY "vendorVerificationId", "createdAt" DESC;

CREATE OR REPLACE VIEW "latest_transaction_status_log_view" AS
SELECT DISTINCT ON ("transactionId") 
  "id",
  "transactionId",
  "status",
  "createdAt"
FROM "TransactionStatusLog"
ORDER BY "transactionId", "createdAt" DESC;
