import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ContentRowHeader } from "./content-row-header";

interface ContentRowSkeletonProps {
  title: string;
  href: string;
  count?: number;
  variant?: "standard" | "ranked";
}

/**
 * Server-compatible skeleton component for content rows - used as Suspense fallback
 * Dimensionally identical to StandardContentRow and RankedContentRow to prevent layout shift
 */
export function ContentRowSkeleton({
  title,
  href,
  count = 10,
  variant = "standard",
}: ContentRowSkeletonProps) {
  const isRanked = variant === "ranked";

  return (
    <div className="mx-4 md:mx-8 mb-8 animate-in fade-in duration-300">
      <ContentRowHeader title={title} href={href} />

      <div className="group/row relative">
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
            skipSnaps: true,
          }}
          className="w-full"
        >
          <CarouselContent
            className={
              isRanked ? "-ml-3 py-3 px-1" : "-ml-2 md:-ml-3 py-4 px-1"
            }
          >
            {Array.from({ length: count }).map((_, i) => (
              <CarouselItem
                key={i}
                className={
                  isRanked
                    ? "pl-3 md:pl-4 basis-[85%] sm:basis-[55%] md:basis-[42%] lg:basis-[32%] xl:basis-[28%] select-none"
                    : "pl-2 md:pl-3 basis-[46%] sm:basis-[30%] md:basis-[22%] lg:basis-[18%] xl:basis-[15%] 2xl:basis-[13%] select-none"
                }
              >
                {isRanked ? (
                  <div className="relative overflow-hidden rounded-lg aspect-video bg-black/40 backdrop-blur-md ring-1 ring-white/[0.08] animate-shimmer shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                      <div className="h-10 w-8 rounded bg-white/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-white/10" />
                        <div className="h-3 w-1/3 rounded bg-white/5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-xl aspect-[2/3] bg-slate-900/60 backdrop-blur-md border border-white/10 animate-shimmer shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 space-y-2">
                      <div className="h-3.5 w-3/4 rounded bg-white/10" />
                      <div className="h-2.5 w-1/2 rounded bg-white/5" />
                    </div>
                  </div>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
