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
import {
  Company,
  CompanyStatus,
  AccountingType,
} from "@/app/interfaces/interface";
import Link from "next/link";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedCompanies, setEditedCompanies] = useState<{
    [key: string]: Partial<Company>;
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

  const handleInputChange = (id: string, field: keyof Company, value: any) => {
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Logo URL</TableHead>
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead className="min-w-[120px]">Category</TableHead>
              <TableHead className="min-w-[120px]">Current Reserve</TableHead>
              <TableHead className="min-w-[120px]">Status</TableHead>
              <TableHead className="min-w-[150px]">Accounting Type</TableHead>
              <TableHead className="min-w-[200px]">News URL</TableHead>
              <TableHead className="min-w-[200px]">Website</TableHead>
              <TableHead className="min-w-[250px]">
                Addresses (comma-sep)
              </TableHead>
              <TableHead className="min-w-[200px]">Contact</TableHead>
              <TableHead className="min-w-[100px]">Marketing</TableHead>
              <TableHead className="min-w-[80px]">Actions</TableHead>
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
                  <TableCell>
                    <Input
                      value={displayCompany.logo ?? ""}
                      onChange={(e) =>
                        handleInputChange(company.id, "logo", e.target.value)
                      }
                      className="bg-background"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={displayCompany.name ?? ""}
                      onChange={(e) =>
                        handleInputChange(company.id, "name", e.target.value)
                      }
                      className="bg-background"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={displayCompany.category ?? ""}
                      onChange={(e) =>
                        handleInputChange(
                          company.id,
                          "category",
                          e.target.value
                        )
                      }
                      className="bg-background"
                    />
                  </TableCell>
                  <TableCell>
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
                      className="bg-background"
                    />
                  </TableCell>
                  <TableCell>
                    <select
                      value={displayCompany.status ?? CompanyStatus.PENDING}
                      onChange={(e) =>
                        handleInputChange(company.id, "status", e.target.value)
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {Object.values(CompanyStatus).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
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
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {Object.values(AccountingType).map((type) => (
                        <option key={type} value={type}>
                          {type.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={displayCompany.news ?? ""}
                      onChange={(e) =>
                        handleInputChange(company.id, "news", e.target.value)
                      }
                      className="bg-background"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={displayCompany.website ?? ""}
                      onChange={(e) =>
                        handleInputChange(company.id, "website", e.target.value)
                      }
                      className="bg-background"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={
                        Array.isArray(displayCompany.addresses)
                          ? displayCompany.addresses.join(", ")
                          : ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          company.id,
                          "addresses",
                          e.target.value
                        )
                      }
                      placeholder="addr1, addr2, ..."
                      className="bg-background"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={displayCompany.contact ?? ""}
                      onChange={(e) =>
                        handleInputChange(company.id, "contact", e.target.value)
                      }
                      className="bg-background"
                    />
                  </TableCell>
                  <TableCell>
                    <MarketingModal company={displayCompany as Company}>
                      <Button variant="outline" size="sm">
                        Share
                      </Button>
                    </MarketingModal>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleSave(company.id)}
                      disabled={!editedCompanies[company.id]}
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
