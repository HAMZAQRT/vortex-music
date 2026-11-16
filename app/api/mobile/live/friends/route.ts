import { NextResponse } from "next/server";

import { prisma } from "../../../../../lib/db/prisma";
import { vxUser } from "../../../../../lib/mobile/vx-auth";

export async function GET(request: Request) {
  const user = await vxUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const follows = await prisma.userFollow.findMany({
    where: { followerId: user.id },
    select: { followingId: true },
    take: 500,
  });

  const ids = follows.map((f) => f.followingId);

  if (!ids.length) {
    return NextResponse.json({ friends: [] });
  }

  const since = new Date(Date.now() - 20_000);

  const listening = await prisma.vxListener.findMany({
    where: { userId: { in: ids }, seenAt: { gte: since } },
    take: 50,
  });

  const hosting = await prisma.vxRoom.findMany({
    where: {
      hostId: { in: ids },
      status: "LIVE",
      syncedAt: { gte: new Date(Date.now() - 90_000) },
    },
    take: 50,
  });

  const roomIds = Array.from(
    new Set([
      ...listening.map((l) => l.roomId),
      ...hosting.map((h) => h.id),
    ]),
  );

  const rooms = await prisma.vxRoom.findMany({
    where: { id: { in: roomIds }, status: "LIVE" },
  });

  const byId = new Map(rooms.map((r) => [r.id, r]));
  const friends: { name: string; roomId: string; roomTitle: string }[] = [];

  for (const l of listening) {
    const r = byId.get(l.roomId);
    if (r) friends.push({ name: l.name, roomId: r.id, roomTitle: r.title });
  }

  for (const h of hosting) {
    friends.push({ name: h.hostName, roomId: h.id, roomTitle: h.title });
  }

  return NextResponse.json({ friends });
}
