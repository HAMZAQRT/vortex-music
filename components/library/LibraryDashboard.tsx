"use client";

import Link from "next/link";

import { useLibrary } from "../../context/LibraryContext";
import { usePlayer } from "../../context/PlayerContext";
import { tracks } from "../../data/tracks";
import { artists } from "../../data/catalog";

export default function LibraryDashboard() {
  const {
    likedTrackIds,
    followedArtistIds,
    historyTrackIds,
    toggleLike,
    toggleFollow,
    clearHistory,
  } = useLibrary();

  const {
    playTrack,
    currentTrack,
    isPlaying,
  } = usePlayer();

  const likedTracks = likedTrackIds
    .map((id) =>
      tracks.find((track) => track.id === id),
    )
    .filter((track) => track !== undefined);

  const historyTracks = historyTrackIds
    .map((id) =>
      tracks.find((track) => track.id === id),
    )
    .filter((track) => track !== undefined);

  const followedArtists = followedArtistIds
    .map((id) =>
      artists.find((artist) => artist.id === id),
    )
    .filter((artist) => artist !== undefined);

  return (
    <>
      <section className="grid grid-cols-3 gap-3">
        <div className="rounded-3xl border border-white/5 bg-white/[0.04] p-4">
          <p className="text-2xl font-black">
            {likedTracks.length}
          </p>
          <p className="mt-1 text-xs text-white/40">
            Liked Songs
          </p>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.04] p-4">
          <p className="text-2xl font-black">
            {followedArtists.length}
          </p>
          <p className="mt-1 text-xs text-white/40">
            Following
          </p>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.04] p-4">
          <p className="text-2xl font-black">
            {historyTracks.length}
          </p>
          <p className="mt-1 text-xs text-white/40">
            History
          </p>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-pink-400">
              Favorites
            </p>
            <h2 className="mt-1 text-xl font-black">
              Liked Songs
            </h2>
          </div>

          <span className="text-xs text-white/30">
            {likedTracks.length}
          </span>
        </div>

        {likedTracks.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-white/10 p-7 text-center">
            <p className="text-3xl">♡</p>
            <p className="mt-3 font-bold">
              No liked songs yet
            </p>
            <p className="mt-1 text-sm text-white/35">
              Like tracks from the player to find them here.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {likedTracks.map((track) => {
              const active =
                currentTrack.id === track.id;

              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-3 rounded-2xl p-2 ${
                    active
                      ? "bg-violet-500/10"
                      : "bg-white/[0.02]"
                  }`}
                >
                  <button
                    onClick={() => playTrack(track)}
                    className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${track.color}`}
                    aria-label={`Play ${track.title}`}
                  />

                  <button
                    onClick={() => playTrack(track)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate font-semibold">
                      {track.title}
                    </p>
                    <p className="truncate text-xs text-white/35">
                      {track.artist}
                    </p>
                  </button>

                  <span className="text-xs text-violet-300">
                    {active && isPlaying ? "Ⅱ" : ""}
                  </span>

                  <button
                    onClick={() =>
                      toggleLike(track.id)
                    }
                    className="grid h-10 w-10 place-items-center text-pink-400"
                    aria-label={`Unlike ${track.title}`}
                  >
                    ♥
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-violet-400">
              Artists
            </p>
            <h2 className="mt-1 text-xl font-black">
              Following
            </h2>
          </div>

          <span className="text-xs text-white/30">
            {followedArtists.length}
          </span>
        </div>

        {followedArtists.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-white/10 p-7 text-center">
            <p className="text-3xl">☆</p>
            <p className="mt-3 font-bold">
              Follow your favorite artists
            </p>

            <Link
              href="/explore"
              className="mt-3 inline-block text-sm font-bold text-violet-400"
            >
              Explore artists
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {followedArtists.map((artist) => (
              <div
                key={artist.id}
                className="flex items-center gap-3 rounded-2xl bg-white/[0.02] p-2"
              >
                <Link
                  href={`/artist/${artist.id}`}
                  className={`h-12 w-12 rounded-full bg-gradient-to-br ${artist.color}`}
                />

                <Link
                  href={`/artist/${artist.id}`}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate font-semibold">
                    {artist.name}
                  </p>
                  <p className="text-xs text-white/35">
                    {artist.followers} followers
                  </p>
                </Link>

                <button
                  onClick={() =>
                    toggleFollow(artist.id)
                  }
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold"
                >
                  Following
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
              Activity
            </p>
            <h2 className="mt-1 text-xl font-black">
              Recently played
            </h2>
          </div>

          {historyTracks.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs font-semibold text-white/35"
            >
              Clear
            </button>
          )}
        </div>

        {historyTracks.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-white/10 p-7 text-center">
            <p className="text-3xl">↺</p>
            <p className="mt-3 font-bold">
              Your listening history is empty
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {historyTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => playTrack(track)}
                className="flex w-full items-center gap-3 rounded-2xl p-2 text-left hover:bg-white/5"
              >
                <div
                  className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${track.color}`}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {track.title}
                  </p>
                  <p className="truncate text-xs text-white/35">
                    {track.artist}
                  </p>
                </div>

                <span className="text-white/30">
                  ▶
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
