"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MarketingModal } from "@/components/MarketingModal";
import { ReserveIncreaseModal } from "@/components/ReserveIncreaseModal";
import {
  Company,
  CompanyStatus,
  AccountingType,
  AdminCompany,
} from "@/app/interfaces/interface";
import Link from "next/link";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [editedCompanies, setEditedCompanies] = useState<{
    [key: string]: Partial<AdminCompany>;
  }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("admin_token");
      if (!adminToken) {
        window.location.href = "/admin/login"; // Redirect if no token
        return;
      }
      const response = await fetch("/api/admin", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        toast.error("Unauthorized. Redirecting to login.");
        window.location.href = "/admin/login"; // Redirect on auth error
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      const fetchedCompanies = Array.isArray(data.companies)
        ? data.companies
        : [];
      setCompanies(fetchedCompanies);
      setEditedCompanies({});
      setEthPrice(data.lastETHPrice);
    } catch (error: any) {
      console.error("Failed to fetch companies:", error);
      toast.error(
        `Failed to fetch companies: ${error.message || "Unknown error"}`
      );
      if (error.message.includes("Unauthorized")) {
        window.location.href = "/admin/login";
      }
    } finally {
      setLoading(false);
    }
  };

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
      !companyUpdates.createdAt // Only set if not already explicitly set in this edit session
    ) {
      // Set createdAt to the current time ISO string directly in updates
      // Assuming the API expects an ISO string format for dates
      companyUpdates.createdAt = new Date().toISOString() as any; // Use 'as any' if Company interface expects Date
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
      fetchData();
    } catch (error: any) {
      console.error("Failed to update company:", error);
      toast.error(`Failed to update company: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <nav className="mb-4">
          <Link href="/admin" className="mr-4 text-blue-500 hover:underline">
            Admin Home
          </Link>
          <Link
            href="/admin/influencers"
            className="text-blue-500 hover:underline"
          >
            Manage Influencers
          </Link>
        </nav>
        <h1 className="text-2xl font-bold mb-8">Manage Companies</h1>
        <div>Loading Companies...</div>
      </div>
    );
  }

  const totalReserve = companies
    .filter((company) => company.status === CompanyStatus.ACTIVE)
    .reduce((sum, company) => sum + (company.reserve || 0), 0);

  const totalReserveUSD = totalReserve * ethPrice;

  return (
    <div className="container mx-auto p-8">
      <nav className="mb-4">
        <Link href="/admin" className="mr-4 text-blue-500 hover:underline">
          Admin Home
        </Link>
        <Link
          href="/admin/influencers"
          className="text-blue-500 hover:underline"
        >
          Manage Influencers
        </Link>
      </nav>
      <h1 className="text-2xl font-bold mb-8">Manage Companies</h1>
      <div className="overflow-x-auto">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Logo URL</TableHead>
              <TableHead className="w-[120px]">Name</TableHead>
              <TableHead className="w-[100px]">Category</TableHead>
              <TableHead className="w-[100px]">Reserve</TableHead>
              <TableHead className="w-[100px]">Snapshot Reserve</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[110px]">Accounting</TableHead>
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
                <TableRow key={company.id}>
                  <TableCell className="p-1">
                    <Input
                      value={displayCompany.logo ?? ""}
                      onChange={(e) =>
                        handleInputChange(company.id, "logo", e.target.value)
                      }
                      className="bg-background h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      value={displayCompany.name ?? ""}
                      onChange={(e) =>
                        handleInputChange(company.id, "name", e.target.value)
                      }
                      className="bg-background h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      value={displayCompany.category ?? ""}
                      onChange={(e) =>
                        handleInputChange(
                          company.id,
                          "category",
                          e.target.value
                        )
                      }
                      className="bg-background h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={displayCompany.currentReserve ?? ""}
                      onChange={(e) =>
                        handleInputChange(
                          company.id,
                          "currentReserve",
                          e.target.value === ""
                            ? null
                            : parseFloat(e.target.value)
                        )
                      }
                      className="bg-background h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <div className="bg-background h-8 px-3 py-1 text-xs rounded-md border border-input flex items-center">
                      {displayCompany.reserve != null
                        ? displayCompany.reserve.toFixed(2)
                        : ""}
                    </div>
                  </TableCell>
                  <TableCell className="p-1">
                    <select
                      value={displayCompany.status ?? CompanyStatus.PENDING}
                      onChange={(e) =>
                        handleInputChange(company.id, "status", e.target.value)
                      }
                      className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                    >
                      {Object.values(CompanyStatus).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="p-1">
                    <select
                      value={
                        displayCompany.accountingType ??
                        AccountingType.SELF_REPORTED
                      }
                      onChange={(e) =>
                        handleInputChange(
                          company.id,
                          "accountingType",
                          e.target.value
                        )
                      }
                      className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                    >
                      {Object.values(AccountingType).map((type) => (
                        <option key={type} value={type}>
                          {type.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      value={displayCompany.news ?? ""}
                      onChange={(e) =>
                        handleInputChange(company.id, "news", e.target.value)
                      }
                      className="bg-background h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      value={displayCompany.website ?? ""}
                      onChange={(e) =>
                        handleInputChange(company.id, "website", e.target.value)
                      }
                      className="bg-background h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      value={displayCompany.twitter ?? ""}
                      onChange={(e) =>
                        handleInputChange(company.id, "twitter", e.target.value)
                      }
                      className="bg-background h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <textarea
                      defaultValue={
                        Array.isArray(displayCompany.addresses)
                          ? displayCompany.addresses.join("\n")
                          : ""
                      }
                      onBlur={(e) => {
                        const raw = e.target.value;
                        const addressesArray = raw
                          .split(/[\n,]+/)
                          .map((addr) => addr.trim())
                          .filter(Boolean);
                        handleInputChange(
                          company.id,
                          "addresses",
                          addressesArray
                        );
                      }}
                      placeholder="Comma-separated"
                      className="w-full resize-y overflow-auto rounded-md border border-input bg-background px-2 py-1 text-xs"
                      rows={2}
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      value={displayCompany.contact ?? ""}
                      onChange={(e) =>
                        handleInputChange(company.id, "contact", e.target.value)
                      }
                      className="bg-background h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <MarketingModal
                      company={displayCompany as Company}
                      totalReserve={totalReserve}
                      totalReserveUSD={totalReserveUSD}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 h-7"
                      >
                        Share
                      </Button>
                    </MarketingModal>
                  </TableCell>
                  <TableCell className="p-1">
                    <ReserveIncreaseModal company={displayCompany as Company}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 h-7 bg-[hsl(var(--primary))/0.1] hover:bg-[hsl(var(--primary))/0.2] text-[hsl(var(--primary))]"
                      >
                        Growth
                      </Button>
                    </ReserveIncreaseModal>
                  </TableCell>
                  <TableCell className="p-1">
                    <Button
                      onClick={() => handleSave(company.id)}
                      disabled={!editedCompanies[company.id]}
                      className="text-xs px-2 py-1 h-7"
                    >
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
