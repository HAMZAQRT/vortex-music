import {
  NextResponse,
} from "next/server";

import {
  auth,
} from "../../../../auth";

import {
  prisma,
} from "../../../../lib/db/prisma";

export async function GET() {
  const session =
    await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const likes =
    await prisma.like.findMany({
      where: {
        userId:
          session.user.id,
      },

      select: {
        trackId: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return NextResponse.json({
    likedTrackIds:
      likes.map(
        (like) =>
          like.trackId,
      ),
  });
}
