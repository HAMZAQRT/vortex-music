import { NextResponse } from "next/server";

import { prisma } from "../../../../../lib/db/prisma";
import { vxUser } from "../../../../../lib/mobile/vx-auth";

function parse(value: string | null): unknown {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const user = await vxUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rooms = await prisma.vxRoom.findMany({
    where: {
      status: "LIVE",
      syncedAt: { gte: new Date(Date.now() - 90_000) },
    },
    orderBy: { syncedAt: "desc" },
    take: 30,
  });

  const result = await Promise.all(
    rooms.map(async (room) => ({
      id: room.id,
      title: room.title,
      hostName: room.hostName,
      track: parse(room.trackJson),
      listeners: await prisma.vxListener.count({
        where: {
          roomId: room.id,
          seenAt: { gte: new Date(Date.now() - 20_000) },
        },
      }),
    })),
  );

  return NextResponse.json({ rooms: result });
}

export async function POST(request: Request) {
  const user = await vxUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title =
    typeof body === "object" &&
    body !== null &&
    typeof (body as { title?: unknown }).title === "string"
      ? (body as { title: string }).title.trim()
      : "";

  if (title.length < 1 || title.length > 80) {
    return NextResponse.json(
      { error: "Room title must be 1 to 80 characters" },
      { status: 400 },
    );
  }

  const room = await prisma.vxRoom.create({
    data: {
      title,
      hostId: user.id,
      hostName: user.name,
    },
  });

  return NextResponse.json(
    { room: { id: room.id, title: room.title } },
    { status: 201 },
  );
}
