-- CreateTable
CREATE TABLE "SnapshotCompany" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "reserve" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SnapshotCompany_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SnapshotCompany" ADD CONSTRAINT "SnapshotCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
