import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BalanceProvider } from "./context/BalanceContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TransactionDetails from "./pages/TransactionDetails";
import CreateTransaction from "./pages/CreateTransaction";
import { useAuth } from "./context/AuthContext";
import { useGoogleAnalytics } from "./hooks/useGoogleAnalytics";

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isConnected, isLoading } = useAuth();

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

// App wrapper that doesn't use hooks
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <BalanceProvider>
          <AppRoutes />
        </BalanceProvider>
      </AuthProvider>
    </Router>
  );
};

// Routes component that can use hooks
const AppRoutes: React.FC = () => {
  // Initialize Google Analytics
  useGoogleAnalytics();

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/:tab"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions/:id"
        element={
          <ProtectedRoute>
            <TransactionDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-transaction"
        element={
          <ProtectedRoute>
            <CreateTransaction />
          </ProtectedRoute>
        }
      />
      {/* Catch all unknown routes and redirect to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
