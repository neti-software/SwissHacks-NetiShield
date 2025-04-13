import { XummJsonTransaction } from 'xumm-sdk/dist/src/types';
import * as xrpl from 'xrpl';

export interface CreateEscrowParams {
  message: string;
  requiredWeight: number;
  entries: {
    address: string;
    weight: number;
  }[];
}

export interface CreateTrustSetTransactionParams {
  account: string;
  destination: string;
  amount: string;
  type: 'TrustSet';
}

export interface CreatePaymentTransactionParams {
  account: string;
  destination: string;
  amount: string;
  type: 'Payment';
}

export interface CreateMultisigPaymentTransactionParams extends CreatePaymentTransactionParams {
  lastLedgerSequence: number;
}

export interface SubmitMultisigTransactionParams {
  transaction: xrpl.SubmittableTransaction;
  signers: xrpl.Signer[];
}

export interface SignTransactionParams {
  transaction: XummJsonTransaction;
  signer: string;
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
}
