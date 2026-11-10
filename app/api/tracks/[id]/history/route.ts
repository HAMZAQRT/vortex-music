import {
  NextResponse,
} from "next/server";

import {
  auth,
} from "../../../../../auth";

import {
  prisma,
} from "../../../../../lib/db/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext,
) {
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

  const {
    id: trackId,
  } = await context.params;

  const track =
    await prisma.track.findUnique({
      where: {
        id: trackId,
      },
      select: {
        id: true,
      },
    });

  if (!track) {
    return NextResponse.json(
      {
        error: "Track not found",
      },
      {
        status: 404,
      },
    );
  }

  await prisma.listeningHistory.create({
    data: {
      userId:
        session.user.id,
      trackId:
        track.id,
    },
  });

  return NextResponse.json(
    {
      recorded: true,
    },
    {
      status: 201,
    },
  );
}
