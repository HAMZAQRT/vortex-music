export const roles = [
  "USER",
  "CREATOR",
  "ARTIST",
  "MODERATOR",
  "ADMIN",
] as const;

export type UserRole =
  (typeof roles)[number];

export const permissions: Record<
  UserRole,
  readonly string[]
> = {
  USER: [
    "music:listen",
    "music:like",
    "artist:follow",
    "playlist:create",
  ],

  CREATOR: [
    "music:listen",
    "music:like",
    "artist:follow",
    "playlist:create",
    "creator:access",
    "content:upload",
  ],

  ARTIST: [
    "music:listen",
    "music:like",
    "artist:follow",
    "playlist:create",
    "creator:access",
    "content:upload",
    "artist:manage",
  ],

  MODERATOR: [
    "music:listen",
    "music:like",
    "artist:follow",
    "playlist:create",
    "moderation:access",
    "report:review",
  ],

  ADMIN: [
    "music:listen",
    "music:like",
    "artist:follow",
    "playlist:create",
    "creator:access",
    "content:upload",
    "artist:manage",
    "moderation:access",
    "report:review",
    "admin:access",
    "user:manage",
    "system:manage",
  ],
};

export function normalizeRole(
  value: unknown,
): UserRole {
  return roles.includes(
    value as UserRole,
  )
    ? (value as UserRole)
    : "USER";
}

export function getSessionRole(
  user: unknown,
): UserRole {
  if (
    typeof user === "object" &&
    user !== null &&
    "role" in user
  ) {
    return normalizeRole(
      (
        user as {
          role?: unknown;
        }
      ).role,
    );
  }

  return "USER";
}

export function canAccessCreator(
  role: UserRole,
) {
  return (
    role === "CREATOR" ||
    role === "ARTIST" ||
    role === "ADMIN"
  );
}

export function canAccessAdmin(
  role: UserRole,
) {
  return role === "ADMIN";
}

export function canModerate(
  role: UserRole,
) {
  return (
    role === "MODERATOR" ||
    role === "ADMIN"
  );
}
