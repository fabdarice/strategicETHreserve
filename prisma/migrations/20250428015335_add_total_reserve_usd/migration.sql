-- AlterTable
ALTER TABLE "snapshot_companies" ADD COLUMN     "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "totalReserveUSD" DOUBLE PRECISION;
