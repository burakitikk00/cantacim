import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&family=Material+Icons&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-primary font-display antialiased" suppressHydrationWarning>
        <style dangerouslySetInnerHTML={{ __html: `
          .material-symbols-outlined { opacity: 0; }
          .fonts-loaded .material-symbols-outlined { opacity: 1; transition: opacity 0.2s ease-in; }
        `}} />
        <script dangerouslySetInnerHTML={{ __html: `
          document.fonts.ready.then(function() {
            document.body.classList.add('fonts-loaded');
          });
        `}} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
