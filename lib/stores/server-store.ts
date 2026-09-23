import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface VideoServer {
  id: string;
  name: string;
  badge?: string;
  description?: string;
  baseUrl: string;
  getMovieUrl: (tmdbId: number) => string;
  getTvUrl: (tmdbId: number) => string;
  getEpisodeUrl: (tmdbId: number, season: number, episode: number) => string;
  getAnimeUrl?: (anilistId: number, episode: number) => string;
  getAnimePaheUrl?: (anilistId: number, episode: number) => string;
  getVidnestUrl?: (
    tmdbId: number,
    contentType: "movie" | "tv" | "anime" | "animepahe",
    season?: number,
    episode?: number,
    anilistId?: number,
  ) => string;
  checkAvailability?: (type: "movie" | "tv") => Promise<number[]>;
  checkIndividualAvailability?: (
    tmdbId: number,
    type: "movie" | "tv",
    season?: number,
    episode?: number,
  ) => Promise<boolean>;
}

export interface ServerOverride {
  serverId: string;
  isAvailable: boolean;
  reason?: string; // Optional reason for the override (e.g., "Server down", "Maintenance")
}
// Old -> vidsrc.xyz
// New: vidsrc-embed.ru - vidsrc-embed.su - vidsrcme.su - vsrc.su
export const videoServers: VideoServer[] = [
  {
    id: "vidlink",
    name: "VidLink",
    badge: "⚡ Fast • 1080p • Ad-Free UI",
    description:
      "Ultra-clean streaming player with native HTML5 controls and zero watermarks",
    baseUrl: "https://vidlink.pro",
    getMovieUrl: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}`,
    getTvUrl: (tmdbId) => `https://vidlink.pro/tv/${tmdbId}/1/1`,
    getEpisodeUrl: (tmdbId, season, episode) =>
      `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidcore",
    name: "VidCore",
    badge: "🔥 TMDB Pro • Subtitles • Ad-Light",
    description:
      "Dedicated TMDB streaming API with clean playback, subtitles & anime",
    baseUrl: "https://vidcore.io",
    getMovieUrl: (tmdbId) => `https://vidcore.io/embed/movie/${tmdbId}?sub=en`,
    getTvUrl: (tmdbId) =>
      `https://vidcore.io/embed/tv/${tmdbId}/1/1?autoNext=true`,
    getEpisodeUrl: (tmdbId, season, episode) =>
      `https://vidcore.io/embed/tv/${tmdbId}/${season}/${episode}?autoNext=true&nextButton=true`,
    getAnimeUrl: (anilistId, episode) =>
      `https://vidcore.io/embed/anime/${anilistId}/${episode}`,
  },
  {
    id: "vidrock",
    name: "VidRock (CinePro)",
    badge: "🎬 CinePro • 50+ Sources",
    description:
      "Developer-focused stream provider from CinePro scraper querying 50+ unique sources",
    baseUrl: "https://vidrock.net",
    getMovieUrl: (tmdbId) => `https://vidrock.net/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId) => `https://vidrock.net/embed/tv/${tmdbId}/1/1`,
    getEpisodeUrl: (tmdbId, season, episode) =>
      `https://vidrock.net/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidnest",
    name: "VidNest",
    badge: "🍿 Anime & TV",
    description:
      "Multi-language audio, Sub/Dub options for Anime, and TV support",
    baseUrl: "https://vidnest.fun",
    getMovieUrl: (tmdbId) => `https://vidnest.fun/movie/${tmdbId}`,
    getTvUrl: (tmdbId) => `https://vidnest.fun/tv/${tmdbId}/1/1`,
    getEpisodeUrl: (tmdbId, season, episode) =>
      `https://vidnest.fun/tv/${tmdbId}/${season}/${episode}`,
    getAnimeUrl: (anilistId, episode) => {
      const state = useServerStore.getState();
      const preference = state.animePreference;
      return `https://vidnest.fun/anime/${anilistId}/${episode}/${preference}`;
    },
    getAnimePaheUrl: (anilistId, episode) => {
      const state = useServerStore.getState();
      const preference = state.animePreference;
      return `https://vidnest.fun/animepahe/${anilistId}/${episode}/${preference}`;
    },
    getVidnestUrl: (tmdbId, contentType, season, episode, anilistId) => {
      const state = useServerStore.getState();
      const preference = state.animePreference;
      switch (contentType) {
        case "movie":
          return `https://vidnest.fun/movie/${tmdbId}`;
        case "tv":
          if (season && episode) {
            return `https://vidnest.fun/tv/${tmdbId}/${season}/${episode}`;
          }
          return `https://vidnest.fun/tv/${tmdbId}`;
        case "anime":
          if (anilistId && episode) {
            return `https://vidnest.fun/anime/${anilistId}/${episode}/${preference}`;
          }
          return "";
        case "animepahe":
          if (anilistId && episode) {
            return `https://vidnest.fun/animepahe/${anilistId}/${episode}/${preference}`;
          }
          return "";
        default:
          return "";
      }
    },
  },
  {
    id: "2embed",
    name: "2Embed",
    badge: "🌐 Instant Player",
    description:
      "Established player generating instant cross-device playback via TMDB routing",
    baseUrl: "https://www.2embed.cc",
    getMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTvUrl: (tmdbId) => `https://www.2embed.cc/embedtv/${tmdbId}&s=1&e=1`,
    getEpisodeUrl: (tmdbId, season, episode) =>
      `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    badge: "🎬 Multi-Server",
    description: "High-speed multi-CDN provider with redundant stream fallback",
    baseUrl: "https://autoembed.co",
    getMovieUrl: (tmdbId) => `https://autoembed.co/movie/tmdb/${tmdbId}`,
    getTvUrl: (tmdbId) => `https://autoembed.co/tv/tmdb/${tmdbId}-1-1`,
    getEpisodeUrl: (tmdbId, season, episode) =>
      `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`,
  },
  {
    id: "superembed",
    name: "SuperEmbed",
    badge: "🛡️ Multi-Host",
    description:
      "Aggregated embed platform (superembed.stream) with automatic third-party host failover",
    baseUrl: "https://superembed.stream",
    getMovieUrl: (tmdbId) =>
      `https://superembed.stream/?video_id=${tmdbId}&tmdb=1`,
    getTvUrl: (tmdbId) =>
      `https://superembed.stream/?video_id=${tmdbId}&tmdb=1&s=1&e=1`,
    getEpisodeUrl: (tmdbId, season, episode) =>
      `https://superembed.stream/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    badge: "🛠️ Most Popular • Primary Source",
    description:
      "High-uptime provider queried as primary source across streaming apps",
    baseUrl: "https://vidsrc.pm",
    getMovieUrl: (tmdbId) => `https://vidsrc.pm/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId) => `https://vidsrc.pm/embed/tv/${tmdbId}/1/1`,
    getEpisodeUrl: (tmdbId, season, episode) =>
      `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "nontongo",
    name: "NontonGo",
    badge: "🎬 Wide Collection • Series Fallback",
    description:
      "Extensive movie and TV series catalogue with reliable fallback streams",
    baseUrl: "https://www.nontongo.win",
    getMovieUrl: (tmdbId) => `https://www.nontongo.win/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId) => `https://www.nontongo.win/embed/tv/${tmdbId}/1/1`,
    getEpisodeUrl: (tmdbId, season, episode) =>
      `https://www.nontongo.win/embed/tv/${tmdbId}/${season}/${episode}`,
  },
];

