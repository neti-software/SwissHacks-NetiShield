import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBalance } from "../context/BalanceContext";
import { TransactionEntity } from "../generated/backendApi";
import VendorVerificationStatus from "../components/VendorVerificationStatus";
import TransactionStatusHistory from "../components/TransactionStatusHistory";
import StatusBadge from "../components/StatusBadge";
import { api } from "../api/api";
import QRCodeModal from "../components/QRCodeModal";
import { useAdminAddress } from "../hooks/useAdminAddress";
import DecisionStatus from "../components/DecisionStatus";
import Logo from "../components/Logo";

const TransactionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isConnected, currentWalletAddress } = useAuth();
  const { refreshBalance } = useBalance();
  const [transaction, setTransaction] = useState<TransactionEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [signingUrl, setSigningUrl] = useState<string | null>(null);
  const [transactionUuid, setTransactionUuid] = useState<string | null>(null);
  const [qrCodeAction, setQrCodeAction] = useState<"approve" | "reject" | null>(null);
  const lastRefreshTime = useRef<number>(0);
  const { adminAddress } = useAdminAddress();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.transactions.transactionsControllerFindOne(id!);
        setTransaction(data);
      } catch (error) {
        console.error("Error fetching transaction:", error);
        setError("Failed to load transaction details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTransaction();
    }
  }, [id]);

  const handleApproveTransaction = async () => {
    if (!id || !currentWalletAddress) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const { data } = await api.transactions.transactionsControllerApproveTransaction(id, {
        signer: currentWalletAddress,
      });

      setSigningUrl(data.signUrl);
      setShowQRCode(true);
      setQrCodeAction("approve");
      setTransactionUuid(data.uuid);
    } catch (error) {
      console.error("Error approving transaction:", error);
      setError("Failed to approve transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectTransaction = async () => {
    if (!id || !currentWalletAddress) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const { data } = await api.transactions.transactionsControllerRejectTransaction(id, {
        signer: currentWalletAddress,
      });

      setSigningUrl(data.signUrl);
      setShowQRCode(true);
      setQrCodeAction("reject");
      setTransactionUuid(data.uuid);
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      setError("Failed to reject transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseQRCode = async () => {
    setShowQRCode(false);
    setSigningUrl(null);

    if (id) {
      refreshTransaction();

      // Only refresh balance if it hasn't been refreshed in the last 5 seconds
      const now = Date.now();
      if (now - lastRefreshTime.current > 5000) {
        lastRefreshTime.current = now;
        await refreshBalance();
      }
    }

    setQrCodeAction(null);
  };

  const refreshTransaction = async () => {
    try {
      if (!id) return;
      const { data } = await api.transactions.transactionsControllerFindOne(id);
      setTransaction(data);
    } catch (error) {
      console.error("Error refreshing transaction:", error);
    }
  };

  const transactionDetails = useMemo(() => {
    if (!transaction || !transaction.statusLog || transaction.statusLog.length === 0) return null;

    const isSender = transaction.senderAddress === currentWalletAddress;
    const isRecipient = transaction.recipientAddress === currentWalletAddress;
    const isAdmin = adminAddress === currentWalletAddress;

    // Check if any of these statuses exist in the status history
    const hasStatus = (status: string, not?: string) => {
      return transaction.statusLog.some((log) => log.status === status);
    };

    const adminHasDecided = hasStatus("ADMIN_APPROVED") || hasStatus("ADMIN_REJECTED");
    const senderHasDecided = hasStatus("SENDER_APPROVED") || hasStatus("SENDER_REJECTED");
    const recipientHasDecided = hasStatus("RECIPIENT_APPROVED") || hasStatus("RECIPIENT_REJECTED");

    const bothVerificationFailed = hasStatus("RECIPIENT_AND_SENDER_VERIFICATION_FAILED");
    const senderVerificationFailed = hasStatus("SENDER_VERIFICATION_FAILED");
    const recipientVerificationFailed = hasStatus("RECIPIENT_VERIFICATION_FAILED");

    return {
      isSender,
      isRecipient,
      isAdmin,
      adminHasDecided,
      senderHasDecided,
      needsSenderDecision: !senderVerificationFailed && !bothVerificationFailed,
      recipientHasDecided,
      needsRecipientDecision: !recipientVerificationFailed && !bothVerificationFailed,
      bothVerificationFailed,
      senderVerificationFailed,
      recipientVerificationFailed,
    };
  }, [transaction, currentWalletAddress, adminAddress]);

  // Get a description for the decision status based on validation results
  const getDecisionStatusDescription = () => {
    if (!transactionDetails) return "";

    if (transactionDetails.senderVerificationFailed) {
      return "Sender identity verification failed. Recipient and Escrow Authority decisions are required.";
    }

    if (transactionDetails.recipientVerificationFailed) {
      return "Recipient identity verification failed. Sender and Escrow Authority decisions are required.";
    }

    if (transactionDetails.bothVerificationFailed) {
      return "Both sender and recipient identity verification failed. Escrow Authority decision is required.";
    }

    return "";
  };

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-neutral-gray/20 border-t-primary"></div>
          <p className="mt-2 text-neutral-gray">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-neutral-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary">{error || "Transaction not found"}</p>
          <Link to="/dashboard/sent" className="mt-4 text-secondary-blue hover:text-secondary-blue/80">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Determine which tab to return to based on the transaction
  const backLinkUrl = transaction.senderAddress === currentWalletAddress ? "/dashboard/sent" : "/dashboard/received";

  // Determine whether the current user can approve/reject based on role and transaction history
  const canApproveOrReject = (): boolean => {
    if (!transactionDetails || !currentWalletAddress || !transaction.currentStatus) {
      return false;
    }

    // Check user role
    const isSender = transaction.senderAddress === currentWalletAddress;
    const isRecipient = transaction.recipientAddress === currentWalletAddress;
    const isAdmin = adminAddress === currentWalletAddress;

    // Only sender or recipient can take action
    if (!isSender && !isRecipient && !isAdmin) {
      return false;
    }

    // Check if user needs to make a decision based on approvalStatus
    if (
      (isSender && transactionDetails.needsSenderDecision) ||
      (isRecipient && transactionDetails.needsRecipientDecision) ||
      isAdmin
    ) {
      return true;
    }

    return false;
  };

  return (
    <div className="min-h-screen bg-neutral-white">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link to={backLinkUrl} className="mr-4 text-neutral-gray hover:text-neutral-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <Logo width={260} height={65} className="mr-4" />
            <h1 className="text-2xl font-bold text-neutral-black">Transaction Details</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-gray/20 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-neutral-black">Transaction Information</h2>
            <StatusBadge status={transaction.currentStatus!.status} />
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-neutral-gray">Transaction ID</p>
                <p className="mt-1 text-sm text-neutral-black">{transaction.id}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-gray">Amount</p>
                <p className="mt-1 text-sm text-neutral-black font-semibold">{transaction.amount.toFixed(2)} RLUSD</p>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-gray">Sender</p>
                <p className="mt-1 text-sm text-neutral-black">
                  {transaction.senderAddress}
                  {transactionDetails?.isSender && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-secondary-blue/20 text-secondary-blue">
                      You
                    </span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-gray">Recipient</p>
                <p className="mt-1 text-sm text-neutral-black">
                  {transaction.recipientAddress}
                  {transactionDetails?.isRecipient && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-secondary-blue/20 text-secondary-blue">
                      You
                    </span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-gray">Created Date</p>
                <p className="mt-1 text-sm text-neutral-black">{new Date(transaction.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-gray">Updated Date</p>
                <p className="mt-1 text-sm text-neutral-black">
                  {transaction.updatedAt ? new Date(transaction.updatedAt).toLocaleString() : "N/A"}
                </p>
              </div>

              {transaction.escrowWalletAddress && (
                <div>
                  <p className="text-sm font-medium text-neutral-gray">Escrow Wallet</p>
                  <p className="mt-1 text-sm text-neutral-black">{transaction.escrowWalletAddress}</p>
                  <a
                    href={`${process.env.REACT_APP_XRPL_EXPLORER_URL}/accounts/${transaction.escrowWalletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-2 text-sm text-secondary-blue hover:text-secondary-blue/80"
                  >
                    View on XRPL Explorer
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-neutral-gray">Escrow Valid Duration</p>
                <p className="mt-1 text-sm text-neutral-black">100k block (3.5 days)</p>
              </div>

              {transaction.escrowTransactionHash && (
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm font-medium text-neutral-gray">Escrow Creation Transaction Hash</p>
                  <div className="mt-1">
                    <p className="text-sm text-neutral-black truncate max-w-full">
                      {transaction.escrowTransactionHash}
                    </p>
                    <a
                      href={`${process.env.REACT_APP_XRPL_EXPLORER_URL}/transactions/${transaction.escrowTransactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 text-sm text-secondary-blue hover:text-secondary-blue/80"
                    >
                      View on XRPL Explorer
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {transactionDetails && (
              <div className="mt-8 mb-4">
                <h3 className="text-lg font-medium text-neutral-black mb-4">Decision Status</h3>

                {getDecisionStatusDescription() && (
                  <div className="bg-secondary-blue/10 border border-secondary-blue/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-secondary-blue">{getDecisionStatusDescription()}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(transactionDetails.needsSenderDecision || transactionDetails.senderHasDecided) && (
                    <DecisionStatus
                      type="Sender"
                      isCurrentUser={transactionDetails.isSender}
                      hasDecided={transactionDetails.senderHasDecided}
                      transactionHash={transaction.senderTransferHash || undefined}
                    />
                  )}

                  {(transactionDetails.needsRecipientDecision || transactionDetails.recipientHasDecided) && (
                    <DecisionStatus
                      type="Recipient"
                      isCurrentUser={transactionDetails.isRecipient}
                      hasDecided={transactionDetails.recipientHasDecided}
                      transactionHash={transaction.recipientTransferHash || undefined}
                    />
                  )}

                  <DecisionStatus
                    type="Escrow Authority"
                    isCurrentUser={transactionDetails.isAdmin}
                    hasDecided={transactionDetails.adminHasDecided}
                    transactionHash={transaction.adminTransferHash || undefined}
                  />
                </div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-medium text-neutral-black mb-4">Status History</h3>
              <TransactionStatusHistory statusLog={transaction.statusLog} />
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-neutral-black mb-4">Vendor Verifications</h3>
              {transaction.vendorVerifications.length === 0 ? (
                <p className="text-sm text-neutral-gray">No vendors associated with this transaction</p>
              ) : (
                <>
                  <div className="space-y-4 bg-neutral-white rounded-lg p-4">
                    {transaction.vendorVerifications.map((verification) => (
                      <div
                        key={verification.id}
                        className="border-b border-neutral-gray/20 pb-4 last:border-0 last:pb-0"
                      >
                        <VendorVerificationStatus
                          vendorVerification={verification}
                          senderAddress={transaction.senderAddress}
                          recipientAddress={transaction.recipientAddress}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {canApproveOrReject() && (
              <div className="mt-8 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleRejectTransaction}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/70 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Reject Transaction"
                    )}
                  </button>

                  <button
                    onClick={handleApproveTransaction}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Approve Transaction"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* QR Code Modal */}
      {showQRCode && signingUrl && (
        <QRCodeModal
          uuid={transactionUuid}
          signUrl={signingUrl}
          title={
            qrCodeAction === "approve" ? "Scan QR Code to Approve Transaction" : "Scan QR Code to Reject Transaction"
          }
          description={
            qrCodeAction === "approve"
              ? "Scan this QR code with your Xaman wallet app to approve the transfer transaction. Once approved, the transaction will be submitted to the XRP Ledger."
              : "Scan this QR code with your Xaman wallet app to reject and return funds. Once signed, the funds will be returned to the sender on the XRP Ledger."
          }
          successMessage={
            qrCodeAction === "approve" ? "Transaction approved successfully." : "Transaction rejected successfully."
          }
          onClose={handleCloseQRCode}
          onSuccess={refreshTransaction}
        />
      )}
    </div>
  );
};

export default TransactionDetails;
