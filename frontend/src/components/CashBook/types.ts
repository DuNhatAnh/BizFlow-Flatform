export interface CashTransaction {
  id: string;
  type: "Receipt" | "Payment";
  paymentMethod: "Cash" | "Transfer";
  amount: number;
  transactionDate: string;
  transactionCode: string;
  reason?: string;
  referenceDocument?: string;
  payerReceiverName?: string;
  address?: string;
  attachedDocuments?: string;
  createdAt: string;
  creatorName?: string;
}
