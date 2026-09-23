import { HeroSection } from "@/components/layout/sections/hero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movie Vault | Watch Movies and TV Shows",
  description:
    "Movie Vault is an open-source, no-cost, and ad-free movie and tv show stream aggregator.",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": 0,
      "max-image-preview": "large",
      "max-snippet": 150,
    },
  },
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
    site: "/",
    title: "Movie Vault | Watch Movies and TV Shows",
    description:
      "Movie Vault is an open-source, no-cost, and ad-free movie and tv show stream aggregator.",
    images: ["/og.png"],
  },
};

export default function Home() {
  return <HeroSection />;
}
