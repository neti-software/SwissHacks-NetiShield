import React from "react";
import { useBalance } from "../context/BalanceContext";

interface TokenBalanceProps {
  className?: string;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({ className = "" }) => {
  const { balanceData, isLoading, error } = useBalance();

  return (
    <div className={`flex flex-row gap-2 items-center ${className}`}>
      <div className="flex flex-row gap-2 items-center min-w-[150px] relative">
        {balanceData && (
          <>
            <span className="text-xs text-neutral-gray">Balance</span>
            <span className="font-medium">{balanceData.balance} RLUSD</span>
          </>
        )}
        {isLoading && (
          <div className="absolute right-0 flex items-center">
            <div className="w-4 h-4 border-2 border-t-secondary-blue border-secondary-blue/20 rounded-full animate-spin"></div>
          </div>
        )}
        {error && <div className="text-sm text-primary">{error}</div>}
      </div>
    </div>
  );
};

export default TokenBalance;
