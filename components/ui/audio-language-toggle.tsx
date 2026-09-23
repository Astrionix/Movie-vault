"use client";

import {
  AUDIO_LANGUAGES,
  AudioLanguage,
  useServerStore,
} from "@/lib/stores/server-store";
import { cn } from "@/lib/utils";
import { Check, Globe } from "lucide-react";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface AudioLanguageToggleProps {
  className?: string;
  variant?: "compact" | "group";
}

export function AudioLanguageToggle({
  className,
  variant = "compact",
}: AudioLanguageToggleProps) {
  const { audioLanguage, setAudioLanguage } = useServerStore();

  const currentOption =
    AUDIO_LANGUAGES.find((opt) => opt.code === audioLanguage) ||
    AUDIO_LANGUAGES[0];

  if (variant === "group") {
    return (
      <div
        className={cn(
          "grid grid-cols-4 gap-1 p-1 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 select-none",
          className,
        )}
      >
        {AUDIO_LANGUAGES.map((option) => {
          const isSelected = audioLanguage === option.code;
          return (
            <button
              key={option.code}
              type="button"
              onClick={() => setAudioLanguage(option.code)}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-white hover:bg-white/10",
              )}
            >
              <span className="text-[11px] leading-tight">
                {option.nativeLabel}
              </span>
              <span className="text-[9px] opacity-75">
                {option.code.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer",
            "bg-background/80 hover:bg-background/90 text-foreground border border-border/50 hover:border-border",
            "backdrop-blur-md shadow-sm hover:shadow-md",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
            audioLanguage === "te" &&
              "border-emerald-500/60 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
            className,
          )}
          aria-label="Audio Language Selector"
        >
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold">
            {audioLanguage === "auto"
              ? "Audio: Auto"
              : `Audio: ${currentOption.nativeLabel}`}
          </span>
          {audioLanguage === "te" && (
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-52 p-1.5 bg-slate-950/95 backdrop-blur-xl border-white/15 text-white shadow-2xl rounded-xl"
      >
        <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground tracking-wider uppercase border-b border-white/10 mb-1 flex items-center justify-between">
          <span>Preferred Audio</span>
          <span className="text-[10px] text-primary lowercase">
            multi-stream
          </span>
        </div>

        {AUDIO_LANGUAGES.map((option) => {
          const isSelected = audioLanguage === option.code;
          return (
            <DropdownMenuItem
              key={option.code}
              onClick={() => setAudioLanguage(option.code)}
              className={cn(
                "flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors",
                isSelected
                  ? "bg-primary/20 text-white font-semibold"
                  : "text-gray-300 hover:text-white hover:bg-white/10",
              )}
            >
              <div className="flex items-center gap-2">
                {option.flag && <span>{option.flag}</span>}
                <div>
                  <div className="text-xs">{option.nativeLabel}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {option.label}
                  </div>
                </div>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
