import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  WATCHLIST_STORAGE_KEY,
  WatchlistButton,
} from "@/components/watchlist/watchlist-button";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

type ToastMock = {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};
const mockToast = toast as unknown as ToastMock;

describe("WatchlistButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("shows bookmark icon when item is not in watchlist", async () => {
    render(
      <WatchlistButton contentId={123} mediaType="movie">
        Add to Watchlist
      </WatchlistButton>,
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId("watchlist-button-loading"),
      ).not.toBeInTheDocument();
    });

    const button = screen.getByTestId("watchlist-button-add");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-in-watchlist", "false");
    expect(button).toHaveAttribute("data-content-id", "123");
    expect(button).toHaveAttribute("data-media-type", "movie");
  });

  test("shows bookmark check icon when item is in watchlist", async () => {
    localStorage.setItem(
      WATCHLIST_STORAGE_KEY,
      JSON.stringify([
        { contentId: 123, mediaType: "movie", addedAt: Date.now() },
      ]),
    );

    render(
      <WatchlistButton contentId={123} mediaType="movie">
        Remove from Watchlist
      </WatchlistButton>,
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId("watchlist-button-loading"),
      ).not.toBeInTheDocument();
    });

    const button = screen.getByTestId("watchlist-button-remove");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-in-watchlist", "true");
  });

  test("adds item to watchlist when clicked", async () => {
    const user = userEvent.setup();
    render(
      <WatchlistButton contentId={123} mediaType="movie">
        Add to Watchlist
      </WatchlistButton>,
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId("watchlist-button-loading"),
      ).not.toBeInTheDocument();
    });

    const button = screen.getByTestId("watchlist-button-add");
    await user.click(button);

    await waitFor(() => {
      const stored = JSON.parse(
        localStorage.getItem(WATCHLIST_STORAGE_KEY) || "[]",
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].contentId).toBe(123);
      expect(stored[0].mediaType).toBe("movie");
    });

    expect(mockToast.success).toHaveBeenCalledWith("Added to watchlist");
  });

  test("removes item from watchlist when clicked", async () => {
    localStorage.setItem(
      WATCHLIST_STORAGE_KEY,
      JSON.stringify([
        { contentId: 123, mediaType: "movie", addedAt: Date.now() },
      ]),
    );

    const user = userEvent.setup();
    render(
      <WatchlistButton contentId={123} mediaType="movie">
        Remove from Watchlist
      </WatchlistButton>,
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId("watchlist-button-loading"),
      ).not.toBeInTheDocument();
    });

    const button = screen.getByTestId("watchlist-button-remove");
    await user.click(button);

    await waitFor(() => {
      const stored = JSON.parse(
        localStorage.getItem(WATCHLIST_STORAGE_KEY) || "[]",
      );
      expect(stored).toHaveLength(0);
    });

    expect(mockToast.success).toHaveBeenCalledWith("Removed from watchlist");
  });

  test("does not add when mediaType is missing", async () => {
    render(<WatchlistButton contentId={123} />);

    await waitFor(() => {
      expect(
        screen.queryByTestId("watchlist-button-loading"),
      ).not.toBeInTheDocument();
    });

    expect(localStorage.getItem(WATCHLIST_STORAGE_KEY)).toBeNull();
  });
});
