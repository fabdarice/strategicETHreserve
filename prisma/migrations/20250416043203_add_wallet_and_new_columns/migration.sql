/*
  Warnings:

  - You are about to drop the column `commitmentPercentage` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `dateCommitment` on the `companies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "companies" DROP COLUMN "commitmentPercentage",
DROP COLUMN "dateCommitment",
ADD COLUMN     "accountingType" TEXT DEFAULT 'SELF_REPORTED',
ADD COLUMN     "contact" TEXT;

-- CreateTable
CREATE TABLE "company_wallets" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_wallets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "company_wallets" ADD CONSTRAINT "company_wallets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
