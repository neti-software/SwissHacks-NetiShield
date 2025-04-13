import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/api";

interface AuthContextType {
  currentWalletAddress: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  logout: () => Promise<void>;
  xrplQrData: {
    uuid: string;
    qrUrl: string;
    webSocketUrl: string;
  } | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentWalletAddress: null,
  isConnected: false,
  isLoading: false,
  error: null,
  connectWallet: async () => {},
  logout: async () => {},
  xrplQrData: null,
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [xrplQrData, setXrplQrData] = useState<AuthContextType["xrplQrData"]>(null);

  const clearError = () => setError(null);

  // Helper function to handle XRPL account login
  const verifyXrplLogin = useCallback(
    async (uuid: string) => {
      try {
        // Don't set loading state during polling
        const isPolling = !!xrplQrData;
        if (!isPolling) {
          setIsLoading(true);
        }

        // Only clear error on manual verification (not polling)
        if (!isPolling) {
          setError(null);
        }

        console.log("Verifying login for UUID:", uuid);

        // Verify the login with the backend
        const { data } = await api.auth.authControllerLoginWithXrpl({
          uuid,
        });

        if (data && data.walletAddress) {
          console.log("Login verified successfully for address:", data.walletAddress);

          // Set new account details
          setCurrentWalletAddress(data.walletAddress);

          // Update localStorage
          localStorage.setItem("currentWalletAddress", data.walletAddress);

          // Clear QR data on successful login
          setXrplQrData(null);
          return true;
        }

        // Don't show error messages during polling
        if (!isPolling) {
          setError("Login verification failed. Please try again.");
        }
        return false;
      } catch (error) {
        console.error("XRPL login error:", error);

        // Don't show error messages during polling
        if (!xrplQrData) {
          setError("Login verification failed. Please make sure you signed the request in Xaman app.");
        }
        return false;
      } finally {
        // Don't update loading state during polling
        if (!xrplQrData) {
          setIsLoading(false);
        }
      }
    },
    [xrplQrData]
  );

  // Poll for login verification
  useEffect(() => {
    if (!xrplQrData?.uuid) return;

    let verificationInterval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    // Add initial delay before first verification attempt
    const initialDelay = setTimeout(() => {
      console.log("Starting verification polling for", xrplQrData.uuid);

      // Start polling after delay
      verificationInterval = setInterval(async () => {
        try {
          console.log("Checking login status...");
          // Try to verify the login
          const successful = await verifyXrplLogin(xrplQrData.uuid);

          if (successful) {
            console.log("Login successful, clearing interval");
            clearInterval(verificationInterval);
          }
        } catch (error) {
          console.error("Error during polling:", error);
        }
      }, 500); // Check every 2 seconds

      // Set a timeout to stop polling after 5 minutes
      timeout = setTimeout(() => {
        console.log("Login session expired");
        clearInterval(verificationInterval);
        setXrplQrData(null);
        setError("Login session expired. Please try again.");
      }, 5 * 60 * 1000);
    }, 5000); // Initial delay of 15 seconds to give time to scan

    // Cleanup function
    return () => {
      console.log("Cleaning up verification timers");
      clearTimeout(initialDelay);
      if (verificationInterval) clearInterval(verificationInterval);
      if (timeout) clearTimeout(timeout);
    };
  }, [xrplQrData, verifyXrplLogin]);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        setError(null);
        const savedWalletAddress = localStorage.getItem("currentWalletAddress");

        setCurrentWalletAddress(savedWalletAddress);
      } catch (error) {
        // Clear storage on error
        localStorage.removeItem("currentWalletAddress");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create a login request for Xaman
      const { data } = await api.auth.authControllerCreateXrplLogin();

      if (data) {
        setXrplQrData({
          uuid: data.uuid,
          qrUrl: data.qrUrl,
          webSocketUrl: data.webSocketUrl,
        });
      } else {
        setError("Failed to create login request. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create XRPL login request:", error);
      setError("Failed to create login request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call the logout endpoint
      await api.auth.authControllerLogout();

      // Clear state and storage
      setCurrentWalletAddress(null);
      localStorage.removeItem("currentWalletAddress");
    } catch (error) {
      // Still clear state and storage on error
      setCurrentWalletAddress(null);
      localStorage.removeItem("currentWalletAddress");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentWalletAddress,
        isConnected: !!currentWalletAddress,
        isLoading,
        error,
        connectWallet,
        logout,
        xrplQrData,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
