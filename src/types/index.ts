// Core domain types for Vasooly

export interface Bill {
  id: string;
  title: string;
  totalAmountPaise: number;
  createdAt: Date;
  updatedAt: Date;
  participants: Participant[];
  status: BillStatus;
}

export interface Participant {
  id: string;
  name: string;
  phone?: string;
  amountPaise: number;
  status: PaymentStatus;
}

export enum BillStatus {
  ACTIVE = 'ACTIVE',
  SETTLED = 'SETTLED',
  DELETED = 'DELETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}
