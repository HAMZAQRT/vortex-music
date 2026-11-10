"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

type PlaylistTrack = {
  position: number;

  track: {
    id: string;
    title: string;
    audioUrl: string;
    duration: number;

    artist: {
      id: string;
      name: string;
    };
  };
};

type Playlist = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  public: boolean;
  createdAt: string;
  tracks: PlaylistTrack[];
};

export default function PlaylistManager() {
  const [playlists, setPlaylists] =
    useState<Playlist[]>([]);

  const [open, setOpen] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPlaylists() {
      try {
        const response =
          await fetch(
            "/api/library/playlists",
            {
              cache: "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load playlists",
          );
        }

        const data =
          (await response.json()) as {
            playlists?: Playlist[];
          };

        if (
          !cancelled &&
          Array.isArray(
            data.playlists,
          )
        ) {
          setPlaylists(
            data.playlists,
          );
        }
      } catch {
        if (!cancelled) {
          setError(
            "Could not load your playlists.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPlaylists();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanTitle =
      title.trim();

    const cleanDescription =
      description.trim();

    if (!cleanTitle) {
      setError(
        "Choose a name for your playlist.",
      );
      return;
    }

    if (cleanTitle.length > 80) {
      setError(
        "Playlist name is too long.",
      );
      return;
    }

    setCreating(true);
    setError("");

    try {
      const response =
        await fetch(
          "/api/library/playlists",
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
                cleanDescription,
            }),
          },
        );

      const data =
        (await response.json()) as {
          playlist?:
            Omit<
              Playlist,
              "tracks"
            >;

          error?: string;
        };

      if (
        !response.ok ||
        !data.playlist
      ) {
        throw new Error(
          data.error ||
            "Playlist creation failed",
        );
      }

      const created: Playlist = {
        ...data.playlist,
        tracks: [],
      };

      setPlaylists(
        (current) => [
          created,
          ...current,
        ],
      );

      setTitle("");
      setDescription("");
      setOpen(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Playlist creation failed.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
            Collection
          </p>

          <h2 className="mt-1 text-xl font-black">
            Your Playlists
          </h2>

          <p className="mt-1 text-sm text-white/35">
            {playlists.length}
            {playlists.length === 1
              ? " playlist"
              : " playlists"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setOpen(
              (value) =>
                !value,
            );
          }}
          className="rounded-full bg-white px-5 py-3 text-xs font-black text-black"
        >
          {open
            ? "Cancel"
            : "+ Create"}
        </button>
      </div>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-5 rounded-[2rem] border border-violet-500/15 bg-gradient-to-br from-violet-500/10 to-blue-500/5 p-5"
        >
          <label className="block">
            <span className="text-xs font-bold text-white/50">
              Playlist name
            </span>

            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              maxLength={80}
              placeholder="My Vortex"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-violet-500/50"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-bold text-white/50">
              Description
            </span>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              maxLength={300}
              rows={3}
              placeholder="What is this playlist about?"
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-violet-500/50"
            />
          </label>

          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-[10px] text-white/25">
              Private by default
            </p>

            <button
              type="submit"
              disabled={
                creating ||
                !title.trim()
              }
              className="rounded-full bg-violet-600 px-6 py-3 text-xs font-black disabled:opacity-40"
            >
              {creating
                ? "Creating..."
                : "Create Playlist"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div
          aria-live="polite"
          className="mt-4 rounded-2xl border border-red-500/15 bg-red-500/5 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-5 rounded-3xl border border-white/5 bg-white/[0.02] p-7 text-center text-sm text-white/30">
          Loading playlists...
        </div>
      ) : playlists.length === 0 ? (
        <button
          type="button"
          onClick={() =>
            setOpen(true)
          }
          className="mt-5 w-full rounded-3xl border border-dashed border-white/10 p-7 text-center"
        >
          <span className="text-3xl text-violet-300">
            +
          </span>

          <span className="mt-3 block font-bold">
            Create your first playlist
          </span>

          <span className="mt-1 block text-sm text-white/35">
            Build a collection from your Vortex.
          </span>
        </button>
      ) : (
        <div className="mt-5 space-y-3">
          {playlists.map(
            (playlist) => (
              <Link
                key={
                  playlist.id
                }
                href={`/playlist/${playlist.id}`}
                className="flex items-center gap-4 rounded-3xl border border-white/5 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
              >
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-800 text-xl font-black text-white/70">
                  ♫
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">
                    {
                      playlist.title
                    }
                  </p>

                  <p className="mt-1 truncate text-xs text-white/35">
                    {
                      playlist.description ||
                      "Vortex Playlist"
                    }
                  </p>

                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                    {
                      playlist
                        .tracks
                        .length
                    }{" "}
                    tracks
                  </p>
                </div>

                <span className="text-xl text-white/20">
                  ›
                </span>
              </Link>
            ),
          )}
        </div>
      )}
    </section>
  );
}
