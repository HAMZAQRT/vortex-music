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
    id: artistId,
  } = await context.params;

  const artist =
    await prisma.artist.findUnique({
      where: {
        id: artistId,
      },
      select: {
        id: true,
      },
    });

  if (!artist) {
    return {
      error: NextResponse.json(
        {
          error: "Artist not found",
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
    artistId:
      artist.id,
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

  const follow =
    await prisma.follow.findUnique({
      where: {
        userId_artistId: {
          userId:
            identity.userId,
          artistId:
            identity.artistId,
        },
      },
      select: {
        createdAt: true,
      },
    });

  return NextResponse.json({
    following:
      Boolean(follow),
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

  await prisma.follow.upsert({
    where: {
      userId_artistId: {
        userId:
          identity.userId,
        artistId:
          identity.artistId,
      },
    },

    update: {},

    create: {
      userId:
        identity.userId,
      artistId:
        identity.artistId,
    },
  });

  return NextResponse.json({
    following: true,
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

  await prisma.follow.deleteMany({
    where: {
      userId:
        identity.userId,
      artistId:
        identity.artistId,
    },
  });

  return NextResponse.json({
    following: false,
  });
}
