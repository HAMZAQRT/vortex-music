"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  tracks,
} from "../../data/tracks";

import {
  albums,
  artists,
  playlists,
} from "../../data/catalog";

import {
  usePlayer,
} from "../../context/PlayerContext";

type Filter =
  | "all"
  | "tracks"
  | "artists"
  | "albums"
  | "playlists";

const filters: Array<{
  id: Filter;
  label: string;
}> = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "tracks",
    label: "Songs",
  },
  {
    id: "artists",
    label: "Artists",
  },
  {
    id: "albums",
    label: "Albums",
  },
  {
    id: "playlists",
    label: "Playlists",
  },
];

export default function ExploreDashboard() {
  const [
    query,
    setQuery,
  ] =
    useState("");

  const [
    filter,
    setFilter,
  ] =
    useState<Filter>(
      "all",
    );

  const {
    currentTrack,
    isPlaying,
    playTrack,
  } = usePlayer();

  const normalized =
    query
      .trim()
      .toLowerCase();

  const filteredTracks =
    useMemo(
      () =>
        tracks.filter(
          (track) =>
            !normalized ||
            `${track.title} ${track.artist} ${track.album}`
              .toLowerCase()
              .includes(
                normalized,
              ),
        ),
      [normalized],
    );

  const filteredArtists =
    useMemo(
      () =>
        artists.filter(
          (artist) =>
            !normalized ||
            `${artist.name} ${artist.bio}`
              .toLowerCase()
              .includes(
                normalized,
              ),
        ),
      [normalized],
    );

  const filteredAlbums =
    useMemo(
      () =>
        albums.filter(
          (album) =>
            !normalized ||
            `${album.title} ${album.year}`
              .toLowerCase()
              .includes(
                normalized,
              ),
        ),
      [normalized],
    );

  const filteredPlaylists =
    useMemo(
      () =>
        playlists.filter(
          (playlist) =>
            !normalized ||
            `${playlist.title} ${playlist.description}`
              .toLowerCase()
              .includes(
                normalized,
              ),
        ),
      [normalized],
    );

  return (
    <>
      <header className="py-6">
        <p className="text-xs font-black tracking-[0.35em] text-violet-400">
          VORTEX EXPLORE
        </p>

        <h1 className="mt-1 text-3xl font-black">
          Find your next sound
        </h1>
      </header>

      <label className="block">
        <span className="sr-only">
          Search Vortex
        </span>

        <input
          value={
            query
          }
          onChange={(
            event,
          ) =>
            setQuery(
              event.target
                .value,
            )
          }
          placeholder="Songs, artists, albums, playlists..."
          className="w-full rounded-3xl border border-white/10 bg-white/5 px-5 py-4 outline-none placeholder:text-white/20 focus:border-violet-500/50"
        />
      </label>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {filters.map(
          (item) => (
            <button
              type="button"
              key={
                item.id
              }
              onClick={() =>
                setFilter(
                  item.id,
                )
              }
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${
                filter ===
                item.id
                  ? "bg-white text-black"
                  : "bg-white/5 text-white/40"
              }`}
            >
              {item.label}
            </button>
          ),
        )}

        <Link
          href="/live"
          className="shrink-0 rounded-full bg-red-500/10 px-4 py-2 text-xs font-black text-red-300"
        >
          ● Live
        </Link>
      </div>

      {(filter === "all" ||
        filter ===
          "tracks") && (
        <section className="mt-8">
          <Heading
            title="Songs"
            count={
              filteredTracks.length
            }
          />

          <div className="mt-3 space-y-2">
            {filteredTracks.map(
              (
                track,
                index,
              ) => {
                const active =
                  currentTrack.id ===
                  track.id;

                return (
                  <button
                    key={
                      track.id
                    }
                    type="button"
                    onClick={() =>
                      playTrack(
                        track,
                      )
                    }
                    className={`flex w-full items-center gap-4 rounded-2xl p-3 text-left ${
                      active
                        ? "bg-violet-500/10"
                        : "bg-white/[0.02]"
                    }`}
                  >
                    <span className="w-5 font-mono text-xs text-white/20">
                      {index +
                        1}
                    </span>

                    <div
                      className={`h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br ${track.color}`}
                    />

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate font-bold ${
                          active
                            ? "text-violet-300"
                            : ""
                        }`}
                      >
                        {
                          track.title
                        }
                      </p>

                      <p className="truncate text-xs text-white/35">
                        {
                          track.artist
                        }{" "}
                        ·{" "}
                        {
                          track.album
                        }
                      </p>
                    </div>

                    <span className="text-white/50">
                      {active &&
                      isPlaying
                        ? "Ⅱ"
                        : "▶"}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </section>
      )}

      {(filter === "all" ||
        filter ===
          "artists") && (
        <section className="mt-9">
          <Heading
            title="Artists"
            count={
              filteredArtists.length
            }
          />

          <div className="mt-4 grid grid-cols-3 gap-3">
            {filteredArtists.map(
              (artist) => (
                <Link
                  key={
                    artist.id
                  }
                  href={`/artist/${artist.id}`}
                >
                  <div
                    className={`aspect-square rounded-full bg-gradient-to-br ${artist.color}`}
                  />

                  <p className="mt-2 truncate text-center text-sm font-bold">
                    {
                      artist.name
                    }
                  </p>
                </Link>
              ),
            )}
          </div>
        </section>
      )}

      {(filter === "all" ||
        filter ===
          "albums") && (
        <section className="mt-9">
          <Heading
            title="Albums"
            count={
              filteredAlbums.length
            }
          />

          <div className="mt-4 grid grid-cols-3 gap-3">
            {filteredAlbums.map(
              (album) => (
                <Link
                  key={
                    album.id
                  }
                  href={`/album/${album.id}`}
                >
                  <div
                    className={`aspect-square rounded-2xl bg-gradient-to-br ${album.color}`}
                  />

                  <p className="mt-2 truncate text-sm font-bold">
                    {
                      album.title
                    }
                  </p>

                  <p className="text-xs text-white/30">
                    {
                      album.year
                    }
                  </p>
                </Link>
              ),
            )}
          </div>
        </section>
      )}

      {(filter === "all" ||
        filter ===
          "playlists") && (
        <section className="mt-9">
          <Heading
            title="Playlists"
            count={
              filteredPlaylists.length
            }
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {filteredPlaylists.map(
              (
                playlist,
              ) => (
                <article
                  key={
                    playlist.id
                  }
                  className="flex items-center gap-4 rounded-3xl border border-white/5 bg-white/[0.025] p-3"
                >
                  <div
                    className={`h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br ${playlist.color}`}
                  />

                  <div className="min-w-0">
                    <p className="truncate font-black">
                      {
                        playlist.title
                      }
                    </p>

                    <p className="mt-1 truncate text-xs text-white/35">
                      {
                        playlist.description
                      }
                    </p>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>
      )}

      <section className="mt-10 rounded-[2rem] border border-white/5 bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/5 p-6">
        <p className="text-xs font-black uppercase tracking-widest text-fuchsia-400">
          Vortex Video
        </p>

        <h2 className="mt-2 text-2xl font-black">
          Visual sessions are next
        </h2>

        <p className="mt-2 max-w-lg text-sm leading-6 text-white/40">
          The video catalog is ready for licensed visual content. Vortex will not publish placeholder or unlicensed media.
        </p>
      </section>
    </>
  );
}

function Heading({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-black">
        {title}
      </h2>

      <span className="font-mono text-xs text-white/25">
        {count}
      </span>
    </div>
  );
}
