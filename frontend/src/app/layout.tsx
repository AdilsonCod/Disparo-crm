import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zaapp - WhatsApp CRM & Marketing",
  description: "SaaS Platform for WhatsApp Automation and CRM",
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
