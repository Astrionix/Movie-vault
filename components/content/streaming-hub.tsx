"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface StreamingPlatform {
  id: string;
  name: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  badge: string;
  href: string;
  glowColor: string;
  borderColor: string;
  bgGradient: string;
}

const PLATFORMS: StreamingPlatform[] = [
  {
    id: "netflix",
    name: "Netflix",
    logo: "/netflix.svg",
    logoWidth: 80,
    logoHeight: 28,
    badge: "Popular Hits",
    href: "/movies/browse?filter=ott-netflix-movies",
    glowColor: "rgba(229, 9, 20, 0.4)",
    borderColor: "hover:border-red-500/60",
    bgGradient: "from-red-950/20 via-black/40 to-transparent",
  },
  {
    id: "disney",
    name: "Disney+",
    logo: "/disneyplus.svg",
    logoWidth: 84,
    logoHeight: 32,
    badge: "Family & Marvel",
    href: "/movies/browse?filter=ott-disney-movies",
    glowColor: "rgba(0, 99, 229, 0.4)",
    borderColor: "hover:border-blue-500/60",
    bgGradient: "from-blue-950/25 via-black/40 to-transparent",
  },
  {
    id: "prime",
    name: "Prime Video",
    logo: "/primevideo.svg",
    logoWidth: 85,
    logoHeight: 30,
    badge: "Included",
    href: "/movies/browse?filter=ott-prime-movies",
    glowColor: "rgba(0, 168, 225, 0.4)",
    borderColor: "hover:border-cyan-400/60",
    bgGradient: "from-cyan-950/25 via-black/40 to-transparent",
  },
  {
    id: "apple",
    name: "Apple TV+",
    logo: "/appletvplus.svg",
    logoWidth: 70,
    logoHeight: 28,
    badge: "Originals",
    href: "/movies/browse?filter=ott-apple-movies",
    glowColor: "rgba(255, 255, 255, 0.3)",
    borderColor: "hover:border-zinc-300/60",
    bgGradient: "from-zinc-800/20 via-black/40 to-transparent",
  },
  {
    id: "max",
    name: "HBO Max",
    logo: "/hbomax.svg",
    logoWidth: 84,
    logoHeight: 26,
    badge: "Blockbusters",
    href: "/movies/browse?filter=ott-max-movies",
    glowColor: "rgba(153, 51, 255, 0.4)",
    borderColor: "hover:border-purple-500/60",
    bgGradient: "from-purple-950/25 via-black/40 to-transparent",
  },
  {
    id: "hulu",
    name: "Hulu",
    logo: "/hulu.svg",
    logoWidth: 65,
    logoHeight: 24,
    badge: "Trending",
    href: "/movies/browse?filter=ott-hulu-movies",
    glowColor: "rgba(28, 231, 131, 0.35)",
    borderColor: "hover:border-emerald-400/60",
    bgGradient: "from-emerald-950/25 via-black/40 to-transparent",
  },
  {
    id: "peacock",
    name: "Peacock",
    logo: "/peacock.svg",
    logoWidth: 82,
    logoHeight: 24,
    badge: "Exclusives",
    href: "/movies/browse?filter=ott-peacock-movies",
    glowColor: "rgba(253, 184, 19, 0.35)",
    borderColor: "hover:border-amber-400/60",
    bgGradient: "from-amber-950/20 via-black/40 to-transparent",
  },
];

export function StreamingHub() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-medium tracking-tight text-white/95">
              Browse by Streaming Service
            </h2>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Explore curated releases and originals from top OTT platforms
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Streaming Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3.5">
        {PLATFORMS.map((platform) => (
          <Link
            key={platform.id}
            href={platform.href}
            className={`group relative flex flex-col items-center justify-center py-4 px-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md hover:bg-gradient-to-b ${platform.bgGradient} ${platform.borderColor} transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.98] shadow-lg`}
            style={{
              boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Ambient hover glow */}
            <div
              className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
              style={{
                boxShadow: `inset 0 0 20px ${platform.glowColor}, 0 0 24px -4px ${platform.glowColor}`,
              }}
            />

            {/* Logo */}
            <div className="h-8 sm:h-9 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Image
                src={platform.logo}
                alt={`${platform.name} logo`}
                width={platform.logoWidth}
                height={platform.logoHeight}
                unoptimized
                className="max-h-6 sm:max-h-7 w-auto object-contain opacity-85 group-hover:opacity-100 drop-shadow-md transition-all duration-200"
              />
            </div>

            {/* Badge */}
            <span className="mt-2 text-[10px] sm:text-[11px] font-medium tracking-wider uppercase text-white/60 group-hover:text-white/90 transition-colors">
              {platform.badge}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default StreamingHub;
