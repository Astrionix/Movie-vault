"use client";

import { useServerStore, videoServers } from "@/lib/stores/server-store";
import { isMovie, isTVShow, MediaItem } from "@/utils/typings";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, Languages, Server, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { AudioLanguageToggle } from "./audio-language-toggle";
import { ContentTypeToggle } from "./content-type-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { SubDubToggle } from "./sub-dub-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface ServerSelectorProps {
  media?: MediaItem;
  mediaType?: "tv" | "movie";
  className?: string;
}

export function ServerSelector({
  media,
  mediaType,
  className,
}: ServerSelectorProps) {
  const {
    selectedServer,
    setSelectedServer,
    getAvailableServer,
    serverOverrides,
    getServerOverride,
    isServerOverridden,
    animePreference,
    setAnimePreference,
    audioLanguage,
    vidnestContentType,
    setVidnestContentType,
  } = useServerStore();
  const [availabilityData, setAvailabilityData] = useState<{
    [serverId: string]: {
      movies: number[];
      tv: number[];
      isLoading: boolean;
    };
  }>({});
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  const getMediaType = (): "movie" | "tv" => {
    if (mediaType) {
      return mediaType;
    }

    if (media) {
      if (isMovie(media)) {
        return "movie";
      } else if (isTVShow(media)) {
        return "tv";
      }
    }

    if (typeof window !== "undefined") {
      if (window.location.pathname.includes("/tvshows/")) {
        return "tv";
      } else if (window.location.pathname.includes("/movies/")) {
        return "movie";
      }
    }

    return "movie";
  };

  useEffect(() => {
    const fetchAvailabilityForAllServers = async () => {
      if (!media) return;

      const detectedMediaType = getMediaType();

      const initialData: typeof availabilityData = {};
      videoServers.forEach((server) => {
        const serverOverride = getServerOverride(server.id);

        if (serverOverride && !serverOverride.isAvailable) {
          initialData[server.id] = {
            movies: [],
            tv: [],
            isLoading: false,
          };
        } else {
          initialData[server.id] = {
            movies: [],
            tv: [],
            isLoading:
              server.checkAvailability || server.checkIndividualAvailability
                ? true
                : false,
          };
        }
      });
      setAvailabilityData(initialData);

      const fetchPromises = videoServers.map(async (server) => {
        const serverOverride = getServerOverride(server.id);

        if (serverOverride && !serverOverride.isAvailable) {
          return;
        }

        if (server.checkAvailability) {
          try {
            const [movies, tv] = await Promise.all([
              server.checkAvailability("movie"),
              server.checkAvailability("tv"),
            ]);

            setAvailabilityData((prev) => ({
              ...prev,
              [server.id]: {
                movies: Array.isArray(movies) ? movies : [],
                tv: Array.isArray(tv) ? tv : [],
                isLoading: false,
              },
            }));
          } catch (error) {
            console.error(
              `Error fetching availability for ${server.name}:`,
              error,
            );
            setAvailabilityData((prev) => ({
              ...prev,
              [server.id]: {
                movies: [],
                tv: [],
                isLoading: false,
              },
            }));
          }
        } else if (server.checkIndividualAvailability) {
          // I've set up individual availability checking for servers like filmku and embed.su.
          try {
            const isAvailable = await server.checkIndividualAvailability(
              media.id,
              detectedMediaType,
            );

            setAvailabilityData((prev) => ({
              ...prev,
              [server.id]: {
                movies:
                  detectedMediaType === "movie" && isAvailable
                    ? [media.id]
                    : [],
                tv: detectedMediaType === "tv" && isAvailable ? [media.id] : [],
                isLoading: false,
              },
            }));
          } catch (error) {
            console.error(
              `Error checking individual availability for ${server.name}:`,
              error,
            );
            setAvailabilityData((prev) => ({
              ...prev,
              [server.id]: {
                movies: [],
                tv: [],
                isLoading: false,
              },
            }));
          }
        } else {
          setAvailabilityData((prev) => ({
            ...prev,
            [server.id]: {
              movies: detectedMediaType === "movie" ? [media.id] : [],
              tv: detectedMediaType === "tv" ? [media.id] : [],
              isLoading: false,
            },
          }));
        }
      });

      await Promise.all(fetchPromises);
    };

    fetchAvailabilityForAllServers();
    setHasAutoSelected(false);
  }, [media, mediaType, serverOverrides, getServerOverride]);

  useEffect(() => {
    if (!media || hasAutoSelected) return;

    const detectedMediaType = getMediaType();

    const allServersLoaded = videoServers.every((server) => {
      const serverData = availabilityData[server.id];
      return serverData && !serverData.isLoading;
    });

    if (allServersLoaded) {
      const availableServer = getAvailableServer(
        media.id,
        detectedMediaType,
        availabilityData,
      );

      const currentServerOverride = getServerOverride(selectedServer.id);
      const isCurrentManuallyUnavailable =
        currentServerOverride && !currentServerOverride.isAvailable;

      const currentServerData = availabilityData[selectedServer.id];
      const isCurrentAvailable =
        !isCurrentManuallyUnavailable &&
        currentServerData &&
        (currentServerData[detectedMediaType]?.includes(media.id) ||
          (!selectedServer.checkAvailability &&
            !selectedServer.checkIndividualAvailability));

      if (!isCurrentAvailable && availableServer.id !== selectedServer.id) {
        setSelectedServer(availableServer);
      }

      setHasAutoSelected(true);
    }
  }, [
    media,
    mediaType,
    availabilityData,
    hasAutoSelected,
    selectedServer,
    setSelectedServer,
    getAvailableServer,
    getServerOverride,
  ]);

  const handleServerChange = (serverId: string) => {
    const server = videoServers.find((s) => s.id === serverId);
    if (!server) return;
    setSelectedServer(server);
  };

  const isContentAvailable = (serverId: string): boolean | null => {
    if (!media) return null;

    const server = videoServers.find((s) => s.id === serverId);
    if (!server) return null;

    const serverOverride = getServerOverride(serverId);
    if (serverOverride) {
      return serverOverride.isAvailable;
    }

    if (!server.checkAvailability && !server.checkIndividualAvailability) {
      return true;
    }

    const serverData = availabilityData[serverId];
    if (!serverData || serverData.isLoading) return null;

    const detectedMediaType = getMediaType();
    const contentArray = serverData[detectedMediaType];

    if (!contentArray || !Array.isArray(contentArray)) return null;

    const isAvailable = contentArray.includes(media.id);

    return isAvailable;
  };

  const isCheckingAvailability = (serverId: string): boolean => {
    if (isServerOverridden(serverId)) {
      return false;
    }

    const serverData = availabilityData[serverId];
    return serverData?.isLoading || false;
  };

  const getAvailabilityIcon = (serverId: string) => {
    if (!media) return null;

    const server = videoServers.find((s) => s.id === serverId);
    if (!server) return null;

    if (isCheckingAvailability(serverId)) {
      return <Wifi className="h-4 w-4 animate-pulse text-yellow-500" />;
    }

    const available = isContentAvailable(serverId);
    if (available === null) return null;

    return available ? (
      <Wifi className="h-4 w-4 text-green-500" />
    ) : (
      <WifiOff className="h-4 w-4 text-red-500" />
    );
  };

  const getCurrentServerAvailability = () => {
    if (!media) return null;
    return isContentAvailable(selectedServer.id);
  };

  const currentServerAvailability = getCurrentServerAvailability();
  const isCurrentServerLoading = isCheckingAvailability(selectedServer.id);

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                className={`backdrop-blur-md bg-white/10 border border-white/30 text-white py-2 px-4 rounded-full font-bold hover:bg-white/20 hover:border-white/40 hover:shadow-xl transition flex items-center shadow-lg gap-2 ${className}`}
              >
                <Server className="h-4 w-4" />
                {selectedServer.name}
                {isCurrentServerLoading ? (
                  <Wifi className="h-4 w-4 animate-pulse text-yellow-300" />
                ) : currentServerAvailability ? (
                  <Wifi className="h-4 w-4 text-green-400" />
                ) : currentServerAvailability === false ? (
                  <WifiOff className="h-4 w-4 text-red-400" />
                ) : (
                  <Wifi className="h-4 w-4 text-gray-300" />
                )}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Select a server to stream from</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          align="end"
          collisionPadding={12}
          className="w-72 p-2 max-h-[min(460px,calc(100vh-140px))] flex flex-col bg-slate-950/95 backdrop-blur-2xl border border-white/15 text-white shadow-2xl rounded-2xl"
        >
          {/* Audio Language Preference Section */}
          <div className="flex flex-col gap-1.5 px-1 py-1 mb-2 border-b border-border/40 pb-2.5 shrink-0">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Languages className="h-3 w-3 text-primary" /> Audio Language
              </span>
              {audioLanguage !== "auto" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                  {audioLanguage === "te"
                    ? "తెలుగు"
                    : audioLanguage.toUpperCase()}
                </span>
              )}
            </div>
            <AudioLanguageToggle variant="group" />
          </div>

          <div className="text-[10px] font-semibold text-muted-foreground uppercase px-1 pb-1 shrink-0 flex items-center justify-between">
            <span>Streaming Servers ({videoServers.length})</span>
            <span className="text-[9px] text-muted-foreground/75 normal-case font-normal">
              scroll ↓
            </span>
          </div>

          {/* Scrollable Servers Container */}
          <div className="flex-1 overflow-y-auto max-h-56 pr-1 space-y-0.5 scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 scrollbar-track-transparent">
            {videoServers
              .sort((a, b) => {
                const aAvailable = isContentAvailable(a.id);
                const bAvailable = isContentAvailable(b.id);

                // We should prioritize available servers.
                if (aAvailable !== bAvailable) {
                  return bAvailable ? 1 : -1;
                }

                return 0;
              })
              .map((server) => {
                const available = isContentAvailable(server.id);
                const isLoading = isCheckingAvailability(server.id);
                const isDisabled = available === false;
                const serverOverride = getServerOverride(server.id);

                if (server.id === "vidnest") {
                  return (
                    <DropdownMenuSub key={server.id}>
                      <DropdownMenuSubTrigger
                        onClick={() =>
                          !isDisabled && handleServerChange(server.id)
                        }
                        className={`flex items-center justify-between cursor-pointer ${
                          isDisabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isDisabled}
                        title={
                          serverOverride && !serverOverride.isAvailable
                            ? serverOverride.reason || "Server unavailable"
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{server.name}</span>
                          {getAvailabilityIcon(server.id)}
                        </div>
                        <div className="flex items-center gap-2">
                          {isLoading && (
                            <span className="text-xs text-muted-foreground">
                              Checking...
                            </span>
                          )}
                          {selectedServer.id === server.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent
                        {...({
                          side: "bottom",
                          align: "start",
                          sideOffset: 8,
                          alignOffset: -4,
                          collisionPadding: 16,
                        } as React.ComponentPropsWithoutRef<
                          typeof DropdownMenuPrimitive.SubContent
                        >)}
                        className="w-auto p-3 min-w-[200px]"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-medium text-muted-foreground px-1 uppercase tracking-wide">
                              Content Type
                            </span>
                            <ContentTypeToggle
                              value={vidnestContentType}
                              onValueChange={setVidnestContentType}
                            />
                          </div>
                          {(vidnestContentType === "anime" ||
                            vidnestContentType === "animepahe") && (
                            <div className="flex flex-col gap-1.5">
                              <span className="text-xs font-medium text-muted-foreground px-1 uppercase tracking-wide">
                                Audio
                              </span>
                              <SubDubToggle
                                value={animePreference}
                                onValueChange={setAnimePreference}
                                aria-label="Choose subtitles or dubbed audio"
                              />
                            </div>
                          )}
                        </div>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  );
                }

                return (
                  <DropdownMenuItem
                    key={server.id}
                    onClick={() => !isDisabled && handleServerChange(server.id)}
                    className={`flex items-center justify-between cursor-pointer ${
                      isDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isDisabled}
                    title={
                      serverOverride && !serverOverride.isAvailable
                        ? serverOverride.reason || "Server unavailable"
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{server.name}</span>
                      {getAvailabilityIcon(server.id)}
                    </div>
                    <div className="flex items-center gap-2">
                      {isLoading && (
                        <span className="text-xs text-muted-foreground">
                          Checking...
                        </span>
                      )}
                      {selectedServer.id === server.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
          </div>

          {media && (
            <div className="px-2 py-1 text-[11px] text-muted-foreground border-t border-white/10 mt-1 shrink-0 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Wifi className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px]">Active</span>
              </span>
              <span className="flex items-center gap-1">
                <WifiOff className="h-3 w-3 text-rose-400" />
                <span className="text-[10px]">Offline</span>
              </span>
              <span className="flex items-center gap-1">
                <Wifi className="h-3 w-3 text-amber-400" />
                <span className="text-[10px]">Testing</span>
              </span>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
