"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

interface WatchlistButtonProps {
  contentId: number;
  mediaType?: "movie" | "tv";
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  children?: ReactNode;
}

export const WATCHLIST_STORAGE_KEY = "movievault_local_watchlist";

export function WatchlistButton({
  contentId,
  mediaType,
  className,
  variant = "outline",
  size = "default",
  children,
}: WatchlistButtonProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (!mediaType || typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (stored) {
        const list = JSON.parse(stored);
        const exists = list.some(
          (item: { contentId: number; mediaType: string }) =>
            item.contentId === contentId && item.mediaType === mediaType,
        );
        setIsInWatchlist(exists);
      }
    } catch {
      // ignore storage errors
    } finally {
      setIsLoading(false);
    }
  }, [contentId, mediaType]);

  const handleToggle = () => {
    if (isLoading || isToggling || !mediaType) return;
    setIsToggling(true);
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      let list: Array<{
        contentId: number;
        mediaType: string;
        addedAt: number;
      }> = stored ? JSON.parse(stored) : [];

      if (isInWatchlist) {
        list = list.filter(
          (item) =>
            !(item.contentId === contentId && item.mediaType === mediaType),
        );
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(list));
        setIsInWatchlist(false);
        toast.success("Removed from watchlist");
      } else {
        list.push({ contentId, mediaType, addedAt: Date.now() });
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(list));
        setIsInWatchlist(true);
        toast.success("Added to watchlist");
      }
    } catch {
      toast.error("Failed to update watchlist");
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn(className)}
        disabled
        data-testid="watchlist-button-loading"
      >
        <Bookmark className="h-4 w-4" />
        {children && (
          <span
            className="ml-2 text-sm"
            data-testid="watchlist-button-loading-text"
          >
            Loading...
          </span>
        )}
      </Button>
    );
  }

  const Icon = isInWatchlist ? BookmarkCheck : Bookmark;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={cn(className)}
      disabled={isToggling}
      aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      data-testid={`watchlist-button-${isInWatchlist ? "remove" : "add"}`}
      data-in-watchlist={isInWatchlist}
      data-content-id={contentId}
      data-media-type={mediaType}
    >
      <Icon className="h-4 w-4" />
      {children && (
        <span
          className="ml-2 text-sm font-medium"
          data-testid="watchlist-button-text"
        >
          {children}
        </span>
      )}
    </Button>
  );
}
