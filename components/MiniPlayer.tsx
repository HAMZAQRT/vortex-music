"use client";

import { useState } from "react";

export default function MiniPlayer() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="fixed bottom-[76px] left-3 right-3 z-40 mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#19191f]/95 shadow-2xl backdrop-blur-xl">

        <div className="h-[2px] w-1/3 bg-gradient-to-r from-violet-500 to-cyan-400" />

        <div className="flex items-center gap-3 p-2">
          <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-blue-700" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              Midnight Echo
            </p>
            <p className="truncate text-xs text-white/40">
              Vortex Originals
            </p>
          </div>

          <button
            onClick={() => setPlaying(!playing)}
            aria-label={playing ? "Pause" : "Play"}
            className="grid h-10 w-10 place-items-center rounded-full bg-white font-bold text-black"
          >
            {playing ? "Ⅱ" : "▶"}
          </button>
        </div>
      </div>
    </div>
  );
}
