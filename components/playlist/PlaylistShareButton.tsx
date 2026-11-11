"use client";

import {
  useState,
} from "react";

type Props = {
  playlistId: string;
  title: string;
  isPublic: boolean;
};

export default function PlaylistShareButton({
  playlistId,
  title,
  isPublic,
}: Props) {
  const [
    status,
    setStatus,
  ] = useState<
    | "idle"
    | "shared"
    | "copied"
    | "private"
    | "failed"
  >("idle");

  async function share() {
    if (!isPublic) {
      setStatus(
        "private",
      );
      return;
    }

    const url =
      `${window.location.origin}/p/${encodeURIComponent(
        playlistId,
      )}`;

    const shareData = {
      title:
        `${title} · Vortex Music`,
      text:
        `Listen to ${title} on Vortex Music`,
      url,
    };

    try {
      if (
        typeof navigator.share ===
        "function"
      ) {
        await navigator.share(
          shareData,
        );

        setStatus(
          "shared",
        );

        return;
      }

      if (
        navigator.clipboard &&
        typeof navigator.clipboard
          .writeText ===
          "function"
      ) {
        await navigator.clipboard.writeText(
          url,
        );

        setStatus(
          "copied",
        );

        return;
      }

      setStatus(
        "failed",
      );
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name ===
          "AbortError"
      ) {
        setStatus(
          "idle",
        );

        return;
      }

      try {
        await navigator.clipboard.writeText(
          url,
        );

        setStatus(
          "copied",
        );
      } catch {
        setStatus(
          "failed",
        );
      }
    }
  }

  const label = {
    idle:
      "Share Playlist",
    shared:
      "Shared",
    copied:
      "Link Copied",
    private:
      "Make Public to Share",
    failed:
      "Share Failed",
  }[status];

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          void share()
        }
        className={`rounded-full border px-5 py-3 text-xs font-black ${
          isPublic
            ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
            : "border-white/10 bg-white/5 text-white/35"
        }`}
      >
        ↗ {label}
      </button>

      {status ===
        "private" && (
        <p
          aria-live="polite"
          className="mt-2 text-xs text-white/30"
        >
          Enable Public Playlist in Edit Playlist first.
        </p>
      )}

      {status ===
        "failed" && (
        <p
          aria-live="polite"
          className="mt-2 text-xs text-red-400"
        >
          Open the public link and copy it manually.
        </p>
      )}
    </div>
  );
}
