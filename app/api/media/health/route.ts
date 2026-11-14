import {
  NextResponse,
} from "next/server";

import {
  auth,
} from "../../../../auth";

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

  const configured =
    Boolean(
      process.env
        .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env
        .NEXT_PUBLIC_CLOUDINARY_API_KEY &&
      process.env
        .CLOUDINARY_API_SECRET,
    );

  return NextResponse.json({
    configured,
    provider:
      "Cloudinary",
  });
}
