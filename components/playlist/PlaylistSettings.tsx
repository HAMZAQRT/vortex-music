"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type Props = {
  playlistId: string;
  initialTitle: string;
  initialDescription:
    | string
    | null;
  initialPublic: boolean;

  onSaved: () =>
    Promise<void>;
};

export default function PlaylistSettings({
  playlistId,
  initialTitle,
  initialDescription,
  initialPublic,
  onSaved,
}: Props) {
  const router =
    useRouter();

  const [open, setOpen] =
    useState(false);

  const [title, setTitle] =
    useState(initialTitle);

  const [
    description,
    setDescription,
  ] = useState(
    initialDescription ?? "",
  );

  const [
    isPublic,
    setIsPublic,
  ] = useState(
    initialPublic,
  );

  const [saving, setSaving] =
    useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    confirmDelete,
    setConfirmDelete,
  ] = useState(false);

  const [error, setError] =
    useState("");

  async function save(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanTitle =
      title.trim();

    if (
      cleanTitle.length < 1 ||
      cleanTitle.length > 80
    ) {
      setError(
        "Playlist name must be between 1 and 80 characters.",
      );
      return;
    }

    if (
      description.length > 300
    ) {
      setError(
        "Description is too long.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/library/playlists/${encodeURIComponent(
            playlistId,
          )}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              title:
                cleanTitle,

              description:
                description.trim(),

              isPublic,
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
            "Unable to save playlist",
        );
      }

      await onSaved();
      setOpen(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to save playlist",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePlaylist() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/library/playlists/${encodeURIComponent(
            playlistId,
          )}`,
          {
            method: "DELETE",
          },
        );

      const payload =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to delete playlist",
        );
      }

      router.push(
        "/library",
      );

      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to delete playlist",
      );

      setDeleting(false);
    }
  }

  return (
    <section className="mt-5">
      <div className="flex flex-wrap gap-2">

        <button
          type="button"
          onClick={() => {
            setOpen(
              (value) => !value,
            );

            setError("");
            setConfirmDelete(
              false,
            );
          }}
          className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-black"
        >
          {open
            ? "Close"
            : "Edit Playlist"}
        </button>

        <span
          className={`rounded-full px-4 py-3 text-xs font-black ${
            initialPublic
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-white/5 text-white/40"
          }`}
        >
          {initialPublic
            ? "Public"
            : "Private"}
        </span>

      </div>

      {open && (
        <form
          onSubmit={save}
          className="mt-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5"
        >
          <p className="text-xs font-black uppercase tracking-widest text-violet-400">
            Playlist Settings
          </p>

          <label className="mt-5 block">
            <span className="text-xs font-bold text-white/45">
              Name
            </span>

            <input
              value={title}
              onChange={(
                event,
              ) =>
                setTitle(
                  event.target.value,
                )
              }
              maxLength={80}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm outline-none focus:border-violet-500/50"
            />
          </label>

          <label className="mt-4 block">
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
                  event.target.value,
                )
              }
              maxLength={300}
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm outline-none focus:border-violet-500/50"
            />
          </label>

          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/20 p-4">

            <div>
              <p className="text-sm font-bold">
                Public Playlist
              </p>

              <p className="mt-1 text-xs text-white/35">
                Allow Vortex users to discover this playlist.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={
                isPublic
              }
              onClick={() =>
                setIsPublic(
                  (value) =>
                    !value,
                )
              }
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                isPublic
                  ? "bg-violet-600"
                  : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  isPublic
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>

          </div>

          {error && (
            <p
              aria-live="polite"
              className="mt-4 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-5 w-full rounded-2xl bg-white py-4 text-sm font-black text-black disabled:opacity-40"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

          <div className="mt-6 border-t border-white/5 pt-5">

            <p className="text-xs font-black uppercase tracking-widest text-red-400">
              Danger Zone
            </p>

            {confirmDelete && (
              <p className="mt-3 text-xs leading-5 text-red-300/70">
                Press delete again to permanently remove this playlist.
              </p>
            )}

            <button
              type="button"
              disabled={
                deleting
              }
              onClick={() =>
                void deletePlaylist()
              }
              className="mt-3 w-full rounded-2xl border border-red-500/20 bg-red-500/5 py-4 text-sm font-black text-red-400 disabled:opacity-40"
            >
              {deleting
                ? "Deleting..."
                : confirmDelete
                  ? "Confirm Delete"
                  : "Delete Playlist"}
            </button>

          </div>
        </form>
      )}
    </section>
  );
}
