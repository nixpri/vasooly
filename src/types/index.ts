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

export enum ActivityType {
  BILL_CREATED = 'BILL_CREATED',
  PAYMENT_MADE = 'PAYMENT_MADE',
  BILL_SETTLED = 'BILL_SETTLED',
  BILL_UPDATED = 'BILL_UPDATED',
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  bill: Bill;
  timestamp: Date;
  description: string;
}
