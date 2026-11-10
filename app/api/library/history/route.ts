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

  const history =
    await prisma.listeningHistory.findMany({
      where: {
        userId:
          session.user.id,
      },

      select: {
        trackId: true,
        playedAt: true,
      },

      orderBy: {
        playedAt: "desc",
      },

      take: 100,
    });

  const historyTrackIds = [
    ...new Set(
      history.map(
        (entry) =>
          entry.trackId,
      ),
    ),
  ].slice(0, 30);

  return NextResponse.json({
    historyTrackIds,
  });
}

export async function DELETE() {
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

  await prisma.listeningHistory.deleteMany({
    where: {
      userId:
        session.user.id,
    },
  });

  return NextResponse.json({
    cleared: true,
  });
}
