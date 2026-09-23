"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AudioLanguageToggle } from "@/components/ui/audio-language-toggle";
import {
  AUDIO_LANGUAGES,
  useServerStore,
  videoServers,
} from "@/lib/stores/server-store";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Keyboard,
  Maximize,
  Minimize,
  Play,
  RotateCcw,
  Server,
  ShieldCheck,
  SkipForward,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

export interface StreamPlayerProps {
  videoSrc: string | null;
  title: string;
  mediaType: "movie" | "tv";
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  episodeTitle?: string | null;
  backdropUrl?: string | null;
  releaseYear?: string | number | null;
  voteAverage?: number | null;
  onClose: () => void;
  className?: string;
}

export function StreamPlayer({
  videoSrc,
  title,
  mediaType,
  seasonNumber,
  episodeNumber,
  episodeTitle,
  backdropUrl,
  releaseYear,
  voteAverage,
  onClose,
  className,
}: StreamPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isShieldActive, setIsShieldActive] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const headerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    selectedServer,
    setSelectedServer,
    vidnestContentType,
    animePreference,
    audioLanguage,
    setAudioLanguage,
  } = useServerStore();

  // Track hydration for portal mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track fullscreen state change
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Prevent background scrolling while cinema player is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Controls auto-hide on mouse idle
  const handleMouseMove = useCallback(() => {
    setShowHeader(true);
    if (headerTimerRef.current) {
      clearTimeout(headerTimerRef.current);
    }
    headerTimerRef.current = setTimeout(() => {
      if (!isShieldActive && !showShortcutsModal) {
        setShowHeader(false);
      }
    }, 3000);
  }, [isShieldActive, showShortcutsModal]);

  useEffect(() => {
    return () => {
      if (headerTimerRef.current) {
        clearTimeout(headerTimerRef.current);
      }
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  const handleNextServer = useCallback(() => {
    const currentIndex = videoServers.findIndex(
      (s) => s.id === selectedServer.id,
    );
    const nextIndex = (currentIndex + 1) % videoServers.length;
    const nextServer = videoServers[nextIndex];
    setSelectedServer(nextServer);
    setReloadKey((prev) => prev + 1);
    toast.info(`Switched to Server: ${nextServer.name}`, {
      duration: 2500,
    });
  }, [selectedServer.id, setSelectedServer]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showShortcutsModal) {
          setShowShortcutsModal(false);
          return;
        }
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {
            /* ignore error when exiting fullscreen */
          });
        } else {
          onClose();
        }
      } else if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        setShowShortcutsModal((prev) => !prev);
      } else if (e.key.toLowerCase() === "r" && !e.metaKey && !e.ctrlKey) {
        setReloadKey((prev) => prev + 1);
      } else if (e.key.toLowerCase() === "f" && !e.metaKey && !e.ctrlKey) {
        toggleFullscreen();
      } else if (
        (e.key.toLowerCase() === "n" || e.key.toLowerCase() === "s") &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        handleNextServer();
      } else if (e.key.toLowerCase() === "l" && !e.metaKey && !e.ctrlKey) {
        const currentIndex = AUDIO_LANGUAGES.findIndex(
          (opt) => opt.code === audioLanguage,
        );
        const nextIndex = (currentIndex + 1) % AUDIO_LANGUAGES.length;
        const nextLang = AUDIO_LANGUAGES[nextIndex];
        setAudioLanguage(nextLang.code);
        setReloadKey((prev) => prev + 1);
        toast.info(`Audio language: ${nextLang.nativeLabel}`, {
          duration: 2000,
        });
      } else if (
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        e.key >= "1" &&
        e.key <= "9"
      ) {
        const index = parseInt(e.key, 10) - 1;
        if (videoServers[index]) {
          setSelectedServer(videoServers[index]);
          setReloadKey((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    audioLanguage,
    handleNextServer,
    onClose,
    setAudioLanguage,
    setSelectedServer,
    showShortcutsModal,
  ]);

  const iframeSrcWithKey = videoSrc
    ? `${videoSrc}${videoSrc.includes("?") ? "&" : "?"}_rk=${reloadKey}`
    : null;

  const currentIframeKey = `${iframeSrcWithKey}-${vidnestContentType}-${animePreference}-${audioLanguage}-${selectedServer.id}-${reloadKey}`;

  if (!mounted) return null;

  return createPortal(
    <TooltipProvider delayDuration={200}>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className={cn(
          "fixed inset-0 z-[99999] w-screen h-screen bg-[#020617] flex flex-col justify-between overflow-hidden select-none font-sans",
          className,
        )}
      >
        {/* Subtle Edge Ambient Glow */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_40%,rgba(59,130,246,0.08),rgba(0,0,0,0.98))]" />

        {/* Top hover detection strip (wakes up controls on cursor hover near top) */}
        <div
          onMouseEnter={() => setShowHeader(true)}
          className="absolute top-0 left-0 right-0 h-16 z-40 pointer-events-auto"
        />

        {/* Minimalist Floating Controls (Responsive on mobile & desktop) */}
        <div
          onMouseEnter={() => setShowHeader(true)}
          className={cn(
            "absolute top-3 right-3 sm:top-4 sm:right-4 z-50 pointer-events-auto flex items-center gap-1.5 sm:gap-2 transition-all duration-300 max-w-[calc(100vw-24px)] flex-wrap justify-end",
            showHeader
              ? "opacity-100 scale-100"
              : "opacity-45 hover:opacity-100 scale-95 hover:scale-100",
          )}
        >
          {/* Quick Next Server Button */}
          <button
            type="button"
            onClick={handleNextServer}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/25 hover:bg-primary/40 text-white backdrop-blur-md border border-primary/40 transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
            title="Next Server (Press N or S)"
          >
            <SkipForward className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">Next Server</span>
          </button>

          {/* In-Player Server Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-black/80 hover:bg-black/95 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
                aria-label="Switch Server"
              >
                <Server className="h-3.5 w-3.5 text-primary" />
                <span className="max-w-[75px] sm:max-w-none truncate">
                  {selectedServer.name}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 p-1.5 bg-slate-950/95 backdrop-blur-xl border-white/15 text-white shadow-2xl rounded-xl max-h-72 overflow-y-auto"
            >
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-white/10 mb-1">
                Select Server (1-9)
              </div>
              {videoServers.map((server, index) => {
                const isSelected = selectedServer.id === server.id;
                return (
                  <DropdownMenuItem
                    key={server.id}
                    onClick={() => {
                      setSelectedServer(server);
                      setReloadKey((prev) => prev + 1);
                      toast.info(`Switched server to ${server.name}`, {
                        duration: 2000,
                      });
                    }}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors",
                      isSelected
                        ? "bg-primary/20 text-white font-semibold"
                        : "text-gray-300 hover:text-white hover:bg-white/10",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span>{server.name}</span>
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <AudioLanguageToggle variant="compact" />

          {/* Fullscreen Button for Mobile & Desktop */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-black/80 hover:bg-black/95 text-white/80 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
                aria-label={
                  isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"
                }
              >
                {isFullscreen ? (
                  <Minimize className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <Maximize className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Close Player Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-black/80 hover:bg-rose-600/90 text-white/80 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
                aria-label="Close player"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Close player (Esc)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Central Cinema Stage - 100% Seamless Full-Screen */}
        <main className="relative flex-1 w-full h-full flex items-center justify-center p-0 overflow-hidden bg-black">
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {!videoSrc ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-white space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center animate-pulse">
                  <RotateCcw className="h-8 w-8 text-primary animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Resolving Cinema Stream
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 max-w-sm">
                    Connecting to {selectedServer.name} streaming cluster...
                  </p>
                </div>
              </div>
            ) : (
              <iframe
                key={currentIframeKey}
                src={iframeSrcWithKey ?? undefined}
                className={cn(
                  "border-0 select-none",
                  isFullscreen
                    ? "w-full h-full"
                    : "w-full aspect-video max-h-full sm:h-full sm:aspect-auto",
                )}
                referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}

            {/* Cinema Splash & Click-to-Play Activation */}
            <AnimatePresence>
              {isShieldActive && videoSrc && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setIsShieldActive(false)}
                  className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer select-none group/shield px-4 text-center overflow-hidden"
                >
                  {/* Subtle Blurred Backdrop */}
                  {backdropUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-md scale-105 transition-transform duration-700 group-hover/shield:scale-110"
                      style={{ backgroundImage: `url(${backdropUrl})` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/60" />

                  {/* Glowing Cinema Play Button */}
                  <div className="relative flex items-center justify-center mb-5 z-10">
                    <div className="absolute inset-0 rounded-full bg-primary/40 blur-2xl group-hover/shield:scale-150 transition-transform duration-500 animate-pulse" />
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover/shield:scale-110 border-2 border-white/30">
                      <Play className="h-9 w-9 sm:h-11 sm:w-11 ml-1.5 fill-current" />
                    </div>
                  </div>

                  <div className="relative z-10 space-y-2 max-w-lg">
                    <h3 className="text-white text-xl sm:text-2xl font-bold tracking-tight drop-shadow-lg">
                      {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 inline shrink-0" />
                      <span>Click anywhere to start playback</span>
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-gray-400">
                      <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                        Server: {selectedServer.name}
                      </span>
                      <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                        1080p Ready
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Keyboard Shortcuts Dialog */}
        <Dialog open={showShortcutsModal} onOpenChange={setShowShortcutsModal}>
          <DialogContent className="bg-slate-950/95 border-white/15 text-white backdrop-blur-2xl max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
                <Keyboard className="h-5 w-5 text-primary" />
                Cinema Player Shortcuts
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400">
                Master playback controls without leaving your keyboard
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span className="text-gray-300">Switch Streaming Mirror</span>
                <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-[11px] text-primary font-bold">
                  1 - 9
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span className="text-gray-300">Quick Next Server</span>
                <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-[11px] text-primary font-bold">
                  N or S
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span className="text-gray-300">Toggle Fullscreen</span>
                <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-[11px] text-gray-200 font-bold">
                  F
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span className="text-gray-300">Reload Current Stream</span>
                <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-[11px] text-gray-200 font-bold">
                  R
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span className="text-gray-300">Cycle Audio Language</span>
                <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-[11px] text-primary font-bold">
                  L
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span className="text-gray-300">Toggle Shortcuts Menu</span>
                <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-[11px] text-gray-200 font-bold">
                  ?
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span className="text-gray-300">Exit Cinema Mode</span>
                <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-[11px] text-rose-300 font-bold">
                  Esc
                </kbd>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>,
    document.body,
  );
}
