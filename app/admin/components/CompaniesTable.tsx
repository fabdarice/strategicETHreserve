"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  CompanyStatus,
  AccountingType,
  AdminCompany,
} from "@/app/interfaces/interface";
import { CompanyRow } from "./CompanyRow";

interface CompaniesTableProps {
  companies: AdminCompany[];
  title: string;
  totalReserve: number;
  totalReserveUSD: number;
  onCompaniesUpdate: () => void;
}

export function CompaniesTable({
  companies,
  title,
  totalReserve,
  totalReserveUSD,
  onCompaniesUpdate,
}: CompaniesTableProps) {
  const [editedCompanies, setEditedCompanies] = useState<{
    [key: string]: Partial<AdminCompany>;
  }>({});

  const handleInputChange = (
    id: string,
    field: keyof AdminCompany,
    value: any
  ) => {
    setEditedCompanies((prev) => {
      const currentEdits = prev[id] || {};
      const newEdits = { ...currentEdits, [field]: value };
      return { ...prev, [id]: newEdits };
    });
  };

  const handleSave = async (id: string) => {
    const companyUpdates = editedCompanies[id];
    const originalCompany = companies.find((c) => c.id === id);

    if (!companyUpdates || !originalCompany) {
      toast.error("Could not find company data to save.");
      return;
    }

    // Check if status is changing from PENDING to ACTIVE and set createdAt if needed
    if (
      originalCompany.status === CompanyStatus.PENDING &&
      companyUpdates.status === CompanyStatus.ACTIVE &&
      !companyUpdates.createdAt
    ) {
      companyUpdates.createdAt = new Date().toISOString() as any;
    }

    const payloadData = { ...originalCompany, ...companyUpdates };

    // Ensure addresses are handled correctly
    if (payloadData.addresses && !Array.isArray(payloadData.addresses)) {
      payloadData.addresses = String(payloadData.addresses)
        .split(",")
        .map((addr) => addr.trim())
        .filter(Boolean);
    } else if (!payloadData.addresses) {
      payloadData.addresses = [];
    }

    if (
      payloadData.currentReserve !== undefined &&
      payloadData.currentReserve !== null
    ) {
      const reserveNum = parseFloat(String(payloadData.currentReserve));
      payloadData.currentReserve = isNaN(reserveNum) ? 0 : reserveNum;
    } else {
      payloadData.currentReserve = 0;
    }

    try {
      const adminToken = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          type: "company",
          id,
          data: payloadData,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        toast.error("Unauthorized. Please login again.");
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Update failed with status: ${response.status}`
        );
      }

      toast.success("Company updated successfully");
      // Clear the edited state for this company
      setEditedCompanies((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      onCompaniesUpdate();
    } catch (error: any) {
      console.error("Failed to update company:", error);
      toast.error(`Failed to update company: ${error.message}`);
    }
  };

  if (companies.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-500">No companies in this category.</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Logo URL</TableHead>
              <TableHead className="w-[120px]">Name</TableHead>
              <TableHead className="w-[100px]">Ticker</TableHead>
              <TableHead className="w-[100px]">Category</TableHead>
              <TableHead className="w-[100px]">Secondary Category</TableHead>
              <TableHead className="w-[100px]">Reserve</TableHead>
              <TableHead className="w-[100px]">Snapshot Reserve</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[110px]">Accounting</TableHead>
              <TableHead className="w-[120px]">Market Cap Tracking</TableHead>
              <TableHead className="w-[130px]">News URL</TableHead>
              <TableHead className="w-[130px]">Website</TableHead>
              <TableHead className="w-[120px]">Twitter</TableHead>
              <TableHead className="w-[150px]">Addresses</TableHead>
              <TableHead className="w-[120px]">Contact</TableHead>
              <TableHead className="w-[80px]">Marketing</TableHead>
              <TableHead className="w-[80px]">Growth</TableHead>
              <TableHead className="w-[60px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => {
              const displayCompany = {
                ...company,
                ...(editedCompanies[company.id] || {}),
              };

              return (
                <CompanyRow
                  key={company.id}
                  company={company}
                  displayCompany={displayCompany}
                  onInputChange={handleInputChange}
                  onSave={handleSave}
                  hasEdits={!!editedCompanies[company.id]}
                  totalReserve={totalReserve}
                  totalReserveUSD={totalReserveUSD}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
