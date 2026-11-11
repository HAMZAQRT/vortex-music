"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

type LiveRoom = {
  id: string;
  title: string;
  description:
    | string
    | null;
  status:
    | "DRAFT"
    | "LIVE"
    | "ENDED";
  startedAt:
    | string
    | null;

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

export default function LiveDashboard() {
  const [
    rooms,
    setRooms,
  ] =
    useState<
      LiveRoom[]
    >([]);

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(false);

  const [
    title,
    setTitle,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    creating,
    setCreating,
  ] =
    useState(false);

  const [
    createdRoomId,
    setCreatedRoomId,
  ] =
    useState<
      string | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(
      async () => {
        try {
          const response =
            await fetch(
              "/api/live/rooms",
              {
                cache:
                  "no-store",
              },
            );

          const payload =
            (await response.json()) as {
              rooms?:
                LiveRoom[];
              error?: string;
            };

          if (!response.ok) {
            throw new Error(
              payload.error ||
                "Unable to load live rooms",
            );
          }

          if (
            !cancelled &&
            Array.isArray(
              payload.rooms,
            )
          ) {
            setRooms(
              payload.rooms,
            );
          }
        } catch (caught) {
          if (!cancelled) {
            setError(
              caught instanceof
              Error
                ? caught.message
                : "Unable to load live rooms",
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(
              false,
            );
          }
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  async function createRoom(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanTitle =
      title.trim();

    if (
      cleanTitle.length < 1 ||
      cleanTitle.length >
        100
    ) {
      setError(
        "Room title must be between 1 and 100 characters.",
      );
      return;
    }

    if (
      description.length > 500
    ) {
      setError(
        "Room description is too long.",
      );
      return;
    }

    setCreating(true);
    setError("");

    try {
      const response =
        await fetch(
          "/api/live/rooms",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              title:
                cleanTitle,

              description:
                description.trim(),
            }),
          },
        );

      const payload =
        (await response.json()) as {
          room?: {
            id: string;
            title: string;
            status:
              | "DRAFT"
              | "LIVE"
              | "ENDED";
          };

          error?: string;
        };

      if (
        !response.ok ||
        !payload.room
      ) {
        throw new Error(
          payload.error ||
            "Unable to create room",
        );
      }

      setCreatedRoomId(
        payload.room.id,
      );

      setTitle("");
      setDescription("");
      setCreateOpen(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to create room",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8">

      <section className="rounded-[2rem] border border-violet-500/15 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent p-5">

        <div className="flex items-start justify-between gap-4">

          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-400">
              Creator Live
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Start a Vortex Room
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-white/40">
              Create the room first. Broadcasting controls will be enabled in the next step.
            </p>
          </div>

          <span className="rounded-full bg-red-500/10 px-3 py-2 text-[10px] font-black text-red-400">
            LIVE
          </span>

        </div>

        <button
          type="button"
          onClick={() => {
            setCreateOpen(
              (value) =>
                !value,
            );

            setError("");
          }}
          className="mt-6 rounded-full bg-white px-6 py-3 text-xs font-black text-black"
        >
          {createOpen
            ? "Cancel"
            : "+ Create Room"}
        </button>

        {createOpen && (
          <form
            onSubmit={
              createRoom
            }
            className="mt-5 space-y-4"
          >

            <label className="block">
              <span className="text-xs font-bold text-white/45">
                Room title
              </span>

              <input
                value={
                  title
                }
                onChange={(
                  event,
                ) =>
                  setTitle(
                    event.target
                      .value,
                  )
                }
                maxLength={
                  100
                }
                placeholder="Late Night Vortex"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm outline-none placeholder:text-white/20 focus:border-violet-500/50"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-white/45">
                Description
              </span>

              <textarea
                value={
                  description
                }
                onChange={(
                  event,
                ) =>
                  setDescription(
                    event.target
                      .value,
                  )
                }
                maxLength={
                  500
                }
                rows={3}
                placeholder="Tell listeners what this room is about."
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm outline-none placeholder:text-white/20 focus:border-violet-500/50"
              />
            </label>

            <button
              type="submit"
              disabled={
                creating ||
                !title.trim()
              }
              className="w-full rounded-2xl bg-violet-600 py-4 text-sm font-black disabled:opacity-40"
            >
              {creating
                ? "Creating..."
                : "Create Draft Room"}
            </button>

          </form>
        )}

        {createdRoomId && (
          <div className="mt-5 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">

            <p className="text-xs font-black uppercase tracking-widest text-emerald-400">
              Draft Created
            </p>

            <p className="mt-2 break-all font-mono text-xs text-white/45">
              {createdRoomId}
            </p>

            <p className="mt-2 text-xs text-white/30">
              The room is saved in PostgreSQL but is not live yet.
            </p>

          </div>
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

      <section>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-red-400">
              Live Now
            </p>

            <h2 className="mt-1 text-xl font-black">
              Rooms
            </h2>
          </div>

          <span className="text-xs text-white/30">
            {
              rooms.length
            }
          </span>
        </div>

        {loading ? (
          <div className="mt-4 rounded-3xl border border-white/5 bg-white/[0.02] p-7 text-center text-sm text-white/30">
            Loading live rooms...
          </div>
        ) : rooms.length ===
        0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-white/10 p-7 text-center">

            <div className="mx-auto h-3 w-3 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)]" />

            <p className="mt-4 font-black">
              No rooms are live
            </p>

            <p className="mt-1 text-sm text-white/35">
              Live creators will appear here.
            </p>

          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {rooms.map(
              (room) => (
                <article
                  key={
                    room.id
                  }
                  className="rounded-3xl border border-red-500/10 bg-red-500/[0.04] p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />

                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
                      Live
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-black">
                    {
                      room.title
                    }
                  </h3>

                  <p className="mt-1 text-xs text-white/35">
                    {
                      room.host
                        .name ||
                      "Vortex Creator"
                    }
                    {" · "}
                    {
                      room._count
                        .participants
                    }{" "}
                    listeners
                  </p>

                  {room.currentTrack && (
                    <p className="mt-3 text-xs text-violet-300">
                      Now playing:{" "}
                      {
                        room
                          .currentTrack
                          .title
                      }
                    </p>
                  )}
                </article>
              ),
            )}
          </div>
        )}

      </section>

    </div>
  );
}
