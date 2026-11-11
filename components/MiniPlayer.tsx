"use client";

import Link from "next/link";
import { usePlayer } from "../context/PlayerContext";

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    next,
  } = usePlayer();

  return (
    <div className="pointer-events-none fixed bottom-[92px] left-3 right-3 z-[9998] mx-auto max-w-2xl">
      <div className="pointer-events-auto overflow-hidden rounded-2xl border border-white/10 bg-[#19191f]/95 shadow-2xl backdrop-blur-xl">

        <div className="h-[2px] w-1/3 bg-gradient-to-r from-violet-500 to-cyan-400" />

        <div className="flex items-center gap-3 p-2">

          <Link
            href="/player"
            className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${currentTrack.color}`}
            aria-label="Open player"
          />

          <Link
            href="/player"
            className="min-w-0 flex-1"
          >
            <p className="truncate text-sm font-semibold">
              {currentTrack.title}
            </p>

            <p className="truncate text-xs text-white/40">
              {currentTrack.artist}
            </p>
          </Link>

          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="grid h-10 w-10 place-items-center rounded-full bg-white font-bold text-black"
          >
            {isPlaying ? "Ⅱ" : "▶"}
          </button>

          <button
            onClick={next}
            aria-label="Next track"
            className="grid h-10 w-8 place-items-center text-white/70"
          >
            ›
          </button>

        </div>
      </div>
    </div>
  );
}
