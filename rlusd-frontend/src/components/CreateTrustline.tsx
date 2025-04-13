import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBalance } from "../context/BalanceContext";
import { api } from "../api/api";
import QRCodeModal from "./QRCodeModal";

interface TrustlineQrData {
  uuid: string;
  signUrl: string;
}

const CreateTrustline: React.FC = () => {
  const { currentWalletAddress } = useAuth();
  const { balanceData, refreshBalance } = useBalance();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trustlineQrData, setTrustlineQrData] = useState<TrustlineQrData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCreateTrustline = async () => {
    if (!currentWalletAddress) {
      setError("You need to connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data } = await api.transactions.transactionsControllerCreateTrustline({
        account: currentWalletAddress,
      });

      if (data) {
        setTrustlineQrData({
          uuid: data.uuid,
          signUrl: data.signUrl,
        });
        setIsModalOpen(true);
      } else {
        setError("Failed to create trustline request. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create trustline:", error);
      setError("Failed to create trustline request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTrustlineQrData(null);
  };

  const handleSuccess = async () => {
    // Refresh balance to update trustline status
    await refreshBalance();
    setIsModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  // Check if trustline information is still loading
  if (!balanceData) {
    return (
      <button
        disabled
        className="bg-neutral-gray text-white font-medium py-2 px-4 rounded flex items-center cursor-not-allowed"
      >
        <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
        Checking Trustline...
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleCreateTrustline}
        className={`${
          balanceData.hasTrustline ? "bg-green-600 hover:bg-green-700" : "bg-secondary-blue hover:bg-secondary-blue/90"
        } text-white font-medium py-2 px-4 rounded flex items-center`}
        disabled={isLoading || balanceData.hasTrustline}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {balanceData.hasTrustline ? "Trustline Created" : isLoading ? "Creating Trustline..." : "Create Trustline"}
      </button>

      {/* QR Code Modal */}
      {isModalOpen && trustlineQrData && (
        <QRCodeModal
          uuid={trustlineQrData.uuid}
          signUrl={trustlineQrData.signUrl}
          title="Create Trustline"
          description="Scan this QR code with your Xaman wallet app to create a trustline for RLUSD."
          successMessage="Trustline created successfully."
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 shadow-lg">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p>
              <strong>Success!</strong> Trustline created successfully.
            </p>
          </div>
        </div>
      )}

      {error && <div className="text-primary mt-2 text-sm">{error}</div>}
    </>
  );
};

export default CreateTrustline;
