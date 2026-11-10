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

  const playlists =
    await prisma.playlist.findMany({
      where: {
        ownerId:
          session.user.id,
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        public: true,
        createdAt: true,

        tracks: {
          orderBy: {
            position: "asc",
          },

          select: {
            position: true,

            track: {
              select: {
                id: true,
                title: true,
                audioUrl: true,
                duration: true,

                artist: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

  return NextResponse.json({
    playlists,
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
        error: "Invalid request",
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
    title.trim().length > 80
  ) {
    return NextResponse.json(
      {
        error:
          "Playlist title must be between 1 and 80 characters",
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
      description.length > 300
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Playlist description is invalid",
      },
      {
        status: 400,
      },
    );
  }

  const playlist =
    await prisma.playlist.create({
      data: {
        title:
          title.trim(),

        description:
          typeof description ===
          "string"
            ? description.trim() ||
              null
            : null,

        ownerId:
          session.user.id,
      },

      select: {
        id: true,
        title: true,
        description: true,
        public: true,
        createdAt: true,
      },
    });

  return NextResponse.json(
    {
      playlist,
    },
    {
      status: 201,
    },
  );
}
