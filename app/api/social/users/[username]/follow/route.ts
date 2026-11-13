import {
  NextResponse,
} from "next/server";

import {
  auth,
} from "../../../../../../auth";

import {
  prisma,
} from "../../../../../../lib/db/prisma";

type Context = {
  params: Promise<{
    username: string;
  }>;
};

async function getTarget(
  username: string,
) {
  return prisma.user.findUnique({
    where: {
      username:
        username
          .trim()
          .toLowerCase(),
    },

    select: {
      id: true,
      username: true,
    },
  });
}

export async function POST(
  _request: Request,
  context: Context,
) {
  const session =
    await auth();

  if (!session?.user?.id) {
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

  const {
    username,
  } = await context.params;

  const target =
    await getTarget(
      username,
    );

  if (!target) {
    return NextResponse.json(
      {
        error:
          "User not found",
      },
      {
        status: 404,
      },
    );
  }

  if (
    target.id ===
    session.user.id
  ) {
    return NextResponse.json(
      {
        error:
          "You cannot follow yourself",
      },
      {
        status: 400,
      },
    );
  }

  await prisma.userFollow.upsert({
    where: {
      followerId_followingId: {
        followerId:
          session.user.id,
        followingId:
          target.id,
      },
    },

    update: {},

    create: {
      followerId:
        session.user.id,
      followingId:
        target.id,
    },
  });

  const followers =
    await prisma.userFollow.count({
      where: {
        followingId:
          target.id,
      },
    });

  return NextResponse.json({
    following: true,
    followers,
  });
}

export async function DELETE(
  _request: Request,
  context: Context,
) {
  const session =
    await auth();

  if (!session?.user?.id) {
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

  const {
    username,
  } = await context.params;

  const target =
    await getTarget(
      username,
    );

  if (!target) {
    return NextResponse.json(
      {
        error:
          "User not found",
      },
      {
        status: 404,
      },
    );
  }

  await prisma.userFollow.deleteMany({
    where: {
      followerId:
        session.user.id,

      followingId:
        target.id,
    },
  });

  const followers =
    await prisma.userFollow.count({
      where: {
        followingId:
          target.id,
      },
    });

  return NextResponse.json({
    following: false,
    followers,
  });
}
