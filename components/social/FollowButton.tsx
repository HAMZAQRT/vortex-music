"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

export default function FollowButton({
  username,
  initialFollowing,
}: {
  username: string;
  initialFollowing: boolean;
}) {
  const router =
    useRouter();

  const [
    following,
    setFollowing,
  ] =
    useState(
      initialFollowing,
    );

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

  async function toggle() {
    if (working) {
      return;
    }

    setWorking(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/social/users/${encodeURIComponent(
            username,
          )}/follow`,
          {
            method:
              following
                ? "DELETE"
                : "POST",
          },
        );

      const payload =
        (await response.json()) as {
          following?: boolean;
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to update follow",
        );
      }

      setFollowing(
        Boolean(
          payload.following,
        ),
      );

      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update follow",
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          void toggle()
        }
        disabled={working}
        className={`rounded-full px-6 py-3 text-sm font-black disabled:opacity-40 ${
          following
            ? "border border-white/10 bg-white/5 text-white/60"
            : "bg-white text-black"
        }`}
      >
        {working
          ? "Updating..."
          : following
            ? "Following"
            : "Follow"}
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
