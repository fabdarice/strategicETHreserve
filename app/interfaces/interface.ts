export interface Company {
  id: string;
  name: string;
  category: string;
  currentReserve: number;
  addresses: string[];
  logo: string;
  website: string | null;
  status: CompanyStatus;
  contact: string | null;
  accountingType: AccountingType;
  news?: string;
  wallets: CompanyWallet[];

  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyWallet {
  id: string;
  companyId: string;
  address: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Influencer {
  id: string;
  name: string;
  avatar: string | null;
  description: string;
  commitment: string;
  twitter: string | null;
}

export enum CompanyStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum AccountingType {
  SELF_REPORTED = "SELF_REPORTED",
  PUBLIC_REPORT = "PUBLIC_REPORT",
  WALLET_TRACKING = "WALLET_TRACKING",
}
