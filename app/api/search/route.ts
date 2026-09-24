import { Movie, TmdbResponse, TvShow } from "@/utils/typings";
import { NextResponse } from "next/server";
import { parseLanguageQuery } from "@/lib/search-language";

interface Person {
  id: number;
  name: string;
  profile_path?: string | null;
  popularity?: number;
  media_type: "person";
}

interface SearchResult {
  media: Array<Movie | TvShow>;
  people: Person[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const page = searchParams.get("page") || "1";
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key is not configured" },
      { status: 500 },
    );
  }

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: "Search query cannot be empty" },
      { status: 400 },
    );
  }

  try {
    const trimmedQuery = query.trim();
    const langMatch = parseLanguageQuery(trimmedQuery);

    let movieData: TmdbResponse<Movie> = {
      results: [],
      page: 1,
      total_pages: 1,
      total_results: 0,
    };
    let tvData: TmdbResponse<TvShow> = {
      results: [],
      page: 1,
      total_pages: 1,
      total_results: 0,
    };

    if (langMatch?.isPureLanguage) {
      // Pure language/industry discovery (e.g., "telugu movies", "hindi", "kdrama")
      const discoverBaseUrl = "https://api.tmdb.org/3/discover";
      const discoverParams = new URLSearchParams({
        api_key: apiKey,
        with_original_language: langMatch.languageCode,
        sort_by: "popularity.desc",
        page: page,
        include_adult: "false",
      });

      if (langMatch.genreId) {
        discoverParams.append("with_genres", langMatch.genreId.toString());
      }

      const promises: Promise<void>[] = [];

      if (langMatch.mediaType !== "tv") {
        promises.push(
          fetch(`${discoverBaseUrl}/movie?${discoverParams}`).then(
            async (res) => {
              if (res.ok) movieData = await res.json();
            },
          ),
        );
      }

      if (langMatch.mediaType !== "movie") {
        promises.push(
          fetch(`${discoverBaseUrl}/tv?${discoverParams}`).then(async (res) => {
            if (res.ok) tvData = await res.json();
          }),
        );
      }

      await Promise.all(promises);
    } else {
      // Search by title or title+language
      const searchBaseUrl = "https://api.tmdb.org/3/search";
      const actualQuery = langMatch?.cleanQuery || trimmedQuery;
      const commonParams = new URLSearchParams({
        api_key: apiKey,
        query: actualQuery,
        page: page,
        include_adult: "false",
        language: "en-US",
      });

      const [movieResponse, tvResponse] = await Promise.all([
        fetch(`${searchBaseUrl}/movie?${commonParams}`),
        fetch(`${searchBaseUrl}/tv?${commonParams}`),
      ]);

      if (movieResponse.ok) {
        movieData = await movieResponse.json();
      }
      if (tvResponse.ok) {
        tvData = await tvResponse.json();
      }
    }

    // combine and sort results by popularity
    const movies: Movie[] = (movieData.results || [])
      .filter((movie: Movie) => movie.poster_path)
      .map((movie: Movie) => ({
        ...movie,
        media_type: "movie" as const,
      }));

    const tvShows: TvShow[] = (tvData.results || [])
      .filter((show: TvShow) => !show.genre_ids?.includes(10767))
      .filter((show: TvShow) => show.poster_path)
      .map((show: TvShow) => ({
        ...show,
        media_type: "tv" as const,
      }));

    // If query specified a language with a title (e.g. "pushpa telugu"), prioritize that language
    if (langMatch && !langMatch.isPureLanguage) {
      const targetLang = langMatch.languageCode;
      movies.sort((a, b) => {
        const aMatches = a.original_language === targetLang ? 1 : 0;
        const bMatches = b.original_language === targetLang ? 1 : 0;
        if (aMatches !== bMatches) return bMatches - aMatches;
        return (b.popularity || 0) - (a.popularity || 0);
      });
      tvShows.sort((a, b) => {
        const aMatches = a.original_language === targetLang ? 1 : 0;
        const bMatches = b.original_language === targetLang ? 1 : 0;
        if (aMatches !== bMatches) return bMatches - aMatches;
        return (b.popularity || 0) - (a.popularity || 0);
      });
    }

    // Filter out released movies with zero revenue, then combine and sort by popularity
    const { filterZeroRevenueMovies } = await import("@/utils/content-filters");
    const filteredMovies = filterZeroRevenueMovies(movies);
    const allMedia = [...filteredMovies, ...tvShows].sort((a, b) => {
      if (langMatch && !langMatch.isPureLanguage) {
        const aLang = a.original_language === langMatch.languageCode ? 1 : 0;
        const bLang = b.original_language === langMatch.languageCode ? 1 : 0;
        if (aLang !== bLang) return bLang - aLang;
      }
      const popA = a.popularity || 0;
      const popB = b.popularity || 0;
      return popB - popA;
    });

    // for people, we'll fetch from page 1 only to show in sidebar
    const people: Person[] = [];
    const personQuery = langMatch?.isPureLanguage
      ? ""
      : langMatch?.cleanQuery || query.trim();

    if (page === "1" && personQuery) {
      const peopleUrl = new URL("https://api.tmdb.org/3/search/person");
      peopleUrl.searchParams.append("api_key", apiKey);
      peopleUrl.searchParams.append("query", personQuery);
      peopleUrl.searchParams.append("page", "1");
      peopleUrl.searchParams.append("include_adult", "false");

      try {
        const peopleResponse = await fetch(peopleUrl.toString());
        if (peopleResponse.ok) {
          const peopleData = await peopleResponse.json();
          if (Array.isArray(peopleData.results)) {
            peopleData.results.forEach((person: unknown) => {
              if (
                typeof person === "object" &&
                person !== null &&
                "id" in person &&
                "name" in person &&
                typeof person.id === "number" &&
                typeof person.name === "string"
              ) {
                const p = person as {
                  id: number;
                  name: string;
                  profile_path?: string | null;
                  popularity?: number;
                };
                people.push({
                  id: p.id,
                  name: p.name,
                  profile_path: p.profile_path || null,
                  popularity: p.popularity || 0,
                  media_type: "person",
                });
              }
            });
          }
        }
      } catch (error) {
        console.error("Error fetching people:", error);
        // continue without people results
      }
    }

    // calculate total pages (use the max of movie and tv pages)
    const totalPages = Math.max(
      movieData.total_pages || 1,
      tvData.total_pages || 1,
    );
    const totalResults =
      (movieData.total_results || 0) + (tvData.total_results || 0);

    // return structured response
    const result: SearchResult = {
      media: allMedia,
      people: people.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)),
      page: parseInt(page),
      totalPages,
      totalResults,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in main search API route:", error);
    return NextResponse.json(
      { error: "Internal server error during search" },
      { status: 500 },
    );
  }
}
