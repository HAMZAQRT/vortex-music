import {
  NextResponse,
} from "next/server";

import {
  v2 as cloudinary,
} from "cloudinary";

import {
  getMobileUser,
} from "../../../../../lib/mobile/auth";

const uploadRoles =
  new Set([
    "CREATOR",
    "ARTIST",
    "MODERATOR",
    "ADMIN",
  ]);

const folders = {
  cover:
    "vortex/covers",
  audio:
    "vortex/audio",
} as const;

export async function POST(
  request: Request,
) {
  const mobile =
    await getMobileUser(
      request,
    );

  if (
    !mobile ||
    !uploadRoles.has(
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

  const secret =
    process.env
      .CLOUDINARY_API_SECRET;

  const apiKey =
    process.env
      .CLOUDINARY_API_KEY;

  const cloudName =
    process.env
      .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (
    !secret ||
    !apiKey ||
    !cloudName
  ) {
    return NextResponse.json(
      {
        error:
          "Media storage unavailable",
      },
      {
        status: 503,
      },
    );
  }

  const body =
    (await request.json()) as {
      kind?: unknown;
    };

  const kind =
    body.kind ===
      "audio" ||
    body.kind ===
      "cover"
      ? body.kind
      : null;

  if (!kind) {
    return NextResponse.json(
      {
        error:
          "Invalid media kind",
      },
      {
        status: 400,
      },
    );
  }

  const timestamp =
    Math.floor(
      Date.now() /
      1000,
    );

  const folder =
    folders[kind];

  const paramsToSign = {
    timestamp,
    folder,
  };

  const signature =
    cloudinary.utils
      .api_sign_request(
        paramsToSign,
        secret,
      );

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey,
    cloudName,
  });
}
