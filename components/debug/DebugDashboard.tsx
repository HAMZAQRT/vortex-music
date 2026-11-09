"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { usePlayer } from "../../context/PlayerContext";
import { useLibrary } from "../../context/LibraryContext";
import { useDebug } from "../../context/DebugContext";

type BrowserInfo = {
  online: boolean;
  userAgent: string;
  language: string;
  screen: string;
  viewport: string;
};

const emptyBrowserInfo: BrowserInfo = {
  online: false,
  userAgent: "Loading...",
  language: "Loading...",
  screen: "Loading...",
  viewport: "Loading...",
};

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString();
}

export default function DebugDashboard() {
  const pathname = usePathname();

  const {
    queue,
    currentTrack,
    currentIndex,
    isPlaying,
    progress,
    volume,
    shuffle,
    repeat,
  } = usePlayer();

  const {
    likedTrackIds,
    followedArtistIds,
    historyTrackIds,
  } = useLibrary();

  const {
    events,
    enabled,
    log,
    clearEvents,
    toggleDebug,
  } = useDebug();

  const [browser, setBrowser] =
    useState<BrowserInfo>(emptyBrowserInfo);

  useEffect(() => {
    function updateBrowserInfo() {
      setBrowser({
        online: navigator.onLine,
        userAgent: navigator.userAgent,
        language:
          navigator.language || "Unknown",
        screen: `${window.screen.width} × ${window.screen.height}`,
        viewport: `${window.innerWidth} × ${window.innerHeight}`,
      });
    }

    updateBrowserInfo();

    window.addEventListener(
      "online",
      updateBrowserInfo,
    );

    window.addEventListener(
      "offline",
      updateBrowserInfo,
    );

    window.addEventListener(
      "resize",
      updateBrowserInfo,
    );

    return () => {
      window.removeEventListener(
        "online",
        updateBrowserInfo,
      );

      window.removeEventListener(
        "offline",
        updateBrowserInfo,
      );

      window.removeEventListener(
        "resize",
        updateBrowserInfo,
      );
    };
  }, []);

  function createTestEvent() {
    log(
      "system",
      "Manual debug test event",
      {
        route: pathname,
        track: currentTrack.id,
      },
    );
  }

  const playerPercent =
    currentTrack.duration > 0
      ? Math.round(
          (progress / currentTrack.duration) *
            100,
        )
      : 0;

  return (
    <div className="pb-16">
      <header className="flex items-start justify-between gap-4 py-6">
        <div>
          <p className="text-xs font-black tracking-[0.3em] text-emerald-400">
            VORTEX DEBUG
          </p>

          <h1 className="mt-1 text-3xl font-black">
            System Console
          </h1>

          <p className="mt-2 text-sm text-white/35">
            Runtime, player and application state.
          </p>
        </div>

        <div
          className={`rounded-full px-3 py-2 text-xs font-black ${
            enabled
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          {enabled ? "ACTIVE" : "PAUSED"}
        </div>
      </header>

      <section className="mb-4 grid grid-cols-2 gap-3">
        <Link
          href="/debug/performance"
          className="rounded-3xl border border-cyan-500/10 bg-cyan-500/5 p-4 transition hover:bg-cyan-500/10"
        >
          <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
            Performance
          </p>

          <p className="mt-2 text-sm text-white/45">
            Runtime, network and memory
          </p>
        </Link>

        <Link
          href="/debug/errors"
          className="rounded-3xl border border-red-500/10 bg-red-500/5 p-4 transition hover:bg-red-500/10"
        >
          <p className="text-xs font-black uppercase tracking-widest text-red-400">
            Error Center
          </p>

          <p className="mt-2 text-sm text-white/45">
            Errors, events and export
          </p>
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric
          title="Player"
          value={
            isPlaying
              ? "PLAYING"
              : "PAUSED"
          }
          accent={
            isPlaying
              ? "text-emerald-400"
              : "text-amber-400"
          }
        />

        <Metric
          title="Network"
          value={
            browser.online
              ? "ONLINE"
              : "OFFLINE"
          }
          accent={
            browser.online
              ? "text-emerald-400"
              : "text-red-400"
          }
        />

        <Metric
          title="Events"
          value={String(events.length)}
          accent="text-cyan-400"
        />

        <Metric
          title="Queue"
          value={String(queue.length)}
          accent="text-violet-400"
        />
      </section>

      <DebugSection title="Player Inspector">
        <DebugRow
          label="Track"
          value={currentTrack.title}
        />

        <DebugRow
          label="Track ID"
          value={currentTrack.id}
        />

        <DebugRow
          label="Artist"
          value={currentTrack.artist}
        />

        <DebugRow
          label="Queue index"
          value={`${currentIndex + 1}/${queue.length}`}
        />

        <DebugRow
          label="Progress"
          value={`${Math.round(
            progress,
          )}s / ${currentTrack.duration}s`}
        />

        <DebugRow
          label="Progress %"
          value={`${playerPercent}%`}
        />

        <DebugRow
          label="Volume"
          value={`${volume}%`}
        />

        <DebugRow
          label="Shuffle"
          value={shuffle ? "ON" : "OFF"}
        />

        <DebugRow
          label="Repeat"
          value={repeat.toUpperCase()}
        />
      </DebugSection>

      <DebugSection title="Library State">
        <DebugRow
          label="Liked tracks"
          value={String(
            likedTrackIds.length,
          )}
        />

        <DebugRow
          label="Following"
          value={String(
            followedArtistIds.length,
          )}
        />

        <DebugRow
          label="History"
          value={String(
            historyTrackIds.length,
          )}
        />
      </DebugSection>

      <DebugSection title="Runtime">
        <DebugRow
          label="Route"
          value={pathname}
        />

        <DebugRow
          label="Environment"
          value={
            process.env.NODE_ENV ||
            "unknown"
          }
        />

        <DebugRow
          label="Online"
          value={
            browser.online
              ? "Yes"
              : "No"
          }
        />

        <DebugRow
          label="Language"
          value={browser.language}
        />

        <DebugRow
          label="Screen"
          value={browser.screen}
        />

        <DebugRow
          label="Viewport"
          value={browser.viewport}
        />

        <div className="mt-3 rounded-2xl bg-black/30 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
            User Agent
          </p>

          <p className="mt-2 break-all font-mono text-xs leading-5 text-white/55">
            {browser.userAgent}
          </p>
        </div>
      </DebugSection>

      <section className="mt-4 rounded-3xl border border-white/5 bg-[#111116] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-orange-400">
              Event Timeline
            </p>

            <h2 className="mt-1 text-lg font-black">
              Debug Events
            </h2>
          </div>

          <span className="text-xs text-white/30">
            {events.length}/100
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={createTestEvent}
            className="rounded-full bg-violet-600 px-4 py-2 text-xs font-black"
          >
            + Test event
          </button>

          <button
            onClick={toggleDebug}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-black"
          >
            {enabled
              ? "Pause logging"
              : "Resume logging"}
          </button>

          <button
            onClick={clearEvents}
            className="rounded-full border border-red-500/20 px-4 py-2 text-xs font-black text-red-400"
          >
            Clear
          </button>
        </div>

        <div className="mt-4 max-h-[420px] space-y-2 overflow-auto">
          {events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
              <p className="text-sm text-white/35">
                No debug events captured yet.
              </p>
            </div>
          ) : (
            events.map((event) => (
              <article
                key={event.id}
                className="rounded-2xl border border-white/5 bg-black/30 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/5 px-2 py-1 font-mono text-[10px] uppercase text-cyan-300">
                    {event.type}
                  </span>

                  <span className="font-mono text-[10px] text-white/25">
                    {formatTime(
                      event.timestamp,
                    )}
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold">
                  {event.message}
                </p>

                {event.data && (
                  <p className="mt-2 break-all font-mono text-[11px] leading-5 text-white/40">
                    {event.data}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-3xl border border-white/5 bg-[#111116] p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
        {title}
      </p>

      <p
        className={`mt-2 font-mono text-lg font-black ${accent}`}
      >
        {value}
      </p>
    </div>
  );
}

function DebugSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 rounded-3xl border border-white/5 bg-[#111116] p-4">
      <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-white/70">
        {title}
      </h2>

      <div className="space-y-1">
        {children}
      </div>
    </section>
  );
}

function DebugRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.04] py-2 last:border-0">
      <span className="text-xs text-white/35">
        {label}
      </span>

      <span className="max-w-[65%] truncate text-right font-mono text-xs text-white/80">
        {value}
      </span>
    </div>
  );
}
