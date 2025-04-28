/*
  Warnings:

  - Made the column `totalReserveUSD` on table `snapshots` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "snapshots" ALTER COLUMN "totalReserveUSD" SET NOT NULL,
ALTER COLUMN "totalReserveUSD" SET DEFAULT 0;
