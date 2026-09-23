"use client";

import AdblockerAlert from "@/components/content/adblocker-alert";
import AdblockerIcons from "@/components/content/adblocker-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDetectAdBlock } from "adblock-detect-react";
import { ArrowRight, List } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import StreamingServices from "./steaming-services";

const NeuralNetworkBackground = dynamic(
  () => import("@/components/ui/neural-network-hero"),
  { ssr: false, loading: () => <div className="w-full h-full bg-black" /> },
);

export const HeroSection = () => {
  const router = useRouter();
  const [adblockAlertTrigger, setAdblockAlertTrigger] =
    useState<boolean>(false);

  const adBlockDetected = useDetectAdBlock();

  const handleStartWatchingClick = useCallback(() => {
    router.prefetch("/home");
    router.prefetch("/movies");
    router.prefetch("/tvshows");

    if (adBlockDetected) {
      router.push("/home");
      return;
    }

    setAdblockAlertTrigger(true);
  }, [adBlockDetected, router]);

  return (
    <section className="relative w-full min-h-[100vh] md:min-h-screen overflow-x-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full flex flex-col relative opacity-50 overflow-hidden"
          suppressHydrationWarning
        >
          <NeuralNetworkBackground />
        </div>
      </div>
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none select-none">
        <div className="flex flex-col items-center justify-center min-h-[80vh] lg:min-h-[85vh] gap-6 sm:gap-8 pt-24 pb-8 md:pt-28 md:pb-16">
          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8 max-w-6xl">
            <div
              className="scale-75 sm:scale-100 flex min-w-fit w-full items-center justify-center gap-2 backdrop-blur-md bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/40 shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 rounded-md max-w-xs mx-auto pointer-events-auto"
              aria-hidden="true"
            >
              <Badge>NEW!</Badge>
              <p className="text-xs text-white text-center">
                Track favorites with the <span className="font-bold">new</span>{" "}
                <Link
                  className="text-white underline cursor-pointer"
                  href="/watchlist"
                >
                  watchlist
                </Link>{" "}
                feature!
              </p>
            </div>
            <div className="max-w-4xl">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight text-white drop-shadow-lg"
                data-testid="hero-title"
              >
                Movies and TV Shows <br />
                <span className="text-transparent px-2 bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text">
                  For Everyone.
                </span>
              </h1>
            </div>
            <div className="w-full max-w-5xl">
              <StreamingServices />
            </div>
            <div className="flex flex-col md:!flex-row text-xl items-center justify-center gap-3 md:gap-4 w-full max-w-xs md:max-w-md -translate-y-2">
              <Button
                className="w-full sm:w-auto sm:min-w-[160px] font-light group/arrow pointer-events-auto select-auto "
                aria-label="Get Started"
                variant="stylish"
                onClick={handleStartWatchingClick}
                onMouseEnter={() => {
                  router.prefetch("/home");
                }}
                data-testid="hero-start-watching-button"
              >
                Start Watching
                <ArrowRight className="size-5 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
              </Button>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="chrome"
                    className="w-full sm:w-auto sm:min-w-[160px] font-light pointer-events-auto select-auto"
                  >
                    <Link
                      href="/watchlist"
                      className="flex items-center justify-center group/user"
                    >
                      View Watchlist
                      <List className="size-5 ml-2 group-hover/user:scale-110 transition-transform" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Access your personal watchlist</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <AdblockerAlert
            openSignal={adblockAlertTrigger}
            data-testid="hero-adblocker-alert"
          />
          <div className="flex flex-col items-center gap-4 sm:gap-6 pointer-events-auto select-auto max-w-4xl">
            <p className="text-sm font-extralight text-white/80 text-center px-4 drop-shadow-md">
              I recommend using one of the adblockers below for the best
              experience.
            </p>
            <AdblockerIcons linkTextClassName="text-xs font-extralight text-white/60 hover:text-primary transition-colors drop-shadow-md" />
          </div>
        </div>
      </div>
    </section>
  );
};
