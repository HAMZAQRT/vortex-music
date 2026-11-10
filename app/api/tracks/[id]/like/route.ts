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

async function getIdentity(
  context: RouteContext,
) {
  const session =
    await auth();

  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      ),
    };
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
    return {
      error: NextResponse.json(
        {
          error: "Track not found",
        },
        {
          status: 404,
        },
      ),
    };
  }

  return {
    userId:
      session.user.id,
    trackId:
      track.id,
  };
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const identity =
    await getIdentity(
      context,
    );

  if ("error" in identity) {
    return identity.error;
  }

  const like =
    await prisma.like.findUnique({
      where: {
        userId_trackId: {
          userId:
            identity.userId,
          trackId:
            identity.trackId,
        },
      },
      select: {
        createdAt: true,
      },
    });

  return NextResponse.json({
    liked:
      Boolean(like),
  });
}

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  const identity =
    await getIdentity(
      context,
    );

  if ("error" in identity) {
    return identity.error;
  }

  await prisma.like.upsert({
    where: {
      userId_trackId: {
        userId:
          identity.userId,
        trackId:
          identity.trackId,
      },
    },

    update: {},

    create: {
      userId:
        identity.userId,
      trackId:
        identity.trackId,
    },
  });

  return NextResponse.json({
    liked: true,
  });
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  const identity =
    await getIdentity(
      context,
    );

  if ("error" in identity) {
    return identity.error;
  }

  await prisma.like.deleteMany({
    where: {
      userId:
        identity.userId,
      trackId:
        identity.trackId,
    },
  });

  return NextResponse.json({
    liked: false,
  });
}
