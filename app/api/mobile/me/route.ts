import {
  NextResponse,
} from "next/server";

import {
  getMobileUser,
} from "../../../../lib/mobile/auth";

export async function GET(
  request: Request,
) {
  const mobile =
    await getMobileUser(
      request,
    );

  if (!mobile) {
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

  return NextResponse.json({
    user:
      mobile.user,
  });
}
