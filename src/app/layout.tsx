import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Lora } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: "Leaflog",
  description: "Track and journal your houseplants",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${lora.variable} h-full`}>
      <body className="min-h-full antialiased" style={{ background: "#f0ebe3", color: "#1c1f2e", fontFamily: "var(--font-geist), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
