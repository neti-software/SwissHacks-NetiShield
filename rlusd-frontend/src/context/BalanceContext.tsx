import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../api/api";
import { TokenBalanceResponseDto } from "../generated/backendApi";

interface BalanceContextType {
  balanceData: TokenBalanceResponseDto | null;
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
};

export const BalanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentWalletAddress } = useAuth();
  const [balanceData, setBalanceData] = useState<TokenBalanceResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!currentWalletAddress) return;

    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.xrpl.xrplControllerGetTokenBalance(currentWalletAddress);
      setBalanceData(data);
    } catch (err) {
      console.error("Failed to fetch token balance:", err);
      setError("Failed to load balance");
    } finally {
      setIsLoading(false);
    }
  }, [currentWalletAddress]);

  // Refresh balance function that can be called from anywhere
  const refreshBalance = async () => {
    await fetchBalance();
  };

  useEffect(() => {
    fetchBalance();

    // Set up an interval to refresh the balance periodically
    const intervalId = setInterval(fetchBalance, 15000);

    return () => clearInterval(intervalId);
  }, [currentWalletAddress, fetchBalance]);

  return (
    <BalanceContext.Provider value={{ balanceData, isLoading, error, refreshBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export default BalanceContext;
