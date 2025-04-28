-- AlterTable
ALTER TABLE "snapshot_companies" ADD COLUMN     "pctDiff" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "pctDiff" DOUBLE PRECISION;
