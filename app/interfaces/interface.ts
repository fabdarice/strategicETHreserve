export interface Company {
  id: string;
  name: string;
  category: string;
  secondaryCategory: string[];
  reserve: number;
  pctDiff?: number | null;
  snapshotDate: Date | null;
  logo: string;
  website: string | null;
  twitter: string | null;
  status: CompanyStatus;
  contact: string | null;
  accountingType: AccountingType;
  news: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface AdminCompany extends Company {
  addresses: string[];
  currentReserve: number;
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
