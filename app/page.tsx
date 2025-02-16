import CompanyTable from '@/components/CompanyTable';
import RecentPledges from '@/components/RecentPledges';
import InfluencerSection from '@/components/InfluencerSection';
import { EthereumLogo } from '@/components/icons/EthereumLogo';
import Image from 'next/image';

const mockCompanies = [
  {
    id: '1',
    name: 'Optimism',
    category: 'L2',
    description: 'Leading Ethereum L2 solution',
    commitmentPercentage: 20,
    currentReserve: 50000,
    logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
    dateCommitment: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Arbitrum',
    category: 'L2',
    description: 'Scaling solution for Ethereum',
    commitmentPercentage: 15,
    currentReserve: 45000,
    logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
    dateCommitment: new Date('2024-02-01'),
  },
];

const mockInfluencers = [
  {
    id: '1',
    name: 'Vitalik Buterin',
    avatar: 'https://images.unsplash.com/photo-1602992708529-c9fdb12905c9?auto=format&fit=crop&w=150&h=150',
    description: 'Ethereum co-founder and researcher',
    commitment: 'Building for the decentralized future',
    twitter: 'vitalikbuterin',
  },
  {
    id: '2',
    name: 'Justin Drake',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150',
    description: 'Ethereum researcher',
    commitment: 'Committed to Ethereum\'s scaling journey',
    twitter: 'drakefjustin',
  },
];

export default function Home() {
  const recentPledges = mockCompanies.slice(0, 3);

  return (
    <main className="min-h-screen cyber-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-10 relative">
          <div className="flex justify-center items-center mb-4">
            <div className="relative">
              <EthereumLogo className="w-20 h-20 text-[hsl(var(--primary))] animate-pulse" />
              <div className="absolute inset-0 bg-[hsl(var(--primary))] blur-xl opacity-20" />
            </div>
          </div>
          <div className="flex mx-auto mb-4 justify-center">
            <Image src="/images/strategicethreserve.svg" alt="Strategic Ethereum Reserve" width={507} height={400} />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto backdrop-blur-sm bg-background/50 p-4 rounded-lg">
            "Ethereum security is a shared responsibility." - Justin Drake
          </p>
        </div>

        <div className="space-y-16">
          <div className="flex flex-col gap-12 lg:flex-row">
            <CompanyTable companies={mockCompanies} />
            <RecentPledges pledges={recentPledges} />

          </div>
          <InfluencerSection influencers={mockInfluencers} />
        </div>
        <footer className="mt-24 text-center">
          <a
            href="https://x.com/fabdarice"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-card/80 backdrop-blur-sm  hover:bg-[hsl(var(--primary))/0.1] transition-colors"
          >
            <span className="text-[hsl(var(--primary))] neon-glow">built by</span>
            <span className="text-[hsl(var(--primary))] neon-glow">fabda.eth</span>
          </a>
        </footer>
      </div>
    </main>
  );
}
