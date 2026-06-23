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
      <body className="min-h-full antialiased" style={{ background: "var(--cream)", color: "var(--text)", fontFamily: "var(--font-geist), sans-serif" }}>
        <a
          href="#main-content"
          className="sr-only sr-only-focusable fixed left-2 top-2 z-50 rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--navy)" }}
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
