"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

interface NavbarMobileNavigationProps {
  links: NavLink[];
  children: React.ReactNode;
  session?: unknown;
}

export const NavbarMobileNavigation = ({
  links,
  children,
}: NavbarMobileNavigationProps) => {
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLinkClick = () => {
    setOpen(false);
  };

  if (!isMounted) {
    return (
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle navigation menu"
          className="h-10 w-10"
        >
          <Menu size={20} />
        </Button>
      </div>
    );
  }

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle navigation menu"
            className="h-10 w-10"
          >
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className={cn(
            "w-[85vw] sm:w-[400px] p-0 flex flex-col",
            "bg-black/95 backdrop-blur-xl border-r border-white/10",
            "shadow-2xl shadow-black/50",
          )}
        >
          <SheetHeader className="px-6 py-5 border-b border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Link href="/" onClick={handleLinkClick} className="shrink-0">
                <Image
                  src="/logo.png"
                  alt="Movie Vault Logo"
                  width={150}
                  height={150}
                  className="size-8"
                />
              </Link>
              <SheetTitle className="text-left text-xl font-semibold text-white">
                Menu
              </SheetTitle>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {/* Navigation Links */}
            <div className="px-4 py-6 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "block w-full px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-200",
                    "text-white/90 hover:text-white",
                    "hover:bg-white/10 hover:backdrop-blur-sm",
                    "focus:bg-white/10 focus:text-white focus:outline-none",
                    "active:bg-white/15",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <Separator className="my-4 bg-white/10" />

            {/* Search Section */}
            <div className="px-4 py-4">{children}</div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
