import {
  NextResponse,
} from "next/server";

import bcrypt from "bcryptjs";

import {
  prisma,
} from "../../../../../lib/db/prisma";

import {
  createMobileSession,
} from "../../../../../lib/mobile/auth";

export async function POST(
  request: Request,
) {
  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid request",
      },
      {
        status: 400,
      },
    );
  }

  if (
    typeof body !==
      "object" ||
    body === null
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid request",
      },
      {
        status: 400,
      },
    );
  }

  const {
    email,
    password,
  } = body as {
    email?: unknown;
    password?: unknown;
  };

  const cleanEmail =
    typeof email ===
    "string"
      ? email
          .trim()
          .toLowerCase()
      : "";

  const cleanPassword =
    typeof password ===
    "string"
      ? password
      : "";

  if (
    !cleanEmail ||
    !cleanPassword
  ) {
    return NextResponse.json(
      {
        error:
          "Email and password are required",
      },
      {
        status: 400,
      },
    );
  }

  const user =
    await prisma.user.findUnique({
      where: {
        email:
          cleanEmail,
      },

      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        role: true,
        passwordHash: true,
      },
    });

  if (
    !user?.passwordHash
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid email or password",
      },
      {
        status: 401,
      },
    );
  }

  const valid =
    await bcrypt.compare(
      cleanPassword,
      user.passwordHash,
    );

  if (!valid) {
    return NextResponse.json(
      {
        error:
          "Invalid email or password",
      },
      {
        status: 401,
      },
    );
  }

  const {
    token,
    expiresAt,
  } =
    await createMobileSession(
      user.id,
    );

  return NextResponse.json({
    token,
    expiresAt,

    user: {
      id:
        user.id,
      name:
        user.name,
      username:
        user.username,
      email:
        user.email,
      image:
        user.image,
      bio:
        user.bio,
      role:
        user.role,
    },
  });
}
