"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, "Entity name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  twitter: z.string(),
  currentReserve: z
    .string()
    .transform((val) => {
      if (!val) return undefined;
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error("Must be a number");
      if (num < 0) throw new Error("Must be a positive number");
      return num;
    })
    .optional(),
  addresses: z.string().optional(),
  contact: z.string().optional(),
});

export default function SubmitCompanyDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      website: "",
      twitter: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setError(null);
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          addresses: values.addresses
            ? values.addresses
                .split(",")
                .map((addr) => addr.trim())
                .filter(Boolean)
            : [],
          website: values.website || null,
          twitter: values.twitter || null,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        form.reset();
        setTimeout(() => {
          setOpen(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit entity");
      }
    } catch (error) {
      console.error("Failed to submit entity:", error);
      setError(
        error instanceof Error ? error.message : "Failed to submit entity"
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Your Entity</DialogTitle>
          <DialogDescription>
            Join the SER movement by submitting your entity.
          </DialogDescription>
        </DialogHeader>
        {isSuccess ? (
          <div className="text-center py-8">
            <div className="text-green-500 mb-4">✓</div>
            <h3 className="text-lg font-semibold mb-2">
              Submission Successful!
            </h3>
            <p className="text-muted-foreground">
              Your company has been submitted and will be reviewed soon.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-background"
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          required
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DAO">DAO</SelectItem>
                            <SelectItem value="Company">Company</SelectItem>
                            <SelectItem value="TradFi">TradFi</SelectItem>
                            <SelectItem value="Government">
                              Government
                            </SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-background"
                            placeholder="https://example.com"
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-background"
                            placeholder="@username"
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currentReserve"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current ETH Reserve</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="0.01"
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Submitter&apos;s Contact</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-background"
                            placeholder="Telegram/Email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="addresses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Addresses</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-background"
                          placeholder="0xfoo,0xbar"
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of addresses (kept private, never
                        shared)
                      </FormDescription>
                      <div className="mt-3 bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/30 rounded-lg p-4 shadow-md space-y-2 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/images/eth-pattern.svg')] opacity-5"></div>
                        <div className="relative z-10">
                          <p className="text-sm font-medium text-primary-foreground/90 flex items-center">
                            <span className="mr-2 text-primary">✦</span>
                            We track ETH assets across:
                          </p>
                          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 mt-2">
                            <li className="transition-colors duration-200 hover:text-primary">
                              Networks: Ethereum, Base, Optimism, Arbitrum,
                              Arbitrum Nova, zkSync, Linea, Gnosis
                            </li>
                            <li className="transition-colors duration-200 hover:text-primary">
                              Assets: ETH, stETH, wstETH, rETH, WETH, oETH,
                              ankrETH, ETHx, rsETH, eETH, weETH, cmETH, mETH,
                              spWETH, cWETHv3 and Aave derivatives (aETH, aWETH,
                              awstETH, aweETH, arETH, aosETH, aETHx, aLidoWETH)
                            </li>
                            <li className="transition-colors duration-200 hover:text-primary">
                              Validator nodes using withdrawal credentials
                            </li>
                          </ul>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-[hsl(var(--primary))] text-secondary hover:text-primary-foreground hover:bg-[hsl(var(--primary))/0.8] dark:bg-[hsl(var(--primary))] dark:text-primary-foreground dark:hover:bg-[hsl(var(--primary))/0.8]"
                >
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
