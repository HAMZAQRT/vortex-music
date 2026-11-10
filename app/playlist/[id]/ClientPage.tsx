"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import AppShell from "../../../components/AppShell";
import { tracks as localTracks } from "../../../data/tracks";
import { usePlayer } from "../../../context/PlayerContext";
import PlaylistSettings from "../../../components/playlist/PlaylistSettings";

type ApiTrack = {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;

  artist: {
    id: string;
    name: string;
  };
};

type PlaylistTrack = {
  position: number;
  track: ApiTrack;
};

type Playlist = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  public: boolean;
  createdAt: string;
  tracks: PlaylistTrack[];
};

type PlaylistResponse = {
  playlist: Playlist;
  availableTracks: ApiTrack[];
};

export default function PlaylistClientPage({
  id,
}: {
  id: string;
}) {
  const {
    playTrack,
  } = usePlayer();

  const [data, setData] =
    useState<PlaylistResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [workingTrack, setWorkingTrack] =
    useState<string | null>(
      null,
    );

  const [error, setError] =
    useState("");

  const loadPlaylist =
    useCallback(async () => {
      setError("");

      try {
        const response =
          await fetch(
            `/api/library/playlists/${encodeURIComponent(
              id,
            )}`,
            {
              cache: "no-store",
            },
          );

        const payload =
          (await response.json()) as
            | PlaylistResponse
            | {
                error?: string;
              };

        if (
          !response.ok ||
          !("playlist" in payload)
        ) {
          throw new Error(
            "error" in payload &&
            payload.error
              ? payload.error
              : "Unable to load playlist",
          );
        }

        setData(payload);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to load playlist",
        );
      } finally {
        setLoading(false);
      }
    }, [id]);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) {
        void loadPlaylist();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadPlaylist]);

  function findLocalTrack(
    trackId: string,
  ) {
    return localTracks.find(
      (track) =>
        track.id === trackId,
    );
  }

  function handlePlay(
    trackId: string,
  ) {
    const localTrack =
      findLocalTrack(trackId);

    if (localTrack) {
      playTrack(localTrack);
    }
  }

  async function addTrack(
    trackId: string,
  ) {
    if (workingTrack) {
      return;
    }

    setWorkingTrack(trackId);
    setError("");

    try {
      const response =
        await fetch(
          `/api/library/playlists/${encodeURIComponent(
            id,
          )}/tracks`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              trackId,
            }),
          },
        );

      const payload =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to add track",
        );
      }

      await loadPlaylist();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to add track",
      );
    } finally {
      setWorkingTrack(null);
    }
  }

  async function removeTrack(
    trackId: string,
  ) {
    if (workingTrack) {
      return;
    }

    setWorkingTrack(trackId);
    setError("");

    try {
      const response =
        await fetch(
          `/api/library/playlists/${encodeURIComponent(
            id,
          )}/tracks/${encodeURIComponent(
            trackId,
          )}`,
          {
            method: "DELETE",
          },
        );

      const payload =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to remove track",
        );
      }

      await loadPlaylist();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to remove track",
      );
    } finally {
      setWorkingTrack(null);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center">
          <p className="text-sm text-white/35">
            Loading playlist...
          </p>
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <h1 className="text-2xl font-black">
            Playlist unavailable
          </h1>

          <p className="mt-3 text-sm text-red-300/70">
            {error}
          </p>

          <Link
            href="/library"
            className="mt-6 inline-block font-bold text-violet-400"
          >
            Back to Library
          </Link>
        </div>
      </AppShell>
    );
  }

  const {
    playlist,
    availableTracks,
  } = data;

  return (
    <AppShell>
      <header className="pt-6">
        <Link
          href="/library"
          className="text-sm text-white/40"
        >
          ‹ Library
        </Link>
      </header>

      <section className="pt-6">
        <div className="aspect-square w-full max-w-sm rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-purple-700 to-blue-800 shadow-2xl" />

        <p className="mt-7 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
          Vortex Playlist
        </p>

        <h1 className="mt-2 text-3xl font-black">
          {playlist.title}
        </h1>

        <p className="mt-3 max-w-lg text-sm leading-6 text-white/45">
          {playlist.description ||
            "Your personal Vortex collection."}
        </p>

        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-white/25">
          {playlist.tracks.length}
          {playlist.tracks.length === 1
            ? " track"
            : " tracks"}
        </p>

        <PlaylistSettings
          playlistId={playlist.id}
          initialTitle={playlist.title}
          initialDescription={playlist.description}
          initialPublic={playlist.public}
          onSaved={loadPlaylist}
        />

        {playlist.tracks[0] && (
          <button
            type="button"
            onClick={() =>
              handlePlay(
                playlist.tracks[0]
                  .track.id,
              )
            }
            className="mt-6 rounded-full bg-white px-8 py-3 font-black text-black"
          >
            ▶ Play
          </button>
        )}
      </section>

      {error && (
        <div
          aria-live="polite"
          className="mt-6 rounded-2xl border border-red-500/15 bg-red-500/5 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-violet-400">
              Playlist
            </p>

            <h2 className="mt-1 text-xl font-black">
              Tracks
            </h2>
          </div>

          <span className="text-xs text-white/30">
            {playlist.tracks.length}
          </span>
        </div>

        {playlist.tracks.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-white/10 p-7 text-center">
            <p className="text-3xl">
              ♫
            </p>

            <p className="mt-3 font-bold">
              This playlist is empty
            </p>

            <p className="mt-1 text-sm text-white/35">
              Add a track below to get started.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {playlist.tracks.map(
              ({
                track,
                position,
              }) => {
                const localTrack =
                  findLocalTrack(
                    track.id,
                  );

                return (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-2"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handlePlay(
                          track.id,
                        )
                      }
                      disabled={
                        !localTrack
                      }
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${
                        localTrack?.color ||
                        "from-violet-600 to-blue-800"
                      } disabled:opacity-50`}
                    >
                      ▶
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handlePlay(
                          track.id,
                        )
                      }
                      disabled={
                        !localTrack
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate font-semibold">
                        {track.title}
                      </p>

                      <p className="truncate text-xs text-white/35">
                        {
                          track.artist
                            .name
                        }
                        {" · "}
                        #{position + 1}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void removeTrack(
                          track.id,
                        )
                      }
                      disabled={
                        workingTrack !==
                        null
                      }
                      className="grid h-10 w-10 place-items-center rounded-full border border-red-500/15 text-red-400 disabled:opacity-40"
                      aria-label={`Remove ${track.title}`}
                    >
                      ×
                    </button>
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
            Discover
          </p>

          <h2 className="mt-1 text-xl font-black">
            Add Tracks
          </h2>
        </div>

        {availableTracks.length ===
        0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-white/10 p-7 text-center">
            <p className="font-bold">
              All available tracks added
            </p>

            <p className="mt-1 text-sm text-white/35">
              Your playlist already contains every published Vortex track.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {availableTracks.map(
              (track) => {
                const localTrack =
                  findLocalTrack(
                    track.id,
                  );

                return (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/5 p-2"
                  >
                    <div
                      className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${
                        localTrack?.color ||
                        "from-cyan-600 to-blue-800"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {track.title}
                      </p>

                      <p className="truncate text-xs text-white/35">
                        {
                          track.artist
                            .name
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void addTrack(
                          track.id,
                        )
                      }
                      disabled={
                        workingTrack !==
                        null
                      }
                      className="rounded-full bg-white px-4 py-2 text-xs font-black text-black disabled:opacity-40"
                    >
                      {workingTrack ===
                      track.id
                        ? "Adding..."
                        : "+ Add"}
                    </button>
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>
    </AppShell>
  );
}
