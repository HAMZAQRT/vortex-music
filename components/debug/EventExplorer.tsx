"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  useDebug,
  type DebugEventType,
} from "../../context/DebugContext";

const filters: Array<
  "all" | DebugEventType
> = [
  "all",
  "system",
  "navigation",
  "player",
  "library",
  "network",
  "error",
];

export default function EventExplorer() {
  const {
    events,
    clearEvents,
  } = useDebug();

  const [filter, setFilter] =
    useState<
      "all" | DebugEventType
    >("all");

  const [query, setQuery] =
    useState("");

  const filteredEvents =
    useMemo(() => {
      const normalized =
        query.trim().toLowerCase();

      return events.filter(
        (event) => {
          const matchesType =
            filter === "all" ||
            event.type === filter;

          const matchesQuery =
            !normalized ||
            event.message
              .toLowerCase()
              .includes(normalized) ||
            event.data
              ?.toLowerCase()
              .includes(normalized);

          return (
            matchesType &&
            matchesQuery
          );
        },
      );
    }, [
      events,
      filter,
      query,
    ]);

  function exportDiagnostics() {
    const payload = {
      exportedAt:
        new Date().toISOString(),

      location:
        window.location.href,

      userAgent:
        navigator.userAgent,

      online:
        navigator.onLine,

      events,
    };

    const blob = new Blob(
      [
        JSON.stringify(
          payload,
          null,
          2,
        ),
      ],
      {
        type: "application/json",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download =
      `vortex-debug-${Date.now()}.json`;

    anchor.click();

    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-3xl border border-white/5 bg-[#111116] p-4">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-orange-400">
            Diagnostics
          </p>

          <h2 className="mt-1 text-xl font-black">
            Event Explorer
          </h2>
        </div>

        <span className="font-mono text-xs text-white/30">
          {filteredEvents.length}
          /
          {events.length}
        </span>
      </div>

      <input
        value={query}
        onChange={(event) =>
          setQuery(
            event.target.value,
          )
        }
        placeholder="Search debug events..."
        className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-violet-500/50"
      />

      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {filters.map(
          (item) => (
            <button
              key={item}
              onClick={() =>
                setFilter(item)
              }
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold uppercase ${
                filter === item
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-white/40"
              }`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <button
          onClick={
            exportDiagnostics
          }
          className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-black"
        >
          Export JSON
        </button>

        <button
          onClick={clearEvents}
          className="rounded-full border border-red-500/20 px-4 py-2 text-xs font-black text-red-400"
        >
          Clear
        </button>
      </div>

      <div className="mt-4 max-h-[500px] space-y-2 overflow-auto">
        {filteredEvents.length ===
        0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-7 text-center text-sm text-white/30">
            No matching events.
          </div>
        ) : (
          filteredEvents.map(
            (event) => (
              <article
                key={event.id}
                className="rounded-2xl border border-white/5 bg-black/30 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-2 py-1 font-mono text-[10px] uppercase ${
                      event.type ===
                      "error"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-white/5 text-cyan-300"
                    }`}
                  >
                    {event.type}
                  </span>

                  <span className="font-mono text-[10px] text-white/25">
                    {new Date(
                      event.timestamp,
                    ).toLocaleTimeString()}
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold">
                  {event.message}
                </p>

                {event.data && (
                  <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-5 text-white/40">
                    {event.data}
                  </pre>
                )}
              </article>
            ),
          )
        )}
      </div>
    </section>
  );
}
