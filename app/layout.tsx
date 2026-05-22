import type { Metadata } from "next";
import "./globals.css";
import { fontSans, fontMono } from "./fonts";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { GenLayerWalletProvider } from "@/components/providers/genlayer-wallet-provider";
import { ConsentVaultProvider } from "@/components/providers/consent-vault-provider";
import { AppShell } from "@/components/shell/app-shell";

function resolveSiteUrl(): URL {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  try {
    return new URL(raw || "https://consentvault.local");
  } catch {
    return new URL("https://consentvault.local");
  }
}

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
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
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${fontSans.variable} ${fontMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <ConsentVaultProvider>
            <GenLayerWalletProvider>
              <AppShell>{children}</AppShell>
            </GenLayerWalletProvider>
          </ConsentVaultProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
