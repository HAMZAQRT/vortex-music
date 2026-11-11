import {
  NextResponse,
} from "next/server";

import {
  auth,
} from "../../../../../../auth";

import {
  prisma,
} from "../../../../../../lib/db/prisma";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  context: Context,
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
    id: roomId,
  } = await context.params;

  const participant =
    await prisma.liveParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId:
            session.user.id,
        },
      },

      select: {
        id: true,
        leftAt: true,
      },
    });

  if (!participant) {
    return NextResponse.json({
      left: true,
    });
  }

  if (!participant.leftAt) {
    await prisma.liveParticipant.update({
      where: {
        id:
          participant.id,
      },

      data: {
        leftAt:
          new Date(),
      },
    });
  }

  return NextResponse.json({
    left: true,
  });
}
