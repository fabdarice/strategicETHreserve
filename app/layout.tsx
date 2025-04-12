import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Strategic ETH Reserve",
  description:
    "Join the Strategic Ethereum Reserve (SER) movement. Companies pledging to maintain ETH reserves for a sustainable Ethereum ecosystem.",
  icons: {
    icon: "/images/strategicethreserve.svg",
    shortcut: "/images/strategicethreserve.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
