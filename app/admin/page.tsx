"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
// Remove unused Link and Button imports
// import Link from "next/link";
// import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    validateAuthAndRedirect();
  }, []);

  const validateAuthAndRedirect = async () => {
    const adminToken = localStorage.getItem("admin_token");

    if (!adminToken) {
      toast.info("Please login to access admin panel.");
      window.location.href = "/admin/login";
      return;
    }

    // Validate token with server
    try {
      const response = await fetch("/api/admin", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to validate authentication");
      }

      // Token is valid, redirect to companies management
      toast.success("Welcome back! Redirecting to dashboard...");
      window.location.href = "/admin/companies";
    } catch (error) {
      console.error("Auth validation error:", error);
      toast.error("Authentication failed. Please login again.");
      localStorage.removeItem("admin_token");
      window.location.href = "/admin/login";
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {isValidating ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Validating authentication...
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">Redirecting...</p>
        )}
      </div>
    </div>
  );
}
