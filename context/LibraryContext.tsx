"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";

type LibraryState = {
  likedTrackIds: string[];
  followedArtistIds: string[];
  historyTrackIds: string[];
};

type LibraryAction =
  | {
      type: "SET_LIKES";
      trackIds: string[];
    }
  | {
      type: "TOGGLE_LIKE";
      trackId: string;
    }
  | {
      type: "SET_FOLLOWS";
      artistIds: string[];
    }
  | {
      type: "TOGGLE_FOLLOW";
      artistId: string;
    }
  | {
      type: "ADD_HISTORY";
      trackId: string;
    }
  | {
      type: "CLEAR_HISTORY";
    };

type LibraryContextValue = {
  likedTrackIds: string[];
  followedArtistIds: string[];
  historyTrackIds: string[];
  isLiked: (
    trackId: string,
  ) => boolean;
  isFollowing: (
    artistId: string,
  ) => boolean;
  toggleLike: (
    trackId: string,
  ) => void;
  toggleFollow: (
    artistId: string,
  ) => void;
  addToHistory: (
    trackId: string,
  ) => void;
  clearHistory: () => void;
};

const initialState: LibraryState = {
  likedTrackIds: [],
  followedArtistIds: [],
  historyTrackIds: [],
};

function reducer(
  state: LibraryState,
  action: LibraryAction,
): LibraryState {
  switch (action.type) {
    case "SET_LIKES":
      return {
        ...state,
        likedTrackIds:
          action.trackIds,
      };

    case "TOGGLE_LIKE": {
      const exists =
        state.likedTrackIds.includes(
          action.trackId,
        );

      return {
        ...state,
        likedTrackIds: exists
          ? state.likedTrackIds.filter(
              (id) =>
                id !==
                action.trackId,
            )
          : [
              action.trackId,
              ...state.likedTrackIds,
            ],
      };
    }

    case "SET_FOLLOWS":
      return {
        ...state,
        followedArtistIds:
          action.artistIds,
      };

    case "TOGGLE_FOLLOW": {
      const exists =
        state.followedArtistIds.includes(
          action.artistId,
        );

      return {
        ...state,
        followedArtistIds: exists
          ? state.followedArtistIds.filter(
              (id) =>
                id !==
                action.artistId,
            )
          : [
              action.artistId,
              ...state.followedArtistIds,
            ],
      };
    }

    case "ADD_HISTORY":
      return {
        ...state,
        historyTrackIds: [
          action.trackId,
          ...state.historyTrackIds.filter(
            (id) =>
              id !==
              action.trackId,
          ),
        ].slice(0, 30),
      };

    case "CLEAR_HISTORY":
      return {
        ...state,
        historyTrackIds: [],
      };

    default:
      return state;
  }
}

const LibraryContext =
  createContext<
    LibraryContextValue | null
  >(null);

export function LibraryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] =
    useReducer(
      reducer,
      initialState,
    );

  useEffect(() => {
    let cancelled = false;

    async function loadLikes() {
      try {
        const response =
          await fetch(
            "/api/library/likes",
            {
              method: "GET",
              cache: "no-store",
            },
          );

        if (
          !response.ok ||
          cancelled
        ) {
          return;
        }

        const data =
          (await response.json()) as {
            likedTrackIds?:
              unknown;
          };

        if (
          Array.isArray(
            data.likedTrackIds,
          ) &&
          data.likedTrackIds.every(
            (id) =>
              typeof id ===
              "string",
          )
        ) {
          dispatch({
            type: "SET_LIKES",
            trackIds:
              data.likedTrackIds,
          });
        }
      } catch {
        // Keep the usable local state
        // when the network is unavailable.
      }
    }

    async function loadFollows() {
      try {
        const response =
          await fetch(
            "/api/library/follows",
            {
              method: "GET",
              cache: "no-store",
            },
          );

        if (
          !response.ok ||
          cancelled
        ) {
          return;
        }

        const data =
          (await response.json()) as {
            followedArtistIds?:
              unknown;
          };

        if (
          Array.isArray(
            data.followedArtistIds,
          ) &&
          data.followedArtistIds.every(
            (id) =>
              typeof id ===
              "string",
          )
        ) {
          dispatch({
            type: "SET_FOLLOWS",
            artistIds:
              data.followedArtistIds,
          });
        }
      } catch {
        // Keep local follow state
        // when the network is unavailable.
      }
    }

    void loadLikes();
    void loadFollows();

    return () => {
      cancelled = true;
    };
  }, []);

  function isLiked(
    trackId: string,
  ) {
    return state.likedTrackIds.includes(
      trackId,
    );
  }

  function isFollowing(
    artistId: string,
  ) {
    return state.followedArtistIds.includes(
      artistId,
    );
  }

  function toggleLike(
    trackId: string,
  ) {
    const wasLiked =
      state.likedTrackIds.includes(
        trackId,
      );

    dispatch({
      type: "TOGGLE_LIKE",
      trackId,
    });

    void persistLike(
      trackId,
      wasLiked,
    );
  }

  async function persistLike(
    trackId: string,
    wasLiked: boolean,
  ) {
    try {
      const response =
        await fetch(
          `/api/tracks/${encodeURIComponent(
            trackId,
          )}/like`,
          {
            method:
              wasLiked
                ? "DELETE"
                : "POST",
          },
        );

      if (!response.ok) {
        throw new Error(
          "Like persistence failed",
        );
      }
    } catch {
      dispatch({
        type: "TOGGLE_LIKE",
        trackId,
      });
    }
  }

  function toggleFollow(
    artistId: string,
  ) {
    const wasFollowing =
      state.followedArtistIds.includes(
        artistId,
      );

    dispatch({
      type: "TOGGLE_FOLLOW",
      artistId,
    });

    void persistFollow(
      artistId,
      wasFollowing,
    );
  }

  async function persistFollow(
    artistId: string,
    wasFollowing: boolean,
  ) {
    try {
      const response =
        await fetch(
          `/api/artists/${encodeURIComponent(
            artistId,
          )}/follow`,
          {
            method:
              wasFollowing
                ? "DELETE"
                : "POST",
          },
        );

      if (!response.ok) {
        throw new Error(
          "Follow persistence failed",
        );
      }
    } catch {
      dispatch({
        type: "TOGGLE_FOLLOW",
        artistId,
      });
    }
  }

  function addToHistory(
    trackId: string,
  ) {
    dispatch({
      type: "ADD_HISTORY",
      trackId,
    });
  }

  function clearHistory() {
    dispatch({
      type: "CLEAR_HISTORY",
    });
  }

  return (
    <LibraryContext.Provider
      value={{
        likedTrackIds:
          state.likedTrackIds,
        followedArtistIds:
          state.followedArtistIds,
        historyTrackIds:
          state.historyTrackIds,
        isLiked,
        isFollowing,
        toggleLike,
        toggleFollow,
        addToHistory,
        clearHistory,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context =
    useContext(
      LibraryContext,
    );

  if (!context) {
    throw new Error(
      "useLibrary must be used inside LibraryProvider",
    );
  }

  return context;
}
