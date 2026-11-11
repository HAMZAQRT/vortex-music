"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import AppShell from "../../../components/AppShell";
import { tracks as localTracks } from "../../../data/tracks";
import { usePlayer } from "../../../context/PlayerContext";

type PublicTrack = {
  position: number;

  track: {
    id: string;
    title: string;
    duration: number;

    artist: {
      id: string;
      name: string;
    };
  };
};

type PublicPlaylist = {
  id: string;
  title: string;
  description:
    | string
    | null;
  public: boolean;

  owner: {
    name:
      | string
      | null;
    image:
      | string
      | null;
  };

  tracks:
    PublicTrack[];
};

export default function PublicPlaylistClient({
  id,
}: {
  id: string;
}) {
  const {
    playTrack,
  } = usePlayer();

  const [
    playlist,
    setPlaylist,
  ] =
    useState<
      PublicPlaylist | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(
      async () => {
        try {
          const response =
            await fetch(
              `/api/public/playlists/${encodeURIComponent(
                id,
              )}`,
              {
                cache:
                  "no-store",
              },
            );

          const payload =
            (await response.json()) as {
              playlist?:
                PublicPlaylist;
              error?: string;
            };

          if (!response.ok) {
            throw new Error(
              payload.error ||
                "Playlist unavailable",
            );
          }

          if (
            !cancelled &&
            payload.playlist
          ) {
            setPlaylist(
              payload.playlist,
            );
          }
        } catch (caught) {
          if (!cancelled) {
            setError(
              caught instanceof
              Error
                ? caught.message
                : "Playlist unavailable",
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(
              false,
            );
          }
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [id]);

  function play(
    trackId: string,
  ) {
    const track =
      localTracks.find(
        (item) =>
          item.id ===
          trackId,
      );

    if (track) {
      playTrack(track);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-sm text-white/35">
          Loading playlist...
        </div>
      </AppShell>
    );
  }

  if (
    !playlist ||
    error
  ) {
    return (
      <AppShell>
        <div className="py-24 text-center">
          <h1 className="text-2xl font-black">
            Playlist unavailable
          </h1>

          <p className="mt-3 text-sm text-white/40">
            {error}
          </p>

          <Link
            href="/"
            className="mt-6 inline-block font-bold text-violet-400"
          >
            Explore Vortex
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="pt-6">
        <Link
          href="/"
          className="text-sm font-bold text-white/40"
        >
          VORTEX
        </Link>
      </header>

      <section className="pt-8">
        <div className="aspect-square w-full max-w-sm rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-purple-700 to-blue-800 shadow-2xl" />

        <p className="mt-7 text-xs font-black uppercase tracking-[0.3em] text-cyan-400">
          Public Playlist
        </p>

        <h1 className="mt-2 text-4xl font-black">
          {
            playlist.title
          }
        </h1>

        <p className="mt-3 max-w-lg text-sm leading-6 text-white/45">
          {
            playlist.description ||
            "A public Vortex playlist."
          }
        </p>

        <p className="mt-4 text-xs text-white/30">
          By{" "}
          {
            playlist.owner
              .name ||
            "Vortex User"
          }
          {" · "}
          {
            playlist.tracks
              .length
          }
          {
            playlist.tracks
              .length === 1
              ? " track"
              : " tracks"
          }
        </p>

        {playlist.tracks[0] && (
          <button
            type="button"
            onClick={() =>
              play(
                playlist
                  .tracks[0]
                  .track.id,
              )
            }
            className="mt-6 rounded-full bg-white px-8 py-3 font-black text-black"
          >
            ▶ Play
          </button>
        )}
      </section>

      <section className="mt-10 space-y-2">
        {playlist.tracks.map(
          ({
            track,
            position,
          }) => {
            const localTrack =
              localTracks.find(
                (item) =>
                  item.id ===
                  track.id,
              );

            return (
              <button
                key={
                  track.id
                }
                type="button"
                onClick={() =>
                  play(
                    track.id,
                  )
                }
                disabled={
                  !localTrack
                }
                className="flex w-full items-center gap-4 rounded-2xl p-3 text-left transition hover:bg-white/5 disabled:opacity-50"
              >
                <span className="w-5 text-xs text-white/25">
                  {position +
                    1}
                </span>

                <div
                  className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${
                    localTrack?.color ||
                    "from-violet-600 to-blue-800"
                  }`}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {
                      track.title
                    }
                  </p>

                  <p className="truncate text-xs text-white/35">
                    {
                      track.artist
                        .name
                    }
                  </p>
                </div>

                <span className="text-white/40">
                  ▶
                </span>
              </button>
            );
          },
        )}
      </section>

      <section className="mt-10 rounded-3xl border border-white/5 bg-white/[0.03] p-5 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-violet-400">
          Vortex Music
        </p>

        <p className="mt-2 text-sm text-white/40">
          Discover, listen and build your own collection.
        </p>
      </section>
    </AppShell>
  );
}
