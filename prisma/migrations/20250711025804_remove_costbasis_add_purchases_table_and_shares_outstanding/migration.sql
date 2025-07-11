/*
  Warnings:

  - You are about to drop the column `costbasis` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `costbasis` on the `snapshot_companies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "companies" DROP COLUMN "costbasis";

-- AlterTable
ALTER TABLE "snapshot_companies" DROP COLUMN "costbasis",
ADD COLUMN     "sharesOutstanding" DOUBLE PRECISION,
ADD COLUMN     "totalCostAccumulated" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
