"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

type SearchUser = {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  role: string;

  _count: {
    followers: number;
    following: number;
  };
};

export default function PeopleSearch() {
  const [
    query,
    setQuery,
  ] =
    useState("");

  const [
    users,
    setUsers,
  ] =
    useState<
      SearchUser[]
    >([]);

  const [
    searching,
    setSearching,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const clean =
      query.trim();

    if (
      clean.length < 2
    ) {
      setError(
        "Enter at least 2 characters.",
      );

      return;
    }

    setSearching(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/social/users?query=${encodeURIComponent(
            clean,
          )}`,
          {
            cache:
              "no-store",
          },
        );

      const payload =
        (await response.json()) as {
          users?: SearchUser[];
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Search failed",
        );
      }

      setUsers(
        payload.users ??
        [],
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Search failed",
      );
    } finally {
      setSearching(false);
    }
  }

  return (
    <>
      <form
        onSubmit={submit}
        className="flex gap-2"
      >
        <input
          value={query}
          onChange={(
            event,
          ) =>
            setQuery(
              event.target.value,
            )
          }
          placeholder="Search name or @username"
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 outline-none placeholder:text-white/20"
        />

        <button
          type="submit"
          disabled={searching}
          className="rounded-2xl bg-white px-5 font-black text-black disabled:opacity-40"
        >
          {searching
            ? "..."
            : "Search"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-2">

        {users.map(
          (user) => {
            if (!user.username) {
              return null;
            }

            return (
              <Link
                key={
                  user.id
                }
                href={`/profile/${user.username}`}
                className="flex items-center gap-4 rounded-3xl border border-white/5 bg-white/[0.025] p-4"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-blue-700 text-xl font-black">
                  {user.name
                    ?.slice(
                      0,
                      1,
                    )
                    .toUpperCase() ??
                    "V"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-black">
                    {user.name ??
                      "Vortex User"}
                  </p>

                  <p className="truncate text-xs text-violet-300">
                    @{user.username}
                  </p>

                  <p className="mt-1 text-[10px] text-white/25">
                    {
                      user._count
                        .followers
                    }{" "}
                    followers
                  </p>
                </div>
              </Link>
            );
          },
        )}

      </div>
    </>
  );
}
