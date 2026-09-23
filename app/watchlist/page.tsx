import { getUserWatchlist } from "./actions";
import { WatchlistClient } from "./watchlist-client";
import { Metadata } from "next";
import { fetchAndEnrichMediaItems } from "../actions";
import { MediaItem } from "@/utils/typings";
import { StaticHero } from "@/components/hero/carousel-static";
import { ContentContainer } from "@/components/layout/content-container";

export const metadata: Metadata = {
  title: "My Watchlist | Movie Vault",
  description: "Manage your watchlist and track your viewing progress",
};

export default async function WatchlistPage() {
  const watchlistItems = await getUserWatchlist();

  // Fetch media details for each watchlist item
  const mediaItems = await Promise.all(
    watchlistItems.map(async (item) => {
      try {
        const apiKey = process.env.TMDB_API_KEY;
        const url =
          item.mediaType === "movie"
            ? `https://api.tmdb.org/3/movie/${item.contentId}?api_key=${apiKey}&language=en-US`
            : `https://api.tmdb.org/3/tv/${item.contentId}?api_key=${apiKey}&language=en-US`;

        const response = await fetch(url, { next: { revalidate: 3600 } });
        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        return {
          ...data,
          media_type: item.mediaType,
          watchlistItem: item,
        };
      } catch (error) {
        console.error(
          `Error fetching ${item.mediaType} ${item.contentId}:`,
          error,
        );
        return null;
      }
    }),
  );

  // Filter out null values and separate by type
  const validRawItems = mediaItems.filter(
    (item): item is NonNullable<typeof item> => item !== null,
  );

  // Separate movies and TV shows
  const movies = validRawItems.filter((item) => item.media_type === "movie");
  const tvShows = validRawItems.filter((item) => item.media_type === "tv");

  // Enrich media items by type
  const enrichedMovies =
    movies.length > 0 ? await fetchAndEnrichMediaItems(movies, "movie") : [];
  const enrichedTvShows =
    tvShows.length > 0 ? await fetchAndEnrichMediaItems(tvShows, "tv") : [];

  // Combine enriched items
  const enrichedItems = [...enrichedMovies, ...enrichedTvShows];

  // Create a map for quick lookup
  const watchlistMap = new Map(
    watchlistItems.map((item) => [item.contentId, item]),
  );

  // Combine enriched items with watchlist data
  const itemsWithWatchlist = enrichedItems.map((item) => {
    const watchlistItem = watchlistMap.get(item.id);
    return {
      ...item,
      media_type: watchlistItem?.mediaType || item.media_type || "movie",
      watchlistItem: watchlistItem!,
    };
  });

  // Pass all items to client (client will handle filtering/sorting)
  return (
    <div className="w-full flex flex-col">
      <StaticHero imageUrl="/movie-banner.png" title="" route="" />
      <ContentContainer className="w-full flex flex-col items-center z-10">
        <WatchlistClient
          allItems={itemsWithWatchlist}
          watchlistItems={watchlistItems}
        />
      </ContentContainer>
    </div>
  );
}
