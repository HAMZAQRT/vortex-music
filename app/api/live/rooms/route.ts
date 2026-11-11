import {
  NextResponse,
} from "next/server";

import {
  auth,
} from "../../../../auth";

import {
  prisma,
} from "../../../../lib/db/prisma";

import {
  canAccessCreator,
  getSessionRole,
} from "../../../../lib/auth/roles";

export async function GET() {
  const rooms =
    await prisma.liveRoom.findMany({
      where: {
        status: "LIVE",
      },

      orderBy: {
        startedAt: "desc",
      },

      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        startedAt: true,

        host: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },

        currentTrack: {
          select: {
            id: true,
            title: true,

            artist: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

  return NextResponse.json({
    rooms,
  });
}

export async function POST(
  request: Request,
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

  const databaseUser =
    await prisma.user.findUnique({
      where: {
        id:
          session.user.id,
      },

      select: {
        id: true,
        role: true,
      },
    });

  if (!databaseUser) {
    return NextResponse.json(
      {
        error:
          "User not found",
      },
      {
        status: 404,
      },
    );
  }

  const role =
    getSessionRole(
      databaseUser,
    );

  if (
    !canAccessCreator(
      role,
    )
  ) {
    return NextResponse.json(
      {
        error: "Forbidden",
      },
      {
        status: 403,
      },
    );
  }

  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON",
      },
      {
        status: 400,
      },
    );
  }

  if (
    typeof body !== "object" ||
    body === null
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid request",
      },
      {
        status: 400,
      },
    );
  }

  const {
    title,
    description,
  } = body as {
    title?: unknown;
    description?: unknown;
  };

  if (
    typeof title !== "string" ||
    title.trim().length < 1 ||
    title.trim().length > 100
  ) {
    return NextResponse.json(
      {
        error:
          "Room title must be between 1 and 100 characters",
      },
      {
        status: 400,
      },
    );
  }

  if (
    description !== undefined &&
    (
      typeof description !==
        "string" ||
      description.length > 500
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Room description is invalid",
      },
      {
        status: 400,
      },
    );
  }

  const room =
    await prisma.liveRoom.create({
      data: {
        title:
          title.trim(),

        description:
          typeof description ===
          "string"
            ? description.trim() ||
              null
            : null,

        hostId:
          databaseUser.id,
      },

      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,

        host: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

  return NextResponse.json(
    {
      room,
    },
    {
      status: 201,
    },
  );
}
