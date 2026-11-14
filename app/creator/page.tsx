import {
  connection,
} from "next/server";

import {
  redirect,
} from "next/navigation";

import {
  auth,
} from "../../auth";

import {
  getSessionRole,
} from "../../lib/auth/roles";

import CreatorStudio from "../../components/creator/CreatorStudio";

export const instant = false;

const creatorRoles =
  new Set([
    "CREATOR",
    "ARTIST",
    "MODERATOR",
    "ADMIN",
  ]);

export default async function CreatorPage() {
  await connection();

  const session =
    await auth();

  if (!session?.user) {
    redirect(
      "/login",
    );
  }

  const role =
    getSessionRole(
      session.user,
    );

  if (
    !creatorRoles.has(
      role,
    )
  ) {
    redirect(
      "/account",
    );
  }

  return (
    <CreatorStudio
      role={role}
    />
  );
}
