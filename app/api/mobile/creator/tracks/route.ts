import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "../../../../../lib/db/prisma";

import {
  getMobileUser,
} from "../../../../../lib/mobile/auth";

const creatorRoles =
  new Set([
    "CREATOR",
    "ARTIST",
    "MODERATOR",
    "ADMIN",
  ]);

function slugify(
  value: string,
) {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}

export async function POST(
  request: Request,
) {
  const mobile =
    await getMobileUser(
      request,
    );

  if (
    !mobile ||
    !creatorRoles.has(
      mobile.user.role,
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

  const body =
    (await request.json()) as {
      title?: unknown;
      audioUrl?: unknown;
      cover?: unknown;
      duration?: unknown;
      artistId?: unknown;
      albumId?: unknown;
      published?: unknown;
    };

  const title =
    typeof body.title ===
      "string"
      ? body.title.trim()
      : "";

  const audioUrl =
    typeof body.audioUrl ===
      "string"
      ? body.audioUrl.trim()
      : "";

  const cover =
    typeof body.cover ===
      "string"
      ? body.cover.trim()
      : "";

  const artistId =
    typeof body.artistId ===
      "string"
      ? body.artistId
      : "";

  const albumId =
    typeof body.albumId ===
      "string" &&
    body.albumId
      ? body.albumId
      : null;

  const duration =
    Number(
      body.duration,
    );

  if (
    !title ||
    !audioUrl ||
    !artistId ||
    !Number.isFinite(
      duration,
    ) ||
    duration <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "Missing track data",
      },
      {
        status: 400,
      },
    );
  }

  let parsedAudioUrl:
    URL;

  try {
    parsedAudioUrl =
      new URL(
        audioUrl,
      );
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid audio URL",
      },
      {
        status: 400,
      },
    );
  }

  if (
    parsedAudioUrl.protocol !==
      "https:" ||
    parsedAudioUrl.hostname !==
      "res.cloudinary.com"
  ) {
    return NextResponse.json(
      {
        error:
          "Audio must come from Vortex media storage",
      },
      {
        status: 400,
      },
    );
  }

  if (cover) {
    try {
      const parsedCover =
        new URL(
          cover,
        );

      if (
        parsedCover.protocol !==
          "https:" ||
        parsedCover.hostname !==
          "res.cloudinary.com"
      ) {
        throw new Error();
      }
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid cover URL",
        },
        {
          status: 400,
        },
      );
    }
  }

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
    return NextResponse.json(
      {
        error:
          "Artist not found",
      },
      {
        status: 400,
      },
    );
  }

  const base =
    slugify(title) ||
    "track";

  let slug =
    base;

  let attempt =
    1;

  while (
    await prisma.track.findUnique({
      where: {
        slug,
      },

      select: {
        id: true,
      },
    })
  ) {
    attempt += 1;

    slug =
      `${base}-${attempt}`;
  }

  const track =
    await prisma.track.create({
      data: {
        title,
        slug,
        audioUrl,
        cover:
          cover ||
          null,
        duration:
          Math.round(
            duration,
          ),
        artistId,
        albumId,
        published:
          body.published ===
          true,
      },

      select: {
        id: true,
        title: true,
        slug: true,
        audioUrl: true,
        cover: true,
        duration: true,
        published: true,

        artist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  return NextResponse.json(
    {
      track,
    },
    {
      status: 201,
    },
  );
}
