import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

import { prisma } from "../../../../../lib/db/prisma";
import { vxUser } from "../../../../../lib/mobile/vx-auth";

export async function POST(request: Request) {
  const user = await vxUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.LIVEKIT_URL;
  const key = process.env.LIVEKIT_API_KEY;
  const secret = process.env.LIVEKIT_API_SECRET;

  if (!url || !key || !secret) {
    return NextResponse.json(
      { error: "Voice is not configured" },
      { status: 501 },
    );
  }

  let roomId = "";

  try {
    const body = (await request.json()) as { roomId?: unknown };
    roomId = typeof body.roomId === "string" ? body.roomId : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const room = await prisma.vxRoom.findUnique({ where: { id: roomId } });

  if (!room || room.status !== "LIVE") {
    return NextResponse.json({ error: "Room not live" }, { status: 404 });
  }

  const isHost = room.hostId === user.id;

  const at = new AccessToken(key, secret, {
    identity: user.id,
    name: user.name,
    ttl: 3600,
  });

  at.addGrant({
    room: room.id,
    roomJoin: true,
    canPublish: isHost,
    canSubscribe: true,
  });

  return NextResponse.json({
    url,
    token: await at.toJwt(),
    canPublish: isHost,
  });
}
