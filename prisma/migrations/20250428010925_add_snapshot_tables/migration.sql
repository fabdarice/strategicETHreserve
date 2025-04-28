/*
  Warnings:

  - You are about to drop the `SnapshotCompany` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SnapshotCompany" DROP CONSTRAINT "SnapshotCompany_companyId_fkey";

-- DropTable
DROP TABLE "SnapshotCompany";

-- CreateTable
CREATE TABLE "snapshot_companies" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "reserve" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "snapshot_companies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "snapshot_companies" ADD CONSTRAINT "snapshot_companies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
