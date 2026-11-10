import {
  prisma,
} from "../lib/db/prisma";

const artists = [
  {
    id: "vortex-originals",
    name: "Vortex Originals",
    slug: "vortex-originals",
    bio: "Original sounds created for the Vortex universe.",
    verified: true,
  },
  {
    id: "luna",
    name: "Luna",
    slug: "luna",
    bio: "Electronic pop, neon nights and atmospheric sound.",
    verified: true,
  },
  {
    id: "nova",
    name: "Nova",
    slug: "nova",
    bio: "Future-facing electronic music and late-night energy.",
    verified: true,
  },
] as const;

const albums = [
  {
    id: "night-signals",
    title: "Night Signals",
    slug: "night-signals",
    artistId: "vortex-originals",
    releaseDate:
      new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "electric-hearts",
    title: "Electric Hearts",
    slug: "electric-hearts",
    artistId: "luna",
    releaseDate:
      new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "horizons",
    title: "Horizons",
    slug: "horizons",
    artistId: "nova",
    releaseDate:
      new Date("2026-01-01T00:00:00.000Z"),
  },
] as const;

const tracks = [
  {
    id: "midnight-echo",
    title: "Midnight Echo",
    slug: "midnight-echo",
    audioUrl:
      "/audio/midnight-echo.mp3",
    duration: 224,
    artistId: "vortex-originals",
    albumId: "night-signals",
  },
  {
    id: "neon-dreams",
    title: "Neon Dreams",
    slug: "neon-dreams",
    audioUrl:
      "/audio/neon-dreams.mp3",
    duration: 198,
    artistId: "luna",
    albumId: "electric-hearts",
  },
  {
    id: "after-dark",
    title: "After Dark",
    slug: "after-dark",
    audioUrl:
      "/audio/after-dark.mp3",
    duration: 241,
    artistId: "nova",
    albumId: "horizons",
  },
] as const;

async function main() {
  for (const artist of artists) {
    await prisma.artist.upsert({
      where: {
        id: artist.id,
      },
      update: artist,
      create: artist,
    });
  }

  for (const album of albums) {
    await prisma.album.upsert({
      where: {
        id: album.id,
      },
      update: album,
      create: album,
    });
  }

  for (const track of tracks) {
    await prisma.track.upsert({
      where: {
        id: track.id,
      },
      update: {
        ...track,
        published: true,
      },
      create: {
        ...track,
        published: true,
      },
    });
  }

  console.log(
    "VORTEX_SEED=OK",
  );

  console.log(
    `ARTISTS=${artists.length}`,
  );

  console.log(
    `ALBUMS=${albums.length}`,
  );

  console.log(
    `TRACKS=${tracks.length}`,
  );

  console.log(
    "GRAVITY=DEFERRED",
  );
}

main()
  .catch((error) => {
    console.error(
      "VORTEX_SEED=FAILED",
    );

    console.error(
      error instanceof Error
        ? error.message
        : String(error),
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
