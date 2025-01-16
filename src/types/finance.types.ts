export type TransactionType = 'ticket' | 'parcel' | 'other';

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  referenceId?: string; // ID of the ticket or parcel
  createdAt: Date;
  updatedAt: Date;
};

export type KPI = {
  label: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
};

export type DateRange = {
  startDate: string;
  endDate: string;
};

export type TransactionFilters = DateRange & {
  searchTerm?: string;
  type?: TransactionType;
}; 