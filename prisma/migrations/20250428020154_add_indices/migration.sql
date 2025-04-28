-- CreateIndex
CREATE INDEX "snapshot_companies_snapshotDate_idx" ON "snapshot_companies"("snapshotDate");

-- CreateIndex
CREATE INDEX "snapshot_companies_companyId_snapshotDate_idx" ON "snapshot_companies"("companyId", "snapshotDate");

-- CreateIndex
CREATE INDEX "snapshots_snapshotDate_idx" ON "snapshots"("snapshotDate");
