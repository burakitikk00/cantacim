import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "L'ELITE | Luxury Bags & Scarves",
  description: "Dünyaca ünlü markaların en seçkin çanta ve şal koleksiyonları — L'ELITE Luxury Store",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&family=Material+Icons&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-primary font-display antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
