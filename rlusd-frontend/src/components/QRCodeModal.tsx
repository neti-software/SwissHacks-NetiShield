import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../api/api";
import { useBalance } from "../context/BalanceContext";

interface QRCodeModalProps {
  uuid: string | null;
  signUrl: string;
  title: string;
  description: string;
  successMessage: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  uuid,
  signUrl,
  title,
  description,
  successMessage,
  onClose,
  onSuccess,
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { refreshBalance } = useBalance();
  const lastRefreshTime = useRef<number>(0);

  // Effect to handle transaction status verification
  useEffect(() => {
    if (!uuid) return;

    console.log(`Starting verification for transaction: ${uuid}`);

    // Track intervals/timeouts for cleanup
    let checkInterval: NodeJS.Timeout;
    let verificationAttempts = 0;
    const maxVerificationAttempts = 60; // Stop after 60 attempts (3 minutes)

    const checkTransactionStatus = async () => {
      try {
        verificationAttempts++;

        console.log(`Polling transaction status (attempt ${verificationAttempts}): ${uuid}`);

        // First check XRPL transaction status
        const xrplResponse = await api.xrpl.xrplControllerGetTransactionStatus(uuid);

        console.log("XRPL transaction status response:", xrplResponse.data);

        // If XRPL status is SUCCESS, we consider it done
        if (xrplResponse.data && xrplResponse.data.status === "SUCCESS") {
          console.log("XRPL transaction succeeded");
          clearInterval(checkInterval);
          setIsSuccess(true);

          // Refresh balance after successful transaction, but limit how often we do it
          const now = Date.now();
          if (now - lastRefreshTime.current > 5000) {
            // Only refresh if 5 seconds have passed since last refresh
            lastRefreshTime.current = now;
            await refreshBalance();
          }

          if (onSuccess) setTimeout(onSuccess, 1000);
          return;
        }

        // If max verification attempts reached, stop checking
        if (verificationAttempts >= maxVerificationAttempts) {
          console.log("Max verification attempts reached");
          clearInterval(checkInterval);
          setIsError(true);
          setErrorMessage("Verification timed out. Please try again.");
        }
      } catch (error) {
        console.error("Error checking transaction status:", error);

        if (verificationAttempts >= maxVerificationAttempts) {
          clearInterval(checkInterval);
          setIsError(true);
          setErrorMessage("Failed to verify transaction status. Please try again.");
        }
      }
    };

    // Initial check
    checkTransactionStatus();

    // Set up interval for subsequent checks - increased to 3 seconds to reduce API load
    checkInterval = setInterval(checkTransactionStatus, 3000);

    return () => {
      console.log("Cleaning up verification process");
      clearInterval(checkInterval);
    };
  }, [uuid, onSuccess, refreshBalance]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>

        {/* Loading indicator */}
        {uuid && !isSuccess && !isError && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-blue-600 bg-blue-50">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Waiting for confirmation...
            </div>
          </div>
        )}

        {/* Success message */}
        {isSuccess && (
          <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {isError && (
          <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{errorMessage || "An error occurred"}</h3>
              </div>
            </div>
          </div>
        )}

        <p className="mb-4 text-center text-gray-600">{description}</p>

        {/* Show QR code only when not success/error */}
        {!isSuccess && !isError && (
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded border">
              <QRCodeSVG value={signUrl} size={200} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeModal;
