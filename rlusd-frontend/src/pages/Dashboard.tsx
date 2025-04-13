import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useBalance } from "../context/BalanceContext";
import { Navigate, Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { TransactionEntity } from "../generated/backendApi";
import { api } from "../api/api";
import StatusBadge from "../components/StatusBadge";
import UserMenu from "../components/UserMenu";
import CreateTrustline from "../components/CreateTrustline";
import TokenBalance from "../components/TokenBalance";
import { useAdminAddress } from "../hooks/useAdminAddress";
import Logo from "../components/Logo";
type TransactionType = "sent" | "received" | "admin";

const Dashboard: React.FC = () => {
  const { isConnected, currentWalletAddress } = useAuth();
  const { balanceData } = useBalance();
  const [transactions, setTransactions] = useState<TransactionEntity[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionEntity[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TransactionType>(
    tab === "received" ? "received" : tab === "admin" ? "admin" : "sent"
  );
  const [isLoading, setIsLoading] = useState(true);

  const { adminAddress } = useAdminAddress();

  const isAdmin = currentWalletAddress === adminAddress;

  useEffect(() => {
    if (!tab) {
      if (isAdmin) {
        navigate("/dashboard/admin", { replace: true });
      } else {
        navigate("/dashboard/sent", { replace: true });
      }
    }
  }, [tab, navigate, isAdmin]);

  useEffect(() => {
    if (tab) {
      if (isAdmin) {
        // Admin users can only access admin tab
        if (tab !== "admin") {
          navigate("/dashboard/admin", { replace: true });
        } else {
          setActiveTab("admin");
        }
      } else {
        // Regular users can't access admin tab
        if (tab === "admin") {
          navigate("/dashboard/sent", { replace: true });
        } else if (tab === "received" || tab === "sent") {
          setActiveTab(tab as TransactionType);
        } else {
          navigate("/dashboard/sent", { replace: true });
        }
      }
    }
  }, [tab, navigate, isAdmin]);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!currentWalletAddress) return;

      let queryParams = {};

      if (activeTab === "sent") {
        queryParams = { senderAddress: currentWalletAddress };
      } else if (activeTab === "received") {
        queryParams = { recipientAddress: currentWalletAddress };
      }
      // For admin tab, don't set any filter parameters to get all transactions

      const response = await api.transactions.transactionsControllerFindAll(queryParams);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentWalletAddress]);

  useEffect(() => {
    if (isConnected) {
      fetchTransactions();
    }
  }, [isConnected, activeTab, currentWalletAddress, fetchTransactions]);

  // Check for refresh state from navigation and refresh transactions if needed
  useEffect(() => {
    if (location.state && (location.state as any).refresh) {
      fetchTransactions();
      // Clear the state so we don't refresh on every render
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname, fetchTransactions]);

  useEffect(() => {
    // Filter transactions based on the status filter (only in admin tab)
    if (activeTab === "admin" && statusFilter && statusFilter !== "all") {
      setFilteredTransactions(
        transactions.filter((tx) => tx.currentStatus && tx.currentStatus.status === statusFilter)
      );
    } else {
      setFilteredTransactions(transactions);
    }
  }, [transactions, statusFilter, activeTab]);

  const handleTabChange = (tabType: TransactionType) => {
    navigate(`/dashboard/${tabType}`);
  };

  if (!isConnected) {
    return <Navigate to="/" />;
  }

  const needsTrustline = balanceData && !balanceData.hasTrustline;
  const canCreateTransaction = balanceData && balanceData.hasTrustline && !isAdmin;

  // For the admin panel, we'll use a dropdown to filter by status
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  return (
    <div className="min-h-screen bg-neutral-white">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Logo width={280} height={70} className="mr-4" />
              {!isAdmin && <TokenBalance className="bg-neutral-white px-3 py-1 rounded-md" />}
            </div>
            <div className="flex items-center space-x-4">
              {!isAdmin && needsTrustline && <CreateTrustline />}
              {canCreateTransaction ? (
                <Link
                  to="/create-transaction"
                  className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Create Transaction
                </Link>
              ) : (
                !isAdmin && (
                  <div className="relative group">
                    <button
                      disabled
                      className="bg-neutral-gray text-white font-medium py-2 px-4 rounded flex items-center cursor-not-allowed"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Create Transaction
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-1.5 text-gray-300"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <div className="absolute top-full mt-2 right-0 bg-white px-4 py-3 rounded-md shadow-md z-10 w-64 text-xs text-neutral-gray opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      You need to create a trustline before you can send transactions.
                    </div>
                  </div>
                )
              )}
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          {!isAdmin && (
            <div className="border-b border-neutral-gray/20">
              <nav className="-mb-px flex">
                <button
                  onClick={() => handleTabChange("sent")}
                  className={`${
                    activeTab === "sent"
                      ? "border-primary text-primary"
                      : "border-transparent text-neutral-gray hover:text-neutral-black hover:border-neutral-gray/50"
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  Sent Transactions
                </button>
                <button
                  onClick={() => handleTabChange("received")}
                  className={`${
                    activeTab === "received"
                      ? "border-primary text-primary"
                      : "border-transparent text-neutral-gray hover:text-neutral-black hover:border-neutral-gray/50"
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  Received Transactions
                </button>
              </nav>
            </div>
          )}

          {isAdmin && (
            <div className="bg-neutral-white p-4 border-b border-neutral-gray/20">
              <h2 className="text-lg font-medium text-neutral-black mb-2">Escrow Authority Transaction Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow">
                  <p className="text-sm text-neutral-gray">Total Transactions</p>
                  <p className="text-2xl font-bold">{transactions.length}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <p className="text-sm text-neutral-gray">Total Amount</p>
                  <p className="text-2xl font-bold">
                    {transactions.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2)} RLUSD
                  </p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <p className="text-sm text-neutral-gray">Latest Transaction</p>
                  <p className="text-2xl font-bold">
                    {transactions.length > 0
                      ? new Date(
                          Math.max(...transactions.map((tx) => new Date(tx.createdAt).getTime()))
                        ).toLocaleDateString()
                      : "None"}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="status-filter" className="block text-sm font-medium text-neutral-black mb-1">
                  Filter by Status:
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="block w-full sm:w-64 px-3 py-2 border border-neutral-gray/30 rounded-md shadow-sm focus:outline-none focus:ring-secondary-blue focus:border-secondary-blue sm:text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                  <option value="VERIFICATION_SUCCESS">Verification Success</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="RECIPIENT_VERIFICATION_FAILED">Recipient Verification Failed</option>
                  <option value="SENDER_VERIFICATION_FAILED">Sender Verification Failed</option>
                  <option value="RECIPIENT_AND_SENDER_VERIFICATION_FAILED">Both Verifications Failed</option>
                </select>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="p-6 text-center flex justify-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-neutral-gray/20 border-t-primary"></div>
              <p className="ml-2 text-neutral-gray">Loading transactions...</p>
            </div>
          ) : isAdmin && filteredTransactions.length === 0 ? (
            <div className="p-6 text-center text-neutral-gray">No transactions found with the selected filter</div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center text-neutral-gray">No transactions found</div>
          ) : (
            <div className="overflow-x-auto h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-neutral-gray/20">
                <thead className="bg-neutral-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-gray uppercase tracking-wider">
                      Date
                    </th>
                    {isAdmin && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-gray uppercase tracking-wider">
                          Sender
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-gray uppercase tracking-wider">
                          Recipient
                        </th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-gray uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-gray uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-gray uppercase tracking-wider">
                      Verifications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-gray uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-gray/20">
                  {(isAdmin ? filteredTransactions : transactions).map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-neutral-white">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-gray">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      {isAdmin && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-gray">
                            <div className="relative group cursor-pointer">
                              <span>
                                {transaction.senderAddress.substring(0, 8)}...
                                {transaction.senderAddress.substring(transaction.senderAddress.length - 6)}
                              </span>
                              <div className="absolute left-0 top-full mt-2 bg-neutral-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-normal max-w-xs">
                                {transaction.senderAddress}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-gray">
                            <div className="relative group cursor-pointer">
                              <span>
                                {transaction.recipientAddress.substring(0, 8)}...
                                {transaction.recipientAddress.substring(transaction.recipientAddress.length - 6)}
                              </span>
                              <div className="absolute left-0 top-full mt-2 bg-neutral-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-normal max-w-xs">
                                {transaction.recipientAddress}
                              </div>
                            </div>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-black">
                        {transaction.amount.toFixed(2)} RLUSD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.currentStatus && (
                          <StatusBadge status={transaction.currentStatus.status} size="sm" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-gray">
                        <div className="flex flex-wrap gap-1">
                          {transaction.vendorVerifications.map((verification) => (
                            <div key={verification.id} className="inline-flex items-center mr-2">
                              <span className="mr-1 text-xs">{verification.vendor.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/transactions/${transaction.id}`}
                          className="text-secondary-blue hover:text-secondary-blue/80 inline-flex items-center"
                        >
                          Details
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
