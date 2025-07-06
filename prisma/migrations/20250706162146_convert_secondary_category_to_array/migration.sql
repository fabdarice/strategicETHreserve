/*
  Warnings:

  - The `secondaryCategory` column on the `companies` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "companies" DROP COLUMN "secondaryCategory",
ADD COLUMN     "secondaryCategory" TEXT[];
