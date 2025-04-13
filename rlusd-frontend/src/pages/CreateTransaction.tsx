import React, { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBalance } from "../context/BalanceContext";
import { useVendors } from "../hooks/useVendors";
import { api } from "../api/api";
import QRCodeModal from "../components/QRCodeModal";
import TokenBalance from "../components/TokenBalance";
import Logo from "../components/Logo";

const CreateTransaction: React.FC = () => {
  const { isConnected, currentWalletAddress } = useAuth();
  const { balanceData } = useBalance();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { vendors, loading: vendorsLoading } = useVendors();
  const [isCheckingTrustline, setIsCheckingTrustline] = useState(false);
  const [recipientHasTrustline, setRecipientHasTrustline] = useState<boolean | null>(null);

  // QR code state
  const [showQRCode, setShowQRCode] = useState(false);
  const [signingUrl, setSigningUrl] = useState<string | null>(null);
  const [transactionUuid, setTransactionUuid] = useState<string>("");
  const [transactionIdFromResponse, setTransactionIdFromResponse] = useState<string>("");

  // Check if user has trustline before allowing transaction creation
  useEffect(() => {
    // Redirect to dashboard if no trustline
    if (balanceData && !balanceData.hasTrustline) {
      navigate("/dashboard", { state: { noTrustline: true } });
    }
  }, [balanceData, navigate]);

  useEffect(() => {
    setAmount("");
    setRecipientAddress("");
    setSelectedVendors(vendors.map((vendor) => vendor.id));
    setError(null);
    setShowQRCode(false);
    setSigningUrl(null);
    setTransactionUuid("");
    setTransactionIdFromResponse("");
    setRecipientHasTrustline(null);
  }, [currentWalletAddress, vendors]);

  // Check recipient address trustline when address is entered
  useEffect(() => {
    const checkTrustline = async () => {
      if (!recipientAddress || recipientAddress.length < 25) {
        setRecipientHasTrustline(null);
        return;
      }

      try {
        setIsCheckingTrustline(true);
        const { data } = await api.xrpl.xrplControllerGetTokenBalance(recipientAddress);
        setRecipientHasTrustline(data.hasTrustline);
      } catch (error) {
        console.error("Error checking recipient trustline:", error);
        setRecipientHasTrustline(false);
      } finally {
        setIsCheckingTrustline(false);
      }
    };

    // Debounce the check to avoid too many requests while typing
    const timeoutId = setTimeout(() => {
      if (recipientAddress && recipientAddress.length >= 25) {
        checkTrustline();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [recipientAddress]);

  const handleVendorToggle = (vendorId: string) => {
    setSelectedVendors((prev) => {
      if (prev.includes(vendorId)) {
        return prev.filter((id) => id !== vendorId);
      } else {
        return [...prev, vendorId];
      }
    });
  };

  const handleCloseQRCode = () => {
    setShowQRCode(false);
    navigate(`/dashboard/sent`);
  };

  const handleSuccess = () => {
    // Check transaction status after signing
    checkTransactionStatus();
  };

  const checkTransactionStatus = async () => {
    if (!transactionIdFromResponse) return;

    try {
      const { data } = await api.transactions.transactionsControllerFindOne(transactionIdFromResponse);
      if (
        data.statusLog.some((status) =>
          [
            "RECIPIENT_AND_SENDER_VERIFICATION_FAILED",
            "RECIPIENT_VERIFICATION_FAILED",
            "SENDER_VERIFICATION_FAILED",
          ].includes(status.status)
        )
      ) {
        navigate(`/dashboard/sent`);
        return;
      }
      navigate(`/transactions/${transactionIdFromResponse}`);
    } catch (error) {
      console.error("Error checking transaction status:", error);
      navigate("/dashboard", { state: { refresh: true } });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || selectedVendors.length === 0 || !recipientAddress) {
      setError("Please enter an amount, recipient address and select at least one vendor");
      return;
    }

    // Verify recipient has a trustline
    if (recipientHasTrustline === false) {
      setError("Recipient does not have a trustline set up for RLUSD tokens. They need to create a trustline first.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (!currentWalletAddress) {
        throw new Error("Wallet address is missing");
      }

      // Create the transaction
      const { data } = await api.transactions.transactionsControllerCreate({
        amount: parseFloat(amount),
        vendorIds: selectedVendors,
        senderAddress: currentWalletAddress,
        recipientAddress: recipientAddress,
      });

      console.log("Transaction created:", data);

      // Store transaction ID and signing URL
      setTransactionUuid(data.uuid);
      // Use type assertion since the API has been updated to include 'id'
      if (data.transactionId) {
        setTransactionIdFromResponse(data.transactionId);
      }
      setSigningUrl(data.signUrl);
      setShowQRCode(true);
    } catch (error) {
      console.error("Error creating transaction:", error);
      setError("Failed to create transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  if (balanceData && !balanceData.hasTrustline) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-white">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-4 text-neutral-gray hover:text-neutral-black">
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
              <h1 className="text-2xl font-bold text-neutral-black">Create Transaction</h1>
            </div>
            <TokenBalance />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-gray/20">
            <h2 className="text-xl font-semibold text-neutral-black">Transaction Details</h2>
          </div>

          {vendorsLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-neutral-gray/20 border-t-primary"></div>
              <p className="mt-4 text-neutral-gray">Loading vendors...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 relative">
              {isSubmitting && (
                <div className="absolute inset-0 bg-white bg-opacity-60 z-10 flex flex-col items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-neutral-gray/20 border-t-primary mb-4"></div>
                  <p className="text-neutral-black font-medium">Creating transaction...</p>
                </div>
              )}
              {error && (
                <div className="mb-6 bg-primary-light border-l-4 border-primary p-4 text-primary">
                  <p>{error}</p>
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="amount" className="block text-sm font-medium text-neutral-black mb-1">
                  Amount (RLUSD)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                  required
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 border border-neutral-gray/30 rounded-md shadow-sm focus:outline-none focus:ring-secondary-blue focus:border-secondary-blue ${
                    isSubmitting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="recipientAddress" className="block text-sm font-medium text-neutral-black mb-1">
                  Recipient Wallet Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="recipientAddress"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="r..."
                    required
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border ${
                      recipientHasTrustline === false
                        ? "border-primary/50 focus:ring-primary focus:border-primary"
                        : recipientHasTrustline === true
                        ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                        : "border-neutral-gray/30 focus:ring-secondary-blue focus:border-secondary-blue"
                    } rounded-md shadow-sm focus:outline-none ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
                  />
                  {isCheckingTrustline && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-t-secondary-blue border-secondary-blue/20 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {recipientAddress && recipientAddress.length >= 25 && (
                  <div className="mt-1">
                    {recipientHasTrustline === false ? (
                      <div>
                        <p className="text-sm text-primary">
                          Recipient does not have a trustline. They need to create one before receiving RLUSD.
                        </p>
                        <div className="mt-2 p-3 bg-secondary-blue/10 border border-secondary-blue/30 rounded-md">
                          <h4 className="text-sm font-medium text-secondary-blue">Instructions for recipient:</h4>
                          <ol className="mt-1 text-xs text-secondary-blue list-decimal list-inside">
                            <li>Connect their XRPL wallet to netiShield</li>
                            <li>Click on the "Create Trustline" button in the dashboard</li>
                            <li>Follow the instructions to scan the QR code with their Xaman wallet</li>
                            <li>Once the trustline is set up, you can send them RLUSD tokens</li>
                          </ol>
                        </div>
                      </div>
                    ) : recipientHasTrustline === true ? (
                      <p className="text-sm text-green-600">Recipient has valid trustline.</p>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="block text-sm font-medium text-neutral-black mb-3">Select Verification Vendors</h3>
                <p className="text-xs text-neutral-gray mb-4">
                  These vendors will verify and validate your transaction for enhanced security.
                </p>

                {vendors.length === 0 ? (
                  <p className="text-neutral-gray">No vendors available</p>
                ) : (
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                      isSubmitting ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
                    {vendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedVendors.includes(vendor.id)
                            ? "border-secondary-blue bg-secondary-blue/10"
                            : "border-neutral-gray/30 hover:border-neutral-gray/50"
                        } ${isSubmitting ? "cursor-not-allowed" : ""}`}
                        onClick={(e) => {
                          if (e.target instanceof HTMLInputElement || isSubmitting) {
                            return;
                          }
                          handleVendorToggle(vendor.id);
                        }}
                      >
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={`vendor-${vendor.id}`}
                              type="checkbox"
                              checked={selectedVendors.includes(vendor.id)}
                              onChange={() => !isSubmitting && handleVendorToggle(vendor.id)}
                              disabled={isSubmitting}
                              className="h-4 w-4 text-secondary-blue border-neutral-gray/50 rounded focus:ring-secondary-blue"
                            />
                          </div>
                          <div className="ml-3">
                            <label htmlFor={`vendor-${vendor.id}`} className="font-medium text-neutral-black">
                              {vendor.name}
                            </label>
                            {vendor.description && (
                              <p className="text-neutral-gray text-sm mt-1">{vendor.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Link
                  to="/dashboard"
                  className={`bg-neutral-white text-neutral-black border border-neutral-gray/30 py-2 px-4 rounded-md mr-4 hover:bg-neutral-gray/10 transition duration-200 ${
                    isSubmitting ? "opacity-60 pointer-events-none" : ""
                  }`}
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || vendors.length === 0}
                  className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90 transition duration-200 disabled:opacity-70 flex items-center"
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
                      Creating...
                    </>
                  ) : (
                    "Create Transaction"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {showQRCode && signingUrl && (
        <QRCodeModal
          uuid={transactionUuid}
          signUrl={signingUrl}
          title="Scan QR Code with Xaman Wallet"
          description="Scan this QR code with your Xaman wallet app to sign the transaction"
          successMessage="Transaction signed successfully."
          onClose={handleCloseQRCode}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default CreateTransaction;
