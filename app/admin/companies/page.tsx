"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanyStatus, AdminCompany } from "@/app/interfaces/interface";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CompaniesTable } from "../components/CompaniesTable";
import { CompanyStats } from "../components/CompanyStats";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [ethPrice, setEthPrice] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    toast.success("Logged out successfully");
    window.location.href = "/admin/login";
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("admin_token");
      if (!adminToken) {
        window.location.href = "/admin/login";
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
        window.location.href = "/admin/login";
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

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <nav className="mb-4 flex justify-between items-center">
          <Link href="/admin" className="mr-4 text-blue-500 hover:underline">
            Admin Home
          </Link>
          <Button onClick={handleLogout} variant="outline" size="sm">
            Logout
          </Button>
        </nav>
        <h1 className="text-2xl font-bold mb-8">Manage Companies</h1>
        <div>Loading Companies...</div>
      </div>
    );
  }

  // Split companies by status
  const inReviewCompanies = companies.filter(
    (company) => company.status === CompanyStatus.IN_REVIEW
  );
  const activeCompanies = companies.filter(
    (company) => company.status !== CompanyStatus.IN_REVIEW
  );

  // Calculate totals from active companies only
  const totalReserve = activeCompanies.reduce(
    (sum, company) => sum + (company.reserve || 0),
    0
  );
  const totalReserveUSD = totalReserve * ethPrice;

  return (
    <div className="container mx-auto p-8">
      <nav className="mb-4 flex justify-between items-center">
        <Link href="/" className="mr-4 text-blue-500 hover:underline">
          Home
        </Link>
        <Button onClick={handleLogout} variant="outline" size="sm">
          Logout
        </Button>
      </nav>

      <h1 className="text-2xl font-bold mb-8">Manage Companies</h1>

      <CompanyStats
        totalReserve={totalReserve}
        totalReserveUSD={totalReserveUSD}
      />

      <CompaniesTable
        companies={inReviewCompanies}
        title="In Review Companies"
        totalReserve={totalReserve}
        totalReserveUSD={totalReserveUSD}
        ethPrice={ethPrice}
        onCompaniesUpdate={fetchData}
      />

      <CompaniesTable
        companies={activeCompanies}
        title="Active & Pending Companies"
        totalReserve={totalReserve}
        totalReserveUSD={totalReserveUSD}
        ethPrice={ethPrice}
        onCompaniesUpdate={fetchData}
      />
    </div>
  );
}