export type AudioLanguage = "auto" | "te" | "hi" | "en";

export interface AudioLanguageOption {
  code: AudioLanguage;
  label: string;
  nativeLabel: string;
  flag?: string;
}

export const AUDIO_LANGUAGES: AudioLanguageOption[] = [
  { code: "auto", label: "Auto / Original", nativeLabel: "Original" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", flag: "🇮🇳" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी", flag: "🇮🇳" },
  { code: "en", label: "English", nativeLabel: "English", flag: "🌐" },
];

export function applyAudioLanguageToUrl(
  url: string,
  serverId: string,
  lang: AudioLanguage,
): string {
  if (!url || lang === "auto") return url;

  const separator = url.includes("?") ? "&" : "?";

  switch (serverId) {
    case "vidlink":
      return `${url}${separator}audio=${lang}`;
    case "vidcore":
      return `${url}${separator}audio=${lang}&sub=${lang}`;
    case "autoembed":
      return `${url}${separator}lang=${lang}`;
    case "superembed":
      return `${url}${separator}lang=${lang}`;
    case "vidsrc":
      return `${url}${separator}audio=${lang}`;
    case "nontongo":
      return `${url}${separator}lang=${lang}`;
    default:
      return `${url}${separator}audio=${lang}&lang=${lang}`;
  }
}

export const defaultServerOverrides: ServerOverride[] = [];

interface ServerState {
  selectedServer: VideoServer;
  serverOverrides: ServerOverride[];
  animePreference: "sub" | "dub";
  audioLanguage: AudioLanguage;
  vidnestContentType: "movie" | "tv" | "anime" | "animepahe";
  setSelectedServer: (server: VideoServer) => void;
  setAnimePreference: (preference: "sub" | "dub") => void;
  setAudioLanguage: (language: AudioLanguage) => void;
  setVidnestContentType: (type: "movie" | "tv" | "anime" | "animepahe") => void;
  getServerById: (id: string) => VideoServer | undefined;
  getAvailableServer: (
    tmdbId: number,
    type: "movie" | "tv",
    availabilityData?: {
      [serverId: string]: {
        movies: number[];
        tv: number[];
        isLoading: boolean;
      };
    },
  ) => VideoServer;
  setServerOverride: (
    serverId: string,
    isAvailable: boolean,
    reason?: string,
  ) => void;
  removeServerOverride: (serverId: string) => void;
  isServerOverridden: (serverId: string) => boolean;
  getServerOverride: (serverId: string) => ServerOverride | undefined;
  resetServerOverrides: () => void;
  getAnimeUrl: (serverId: string, anilistId: number, episode: number) => string;
  getAnimePaheUrl: (
    serverId: string,
    anilistId: number,
    episode: number,
  ) => string;
}

