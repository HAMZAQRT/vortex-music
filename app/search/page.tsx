"use client";

import { useMemo, useState } from "react";
import { tracks } from "../../data/tracks";
import { usePlayer } from "../../context/PlayerContext";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return tracks;
    }

    return tracks.filter((track) =>
      `${track.title} ${track.artist} ${track.album}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  return (
    <>
      <header className="py-6">
        <p className="text-xs font-black tracking-[0.35em] text-violet-400">
          VORTEX
        </p>

        <h1 className="mt-1 text-3xl font-black">
          Search
        </h1>
      </header>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Songs, artists, albums..."
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-white/25 focus:border-violet-500/60"
      />

      <section className="mt-7">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {query ? "Search results" : "Discover"}
          </h2>

          <span className="text-xs text-white/30">
            {results.length} tracks
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {results.map((track) => {
            const active = currentTrack.id === track.id;

            return (
              <button
                key={track.id}
                onClick={() => playTrack(track)}
                className={`flex w-full items-center gap-4 rounded-2xl p-3 text-left ${
                  active
                    ? "bg-violet-500/10"
                    : "hover:bg-white/5"
                }`}
              >
                <div
                  className={`h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br ${track.color}`}
                />

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate font-semibold ${
                      active
                        ? "text-violet-300"
                        : "text-white"
                    }`}
                  >
                    {track.title}
                  </p>

                  <p className="truncate text-sm text-white/40">
                    {track.artist} • {track.album}
                  </p>
                </div>

                <span className="text-white/50">
                  {active && isPlaying ? "Ⅱ" : "▶"}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
