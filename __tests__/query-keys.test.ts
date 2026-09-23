import { queryKeys } from "@/lib/query-keys";
import { describe, expect, test } from "vitest";

describe("queryKeys", () => {
  describe("base keys", () => {
    test("all returns base key array", () => {
      expect(queryKeys.all).toEqual(["StreamX"]);
    });
  });

  describe("content rows", () => {
    test("contentRows returns correct key structure", () => {
      expect(queryKeys.contentRows()).toEqual(["StreamX", "content-rows"]);
    });

    test("contentRow returns key with rowId", () => {
      expect(queryKeys.contentRow("trending-movies")).toEqual([
        "StreamX",
        "content-rows",
        "trending-movies",
        undefined,
      ]);
    });

    test("contentRow includes options when provided", () => {
      expect(
        queryKeys.contentRow("trending-movies", { count: 10, enrich: true }),
      ).toEqual([
        "StreamX",
        "content-rows",
        "trending-movies",
        { count: 10, enrich: true },
      ]);
    });

    test("contentRow with partial options", () => {
      expect(queryKeys.contentRow("trending-movies", { count: 5 })).toEqual([
        "StreamX",
        "content-rows",
        "trending-movies",
        { count: 5 },
      ]);
    });
  });

  describe("search keys", () => {
    test("search returns base search key", () => {
      expect(queryKeys.search()).toEqual(["StreamX", "search"]);
    });

    test("searchPreview returns key with query", () => {
      expect(queryKeys.searchPreview("batman")).toEqual([
        "StreamX",
        "search",
        "preview",
        "batman",
      ]);
    });

    test("searchResults returns key with query and page", () => {
      expect(queryKeys.searchResults("batman", 2)).toEqual([
        "StreamX",
        "search",
        "results",
        "batman",
        2,
      ]);
    });
  });

  describe("genre keys", () => {
    test("genres returns base genres key", () => {
      expect(queryKeys.genres()).toEqual(["StreamX", "genres"]);
    });

    test("movieGenres returns movie genres key", () => {
      expect(queryKeys.movieGenres()).toEqual(["StreamX", "genres", "movie"]);
    });

    test("tvGenres returns TV genres key", () => {
      expect(queryKeys.tvGenres()).toEqual(["StreamX", "genres", "tv"]);
    });

    test("combinedGenres returns combined genres key", () => {
      expect(queryKeys.combinedGenres()).toEqual([
        "StreamX",
        "genres",
        "combined",
      ]);
    });
  });

  describe("media keys", () => {
    test("media returns base media key", () => {
      expect(queryKeys.media()).toEqual(["StreamX", "media"]);
    });

    test("tvSeason returns key with tvId and seasonNumber", () => {
      expect(queryKeys.tvSeason(12345, 2)).toEqual([
        "StreamX",
        "media",
        "tv",
        12345,
        "season",
        2,
      ]);
    });

    test("movieDetails returns key with movieId", () => {
      expect(queryKeys.movieDetails(550)).toEqual([
        "StreamX",
        "media",
        "movie",
        550,
      ]);
    });

    test("tvDetails returns key with tvId", () => {
      expect(queryKeys.tvDetails(1399)).toEqual([
        "StreamX",
        "media",
        "tv",
        1399,
      ]);
    });
  });

  describe("key uniqueness", () => {
    test("different content rows have different keys", () => {
      const key1 = queryKeys.contentRow("trending-movies");
      const key2 = queryKeys.contentRow("popular-tv");

      expect(key1).not.toEqual(key2);
    });

    test("same content row with different options have different keys", () => {
      const key1 = queryKeys.contentRow("trending-movies", { count: 10 });
      const key2 = queryKeys.contentRow("trending-movies", { count: 20 });

      expect(key1).not.toEqual(key2);
    });

    test("different search queries have different keys", () => {
      const key1 = queryKeys.searchPreview("batman");
      const key2 = queryKeys.searchPreview("superman");

      expect(key1).not.toEqual(key2);
    });

    test("same search query with different pages have different keys", () => {
      const key1 = queryKeys.searchResults("batman", 1);
      const key2 = queryKeys.searchResults("batman", 2);

      expect(key1).not.toEqual(key2);
    });
  });
});
