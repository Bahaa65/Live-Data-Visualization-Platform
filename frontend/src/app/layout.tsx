import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Data Visualization Platform",
  description: "Live currency and metals prices dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 