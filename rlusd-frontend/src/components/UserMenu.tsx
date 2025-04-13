import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const UserMenu: React.FC = () => {
  const { currentWalletAddress, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div
      className="relative"
      onBlur={(e) => {
        // Only close if focus moves outside the container
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsMenuOpen(false);
        }
      }}
      tabIndex={-1} // Makes the div focusable
    >
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      >
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium text-gray-700">
          {currentWalletAddress ? shortenAddress(currentWalletAddress) : "Connect Wallet"}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transform transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b">XRPL Wallet</div>
          <div className="px-4 py-2 text-sm text-gray-700 break-all">{currentWalletAddress}</div>

          <div className="border-t my-1"></div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 focus:outline-none"
            disabled={isLoading}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
