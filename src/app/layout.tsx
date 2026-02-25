import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
// Simple mono fallback
const mono = Inter({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Demand Pool — The Premium Pre-order Experience",
  description: "A high-trust marketplace bridging consumer intent and production certainty.",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Demand Pool" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} antialiased bg-white text-gray-900 overflow-hidden overscroll-none h-[100dvh] w-[100dvw] m-0 p-0`}>
        {children}
      </body>
    </html>
  );
}
