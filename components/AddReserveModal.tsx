"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCompany } from "@/app/interfaces/interface";
import { X } from "lucide-react";

// Custom DialogContent with close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = DialogPrimitive.Content.displayName;

interface AddReserveModalProps {
  company: AdminCompany;
  children: React.ReactNode;
  onUpdate: () => void;
}

export function AddReserveModal({
  company,
  children,
  onUpdate,
}: AddReserveModalProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [totalCost, setTotalCost] = useState<string>("");
  const [type, setType] = useState<string>("buy");
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);

  const calculateNewReserve = () => {
    const addedAmount = parseFloat(amount) || 0;
    const currentReserve = company.currentReserve || 0;

    if (addedAmount <= 0) return null;

    return currentReserve + addedAmount;
  };

  const handleSubmit = async () => {
    const addedAmount = parseFloat(amount) || 0;
    const purchaseTotalCost = parseFloat(totalCost) || 0;

    if (addedAmount <= 0 || purchaseTotalCost <= 0) return;

    setLoading(true);
    try {
      // Get admin token for authentication
      const adminToken = localStorage.getItem("admin_token");
      if (!adminToken) {
        throw new Error("Admin authentication required");
      }

      // Call API to create purchase record
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          companyId: company.id,
          amount: addedAmount,
          totalCost: purchaseTotalCost,
          type: type,
          purchaseDate: purchaseDate,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to create purchase");
      }

      // Call the parent's update function to refresh data
      onUpdate();

      // Reset form
      setAmount("");
      setTotalCost("");
      setType("buy");
      setPurchaseDate(new Date().toISOString().split("T")[0]);
      setOpen(false);
    } catch (error) {
      console.error("Error creating purchase:", error);
    } finally {
      setLoading(false);
    }
  };

  const newReserve = calculateNewReserve();
  const isValid = parseFloat(amount) > 0 && parseFloat(totalCost) > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <CustomDialogContent>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Add Purchase</h2>
            <p className="text-sm text-muted-foreground">
              Record a new ETH purchase for {company.name}
            </p>
          </div>

          {/* Current State */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h3 className="text-sm font-medium">Current State</h3>
            <div className="text-sm">
              <span className="text-muted-foreground">Reserve:</span>
              <div className="font-mono">
                {company.currentReserve?.toFixed(4) || 0} ETH
              </div>
            </div>
          </div>

          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (ETH)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="any"
                placeholder="0.0000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="totalCost">Total Cost (USD)</Label>
              <Input
                id="totalCost"
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="buy">Buy</option>
                <option value="yield">Yield</option>
              </select>
            </div>

            <div>
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
          </div>

          {/* Purchase Preview */}
          {parseFloat(amount) > 0 && parseFloat(totalCost) > 0 && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
              <h3 className="text-sm font-medium text-primary">
                Purchase Preview
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <div className="font-mono text-primary">
                    {parseFloat(amount).toFixed(4)} ETH
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Cost:</span>
                  <div className="font-mono text-primary">
                    ${parseFloat(totalCost).toFixed(2)} USD
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <div className="font-mono text-primary capitalize">
                    {type}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Purchase Date:</span>
                  <div className="font-mono text-primary">
                    {new Date(purchaseDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Avg Price:</span>
                  <div className="font-mono text-primary">
                    ${(parseFloat(totalCost) / parseFloat(amount)).toFixed(2)}
                    /ETH
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid || loading}>
              {loading ? "Creating..." : "Add Purchase"}
            </Button>
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
