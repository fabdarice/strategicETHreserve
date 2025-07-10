-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "marketCapTracking" TEXT DEFAULT 'Crypto';

-- AlterTable
ALTER TABLE "snapshot_companies" ADD COLUMN     "marketCap" DOUBLE PRECISION;
