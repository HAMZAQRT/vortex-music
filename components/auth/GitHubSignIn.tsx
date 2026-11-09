"use client";

import {
  useState,
} from "react";

import {
  signIn,
} from "next-auth/react";

export default function GitHubSignIn() {
  const [loading, setLoading] =
    useState(false);

  async function handleSignIn() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      await signIn(
        "github",
        {
          redirectTo:
            "/account",
        },
      );
    } catch (error) {
      console.error(
        "[VORTEX:AUTH] GitHub sign-in failed",
        error,
      );

      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() =>
        void handleSignIn()
      }
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-wait disabled:opacity-60"
    >
      <span className="text-lg">
        ◉
      </span>

      {loading
        ? "Connecting to GitHub..."
        : "Continue with GitHub"}
    </button>
  );
}
