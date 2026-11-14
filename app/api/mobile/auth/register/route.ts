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

const usernamePattern =
  /^[a-z0-9_]{3,24}$/;

export async function POST(
  request: Request,
) {
  const body =
    (await request.json()) as {
      name?: unknown;
      username?: unknown;
      email?: unknown;
      password?: unknown;
    };

  const name =
    typeof body.name ===
    "string"
      ? body.name.trim()
      : "";

  const username =
    typeof body.username ===
    "string"
      ? body.username
          .trim()
          .toLowerCase()
      : "";

  const email =
    typeof body.email ===
    "string"
      ? body.email
          .trim()
          .toLowerCase()
      : "";

  const password =
    typeof body.password ===
    "string"
      ? body.password
      : "";

  if (
    name.length < 2 ||
    name.length > 60 ||
    !usernamePattern.test(
      username,
    ) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    ) ||
    password.length <
      10 ||
    Buffer.byteLength(
      password,
      "utf8",
    ) > 72
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid registration data",
      },
      {
        status: 400,
      },
    );
  }

  const existing =
    await prisma.user.findFirst({
      where: {
        OR: [
          {
            email,
          },
          {
            username,
          },
        ],
      },

      select: {
        id: true,
      },
    });

  if (existing) {
    return NextResponse.json(
      {
        error:
          "Email or username already exists",
      },
      {
        status: 409,
      },
    );
  }

  const passwordHash =
    await bcrypt.hash(
      password,
      12,
    );

  const user =
    await prisma.user.create({
      data: {
        name,
        username,
        email,
        passwordHash,
        role:
          "USER",
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

  const {
    token,
    expiresAt,
  } =
    await createMobileSession(
      user.id,
    );

  return NextResponse.json(
    {
      token,
      expiresAt,
      user,
    },
    {
      status: 201,
    },
  );
}
