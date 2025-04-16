"use client";

import { useEffect } from "react";
import { toast } from "sonner";
// Remove unused Link and Button imports
// import Link from "next/link";
// import { Button } from "@/components/ui/button";

export default function AdminPage() {
  useEffect(() => {
    // Basic check if admin token exists, redirect if not
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      toast.info("Redirecting to login.");
      window.location.href = "/admin/login";
    } else {
      // If token exists, redirect to the companies page
      toast.info("Redirecting to Companies management.");
      window.location.href = "/admin/companies";
    }
  }, []);

  // Simplified return, as the logic is handled in useEffect
  return <div className="container mx-auto p-8">Loading or redirecting...</div>;
}
