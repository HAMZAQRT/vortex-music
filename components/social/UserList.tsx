"use client";

import Link from "next/link";

type SocialUser = {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  role: string;
};

export default function UserList({
  users,
}: {
  users: SocialUser[];
}) {
  if (users.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-7 text-center text-sm text-white/30">
        No users yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
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
              className="flex items-center gap-4 rounded-3xl border border-white/5 bg-white/[0.02] p-3"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-blue-700 font-black">
                {user.name
                  ?.slice(
                    0,
                    1,
                  )
                  .toUpperCase() ??
                  "V"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">
                  {user.name ??
                    "Vortex User"}
                </p>

                <p className="truncate text-xs text-violet-300">
                  @{user.username}
                </p>

                {user.bio && (
                  <p className="mt-1 truncate text-xs text-white/30">
                    {
                      user.bio
                    }
                  </p>
                )}
              </div>
            </Link>
          );
        },
      )}
    </div>
  );
}
