"use client";

import {
  useState,
} from "react";

import {
  tracks,
} from "../../data/tracks";

type MediaResult = {
  id: string;
  title: string;
  source: string;
  ok: boolean;
  status: number;
};

export default function MediaInspector() {
  const [
    results,
    setResults,
  ] =
    useState<
      MediaResult[]
    >([]);

  const [
    checking,
    setChecking,
  ] =
    useState(false);

  async function inspect() {
    if (checking) {
      return;
    }

    setChecking(true);

    const next:
      MediaResult[] = [];

    for (const track of tracks) {
      try {
        const response =
          await fetch(
            track.audioSrc,
            {
              method: "HEAD",
              cache:
                "no-store",
            },
          );

        next.push({
          id:
            track.id,
          title:
            track.title,
          source:
            track.audioSrc,
          ok:
            response.ok,
          status:
            response.status,
        });
      } catch {
        next.push({
          id:
            track.id,
          title:
            track.title,
          source:
            track.audioSrc,
          ok: false,
          status: 0,
        });
      }
    }

    setResults(next);
    setChecking(false);
  }

  const healthy =
    results.filter(
      (result) =>
        result.ok,
    ).length;

  return (
    <section className="mt-4 rounded-3xl border border-white/5 bg-[#111116] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-pink-400">
            Media Integrity
          </p>

          <h2 className="mt-1 text-lg font-black">
            Audio Sources
          </h2>

          <p className="mt-1 text-xs text-white/30">
            Verifies the configured track sources without exposing secrets.
          </p>
        </div>

        <span className="font-mono text-xs text-white/30">
          {results.length
            ? `${healthy}/${results.length}`
            : `${tracks.length} tracks`}
        </span>
      </div>

      <button
        type="button"
        onClick={() =>
          void inspect()
        }
        disabled={checking}
        className="mt-5 rounded-full bg-pink-600 px-5 py-2 text-xs font-black disabled:opacity-40"
      >
        {checking
          ? "Checking..."
          : "Check Media"}
      </button>

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map(
            (result) => (
              <div
                key={
                  result.id
                }
                className="flex items-center justify-between gap-3 rounded-2xl bg-black/30 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    {result.title}
                  </p>

                  <p className="mt-1 truncate font-mono text-[10px] text-white/30">
                    {result.source}
                  </p>
                </div>

                <span
                  className={`font-mono text-xs font-black ${
                    result.ok
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {result.status ||
                    "ERR"}
                </span>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}
