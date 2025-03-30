export interface Company {
  id: string;
  name: string;
  category: string;
  description: string;
  commitmentPercentage: number;
  logo: string;
  currentReserve: number;
  dateCommitment: Date;
}

export interface Influencer {
  id: string;
  name: string;
  avatar: string | null;
  description: string;
  commitment: string;
  twitter: string | null;
}
