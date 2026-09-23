"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { isMovie, MediaItem, Movie, TvShow } from "@/utils/typings";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MediaLogo } from "../media/media-logo";
import { ContentRowHeader } from "./content-row-header";

export interface RankedContentRowProps {
  title: string;
  items: MediaItem[];
  href: string;
}

export function RankedContentRow({
  title,
  items: initialItems,
  href,
}: RankedContentRowProps) {
  const router = useRouter();
  const items = initialItems.slice(0, 10);

  const getItemDetails = (item: MediaItem) => {
    const movieItem = isMovie(item) ? (item as Movie) : null;
    const tvShowItem = !isMovie(item) ? (item as TvShow) : null;

    const displayTitle = movieItem
      ? movieItem.title
      : tvShowItem
        ? tvShowItem.name
        : "";
    const year =
      movieItem?.release_date?.substring(0, 4) ||
      tvShowItem?.first_air_date?.substring(0, 4);

    return { displayTitle, year };
  };

  const handleItemClick = (item: MediaItem) => {
    const itemHref = `/${isMovie(item) ? "movies" : "tvshows"}/${item.id}`;
    router.push(itemHref);
  };

  const handleItemMouseEnter = (item: MediaItem) => {
    const itemHref = `/${isMovie(item) ? "movies" : "tvshows"}/${item.id}`;
    router.prefetch(itemHref);
  };

  const LandscapeCard = ({ item, rank }: { item: MediaItem; rank: number }) => {
    const { displayTitle, year } = getItemDetails(item);
    const backdropUrl = item.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
      : undefined;

    return (
      <div
        onClick={() => handleItemClick(item)}
        onMouseEnter={() => handleItemMouseEnter(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleItemClick(item);
          }
        }}
        role="button"
        tabIndex={0}
        className="group relative overflow-hidden rounded-lg bg-black/40 backdrop-blur-md ring-1 ring-white/[0.08] shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-primary/5 hover:ring-primary/30 transition-all duration-300 cursor-pointer aspect-video"
        aria-label={`View details for ${displayTitle}`}
      >
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt={displayTitle || "Backdrop"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
          <div className="flex items-center gap-3 mb-3">
            <span
              className={cn(
                "text-5xl md:text-6xl font-black tabular-nums tracking-tighter w-10",
                "bg-gradient-to-b bg-clip-text text-transparent",
                rank === 1
                  ? "from-amber-300 to-amber-600"
                  : "from-slate-200 to-slate-500",
              )}
            >
              {rank}
            </span>
            <div className="flex-1">
              <MediaLogo
                logo={item.logo}
                title={displayTitle}
                align="left"
                className="mb-2"
                fallbackClassName="text-xl md:text-2xl font-bold text-white mb-2"
              />
              <div className="flex items-center gap-2 text-sm text-white/80">
                {year && <span>{year}</span>}
                {item.vote_average && item.vote_average > 0 && (
                  <>
                    <span className="text-white/40">•</span>
                    <div className="flex items-center gap-1">
                      <Star
                        className="w-4 h-4 text-amber-400"
                        fill="currentColor"
                      />
                      <span>{item.vote_average.toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
          <Icons.play className="w-12 h-12 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
        </div>
      </div>
    );
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
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3 py-3 px-1">
            {items.map((item, index) => (
              <CarouselItem
                key={`${item.id}-${index}`}
                className="pl-3 md:pl-4 basis-[85%] sm:basis-[55%] md:basis-[42%] lg:basis-[32%] xl:basis-[28%] select-none transition-transform"
              >
                <LandscapeCard item={item} rank={index + 1} />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Netflix-Style Side Scroll Navigation Handles */}
          <CarouselPrevious className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 h-[78%] w-11 lg:w-12 bg-black/60 hover:bg-black/90 text-white hover:text-primary rounded-r-xl border-0 ring-1 ring-white/10 shadow-2xl backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all duration-300 z-30 cursor-pointer disabled:opacity-0 disabled:pointer-events-none hover:scale-105 active:scale-95">
            <ChevronLeft className="h-8 w-8 stroke-[2.5]" />
          </CarouselPrevious>
          <CarouselNext className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 h-[78%] w-11 lg:w-12 bg-black/60 hover:bg-black/90 text-white hover:text-primary rounded-l-xl border-0 ring-1 ring-white/10 shadow-2xl backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all duration-300 z-30 cursor-pointer disabled:opacity-0 disabled:pointer-events-none hover:scale-105 active:scale-95">
            <ChevronRight className="h-8 w-8 stroke-[2.5]" />
          </CarouselNext>
        </Carousel>
      </div>
    </div>
  );
}
