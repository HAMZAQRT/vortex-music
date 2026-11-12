"use client";

import Link from "next/link";
import { usePlayer } from "../../context/PlayerContext";
import { useLibrary } from "../../context/LibraryContext";

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export default function PlayerPage() {
  const {
    isLiked,
    toggleLike,
  } = useLibrary();

  const {
    queue,
    currentTrack,
    currentIndex,
    isPlaying,
    progress,
    volume,
    shuffle,
    repeat,
    togglePlay,
    previous,
    next,
    playTrack,
    setProgress,
    setVolume,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer();

  return (
    <main className="min-h-screen bg-[#070709] px-5 pb-16 text-white">
      <div className="mx-auto max-w-lg">

        <header className="flex items-center justify-between py-6">
          <Link
            href="/"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-xl"
          >
            ↓
          </Link>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">
              Now playing
            </p>

            <p className="mt-1 text-xs font-semibold">
              {currentTrack.album}
            </p>
          </div>

          <button
            aria-label="More options"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/5"
          >
            •••
          </button>
        </header>

        <section>
          <div
            className={`aspect-square w-full rounded-[2.5rem] bg-gradient-to-br ${currentTrack.color} p-7 shadow-2xl`}
          >
            <div className="flex h-full items-end">
              <span className="text-7xl font-black text-white/15">
                V
              </span>
            </div>
          </div>

          <div className="mt-8 flex items-start justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black">
                {currentTrack.title}
              </h1>

              <p className="mt-1 text-white/45">
                {currentTrack.artist}
              </p>
            </div>

            <button
              onClick={() =>
                toggleLike(currentTrack.id)
              }
              aria-label={
                isLiked(currentTrack.id)
                  ? "Unlike track"
                  : "Like track"
              }
              className={`grid h-11 w-11 place-items-center rounded-full border text-xl ${
                isLiked(currentTrack.id)
                  ? "border-pink-500/30 bg-pink-500/10 text-pink-400"
                  : "border-white/10 text-white"
              }`}
            >
              {isLiked(currentTrack.id)
                ? "♥"
                : "♡"}
            </button>
          </div>

          <div className="mt-8">
            <input
              type="range"
              min="0"
              max={currentTrack.duration}
              value={progress}
              onChange={(event) =>
                setProgress(Number(event.target.value))
              }
              className="vortex-range w-full"
              aria-label="Track progress"
            />

            <div className="mt-2 flex justify-between text-xs text-white/35">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={toggleShuffle}
              className={`text-sm ${
                shuffle
                  ? "text-violet-400"
                  : "text-white/35"
              }`}
              aria-label="Shuffle"
            >
              ⤨
            </button>

            <button
              onClick={previous}
              className="text-3xl"
              aria-label="Previous track"
            >
              ‹
            </button>

            <button
              onClick={togglePlay}
              className="grid h-20 w-20 place-items-center rounded-full bg-white text-2xl font-black text-black shadow-xl"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "Ⅱ" : "▶"}
            </button>

            <button
              onClick={next}
              className="text-3xl"
              aria-label="Next track"
            >
              ›
            </button>

            <button
              onClick={cycleRepeat}
              className={`text-sm ${
                repeat !== "off"
                  ? "text-violet-400"
                  : "text-white/35"
              }`}
              aria-label="Repeat"
            >
              {repeat === "one" ? "↻¹" : "↻"}
            </button>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <span className="text-xs text-white/30">
              🔈
            </span>

            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(event) =>
                setVolume(Number(event.target.value))
              }
              className="vortex-range flex-1"
              aria-label="Volume"
            />

            <span className="w-9 text-right text-xs text-white/30">
              {volume}%
            </span>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-white/5 bg-white/[0.025] p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              Media
            </p>

            <p className="mt-2 text-sm font-bold">
              FreePD
            </p>

            <p className="mt-1 text-xs text-white/30">
              Public-domain / CC0 source documented with Vortex.
            </p>
          </div>

          <Link
            href="/videos"
            className="rounded-3xl border border-fuchsia-500/10 bg-fuchsia-500/5 p-4"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">
              Video
            </p>

            <p className="mt-2 text-sm font-bold">
              Visual Sessions
            </p>

            <p className="mt-1 text-xs text-white/30">
              Open Vortex Video →
            </p>
          </Link>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">
              Up next
            </h2>

            <span className="text-xs text-white/30">
              {queue.length} tracks
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {queue.map((track, index) => {
              const active = index === currentIndex;

              return (
                <button
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left transition ${
                    active
                      ? "bg-white/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${track.color}`}
                  />

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-semibold ${
                        active
                          ? "text-violet-300"
                          : "text-white"
                      }`}
                    >
                      {track.title}
                    </p>

                    <p className="truncate text-xs text-white/35">
                      {track.artist}
                    </p>
                  </div>

                  <span className="text-xs text-white/30">
                    {formatTime(track.duration)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}
