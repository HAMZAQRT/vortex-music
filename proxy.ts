import {
  NextResponse,
} from "next/server";

import {
  auth,
} from "./auth";

export const proxy =
  auth((request) => {
    if (
      !request.auth
    ) {
      return NextResponse.redirect(
        new URL(
          "/login",
          request.nextUrl,
        ),
      );
    }

    return NextResponse.next();
  });

export const config = {
  matcher: [
    "/",
    "/explore/:path*",
    "/search/:path*",
    "/player/:path*",
    "/library/:path*",
    "/live/:path*",
    "/profile",
    "/account/:path*",
    "/playlist/:path*",
    "/artist/:path*",
    "/album/:path*",
    "/videos/:path*",
    "/creator/:path*",
    "/admin/:path*",
    "/debug/:path*",
  ],
};
