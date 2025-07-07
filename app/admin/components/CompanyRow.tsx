"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarketingModal } from "@/components/MarketingModal";
import { ReserveIncreaseModal } from "@/components/ReserveIncreaseModal";
import {
  Company,
  CompanyStatus,
  AccountingType,
  AdminCompany,
} from "@/app/interfaces/interface";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

interface CompanyRowProps {
  company: AdminCompany;
  displayCompany: AdminCompany;
  onInputChange: (id: string, field: keyof AdminCompany, value: any) => void;
  onSave: (id: string) => void;
  hasEdits: boolean;
  totalReserve?: number;
  totalReserveUSD?: number;
}

// Available secondary categories
const SECONDARY_CATEGORIES = [
  "Public Companies",
  "Private Companies",
  "Treasuries",
  "Blockchains",
  "Web3 Entities",
  "Governments",
  "DeFi",
  "L1",
  "L2",
  "DAO",
  "Metaverse",
  "Others",
];

export function CompanyRow({
  company,
  displayCompany,
  onInputChange,
  onSave,
  hasEdits,
  totalReserve = 0,
  totalReserveUSD = 0,
}: CompanyRowProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ensure secondaryCategory is always an array
  const secondaryCategories = Array.isArray(displayCompany.secondaryCategory)
    ? displayCompany.secondaryCategory
    : displayCompany.secondaryCategory
      ? [displayCompany.secondaryCategory]
      : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCategory = (category: string) => {
    const currentCategories = secondaryCategories;
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];

    onInputChange(company.id, "secondaryCategory", newCategories);
  };

  const removeCategory = (category: string) => {
    const newCategories = secondaryCategories.filter((c) => c !== category);
    onInputChange(company.id, "secondaryCategory", newCategories);
  };

  return (
    <TableRow>
      <TableCell className="p-1">
        <Input
          value={displayCompany.logo ?? ""}
          onChange={(e) => onInputChange(company.id, "logo", e.target.value)}
          className="bg-background h-8 text-xs"
        />
      </TableCell>
      <TableCell className="p-1">
        <Input
          value={displayCompany.name ?? ""}
          onChange={(e) => onInputChange(company.id, "name", e.target.value)}
          className="bg-background h-8 text-xs"
        />
      </TableCell>
      <TableCell className="p-1">
        <Input
          value={displayCompany.ticker ?? ""}
          onChange={(e) => onInputChange(company.id, "ticker", e.target.value)}
          className="bg-background h-8 text-xs"
        />
      </TableCell>
      <TableCell className="p-1">
        <select
          value={displayCompany.category ?? ""}
          onChange={(e) =>
            onInputChange(company.id, "category", e.target.value)
          }
          className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
        >
          <option value="">Select a category</option>
          <option value="Public Companies">Public Companies</option>
          <option value="Private Companies">Private Companies</option>
          <option value="Treasuries">Treasuries</option>
          <option value="Blockchains">Blockchains</option>
          <option value="Web3 Entities">Web3 Entities</option>
          <option value="Governments">Governments</option>
          <option value="Others">Others</option>
        </select>
      </TableCell>
      <TableCell className="p-1">
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className="min-h-[32px] w-full rounded-md border border-input bg-background px-2 py-1 text-xs cursor-pointer flex items-center justify-between"
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {secondaryCategories.length > 0 ? (
                secondaryCategories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                  >
                    {category}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCategory(category);
                      }}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">Select categories</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {SECONDARY_CATEGORIES.map((category) => {
                const isSelected = secondaryCategories.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-accent hover:text-accent-foreground transition-colors ${
                      isSelected ? "bg-primary/10 text-primary" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 border rounded-sm ${isSelected ? "bg-primary border-primary" : "border-input"}`}
                      >
                        {isSelected && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full"></div>
                          </div>
                        )}
                      </div>
                      {category}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="p-1">
        <Input
          type="number"
          min="0"
          step="any"
          value={displayCompany.currentReserve ?? ""}
          onChange={(e) =>
            onInputChange(
              company.id,
              "currentReserve",
              e.target.value === "" ? null : parseFloat(e.target.value)
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
          onChange={(e) => onInputChange(company.id, "status", e.target.value)}
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
          value={displayCompany.accountingType ?? AccountingType.SELF_REPORTED}
          onChange={(e) =>
            onInputChange(company.id, "accountingType", e.target.value)
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
          onChange={(e) => onInputChange(company.id, "news", e.target.value)}
          className="bg-background h-8 text-xs"
        />
      </TableCell>
      <TableCell className="p-1">
        <Input
          value={displayCompany.website ?? ""}
          onChange={(e) => onInputChange(company.id, "website", e.target.value)}
          className="bg-background h-8 text-xs"
        />
      </TableCell>
      <TableCell className="p-1">
        <Input
          value={displayCompany.twitter ?? ""}
          onChange={(e) => onInputChange(company.id, "twitter", e.target.value)}
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
            onInputChange(company.id, "addresses", addressesArray);
          }}
          placeholder="Comma-separated"
          className="w-full resize-y overflow-auto rounded-md border border-input bg-background px-2 py-1 text-xs"
          rows={2}
        />
      </TableCell>
      <TableCell className="p-1">
        <Input
          value={displayCompany.contact ?? ""}
          onChange={(e) => onInputChange(company.id, "contact", e.target.value)}
          className="bg-background h-8 text-xs"
        />
      </TableCell>
      <TableCell className="p-1">
        <MarketingModal
          company={displayCompany as Company}
          totalReserve={totalReserve}
          totalReserveUSD={totalReserveUSD}
        >
          <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7">
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
          onClick={() => onSave(company.id)}
          disabled={!hasEdits}
          className="text-xs px-2 py-1 h-7"
        >
          Save
        </Button>
      </TableCell>
    </TableRow>
  );
}