export const useServerStore = create<ServerState>()(
  persist(
    (set, get) => ({
      selectedServer: videoServers[0],
      serverOverrides: defaultServerOverrides,
      animePreference: "sub" as "sub" | "dub",
      audioLanguage: "auto" as AudioLanguage,
      vidnestContentType: "movie" as "movie" | "tv" | "anime" | "animepahe",
      setSelectedServer: (server) => {
        set({ selectedServer: server });
      },
      setAnimePreference: (preference) => {
        set({ animePreference: preference });
      },
      setAudioLanguage: (language) => {
        set({ audioLanguage: language });
      },
      setVidnestContentType: (type) => {
        set({ vidnestContentType: type });
      },
      getServerById: (id) => {
        return videoServers.find((server) => server.id === id);
      },
      getAvailableServer: (tmdbId, type, availabilityData) => {
        const { serverOverrides } = get();

        if (!availabilityData) {
          const currentServer = get().selectedServer;
          const override = serverOverrides.find(
            (o) => o.serverId === currentServer.id,
          );
          if (override && !override.isAvailable) {
            for (const server of videoServers) {
              const serverOverride = serverOverrides.find(
                (o) => o.serverId === server.id,
              );
              if (!serverOverride || serverOverride.isAvailable) {
                return server;
              }
            }
          }
          return currentServer;
        }

        const currentServer = get().selectedServer;
        const currentServerOverride = serverOverrides.find(
          (o) => o.serverId === currentServer.id,
        );

        if (currentServerOverride && !currentServerOverride.isAvailable) {
          // Current server is manually overridden as unavailable, skip availability check
        } else {
          const currentServerData = availabilityData[currentServer.id];
          if (currentServerData && !currentServerData.isLoading) {
            const isCurrentAvailable =
              currentServerData[type]?.includes(tmdbId);
            if (isCurrentAvailable) {
              return currentServer;
            }
          }
        }

        for (const server of videoServers) {
          const serverOverride = serverOverrides.find(
            (o) => o.serverId === server.id,
          );

          if (serverOverride && !serverOverride.isAvailable) {
            continue;
          }

          const serverData = availabilityData[server.id];
          if (!serverData || serverData.isLoading) continue;

          if (
            !server.checkAvailability &&
            !server.checkIndividualAvailability
          ) {
            return server;
          }

          if (serverData[type]?.includes(tmdbId)) {
            return server;
          }
        }

        const defaultServerOverride = serverOverrides.find(
          (o) => o.serverId === videoServers[0].id,
        );
        if (!defaultServerOverride || defaultServerOverride.isAvailable) {
          return videoServers[0];
        }

        for (const server of videoServers) {
          const serverOverride = serverOverrides.find(
            (o) => o.serverId === server.id,
          );
          if (!serverOverride || serverOverride.isAvailable) {
            return server;
          }
        }

        return videoServers[0];
      },
      setServerOverride: (serverId, isAvailable, reason) => {
        set((state) => ({
          serverOverrides: [
            ...state.serverOverrides.filter((o) => o.serverId !== serverId),
            { serverId, isAvailable, reason },
          ],
        }));
      },
      removeServerOverride: (serverId) => {
        set((state) => ({
          serverOverrides: state.serverOverrides.filter(
            (o) => o.serverId !== serverId,
          ),
        }));
      },
      isServerOverridden: (serverId) => {
        const { serverOverrides } = get();
        return serverOverrides.some((o) => o.serverId === serverId);
      },
      getServerOverride: (serverId) => {
        const { serverOverrides } = get();
        return serverOverrides.find((o) => o.serverId === serverId);
      },
      resetServerOverrides: () => {
        set({ serverOverrides: defaultServerOverrides });
      },
      getAnimeUrl: (serverId, anilistId, episode) => {
        const server = videoServers.find((s) => s.id === serverId);
        if (!server || !server.getAnimeUrl) return "";
        if (serverId === "vidnest") {
          const preference = get().animePreference;
          return `https://vidnest.fun/anime/${anilistId}/${episode}/${preference}`;
        }
        return server.getAnimeUrl(anilistId, episode);
      },
      getAnimePaheUrl: (serverId, anilistId, episode) => {
        const server = videoServers.find((s) => s.id === serverId);
        if (!server || !server.getAnimePaheUrl) return "";
        if (serverId === "vidnest") {
          const preference = get().animePreference;
          return `https://vidnest.fun/animepahe/${anilistId}/${episode}/${preference}`;
        }
        return server.getAnimePaheUrl(anilistId, episode);
      },
    }),
    {
      name: "video-server-storage",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const parsed = JSON.parse(str);
            if (parsed.state && parsed.state.selectedServerId) {
              const server = videoServers.find(
                (s) => s.id === parsed.state.selectedServerId,
              );
              const activeServer = server || videoServers[0];
              parsed.state.selectedServer = activeServer;
              parsed.state.selectedServerId = activeServer.id;
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              selectedServerId: value.state.selectedServer.id,
              selectedServer: undefined,
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
);
