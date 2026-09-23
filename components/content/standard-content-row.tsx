"use client";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import useMedia from "@/hooks/useMedia";
import { isMovie, isTVShow, MediaItem } from "@/utils/typings";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ContentCard } from "./content-card";
import { ContentRowHeader } from "./content-row-header";

// Interface to ensure item has an id property
interface ItemWithId {
  id: number;
}

// Note: ContentRowVariant might be defined elsewhere or become unnecessary if pages import specific rows.
// For now, we keep ContentRowProps similar, minus the variant prop for this specific component.
export interface StandardContentRowProps {
  title: string;
  items: MediaItem[];
  href: string;
  contentRating?: Record<number, string | null>;
  onLoadMore?: () => Promise<MediaItem[]>;
  hasMoreItems?: boolean;
}

export function StandardContentRow({
  title,
  items: initialItems,
  href,
  contentRating = {},
  onLoadMore,
  hasMoreItems = false,
}: StandardContentRowProps) {
  const isMobile = useMedia("(max-width: 768px)", false);
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const lastScrollProgressRef = useRef(0);

  useEffect(() => {
    if (initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);

  // Handle scroll end detection for infinite loading
  useEffect(() => {
    if (!api || !hasMoreItems) return;

    const handleScroll = () => {
      const scrollProgress = api.scrollProgress();
      lastScrollProgressRef.current = scrollProgress;

      // When close to the end, load more items
      if (scrollProgress > 0.85 && !loading && hasMoreItems) {
        loadMoreItems();
      }
    };

    api.on("scroll", handleScroll);

    return () => {
      api.off("scroll", handleScroll);
    };
  }, [api, hasMoreItems, loading]);

  const getContentRating = (item: MediaItem & ItemWithId) => {
    // Use embedded content_rating first, then fallback to passed contentRating prop
    return item.content_rating || contentRating[item.id] || undefined;
  };

  const loadMoreItems = async () => {
    if (onLoadMore && hasMoreItems && !loading) {
      setLoading(true);
      try {
        const newItems = await onLoadMore();
        if (newItems && newItems.length > 0) {
          setItems((prev) => [...prev, ...newItems]);
        }
      } catch (error) {
        console.error("Error loading more items:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const LoadingComponent = () => (
    <div className="flex items-center justify-center min-h-[150px] w-full">
      <LoadingSpinner size="lg" />
    </div>
  );

  const getItemLink = (item: MediaItem): string => {
    if (isMovie(item)) {
      return `/movies/${(item as MediaItem).id}`;
    } else if (isTVShow(item)) {
      return `/tvshows/${(item as MediaItem).id}`;
    }
    return `/movies/${(item as MediaItem).id}`;
  };

  return (
    <div className="mx-4 md:mx-8 mb-8">
      <ContentRowHeader title={title} href={href} />

      <div className="group/row relative">
        <Carousel
          opts={{
            align: "start",
            loop: false,
            slidesToScroll: "auto",
            containScroll: "trimSnaps",
            dragFree: false,
          }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-3 py-4 px-1">
            {items.map((item, index) => (
              <CarouselItem
                key={`${item.id}-${index}`}
                className="pl-2 md:pl-3 basis-[46%] sm:basis-[30%] md:basis-[22%] lg:basis-[18%] xl:basis-[15%] 2xl:basis-[13%] select-none transition-transform"
              >
                <ContentCard
                  item={item}
                  isMobile={!!isMobile}
                  rating={getContentRating(item)}
                  href={getItemLink(item)}
                />
              </CarouselItem>
            ))}

            {hasMoreItems && loading && (
              <CarouselItem className="pl-3 basis-[46%] sm:basis-[30%] md:basis-[22%] flex items-center justify-center">
                <LoadingComponent />
              </CarouselItem>
            )}
          </CarouselContent>

          {/* Netflix-Style Side Scroll Navigation Handles */}
          <CarouselPrevious className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 h-[75%] w-11 lg:w-12 bg-black/60 hover:bg-black/90 text-white hover:text-primary rounded-r-xl border-0 ring-1 ring-white/10 shadow-2xl backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all duration-300 z-30 cursor-pointer disabled:opacity-0 disabled:pointer-events-none hover:scale-105 active:scale-95">
            <ChevronLeft className="h-8 w-8 stroke-[2.5]" />
          </CarouselPrevious>
          <CarouselNext className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 h-[75%] w-11 lg:w-12 bg-black/60 hover:bg-black/90 text-white hover:text-primary rounded-l-xl border-0 ring-1 ring-white/10 shadow-2xl backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all duration-300 z-30 cursor-pointer disabled:opacity-0 disabled:pointer-events-none hover:scale-105 active:scale-95">
            <ChevronRight className="h-8 w-8 stroke-[2.5]" />
          </CarouselNext>
        </Carousel>
      </div>
    </div>
  );
}
