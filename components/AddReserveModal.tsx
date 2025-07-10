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
  onUpdate: (
    companyId: string,
    newReserve: number,
    newCostBasis: number
  ) => void;
}

export function AddReserveModal({
  company,
  children,
  onUpdate,
}: AddReserveModalProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [costBasis, setCostBasis] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const calculateNewValues = () => {
    const addedAmount = parseFloat(amount) || 0;
    const addedCostBasis = parseFloat(costBasis) || 0;
    const currentReserve = company.currentReserve || 0;
    const currentCostBasis = company.costbasis || 0;

    if (addedAmount <= 0) return null;

    const newReserve = currentReserve + addedAmount;

    // Weighted average cost basis calculation
    const newCostBasis =
      currentReserve > 0
        ? (currentReserve * currentCostBasis + addedAmount * addedCostBasis) /
          newReserve
        : addedCostBasis;

    return {
      newReserve,
      newCostBasis,
    };
  };

  const handleSubmit = async () => {
    const calculations = calculateNewValues();
    if (!calculations) return;

    setLoading(true);
    try {
      // Call the parent's update function
      onUpdate(company.id, calculations.newReserve, calculations.newCostBasis);

      // Reset form
      setAmount("");
      setCostBasis("");
      setOpen(false);
    } catch (error) {
      console.error("Error updating reserve:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculations = calculateNewValues();
  const isValid =
    calculations && parseFloat(amount) > 0 && parseFloat(costBasis) > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <CustomDialogContent>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Add Reserve & Cost Basis</h2>
            <p className="text-sm text-muted-foreground">
              Add new ETH amount with its cost basis for {company.name}
            </p>
          </div>

          {/* Current State */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h3 className="text-sm font-medium">Current State</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Reserve:</span>
                <div className="font-mono">
                  {company.currentReserve?.toFixed(4) || 0} ETH
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Cost Basis:</span>
                <div className="font-mono">
                  ${company.costbasis?.toFixed(2) || 0}/ETH
                </div>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount to Add (ETH)</Label>
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
              <Label htmlFor="costBasis">Cost Basis (USD per ETH)</Label>
              <Input
                id="costBasis"
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={costBasis}
                onChange={(e) => setCostBasis(e.target.value)}
              />
            </div>
          </div>

          {/* Calculation Preview */}
          {calculations && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
              <h3 className="text-sm font-medium text-primary">
                New State (Preview)
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">New Reserve:</span>
                  <div className="font-mono text-primary">
                    {calculations.newReserve.toFixed(4)} ETH
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">New Cost Basis:</span>
                  <div className="font-mono text-primary">
                    ${calculations.newCostBasis.toFixed(2)}/ETH
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
              {loading ? "Updating..." : "Add Reserve"}
            </Button>
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
