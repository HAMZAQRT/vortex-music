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
      paramsToSign?: Record<
        string,
        string | number
      >;
    };

  if (!body.paramsToSign) {
    return NextResponse.json(
      {
        error:
          "Missing upload parameters",
      },
      {
        status: 400,
      },
    );
  }

  const signature =
    cloudinary.utils
      .api_sign_request(
        body.paramsToSign,
        secret,
      );

  return NextResponse.json({
    signature,
    apiKey,
    cloudName,
  });
}
