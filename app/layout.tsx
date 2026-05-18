import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { GenLayerWalletProvider } from "@/components/providers/genlayer-wallet-provider";
import { ConsentVaultProvider } from "@/components/providers/consent-vault-provider";
import { SiteShell } from "@/components/site-shell";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ConsentVault",
  description:
    "ConsentVault is a polished archive-style demo for reviewing AI content consent disputes and simulated verdict receipts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <ConsentVaultProvider>
          <GenLayerWalletProvider>
            <SiteShell>{children}</SiteShell>
          </GenLayerWalletProvider>
        </ConsentVaultProvider>
      </body>
    </html>
  );
}
