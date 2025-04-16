/*
  Warnings:

  - You are about to drop the column `description` on the `companies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "companies" DROP COLUMN "description";

-- CreateTable
CREATE TABLE "snapshots" (
    "id" TEXT NOT NULL,
    "totalReserve" TEXT NOT NULL,
    "totalCompanies" INTEGER NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "snapshots_pkey" PRIMARY KEY ("id")
);
