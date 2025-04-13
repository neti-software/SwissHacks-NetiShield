import React from "react";
import Tooltip from "./Tooltip";

interface DecisionStatusProps {
  type: "Sender" | "Recipient" | "Escrow Authority";
  isCurrentUser?: boolean;
  hasDecided: boolean;
  transactionHash?: string | string[];
  explorerUrl?: string;
}

const DecisionStatus: React.FC<DecisionStatusProps> = ({
  type,
  isCurrentUser = false,
  hasDecided,
  transactionHash,
  explorerUrl = process.env.REACT_APP_XRPL_EXPLORER_URL,
}) => {
  return (
    <div
      className={`p-4 rounded-lg border ${
        hasDecided ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
      }`}
    >
      <div className="flex items-center">
        <div
          className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
            hasDecided ? "bg-green-100" : "bg-yellow-100"
          }`}
        >
          {hasDecided ? (
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              {type === "Escrow Authority" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
          )}
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${hasDecided ? "text-green-800" : "text-yellow-800"}`}>{type}</h3>
          <p className={`text-sm mt-1 ${hasDecided ? "text-green-700" : "text-yellow-700"}`}>
            {hasDecided ? "Signed" : "Not signed"}
            {isCurrentUser && !hasDecided && <span className="ml-1 font-medium">(You)</span>}
          </p>
          {transactionHash && hasDecided && (
            <div className="mt-1">
              {Array.isArray(transactionHash) ? (
                transactionHash.map((hash, index) => (
                  <Tooltip key={index} content={hash}>
                    <a
                      href={`${explorerUrl}/transactions/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center mb-1"
                    >
                      <span className="truncate max-w-[150px]">{hash}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 ml-1 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </Tooltip>
                ))
              ) : (
                <Tooltip content={transactionHash}>
                  <a
                    href={`${explorerUrl}/transactions/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <span className="truncate max-w-[150px]">View on XRPL Explorer</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 ml-1 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DecisionStatus;
