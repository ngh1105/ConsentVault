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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://consentvault.local",
  ),
  title: {
    default: "ConsentVault — AI consent verdict archive",
    template: "%s · ConsentVault",
  },
  description:
    "ConsentVault is a polished archive-style demo for reviewing AI content consent disputes and GenLayer-backed verdict receipts.",
  keywords: [
    "GenLayer",
    "AI consent",
    "content moderation",
    "creator policy",
    "verdict receipt",
    "trial",
  ],
  applicationName: "ConsentVault",
  openGraph: {
    type: "website",
    title: "ConsentVault — AI consent verdict archive",
    description:
      "Capture creator consent policies, bundle dispute evidence, and run a GenLayer-backed trial that produces a shareable verdict receipt.",
    siteName: "ConsentVault",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConsentVault — AI consent verdict archive",
    description:
      "GenLayer-backed verdict receipts for AI content consent disputes.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
