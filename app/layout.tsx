import { Inter } from "next/font/google";
import type { Metadata } from "next";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FIFA Collections Helper",
  description: "Scan and track your FIFA World Cup sticker collection",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body>
        <main className="min-h-screen pb-16">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
