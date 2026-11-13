import {
  NextResponse,
} from "next/server";

import bcrypt from "bcryptjs";

import {
  prisma,
} from "../../../../lib/db/prisma";

const usernamePattern =
  /^[a-z0-9_]{3,24}$/;

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
          "Invalid JSON",
      },
      {
        status: 400,
      },
    );
  }

  if (
    typeof body !== "object" ||
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
    name,
    username,
    email,
    password,
  } = body as {
    name?: unknown;
    username?: unknown;
    email?: unknown;
    password?: unknown;
  };

  const cleanName =
    typeof name === "string"
      ? name.trim()
      : "";

  const cleanUsername =
    typeof username ===
    "string"
      ? username
          .trim()
          .toLowerCase()
      : "";

  const cleanEmail =
    typeof email ===
    "string"
      ? email
          .trim()
          .toLowerCase()
      : "";

  if (
    cleanName.length < 2 ||
    cleanName.length > 60
  ) {
    return NextResponse.json(
      {
        error:
          "Name must contain 2-60 characters",
      },
      {
        status: 400,
      },
    );
  }

  if (
    !usernamePattern.test(
      cleanUsername,
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Username must contain 3-24 lowercase letters, numbers or underscores",
      },
      {
        status: 400,
      },
    );
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      cleanEmail,
    ) ||
    cleanEmail.length >
      254
  ) {
    return NextResponse.json(
      {
        error:
          "Enter a valid email address",
      },
      {
        status: 400,
      },
    );
  }

  if (
    typeof password !==
      "string" ||
    password.length < 10 ||
    Buffer.byteLength(
      password,
      "utf8",
    ) > 72
  ) {
    return NextResponse.json(
      {
        error:
          "Password must contain at least 10 characters and no more than 72 bytes",
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
            email:
              cleanEmail,
          },
          {
            username:
              cleanUsername,
          },
        ],
      },

      select: {
        email: true,
        username: true,
      },
    });

  if (existing) {
    return NextResponse.json(
      {
        error:
          existing.email ===
          cleanEmail
            ? "This email already has a Vortex account"
            : "This username is already taken",
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
        name:
          cleanName,
        username:
          cleanUsername,
        email:
          cleanEmail,
        passwordHash,
        role:
          "USER",
      },

      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
      },
    });

  return NextResponse.json(
    {
      user,
    },
    {
      status: 201,
    },
  );
}
