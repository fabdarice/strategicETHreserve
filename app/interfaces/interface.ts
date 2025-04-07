export interface Company {
  id: string;
  name: string;
  category: string;
  description: string;
  commitmentPercentage: number;
  currentReserve: number;
  addresses: string[];
  logo: string;
  website: string | null;
  status: "PENDING" | "ACTIVE" | "INACTIVE";
  dateCommitment: string;
  news?: string;
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
