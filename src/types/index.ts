// Core domain types for Vasooly

export enum ExpenseCategory {
  FOOD = 'FOOD',
  TRAVEL = 'TRAVEL',
  SHOPPING = 'SHOPPING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OTHER = 'OTHER',
}

export interface Bill {
  id: string;
  title: string;
  totalAmountPaise: number;
  createdAt: Date;
  updatedAt: Date;
  participants: Participant[];
  status: BillStatus;
  category?: ExpenseCategory;
  receiptPhoto?: string;
  description?: string; // Bill notes/description
  activityLog?: ActivityEvent[]; // Timeline events
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

// Activity event for bill timeline (internal to VasoolyDetail)
export enum ActivityEventType {
  BILL_CREATED = 'BILL_CREATED',
  BILL_EDITED = 'BILL_EDITED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  BILL_SETTLED = 'BILL_SETTLED',
}

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  timestamp: Date;
  participantName?: string; // For payment events
  amount?: number; // For payment events (in paise)
  metadata?: Record<string, any>;
}

export interface Karzedaar {
  id: string;
  name: string;
  phone?: string;
  upiId?: string;
  addedAt: Date;
  billCount: number;
  totalAmountPaise: number;
}

// Settings interface (for SettingsScreen enhancements)
export interface Settings {
  // Existing
  defaultVPA?: string;
  defaultUPIName?: string;
  enableHaptics: boolean;
  autoDeleteDays: number;
  reminderEnabled: boolean;

  // NEW - User Profile
  profilePhoto?: string; // URI or base64

  // NEW - Payment Preferences
  defaultPaymentMethod: 'UPI' | 'Cash' | 'Other';
  defaultPaymentNote?: string;

  // NEW - Notification Preferences
  reminderFrequency: 'daily' | 'every3days' | 'weekly' | 'never';
  reminderTime: string; // HH:MM format (e.g., "10:00")
  settlementNotifications: boolean;
  newBillNotifications: boolean;
}
