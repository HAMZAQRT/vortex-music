import {
  createHash,
  randomBytes,
} from "node:crypto";

import {
  prisma,
} from "../db/prisma";

export const MOBILE_SESSION_DAYS =
  30;

export function hashMobileToken(
  token: string,
) {
  return createHash(
    "sha256",
  )
    .update(token)
    .digest("hex");
}

export function createMobileToken() {
  return randomBytes(
    32,
  ).toString(
    "base64url",
  );
}

export async function createMobileSession(
  userId: string,
) {
  const token =
    createMobileToken();

  const tokenHash =
    hashMobileToken(
      token,
    );

  const expiresAt =
    new Date(
      Date.now() +
        MOBILE_SESSION_DAYS *
          24 *
          60 *
          60 *
          1000,
    );

  await prisma.mobileSession.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export function getBearerToken(
  request: Request,
) {
  const authorization =
    request.headers.get(
      "authorization",
    );

  if (
    !authorization ||
    !authorization.startsWith(
      "Bearer ",
    )
  ) {
    return null;
  }

  const token =
    authorization
      .slice(7)
      .trim();

  return token ||
    null;
}

export async function getMobileUser(
  request: Request,
) {
  const token =
    getBearerToken(
      request,
    );

  if (!token) {
    return null;
  }

  const tokenHash =
    hashMobileToken(
      token,
    );

  const session =
    await prisma.mobileSession.findUnique({
      where: {
        tokenHash,
      },

      select: {
        id: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
            bio: true,
            role: true,
          },
        },
      },
    });

  if (!session) {
    return null;
  }

  if (
    session.expiresAt.getTime() <=
    Date.now()
  ) {
    await prisma.mobileSession.delete({
      where: {
        id:
          session.id,
      },
    });

    return null;
  }

  await prisma.mobileSession.update({
    where: {
      id:
        session.id,
    },

    data: {
      lastUsedAt:
        new Date(),
    },
  });

  return {
    sessionId:
      session.id,
    user:
      session.user,
  };
}
