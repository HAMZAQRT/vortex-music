"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type InitialProfile = {
  name: string;
  username: string;
  bio: string;
  image: string;
};

export default function ProfileEditor({
  initial,
}: {
  initial: InitialProfile;
}) {
  const router =
    useRouter();

  const [open, setOpen] =
    useState(false);

  const [name, setName] =
    useState(
      initial.name,
    );

  const [
    username,
    setUsername,
  ] =
    useState(
      initial.username,
    );

  const [bio, setBio] =
    useState(
      initial.bio,
    );

  const [image, setImage] =
    useState(
      initial.image,
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  async function save(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response =
        await fetch(
          "/api/account/profile",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name,
              username,
              bio,
              image,
            }),
          },
        );

      const payload =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        setError(
          payload.error ||
            "Unable to save profile",
        );

        setSaving(false);
        return;
      }

      setOpen(false);
      setSaving(false);

      router.refresh();
    } catch {
      setError(
        "Unable to save profile",
      );

      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-black"
      >
        Edit Profile
      </button>
    );
  }

  return (
    <form
      onSubmit={save}
      className="mt-6 space-y-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-left"
    >
      <input
        value={name}
        onChange={(
          event,
        ) =>
          setName(
            event.target.value,
          )
        }
        placeholder="Display name"
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
      />

      <input
        value={username}
        onChange={(
          event,
        ) =>
          setUsername(
            event.target.value
              .toLowerCase()
              .replace(
                /[^a-z0-9_]/g,
                "",
              ),
          )
        }
        placeholder="username"
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
      />

      <textarea
        value={bio}
        onChange={(
          event,
        ) =>
          setBio(
            event.target.value,
          )
        }
        maxLength={240}
        rows={3}
        placeholder="Tell Vortex something about you"
        className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
      />

      <input
        type="url"
        value={image}
        onChange={(
          event,
        ) =>
          setImage(
            event.target.value,
          )
        }
        placeholder="https://... profile photo"
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
      />

      <p className="text-[10px] leading-5 text-white/25">
        Direct photo uploads will use Vortex Media Storage in the media backend phase.
      </p>

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-white px-5 py-3 text-xs font-black text-black disabled:opacity-40"
        >
          {saving
            ? "Saving..."
            : "Save Profile"}
        </button>

        <button
          type="button"
          onClick={() =>
            setOpen(false)
          }
          className="rounded-full border border-white/10 px-5 py-3 text-xs font-black text-white/50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
