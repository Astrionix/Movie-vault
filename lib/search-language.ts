export interface LanguageInfo {
  code: string;
  name: string;
  aliases: string[];
  genreId?: number; // e.g. animation genre 16 for anime
}

export interface ParsedLanguageQuery {
  languageCode: string;
  languageName: string;
  mediaType: "movie" | "tv" | "all";
  isPureLanguage: boolean;
  cleanQuery: string;
  genreId?: number;
}

export const SUPPORTED_SEARCH_LANGUAGES: LanguageInfo[] = [
  { code: "te", name: "Telugu", aliases: ["telugu", "tollywood"] },
  { code: "hi", name: "Hindi", aliases: ["hindi", "bollywood"] },
  { code: "ta", name: "Tamil", aliases: ["tamil", "kollywood"] },
  { code: "ml", name: "Malayalam", aliases: ["malayalam", "mollywood"] },
  { code: "kn", name: "Kannada", aliases: ["kannada", "sandalwood"] },
  { code: "bn", name: "Bengali", aliases: ["bengali", "bangla"] },
  { code: "mr", name: "Marathi", aliases: ["marathi"] },
  { code: "pa", name: "Punjabi", aliases: ["punjabi"] },
  {
    code: "ko",
    name: "Korean",
    aliases: ["korean", "kdrama", "k-drama", "k drama"],
  },
  {
    code: "ja",
    name: "Japanese",
    aliases: ["japanese"],
  },
  {
    code: "ja",
    name: "Anime",
    aliases: ["anime"],
    genreId: 16,
  },
  {
    code: "zh",
    name: "Chinese",
    aliases: ["chinese", "mandarin", "cantonese"],
  },
  { code: "es", name: "Spanish", aliases: ["spanish", "espanol"] },
  { code: "fr", name: "French", aliases: ["french"] },
  { code: "de", name: "German", aliases: ["german"] },
  { code: "it", name: "Italian", aliases: ["italian"] },
  { code: "tr", name: "Turkish", aliases: ["turkish", "dizi"] },
  { code: "en", name: "English", aliases: ["english", "hollywood"] },
];

/**
 * Detects whether a search query targets a specific language or regional industry
 * (e.g., "telugu movies", "hindi", "kdrama", "pushpa telugu", etc.)
 */
export function parseLanguageQuery(query: string): ParsedLanguageQuery | null {
  if (!query || typeof query !== "string") return null;

  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return null;

  const moviePattern = /\b(movies?|films?|cinema)\b/i;
  const tvPattern =
    /\b(tv\s*shows?|tv|shows?|series|web\s*series|dramas?|dizi)\b/i;

  let mediaType: "movie" | "tv" | "all" = "all";
  if (moviePattern.test(normalized) && !tvPattern.test(normalized)) {
    mediaType = "movie";
  } else if (tvPattern.test(normalized) && !moviePattern.test(normalized)) {
    mediaType = "tv";
  }

  for (const lang of SUPPORTED_SEARCH_LANGUAGES) {
    for (const alias of lang.aliases) {
      const aliasPattern = new RegExp(
        `\\b${alias.replace("-", "[-\\s]?")}\\b`,
        "i",
      );
      if (aliasPattern.test(normalized)) {
        if (
          alias === "kdrama" ||
          alias === "k-drama" ||
          alias === "k drama" ||
          alias === "dizi"
        ) {
          mediaType = "tv";
        }

        // Clean out the alias and media keywords
        const stripped = normalized
          .replace(aliasPattern, "")
          .replace(
            /\b(movies?|films?|cinema|tv\s*shows?|tv|shows?|series|web\s*series|dramas?|dizi)\b/gi,
            "",
          )
          .replace(/\s+/g, " ")
          .trim();

        return {
          languageCode: lang.code,
          languageName: lang.name,
          mediaType,
          isPureLanguage: stripped.length === 0,
          cleanQuery: stripped,
          genreId: lang.genreId,
        };
      }
    }
  }

  return null;
}
