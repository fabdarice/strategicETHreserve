import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Strategic ETH Reserve (SER)",
    template: "%s | Strategic ETH Reserve",
  },
  description:
    "Follow the Strategic Ethereum Reserve (SER): Companies accumulating ETH as a strategic reserve asset.",
  keywords: [
    "Strategic Ethereum Reserve",
    "ETH reserves",
    "institutional ETH",
    "corporate treasury",
    "ETH tracking",
    "blockchain analytics",
    "cryptocurrency reserves",
    "institutional adoption",
    "ETH holdings",
    "strategic reserves",
  ],
  authors: [{ name: "Strategic ETH Reserve" }],
  creator: "Strategic ETH Reserve",
  publisher: "Strategic ETH Reserve",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://strategicethreserve.xyz"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://strategicethreserve.xyz",
    title: "Strategic ETH Reserve (SER)",
    description:
      "Follow the Strategic Ethereum Reserve (SER): Companies accumulating ETH as a strategic reserve asset.",
    siteName: "Strategic ETH Reserve",
    images: [
      {
        url: "/images/socialgraph.png",
        width: 507,
        height: 400,
        alt: "Strategic ETH Reserve Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Strategic ETH Reserve (SER)",
    description:
      "Follow the Strategic Ethereum Reserve (SER): Companies accumulating ETH as a strategic reserve asset.",
    images: ["/images/socialgraph.png"],
    creator: "@StrategicETHRes",
    site: "@StrategicETHRes",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/images/ethereum_favicon.ico",
        sizes: "32x32",
        type: "image/x-icon",
      },
      {
        url: "/images/ethereum_favicon.ico",
        sizes: "16x16",
        type: "image/x-icon",
      },
    ],
    shortcut: "/images/ethereum_favicon.ico",
    apple: "/images/ethereum_favicon.ico",
  },
  manifest: "/site.webmanifest",
  other: {
    "msapplication-TileColor": "#000000",
    "theme-color": "#000000",
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
        <SpeedInsights />
      </body>
    </html>
  );
}
