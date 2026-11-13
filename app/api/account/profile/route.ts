import {
  NextResponse,
} from "next/server";

import {
  auth,
} from "../../../../auth";

import {
  prisma,
} from "../../../../lib/db/prisma";

const usernamePattern =
  /^[a-z0-9_]{3,24}$/;

export async function GET() {
  const session =
    await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error:
          "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id:
          session.user.id,
      },

      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        role: true,
        createdAt: true,

        _count: {
          select: {
            playlists: true,
            likes: true,
            follows: true,
            history: true,
          },
        },
      },
    });

  if (!user) {
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

  return NextResponse.json({
    user,
  });
}

export async function PATCH(
  request: Request,
) {
  const session =
    await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error:
          "Unauthorized",
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
        error:
          "Invalid JSON",
      },
      {
        status: 400,
      },
    );
  }

  const data =
    typeof body === "object" &&
    body !== null
      ? body as {
          name?: unknown;
          username?: unknown;
          bio?: unknown;
          image?: unknown;
        }
      : {};

  const name =
    typeof data.name ===
    "string"
      ? data.name.trim()
      : "";

  const username =
    typeof data.username ===
    "string"
      ? data.username
          .trim()
          .toLowerCase()
      : "";

  const bio =
    typeof data.bio ===
    "string"
      ? data.bio.trim()
      : "";

  const image =
    typeof data.image ===
    "string"
      ? data.image.trim()
      : "";

  if (
    name.length < 2 ||
    name.length > 60
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid display name",
      },
      {
        status: 400,
      },
    );
  }

  if (
    !usernamePattern.test(
      username,
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid username",
      },
      {
        status: 400,
      },
    );
  }

  if (bio.length > 240) {
    return NextResponse.json(
      {
        error:
          "Bio must be 240 characters or fewer",
      },
      {
        status: 400,
      },
    );
  }

  if (image) {
    try {
      const url =
        new URL(image);

      if (
        url.protocol !==
        "https:"
      ) {
        throw new Error();
      }
    } catch {
      return NextResponse.json(
        {
          error:
            "Profile image must use a valid HTTPS URL",
        },
        {
          status: 400,
        },
      );
    }
  }

  const owner =
    await prisma.user.findFirst({
      where: {
        username,

        NOT: {
          id:
            session.user.id,
        },
      },

      select: {
        id: true,
      },
    });

  if (owner) {
    return NextResponse.json(
      {
        error:
          "Username is already taken",
      },
      {
        status: 409,
      },
    );
  }

  const user =
    await prisma.user.update({
      where: {
        id:
          session.user.id,
      },

      data: {
        name,
        username,
        bio:
          bio || null,
        image:
          image || null,
      },

      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        role: true,
      },
    });

  return NextResponse.json({
    user,
  });
}
