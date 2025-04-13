import React from "react";
import { VendorVerificationEntity } from "../generated/backendApi";
import StatusBadge from "./StatusBadge";

interface VendorVerificationStatusProps {
  vendorVerification: VendorVerificationEntity;
  showTimeline?: boolean;
  senderAddress?: string;
  recipientAddress?: string;
}

const VendorVerificationStatus: React.FC<VendorVerificationStatusProps> = ({
  vendorVerification,
  showTimeline = false,
  senderAddress,
  recipientAddress,
}) => {
  const status = vendorVerification.currentStatus?.status || "PENDING";

  // Determine if this is sender or recipient verification
  const getAddressRole = () => {
    if (senderAddress && vendorVerification.subjectAddress === senderAddress) {
      return "Sender";
    } else if (recipientAddress && vendorVerification.subjectAddress === recipientAddress) {
      return "Recipient";
    }
    return "Address";
  };

  // Get role color
  const getRoleColor = () => {
    const role = getAddressRole();
    if (role === "Sender") return "bg-purple-100 text-purple-800";
    if (role === "Recipient") return "bg-indigo-100 text-indigo-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="font-medium text-gray-700">{vendorVerification.vendor.name}</div>
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getRoleColor()}`}>{getAddressRole()}</span>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      {vendorVerification.vendor.description && (
        <div className="text-xs text-gray-600 mt-1">
          <div className="mt-1">{vendorVerification.vendor.description}</div>
        </div>
      )}
    </div>
  );
};

export default VendorVerificationStatus;
