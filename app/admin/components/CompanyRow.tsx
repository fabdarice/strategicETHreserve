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

interface CompanyRowProps {
  company: AdminCompany;
  displayCompany: AdminCompany;
  onInputChange: (id: string, field: keyof AdminCompany, value: any) => void;
  onSave: (id: string) => void;
  hasEdits: boolean;
  totalReserve?: number;
  totalReserveUSD?: number;
}

export function CompanyRow({
  company,
  displayCompany,
  onInputChange,
  onSave,
  hasEdits,
  totalReserve = 0,
  totalReserveUSD = 0,
}: CompanyRowProps) {
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
        <select
          value={displayCompany.category ?? ""}
          onChange={(e) =>
            onInputChange(company.id, "category", e.target.value)
          }
          className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
        >
          <option value="">Select a category</option>
          <option value="Company">Company</option>
          <option value="Treasury">Treasury</option>
          <option value="Blockchains">Blockchains</option>
          <option value="Web3 Entities">Web3 Entities</option>
          <option value="Gov">Gov</option>
          <option value="Other">Other</option>
        </select>
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
