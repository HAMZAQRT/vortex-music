import { NextResponse } from "next/server";

import { prisma } from "../../../../../../lib/db/prisma";
import { vxUser } from "../../../../../../lib/mobile/vx-auth";

type Ctx = {
  params: Promise<{ id: string }>;
};

const EMOJI = [
  "\uD83D\uDD25",
  "\u2764\uFE0F",
  "\uD83D\uDC4F",
  "\uD83D\uDE02",
  "\uD83C\uDF89",
];

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

function slim(value: unknown): string | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const t = value as Record<string, unknown>;

  if (
    typeof t.audio !== "string" ||
    !t.audio.startsWith("https://") ||
    typeof t.name !== "string"
  ) {
    return null;
  }

  return JSON.stringify({
    id: String(t.id ?? t.audio).slice(0, 200),
    name: t.name.slice(0, 200),
    artist_name:
      typeof t.artist_name === "string" ? t.artist_name.slice(0, 200) : "",
    image:
      typeof t.image === "string" && t.image.startsWith("https://")
        ? t.image.slice(0, 500)
        : "",
    audio: t.audio.slice(0, 1000),
  });
}

export async function GET(request: Request, ctx: Ctx) {
  const user = await vxUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const room = await prisma.vxRoom.findUnique({ where: { id } });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const isHost = room.hostId === user.id;

  if (!isHost) {
    await prisma.vxListener.upsert({
      where: { roomId_userId: { roomId: id, userId: user.id } },
      update: { seenAt: new Date(), name: user.name },
      create: { roomId: id, userId: user.id, name: user.name },
    });
  }

  const sinceRaw = new URL(request.url).searchParams.get("since");
  const sinceDate = sinceRaw ? new Date(sinceRaw) : null;
  const gt =
    sinceDate && !Number.isNaN(sinceDate.getTime()) ? sinceDate : null;

  const found = await prisma.vxMessage.findMany({
    where: {
      roomId: id,
      ...(gt ? { createdAt: { gt } } : {}),
    },
    orderBy: { createdAt: gt ? "asc" : "desc" },
    take: gt ? 60 : 30,
  });

  const messages = gt ? found : found.reverse();

  const listeners = await prisma.vxListener.count({
    where: {
      roomId: id,
      seenAt: { gte: new Date(Date.now() - 20_000) },
    },
  });

  return NextResponse.json({
    room: {
      id: room.id,
      title: room.title,
      hostId: room.hostId,
      hostName: room.hostName,
      status: room.status,
      isHost,
      track: parse(room.trackJson),
      playing: room.playing,
      positionMs: room.positionMs,
      syncedAt: room.syncedAt.getTime(),
    },
    serverNow: Date.now(),
    listeners,
    messages: messages.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.name,
      kind: m.kind,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request, ctx: Ctx) {
  const user = await vxUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const room = await prisma.vxRoom.findUnique({ where: { id } });

  if (!room || room.status !== "LIVE") {
    return NextResponse.json({ error: "Room not live" }, { status: 404 });
  }

  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof raw !== "object" || raw === null) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const body = raw as Record<string, unknown>;
  const isHost = room.hostId === user.id;

  if (body.action === "sync") {
    if (!isHost) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const position =
      typeof body.positionMs === "number" && Number.isFinite(body.positionMs)
        ? Math.max(0, Math.min(Math.round(body.positionMs), 86_400_000))
        : 0;

    await prisma.vxRoom.update({
      where: { id },
      data: {
        trackJson: slim(body.track),
        playing: body.playing === true,
        positionMs: position,
        syncedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  }

  if (body.action === "end") {
    if (!isHost) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.vxRoom.update({
      where: { id },
      data: { status: "ENDED" },
    });

    return NextResponse.json({ ok: true });
  }

  if (body.action === "say") {
    const text =
      typeof body.text === "string" ? body.text.trim().slice(0, 300) : "";

    if (!text) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    await prisma.vxMessage.create({
      data: {
        roomId: id,
        userId: user.id,
        name: user.name,
        kind: "chat",
        body: text,
      },
    });

    return NextResponse.json({ ok: true });
  }

  if (body.action === "react") {
    const emoji = typeof body.emoji === "string" ? body.emoji : "";

    if (!EMOJI.includes(emoji)) {
      return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
    }

    await prisma.vxMessage.create({
      data: {
        roomId: id,
        userId: user.id,
        name: user.name,
        kind: "react",
        body: emoji,
      },
    });

    return NextResponse.json({ ok: true });
  }

  if (body.action === "request") {
    const track = slim(body.track);

    if (!track) {
      return NextResponse.json({ error: "Invalid track" }, { status: 400 });
    }

    await prisma.vxMessage.create({
      data: {
        roomId: id,
        userId: user.id,
        name: user.name,
        kind: "req",
        body: track,
      },
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
