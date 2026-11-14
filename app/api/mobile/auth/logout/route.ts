import {
  NextResponse,
} from "next/server";

import {
  getBearerToken,
  hashMobileToken,
} from "../../../../../lib/mobile/auth";

import {
  prisma,
} from "../../../../../lib/db/prisma";

export async function POST(
  request: Request,
) {
  const token =
    getBearerToken(
      request,
    );

  if (token) {
    await prisma.mobileSession.deleteMany({
      where: {
        tokenHash:
          hashMobileToken(
            token,
          ),
      },
    });
  }

  return NextResponse.json({
    signedOut: true,
  });
}
