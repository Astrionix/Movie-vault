import { NextResponse } from "next/server";
import { getGenreNames } from "@/components/content/genre-helpers";
import {
  Movie,
  TmdbResponse,
  TmdbResponseSchema,
  TvShow,
} from "@/utils/typings";
import { parseLanguageQuery } from "@/lib/search-language";

type PreviewResult = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  media_type: string;
  release_date?: string;
  first_air_date?: string;
  genre_names?: string[];
  original_language?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key is not configured" },
      { status: 500 },
    );
  }

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const trimmedQuery = query.trim();
    const langMatch = parseLanguageQuery(trimmedQuery);

    let rawResults: (Movie | TvShow)[] = [];

    if (langMatch?.isPureLanguage) {
      // Pure language query (e.g. "telugu", "telugu movies", "hindi", "kdrama")
      const discoverBaseUrl = "https://api.tmdb.org/3/discover";
      const discoverParams = new URLSearchParams({
        api_key: apiKey,
        with_original_language: langMatch.languageCode,
        sort_by: "popularity.desc",
        page: "1",
        include_adult: "false",
      });

      if (langMatch.genreId) {
        discoverParams.append("with_genres", langMatch.genreId.toString());
      }

      if (langMatch.mediaType === "movie") {
        const res = await fetch(`${discoverBaseUrl}/movie?${discoverParams}`);
        if (res.ok) {
          const data = await res.json();
          rawResults = (data.results || []).map((item: Movie) => ({
            ...item,
            media_type: "movie" as const,
          }));
        }
      } else if (langMatch.mediaType === "tv") {
        const res = await fetch(`${discoverBaseUrl}/tv?${discoverParams}`);
        if (res.ok) {
          const data = await res.json();
          rawResults = (data.results || []).map((item: TvShow) => ({
            ...item,
            media_type: "tv" as const,
          }));
        }
      } else {
        const [movieRes, tvRes] = await Promise.all([
          fetch(`${discoverBaseUrl}/movie?${discoverParams}`),
          fetch(`${discoverBaseUrl}/tv?${discoverParams}`),
        ]);

        const [movieData, tvData] = await Promise.all([
          movieRes.ok ? movieRes.json() : { results: [] },
          tvRes.ok ? tvRes.json() : { results: [] },
        ]);

        const movies = (movieData.results || []).map((item: Movie) => ({
          ...item,
          media_type: "movie" as const,
        }));
        const tvShows = (tvData.results || []).map((item: TvShow) => ({
          ...item,
          media_type: "tv" as const,
        }));

        rawResults = [...movies, ...tvShows].sort(
          (a, b) => (b.popularity || 0) - (a.popularity || 0),
        );
      }
    } else {
      const actualQuery = langMatch?.cleanQuery || trimmedQuery;
      const response = await fetch(
        `https://api.tmdb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(actualQuery)}&page=1&include_adult=false`,
      );

      if (!response.ok) {
        console.error(
          `TMDB API error: ${response.status} ${response.statusText}`,
        );
        return NextResponse.json(
          { error: "Failed to fetch search preview from TMDB" },
          { status: response.status },
        );
      }

      const rawData = await response.json();
      const result = TmdbResponseSchema.safeParse(rawData);
      const data: TmdbResponse<Movie | TvShow> = result.success
        ? result.data
        : rawData;
      rawResults = data.results || [];

      if (langMatch && !langMatch.isPureLanguage) {
        rawResults.sort((a, b) => {
          const aMatch = a.original_language === langMatch.languageCode ? 1 : 0;
          const bMatch = b.original_language === langMatch.languageCode ? 1 : 0;
          if (aMatch !== bMatch) return bMatch - aMatch;
          return (b.popularity || 0) - (a.popularity || 0);
        });
      }
    }
    const filteredResults: PreviewResult[] =
      rawResults
        .filter(
          (item: Movie | TvShow) =>
            item.poster_path &&
            (item.media_type === "movie" || item.media_type === "tv"),
        )
        .slice(0, 8)
        .map((item: Movie | TvShow) => ({
          id: item.id,
          title: "title" in item ? item.title : undefined,
          name: "name" in item ? item.name : undefined,
          poster_path: item.poster_path,
          media_type: item.media_type,
          release_date: "release_date" in item ? item.release_date : undefined,
          first_air_date:
            "first_air_date" in item ? item.first_air_date : undefined,
          genre_names: item.genre_ids
            ? getGenreNames(
                item.genre_ids,
                item.media_type === "tv" ? "tv" : "movie",
              )
            : undefined,
        })) || [];

    return NextResponse.json({ results: filteredResults });
  } catch (error) {
    console.error("Error in search preview API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
