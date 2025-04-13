import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Logo from "../components/Logo";

const Login: React.FC = () => {
  const { connectWallet, isConnected, isLoading, xrplQrData, error, clearError } = useAuth();

  // Handle button click
  const handleConnectClick = async () => {
    await connectWallet();
  };

  // Cancel QR code scanning and go back to login button
  const handleCancel = () => {
    clearError();
    window.location.reload(); // Simple way to reset the state
  };

  if (isConnected) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-neutral-white flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo width={560} height={100} />
          </div>
          <p className="mt-2 text-neutral-gray">Secure transactions with fraud prevention</p>
        </div>

        {error && (
          <div className="bg-primary-light border-l-4 border-primary p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-primary">{error}</p>
              </div>
            </div>
          </div>
        )}

        {xrplQrData ? (
          <div className="flex flex-col items-center">
            <p className="mb-4 text-center font-medium text-neutral-black">
              Scan this QR code with your Xaman wallet app to connect
            </p>
            <div className="border-2 border-neutral-gray rounded-lg p-4 mb-4">
              <QRCodeSVG
                value={xrplQrData.qrUrl}
                size={200}
                level="H" // High error correction for better scanning
                fgColor="#141415" // Using neutral-black color
              />
            </div>

            <div className="bg-secondary-blue/10 border-l-4 border-secondary-blue p-4 mb-4 w-full text-left">
              <h3 className="font-medium text-secondary-blue mb-1">How to connect:</h3>
              <ol className="list-decimal pl-5 text-sm text-secondary-blue space-y-1">
                <li>Open your Xaman wallet app</li>
                <li>Ensure you have activated you account</li>
                <li>Tap the scan button in the app</li>
                <li>Scan this QR code</li>
                <li>Approve the sign-in request in your Xaman app</li>
                <li>Wait for verification (takes about 15 seconds)</li>
              </ol>
            </div>

            <div className="text-xs text-neutral-gray text-center mb-4">
              <p>Trouble scanning? Your URL is:</p>
              <a
                href={xrplQrData.qrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-blue break-words"
              >
                {xrplQrData.qrUrl}
              </a>
            </div>

            <button
              onClick={handleCancel}
              className="text-neutral-gray hover:text-neutral-black underline text-sm mt-2"
            >
              Cancel and try again
            </button>
          </div>
        ) : (
          <div className="mt-8">
            <button
              onClick={handleConnectClick}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 bg-primary hover:bg-primary/90 rounded-lg text-white font-medium transition duration-200 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Connecting...
                </div>
              ) : (
                <>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                      fill="white"
                    />
                    <path
                      d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
                      fill="white"
                    />
                  </svg>
                  Connect with Xaman
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
