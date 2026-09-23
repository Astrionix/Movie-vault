"use client";

import { NavbarSearchClient } from "@/components/search/search";
import { cn } from "@/lib/utils";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { BackButton } from "../../ui/back-button";
import { Badge } from "../../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { NavbarLinks } from "./navbar-links";
import { NavbarMobileNavigation } from "./navbar-mobile-navigation";

interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

const NAV_LINKS_WITH_HOME: NavLink[] = [
  { label: "Home", href: "/home" },
  { label: "Movies", href: "/movies" },
  { label: "TV Shows", href: "/tvshows" },
  { label: "Watchlist", href: "/watchlist" },
];

const getNavLinks = (session: Session | null): NavLink[] => {
  return [...NAV_LINKS_WITH_HOME];
};

interface NavbarClientProps {
  session?: Session | null;
}

export const NavbarClient = ({ session = null }: NavbarClientProps) => {
  return (
    <>
      <nav className={cn("absolute top-0 z-50 w-full")}>
        <div className="flex justify-between items-center md:max-w-7xl lg:max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:pb-8">
          <div className="flex flex-row items-center gap-2 shrink-0">
            <BackButton />
            <Link href="/" className="shrink-0 flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="Movie Vault Logo"
                width={150}
                height={150}
                className="size-10 transition-transform group-hover:scale-105"
              />
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-white/95 to-white/80 bg-clip-text text-transparent hidden sm:inline-block">
                Movie Vault
              </span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 mx-8">
            <NavbarSearchClient />
          </div>

          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 ml-auto">
            <NavbarLinks links={getNavLinks(session)} />
          </div>

          <div className="flex md:hidden items-center space-x-2">
            <NavbarMobileNavigation
              links={getNavLinks(session)}
              session={session}
            >
              <div className="px-2">
                <NavbarSearchClient />
              </div>
            </NavbarMobileNavigation>
          </div>
        </div>
      </nav>
      {/* <div className="h-[35px] md:h-auto" aria-hidden="true" /> */}
    </>
  );
};
