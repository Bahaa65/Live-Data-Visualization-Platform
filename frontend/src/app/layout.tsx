import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Cairo } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: "Live Data Visualization Platform",
  description: "Live currency and metals prices dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cairo.variable}`}> 
      <body className="font-sans bg-gradient-to-br from-indigo-400 via-cyan-300 to-blue-200 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 min-h-screen w-full relative overflow-x-hidden">
        {/* خلفية متدرجة متحركة */}
        <div className="fixed inset-0 -z-10 animate-gradient bg-gradient-to-br from-indigo-400 via-cyan-300 to-blue-200 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 opacity-80 blur-2xl" />
        {children}
      </body>
    </html>
  );
}