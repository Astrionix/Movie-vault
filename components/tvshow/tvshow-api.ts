import { SeasonDetails, TvShowDetails } from "@/utils/typings";

/**
 * Fetches details for a TV show by ID
 */
export async function fetchTVShowDetails(id: string): Promise<TvShowDetails> {
  try {
    const response = await fetch(
      `https://api.tmdb.org/3/tv/${id}?api_key=${process.env.TMDB_API_KEY}&language=en-US&append_to_response=videos,images,credits,recommendations,similar,keywords,reviews,content_ratings,aggregate_credits`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch TV show details: ${response.status}`);
    }
    const data = await response.json();

    let englishLogo = undefined;
    if (data.images?.logos) {
      englishLogo = data.images.logos.find(
        (logo: { iso_639_1?: string }) => logo.iso_639_1 === "en",
      );
    }

    let contentRating = null;
    if (data.content_ratings?.results) {
      const usRating = data.content_ratings.results.find(
        (r: { iso_3166_1?: string }) => r.iso_3166_1 === "US",
      );
      if (usRating?.rating) {
        contentRating = usRating.rating;
      }
    }

    return {
      ...data,
      media_type: "tv" as const,
      logo: englishLogo,
      content_rating: contentRating,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch TV show details");
  }
}

/**
 * Fetches details for a specific season of a TV show (server-side)
 */
export async function fetchSeasonDetailsServer(
  tvId: string,
  seasonNumber: number,
): Promise<SeasonDetails | null> {
  try {
    const response = await fetch(
      `https://api.tmdb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${process.env.TMDB_API_KEY}&language=en-US`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch season details: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Fetches details for a specific season of a TV show (client-side)
 */
export async function fetchSeasonDetails(
  tvId: string,
  seasonNumber: number,
): Promise<SeasonDetails | null> {
  try {
    // Call the API route instead of directly calling TMDB
    const response = await fetch(`/api/tv/${tvId}/season/${seasonNumber}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch season details: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
