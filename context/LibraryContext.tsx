"use client";

import {
  createContext,
  useContext,
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
      type: "TOGGLE_LIKE";
      trackId: string;
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
  isLiked: (trackId: string) => boolean;
  isFollowing: (artistId: string) => boolean;
  toggleLike: (trackId: string) => void;
  toggleFollow: (artistId: string) => void;
  addToHistory: (trackId: string) => void;
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
    case "TOGGLE_LIKE": {
      const exists = state.likedTrackIds.includes(
        action.trackId,
      );

      return {
        ...state,
        likedTrackIds: exists
          ? state.likedTrackIds.filter(
              (id) => id !== action.trackId,
            )
          : [action.trackId, ...state.likedTrackIds],
      };
    }

    case "TOGGLE_FOLLOW": {
      const exists = state.followedArtistIds.includes(
        action.artistId,
      );

      return {
        ...state,
        followedArtistIds: exists
          ? state.followedArtistIds.filter(
              (id) => id !== action.artistId,
            )
          : [
              action.artistId,
              ...state.followedArtistIds,
            ],
      };
    }

    case "ADD_HISTORY": {
      return {
        ...state,
        historyTrackIds: [
          action.trackId,
          ...state.historyTrackIds.filter(
            (id) => id !== action.trackId,
          ),
        ].slice(0, 30),
      };
    }

    case "CLEAR_HISTORY": {
      return {
        ...state,
        historyTrackIds: [],
      };
    }

    default:
      return state;
  }
}

const LibraryContext =
  createContext<LibraryContextValue | null>(null);

export function LibraryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
  );

  function isLiked(trackId: string) {
    return state.likedTrackIds.includes(trackId);
  }

  function isFollowing(artistId: string) {
    return state.followedArtistIds.includes(artistId);
  }

  function toggleLike(trackId: string) {
    dispatch({
      type: "TOGGLE_LIKE",
      trackId,
    });
  }

  function toggleFollow(artistId: string) {
    dispatch({
      type: "TOGGLE_FOLLOW",
      artistId,
    });
  }

  function addToHistory(trackId: string) {
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
        likedTrackIds: state.likedTrackIds,
        followedArtistIds: state.followedArtistIds,
        historyTrackIds: state.historyTrackIds,
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
  const context = useContext(LibraryContext);

  if (!context) {
    throw new Error(
      "useLibrary must be used inside LibraryProvider",
    );
  }

  return context;
}
