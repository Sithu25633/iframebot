import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { WelcomeModal } from "@/components/WelcomeModal";
import { BottomNav } from "@/components/BottomNav";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "FilmFeed Iframe Stream Web - 100% Ad-Free 4K Streaming (8h TTL)",
  description:
    "Instant high-speed online movie & TV series streaming via private ad-free iframe web player. Direct Cloudflare R2 / CDN delivery with 0 lag and 8 hours expiration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="min-h-screen bg-[#07090e] font-sans text-gray-100 antialiased selection:bg-emerald-500 selection:text-white pb-20 md:pb-0">
        <Navbar />
        <main className="relative min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <BottomNav />
        <WelcomeModal />
      </body>
    </html>
  );
}
