"use client";

import {
  useState,
} from "react";

export default function ShareProfileButton({
  username,
}: {
  username: string;
}) {
  const [
    copied,
    setCopied,
  ] =
    useState(false);

  async function share() {
    const url =
      `${window.location.origin}/profile/${encodeURIComponent(
        username,
      )}`;

    try {
      if (
        typeof navigator.share ===
        "function"
      ) {
        await navigator.share({
          title:
            `@${username} · Vortex`,
          text:
            `Follow @${username} on Vortex`,
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(
        url,
      );

      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() =>
        void share()
      }
      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-black text-white/60"
    >
      {copied
        ? "Link Copied"
        : "Share"}
    </button>
  );
}
