import {
  NextResponse,
} from "next/server";

import {
  v2 as cloudinary,
} from "cloudinary";

import {
  auth,
} from "../../../../auth";

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

  const secret =
    process.env
      .CLOUDINARY_API_SECRET;

  if (!secret) {
    return NextResponse.json(
      {
        error:
          "Cloudinary secret is missing",
      },
      {
        status: 503,
      },
    );
  }

  let body: {
    paramsToSign?: Record<
      string,
      string
    >;
  };

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

  if (!body.paramsToSign) {
    return NextResponse.json(
      {
        error:
          "Missing paramsToSign",
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
  });
}
