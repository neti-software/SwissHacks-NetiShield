import React from "react";

export type StatusType = "PENDING" | "APPROVED" | "REJECTED";
export type TransactionStatusType =
  | "PENDING_VERIFICATION"
  | "RECIPIENT_AND_SENDER_VERIFICATION_FAILED"
  | "RECIPIENT_VERIFICATION_FAILED"
  | "SENDER_VERIFICATION_FAILED"
  | "ESCROW_FUNDED"
  | "SENDER_APPROVED"
  | "RECIPIENT_APPROVED"
  | "ADMIN_APPROVED"
  | "SENDER_REJECTED"
  | "RECIPIENT_REJECTED"
  | "ADMIN_REJECTED"
  | "VERIFICATION_SUCCESS"
  | "REJECTED"
  | "SUCCESS"
  | "FAILED";

interface StatusBadgeProps {
  status: StatusType | TransactionStatusType;
  pulsing?: boolean;
  size?: "sm" | "md" | "lg";
  isOld?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, pulsing = false, size = "md", isOld = false }) => {
  // Map the status to UI properties
  let bgColor = "bg-neutral-white";
  let textColor = "text-neutral-black";
  let displayLabel: string = String(status);
  let showSpinner = false;

  // Handle verification status
  switch (status) {
    case "PENDING":
      bgColor = isOld ? "bg-secondary-blue/10" : "bg-secondary-blue/20";
      textColor = isOld ? "text-secondary-blue" : "text-secondary-blue";
      displayLabel = "Pending";
      showSpinner = !isOld;
      break;
    case "APPROVED":
      bgColor = isOld ? "bg-green-50" : "bg-green-100";
      textColor = isOld ? "text-green-600" : "text-green-800";
      displayLabel = "Approved";
      break;
    case "REJECTED":
      bgColor = isOld ? "bg-primary/10" : "bg-primary/20";
      textColor = isOld ? "text-primary" : "text-primary";
      displayLabel = "Rejected";
      break;
    case "PENDING_VERIFICATION":
      bgColor = isOld ? "bg-secondary-blue/10" : "bg-secondary-blue/20";
      textColor = isOld ? "text-secondary-blue" : "text-secondary-blue";
      displayLabel = "Pending Verification";
      showSpinner = !isOld;
      break;
    case "RECIPIENT_AND_SENDER_VERIFICATION_FAILED":
      bgColor = isOld ? "bg-primary/10" : "bg-primary/20";
      textColor = isOld ? "text-primary" : "text-primary";
      displayLabel = "Both Verifications Failed";
      break;
    case "RECIPIENT_VERIFICATION_FAILED":
      bgColor = isOld ? "bg-primary/10" : "bg-primary/20";
      textColor = isOld ? "text-primary" : "text-primary";
      displayLabel = "Recipient Verification Failed";
      break;
    case "SENDER_VERIFICATION_FAILED":
      bgColor = isOld ? "bg-primary/10" : "bg-primary/20";
      textColor = isOld ? "text-primary" : "text-primary";
      displayLabel = "Sender Verification Failed";
      break;
    case "SENDER_APPROVED":
      bgColor = isOld ? "bg-green-50" : "bg-green-100";
      textColor = isOld ? "text-green-600" : "text-green-800";
      displayLabel = "Sender Approved";
      break;
    case "RECIPIENT_APPROVED":
      bgColor = isOld ? "bg-green-50" : "bg-green-100";
      textColor = isOld ? "text-green-600" : "text-green-800";
      displayLabel = "Recipient Approved";
      break;
    case "ADMIN_APPROVED":
      bgColor = isOld ? "bg-green-50" : "bg-green-100";
      textColor = isOld ? "text-green-600" : "text-green-800";
      displayLabel = "Escrow Authority Approved";
      break;
    case "SENDER_REJECTED":
      bgColor = isOld ? "bg-primary/10" : "bg-primary/20";
      textColor = isOld ? "text-primary" : "text-primary";
      displayLabel = "Sender Rejected";
      break;
    case "RECIPIENT_REJECTED":
      bgColor = isOld ? "bg-primary/10" : "bg-primary/20";
      textColor = isOld ? "text-primary" : "text-primary";
      displayLabel = "Recipient Rejected";
      break;
    case "ADMIN_REJECTED":
      bgColor = isOld ? "bg-primary/10" : "bg-primary/20";
      textColor = isOld ? "text-primary" : "text-primary";
      displayLabel = "Escrow Authority Rejected";
      break;
    case "ESCROW_FUNDED":
      bgColor = isOld ? "bg-secondary-blue/10" : "bg-secondary-blue/20";
      textColor = isOld ? "text-secondary-blue" : "text-secondary-blue";
      displayLabel = "Escrow Funded";
      break;
    case "VERIFICATION_SUCCESS":
      bgColor = isOld ? "bg-green-50" : "bg-green-100";
      textColor = isOld ? "text-green-600" : "text-green-800";
      displayLabel = "Verification Successful";
      break;
    case "SUCCESS":
      bgColor = isOld ? "bg-green-50" : "bg-green-100";
      textColor = isOld ? "text-green-600" : "text-green-800";
      displayLabel = "Success";
      break;
    case "FAILED":
      bgColor = isOld ? "bg-primary/10" : "bg-primary/20";
      textColor = isOld ? "text-primary" : "text-primary";
      displayLabel = "Failed";
      break;
  }

  // Determine size-specific classes
  let sizeClasses = "px-2.5 py-0.5 text-xs";
  if (size === "sm") {
    sizeClasses = "px-2 py-0.5 text-xs";
  } else if (size === "lg") {
    sizeClasses = "px-3 py-1 text-sm";
  }

  return (
    <span className={`inline-flex items-center ${bgColor} ${textColor} rounded-full ${sizeClasses} font-medium`}>
      {showSpinner && (
        <svg
          className="animate-spin -ml-1 mr-2 h-3 w-3 text-current"
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
      )}
      {pulsing && !showSpinner && (
        <span className="mr-2 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-secondary-blue opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary-blue"></span>
        </span>
      )}
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
