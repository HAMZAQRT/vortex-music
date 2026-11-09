"use client";

export const instant = false;

import Link from "next/link";
import { useParams } from "next/navigation";

import AppShell from "../../../components/AppShell";
import { artists, albums } from "../../../data/catalog";
import { tracks } from "../../../data/tracks";
import { usePlayer } from "../../../context/PlayerContext";

export default function ArtistPage() {
  const params = useParams<{ id: string }>();
  const { playTrack } = usePlayer();

  const artist = artists.find(
    (item) => item.id === params.id,
  );

  if (!artist) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <h1 className="text-2xl font-black">
            Artist not found
          </h1>
          <Link
            href="/explore"
            className="mt-4 inline-block text-violet-400"
          >
            Back to Explore
          </Link>
        </div>
      </AppShell>
    );
  }

  const artistAlbums = albums.filter(
    (album) => album.artistId === artist.id,
  );

  const artistTracks = tracks.filter((track) =>
    artistAlbums.some((album) =>
      album.trackIds.includes(track.id),
    ),
  );

  return (
    <AppShell>
      <header className="pt-6">
        <Link
          href="/explore"
          className="text-sm text-white/40"
        >
          ‹ Explore
        </Link>
      </header>

      <section className="mt-6">
        <div
          className={`aspect-[16/10] overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${artist.color} p-7`}
        >
          <div className="flex h-full flex-col justify-end">
            <span className="text-6xl font-black text-white/15">
              V
            </span>

            {artist.verified && (
              <span className="mt-4 w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                ✓ Verified Artist
              </span>
            )}

            <h1 className="mt-3 text-4xl font-black">
              {artist.name}
            </h1>

            <p className="mt-2 text-sm text-white/60">
              {artist.followers} followers
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button className="rounded-full bg-white px-6 py-3 text-sm font-black text-black">
            Follow
          </button>

          {artistTracks[0] && (
            <button
              onClick={() => playTrack(artistTracks[0])}
              className="rounded-full bg-violet-600 px-6 py-3 text-sm font-black"
            >
              ▶ Play
            </button>
          )}
        </div>

        <p className="mt-6 max-w-xl text-sm leading-6 text-white/50">
          {artist.bio}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-black">
          Popular
        </h2>

        <div className="mt-4 space-y-2">
          {artistTracks.map((track, index) => (
            <button
              key={track.id}
              onClick={() => playTrack(track)}
              className="flex w-full items-center gap-4 rounded-2xl p-3 text-left hover:bg-white/5"
            >
              <span className="w-5 text-white/30">
                {index + 1}
              </span>

              <div
                className={`h-12 w-12 rounded-xl bg-gradient-to-br ${track.color}`}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {track.title}
                </p>
                <p className="text-sm text-white/40">
                  {track.album}
                </p>
              </div>

              <span>▶</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-black">
          Albums
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {artistAlbums.map((album) => (
            <Link
              href={`/album/${album.id}`}
              key={album.id}
            >
              <div
                className={`aspect-square rounded-3xl bg-gradient-to-br ${album.color}`}
              />

              <p className="mt-3 font-bold">
                {album.title}
              </p>

              <p className="text-xs text-white/40">
                {album.year}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
