import type { Metadata, Viewport } from "next";
import { Geist, Newsreader } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-newsreader", display: "swap" });

export const metadata: Metadata = {
  title: "HomeFind",
  description: "A shared inventory for one home",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "HomeFind" },
};

export const viewport: Viewport = { themeColor: "#f5f3ef" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${geist.variable} ${newsreader.variable}`}>{children}</body></html>;
}
