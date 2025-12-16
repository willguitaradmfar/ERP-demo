import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERP Demo",
  description: "ERP Demo with Next.js and SQLite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
