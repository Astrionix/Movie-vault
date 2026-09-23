import { NavbarServer } from "@/components/layout/nav/navbar-server";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { OnboardingProvider } from "@/components/providers/onboarding-provider";
import { GlobalDockProvider } from "@/components/ui/global-dock";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/lib/query-client";
import { cn, validateEnv } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

if (process.env.NODE_ENV !== "production") {
  validateEnv();
}

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: "Movie Vault | Watch Movies and TV Shows",
  icons: {
    icon: "/favicon.ico",
  },
  description:
    "Movie Vault is an open-source, no-cost, and ad-free movie and tv show stream aggregator.",
  openGraph: {
    type: "website",
    url: "/",
    title: "Movie Vault | Watch Movies and TV Shows",
    description:
      "Movie Vault is an open-source, no-cost, and ad-free movie and tv show stream aggregator.",
    images: [
      {
        url: "/og.png",
        alt: "Movie Vault | Watch Movies and TV Shows",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@MovieVault",
    title: "Movie Vault | Watch Movies and TV Shows",
    description:
      "Movie Vault is an open-source, no-cost, and ad-free movie and tv show stream aggregator.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn("min-h-screen bg-background", inter.className)}>
        <QueryProvider>
          <OnboardingProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              forcedTheme="dark"
              disableTransitionOnChange
            >
              <TooltipProvider>
                <GlobalDockProvider>
                  <NavbarServer />
                  <main className="flex-1">{children}</main>
                  <Toaster richColors closeButton />
                </GlobalDockProvider>
              </TooltipProvider>
            </ThemeProvider>
          </OnboardingProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
