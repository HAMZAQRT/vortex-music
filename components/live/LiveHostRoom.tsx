"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import AppShell from "../AppShell";

import { tracks } from "../../data/tracks";

type Room = {
  id: string;
  title: string;
  description:
    | string
    | null;

  status:
    | "DRAFT"
    | "LIVE"
    | "ENDED";

  createdAt: string;

  startedAt:
    | string
    | null;

  endedAt:
    | string
    | null;

  isHost: boolean;
  isJoined: boolean;

  host: {
    id: string;
    name:
      | string
      | null;
    image:
      | string
      | null;
    role: string;
  };

  currentTrack: {
    id: string;
    title: string;

    artist: {
      id: string;
      name: string;
    };
  } | null;

  _count: {
    participants: number;
  };
};

export default function LiveHostRoom({
  id,
}: {
  id: string;
}) {
  const [
    room,
    setRoom,
  ] =
    useState<
      Room | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    working,
    setWorking,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const loadRoom =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              `/api/live/rooms/${encodeURIComponent(
                id,
              )}`,
              {
                cache:
                  "no-store",
              },
            );

          const payload =
            (await response.json()) as {
              room?: Room;
              error?: string;
            };

          if (
            !response.ok ||
            !payload.room
          ) {
            throw new Error(
              payload.error ||
                "Unable to load room",
            );
          }

          setRoom(
            payload.room,
          );
        } catch (caught) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to load room",
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [id],
    );

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(
      () => {
        if (!cancelled) {
          void loadRoom();
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [loadRoom]);

  async function changeStatus(
    action:
      | "start"
      | "end",
  ) {
    if (
      working ||
      !room
    ) {
      return;
    }

    setWorking(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/live/rooms/${encodeURIComponent(
            room.id,
          )}/${action}`,
          {
            method: "POST",
          },
        );

      const payload =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            `Unable to ${action} room`,
        );
      }

      await loadRoom();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Room update failed",
      );
    } finally {
      setWorking(false);
    }
  }

  async function setLiveTrack(
    trackId: string,
  ) {
    if (
      working ||
      !room ||
      !room.isHost ||
      room.status !== "LIVE"
    ) {
      return;
    }

    setWorking(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/live/rooms/${encodeURIComponent(
            room.id,
          )}/track`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              trackId,
            }),
          },
        );

      const payload =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to update Live track",
        );
      }

      await loadRoom();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update Live track",
      );
    } finally {
      setWorking(false);
    }
  }

  async function changeListenerState() {
    if (
      working ||
      !room ||
      room.isHost ||
      room.status !== "LIVE"
    ) {
      return;
    }

    const action =
      room.isJoined
        ? "leave"
        : "join";

    setWorking(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/live/rooms/${encodeURIComponent(
            room.id,
          )}/${action}`,
          {
            method: "POST",
          },
        );

      const payload =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            `Unable to ${action} room`,
        );
      }

      await loadRoom();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Listener update failed",
      );
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-sm text-white/35">
          Loading room...
        </div>
      </AppShell>
    );
  }

  if (!room) {
    return (
      <AppShell>
        <div className="py-24 text-center">

          <h1 className="text-2xl font-black">
            Room unavailable
          </h1>

          <p className="mt-3 text-sm text-red-300/70">
            {error}
          </p>

          <Link
            href="/live"
            className="mt-6 inline-block font-bold text-violet-400"
          >
            Back to Live
          </Link>

        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>

      <header className="pt-6">

        <Link
          href="/live"
          className="text-sm font-bold text-white/40"
        >
          ‹ Live Rooms
        </Link>

      </header>

      <section className="pt-8">

        <div className="flex items-center gap-2">

          <span
            className={`h-3 w-3 rounded-full ${
              room.status ===
              "LIVE"
                ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)]"
                : room.status ===
                    "DRAFT"
                  ? "bg-amber-400"
                  : "bg-white/20"
            }`}
          />

          <span
            className={`text-xs font-black uppercase tracking-[0.3em] ${
              room.status ===
              "LIVE"
                ? "text-red-400"
                : room.status ===
                    "DRAFT"
                  ? "text-amber-300"
                  : "text-white/30"
            }`}
          >
            {room.status}
          </span>

        </div>

        <h1 className="mt-4 text-4xl font-black">
          {room.title}
        </h1>

        <p className="mt-3 max-w-lg text-sm leading-6 text-white/40">
          {room.description ||
            "Vortex Live Room"}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">

          <Metric
            label="Listeners"
            value={String(
              room._count
                .participants,
            )}
          />

          <Metric
            label="Host"
            value={
              room.host.name ||
              "Vortex Creator"
            }
          />

        </div>

      </section>

      {!room.isHost && (
        <section className="mt-6 rounded-3xl border border-cyan-500/15 bg-cyan-500/5 p-5">

          <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
            Listener
          </p>

          {room.status === "LIVE" ? (
            <>
              <h2 className="mt-3 text-xl font-black">
                {room.isJoined
                  ? "You are in the room"
                  : "Join this Live Room"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/35">
                {room.isJoined
                  ? "You are counted as an active listener."
                  : "Join to become an active listener in this room."}
              </p>

              <button
                type="button"
                disabled={working}
                onClick={() =>
                  void changeListenerState()
                }
                className={`mt-5 w-full rounded-2xl py-4 text-sm font-black disabled:opacity-40 ${
                  room.isJoined
                    ? "border border-white/10 bg-white/5 text-white/60"
                    : "bg-cyan-400 text-black"
                }`}
              >
                {working
                  ? "Updating..."
                  : room.isJoined
                    ? "Leave Room"
                    : "Join Room"}
              </button>
            </>
          ) : (
            <p className="mt-3 text-sm text-white/35">
              This room is not currently live.
            </p>
          )}

          {error && (
            <p
              aria-live="polite"
              className="mt-4 text-sm text-red-400"
            >
              {error}
            </p>
          )}

        </section>
      )}

      {room.isHost && (
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">

          <p className="text-xs font-black uppercase tracking-widest text-violet-400">
            Host Control
          </p>

          {room.status ===
            "DRAFT" && (
            <>
              <h2 className="mt-3 text-xl font-black">
                Ready to go live?
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/35">
                Starting the room will make it visible in Live Now.
              </p>

              <button
                type="button"
                disabled={
                  working
                }
                onClick={() =>
                  void changeStatus(
                    "start",
                  )
                }
                className="mt-5 w-full rounded-2xl bg-red-500 py-4 text-sm font-black text-white disabled:opacity-40"
              >
                {working
                  ? "Starting..."
                  : "● Start Live"}
              </button>
            </>
          )}

          {room.status ===
            "LIVE" && (
            <>
              <h2 className="mt-3 text-xl font-black">
                Room is live
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/35">
                Listeners can now discover this room from Vortex Live.
              </p>

              <button
                type="button"
                disabled={
                  working
                }
                onClick={() =>
                  void changeStatus(
                    "end",
                  )
                }
                className="mt-5 w-full rounded-2xl border border-red-500/20 bg-red-500/5 py-4 text-sm font-black text-red-400 disabled:opacity-40"
              >
                {working
                  ? "Ending..."
                  : "End Live"}
              </button>
            </>
          )}

          {room.status ===
            "ENDED" && (
            <>
              <h2 className="mt-3 text-xl font-black">
                Live ended
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/35">
                This room is archived and cannot be restarted in v1.
              </p>
            </>
          )}

          {error && (
            <p
              aria-live="polite"
              className="mt-4 text-sm text-red-400"
            >
              {error}
            </p>
          )}

        </section>
      )}

      {room.isHost &&
        room.status === "LIVE" && (
        <section className="mt-8">

          <p className="text-xs font-black uppercase tracking-widest text-violet-400">
            Live Queue
          </p>

          <h2 className="mt-1 text-xl font-black">
            Choose Current Track
          </h2>

          <div className="mt-4 space-y-2">
            {tracks.map(
              (track) => {
                const active =
                  room.currentTrack
                    ?.id ===
                  track.id;

                return (
                  <button
                    key={track.id}
                    type="button"
                    disabled={working}
                    onClick={() =>
                      void setLiveTrack(
                        track.id,
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left disabled:opacity-40 ${
                      active
                        ? "border-violet-500/30 bg-violet-500/10"
                        : "border-white/5 bg-white/[0.02]"
                    }`}
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

                    <span className="text-xs font-black text-violet-300">
                      {active
                        ? "LIVE"
                        : "Select"}
                    </span>
                  </button>
                );
              },
            )}
          </div>

        </section>
      )}

      <section className="mt-8 rounded-3xl border border-white/5 bg-white/[0.02] p-5">

        <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
          Now Playing
        </p>

        <h2 className="mt-3 font-bold">
          {room.currentTrack
            ? room.currentTrack
                .title
            : "No track selected"}
        </h2>

        {room.currentTrack && (
          <p className="mt-1 text-sm text-white/35">
            {
              room.currentTrack
                .artist.name
            }
          </p>
        )}

      </section>

    </AppShell>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">

      <p className="text-[10px] font-black uppercase tracking-widest text-white/25">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-bold">
        {value}
      </p>

    </div>
  );
}
