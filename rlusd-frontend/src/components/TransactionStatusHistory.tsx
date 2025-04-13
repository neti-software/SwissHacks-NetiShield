import React from "react";
import { TransactionStatusLogEntity } from "../generated/backendApi";

interface TransactionStatusHistoryProps {
  statusLog: TransactionStatusLogEntity[];
}

const TransactionStatusHistory: React.FC<TransactionStatusHistoryProps> = ({ statusLog }) => {
  if (statusLog.length === 0) {
    return <div className="text-sm text-gray-500">No status history available</div>;
  }

  const getStatusColor = (status: TransactionStatusLogEntity["status"], isLatest: boolean) => {
    if (!isLatest) {
      switch (status) {
        case "SUCCESS":
          return "bg-green-400/70";
        case "FAILED":
        case "REJECTED":
        case "SENDER_REJECTED":
        case "RECIPIENT_REJECTED":
        case "ADMIN_REJECTED":
          return "bg-red-400/70";
        case "VERIFICATION_SUCCESS":
        case "SENDER_APPROVED":
        case "RECIPIENT_APPROVED":
        case "ADMIN_APPROVED":
        case "ESCROW_FUNDED":
          return "bg-green-400/70";
        case "RECIPIENT_AND_SENDER_VERIFICATION_FAILED":
        case "RECIPIENT_VERIFICATION_FAILED":
        case "SENDER_VERIFICATION_FAILED":
          return "bg-red-400/70";
        case "PENDING_VERIFICATION":
        default:
          return "bg-blue-400/70";
      }
    }

    switch (status) {
      case "SUCCESS":
        return "bg-green-500";
      case "FAILED":
      case "REJECTED":
      case "SENDER_REJECTED":
      case "RECIPIENT_REJECTED":
      case "ADMIN_REJECTED":
        return "bg-red-500";
      case "VERIFICATION_SUCCESS":
      case "SENDER_APPROVED":
      case "RECIPIENT_APPROVED":
      case "ADMIN_APPROVED":
      case "ESCROW_FUNDED":
        return "bg-green-500";
      case "RECIPIENT_AND_SENDER_VERIFICATION_FAILED":
      case "RECIPIENT_VERIFICATION_FAILED":
      case "SENDER_VERIFICATION_FAILED":
        return "bg-red-500";
      case "PENDING_VERIFICATION":
      default:
        return "bg-blue-500";
    }
  };

  const getStatusLabel = (status: TransactionStatusLogEntity["status"]) => {
    switch (status) {
      case "SUCCESS":
        return "Success";
      case "FAILED":
        return "Failed";
      case "REJECTED":
        return "Rejected";
      case "SENDER_REJECTED":
        return "Sender Rejected";
      case "RECIPIENT_REJECTED":
        return "Recipient Rejected";
      case "ADMIN_REJECTED":
        return "Escrow Authority Rejected";
      case "VERIFICATION_SUCCESS":
        return "Verification Successful";
      case "SENDER_APPROVED":
        return "Sender Approved";
      case "RECIPIENT_APPROVED":
        return "Recipient Approved";
      case "ADMIN_APPROVED":
        return "Escrow Authority Approved";
      case "ESCROW_FUNDED":
        return "Escrow Funded";
      case "RECIPIENT_AND_SENDER_VERIFICATION_FAILED":
        return "Both Verifications Failed";
      case "RECIPIENT_VERIFICATION_FAILED":
        return "Recipient Verification Failed";
      case "SENDER_VERIFICATION_FAILED":
        return "Sender Verification Failed";
      case "PENDING_VERIFICATION":
        return "Pending Verification";
      default:
        return String(status);
    }
  };

  const getStatusDescription = (status: TransactionStatusLogEntity["status"]) => {
    switch (status) {
      case "SUCCESS":
        return "Transaction completed successfully";
      case "FAILED":
        return "Transaction failed to complete";
      case "REJECTED":
        return "Transaction was rejected";
      case "SENDER_REJECTED":
        return "Transaction was rejected by the sender";
      case "RECIPIENT_REJECTED":
        return "Transaction was rejected by the recipient";
      case "ADMIN_REJECTED":
        return "Transaction was rejected by the Escrow Authority";
      case "VERIFICATION_SUCCESS":
        return "Verification was successful, awaiting confirmation";
      case "SENDER_APPROVED":
        return "Transaction was approved by the sender";
      case "RECIPIENT_APPROVED":
        return "Transaction was approved by the recipient";
      case "ADMIN_APPROVED":
        return "Transaction was approved by the Escrow Authority";
      case "ESCROW_FUNDED":
        return "Funds have been placed in escrow for this transaction";
      case "RECIPIENT_AND_SENDER_VERIFICATION_FAILED":
        return "Both recipient and sender verification failed";
      case "RECIPIENT_VERIFICATION_FAILED":
        return "Recipient verification failed, transaction requires additional steps";
      case "SENDER_VERIFICATION_FAILED":
        return "Sender verification failed, transaction requires additional steps";
      case "PENDING_VERIFICATION":
        return "Pending verification from required vendors";
      default:
        return "";
    }
  };

  const shouldAnimate = (status: TransactionStatusLogEntity["status"], isLatest: boolean) => {
    if (!isLatest) return false;
    return status === "PENDING_VERIFICATION";
  };

  const getStatusIcon = (status: TransactionStatusLogEntity["status"], isLatest: boolean) => {
    if (shouldAnimate(status, isLatest)) {
      return (
        <div className="h-4 w-4 rounded-full relative">
          <div
            className={`absolute inset-0 rounded-full ${getStatusColor(status, isLatest)} animate-ping opacity-75`}
          ></div>
          <div className={`absolute inset-0 rounded-full ${getStatusColor(status, isLatest)}`}></div>
        </div>
      );
    }

    switch (status) {
      case "SUCCESS":
      case "VERIFICATION_SUCCESS":
      case "SENDER_APPROVED":
      case "RECIPIENT_APPROVED":
      case "ADMIN_APPROVED":
      case "ESCROW_FUNDED":
        return (
          <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
            <svg
              className="h-3 w-3 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "FAILED":
      case "REJECTED":
      case "SENDER_REJECTED":
      case "RECIPIENT_REJECTED":
      case "ADMIN_REJECTED":
      case "RECIPIENT_AND_SENDER_VERIFICATION_FAILED":
      case "RECIPIENT_VERIFICATION_FAILED":
      case "SENDER_VERIFICATION_FAILED":
        return (
          <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
            <svg
              className="h-3 w-3 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return <div className={`h-4 w-4 rounded-full ${getStatusColor(status, isLatest)}`}></div>;
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {statusLog.map((status, index) => {
        const isLatest = index === 0;
        return (
          <div key={status.id} className="flex items-start">
            <div className="flex-shrink-0 relative flex items-center justify-center">
              {getStatusIcon(status.status, isLatest)}
              {index !== statusLog.length - 1 && <div className="absolute w-0.5 bg-gray-200 h-10 top-4 -z-10"></div>}
            </div>
            <div className="ml-4 flex-1">
              <div className={`font-medium ${isLatest ? "text-gray-900" : "text-gray-700"}`}>
                {getStatusLabel(status.status)}
                {isLatest && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    Latest
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">{new Date(status.createdAt).toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">{getStatusDescription(status.status)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionStatusHistory;
