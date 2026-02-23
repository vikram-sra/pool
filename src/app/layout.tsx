import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Demand Pool — Signal. Pledge. Build.",
  description: "A high-trust marketplace bridging consumer intent and production certainty through financially backed pledges.",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Demand Pool" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover", // enable safe-area env() vars
  themeColor: "#000000",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white overflow-hidden overscroll-none h-[100dvh] w-[100dvw] m-0 p-0`}>
        {children}
      </body>
    </html>
  );
}
