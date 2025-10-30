export interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  dividend: number;
}

export interface Asset {
  id: string;
  name: string;
  icon: string;
  cost: number;
  income: number;
}

export interface Expense {
  id: string;
  name: string;
  icon: string;
  cost: number;
  monthlyExpense: number;
}

export interface OwnedItem {
  type: 'stock' | 'asset' | 'expense';
  name: string;
  monthlyIncome: number;
  purchasePrice: number;
  loanPayment?: number;
  stockId?: string;
  assetId?: string;
  quantity?: number;
}

export type CardType = 'stock' | 'asset' | 'expense';

export interface OwnedStock {
  quantity: number;
  avgPrice: number;
  totalDividends: number;
}

export interface OwnedAsset {
  quantity: number;
  avgPrice: number;
  totalIncome: number;
}