"use client";

export const instant = false;

import Link from "next/link";
import { useParams } from "next/navigation";

import AppShell from "../../../components/AppShell";
import { albums, artists } from "../../../data/catalog";
import { tracks } from "../../../data/tracks";
import { usePlayer } from "../../../context/PlayerContext";

export default function AlbumPage() {
  const params = useParams<{ id: string }>();
  const { playTrack } = usePlayer();

  const album = albums.find(
    (item) => item.id === params.id,
  );

  if (!album) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <h1 className="text-2xl font-black">
            Album not found
          </h1>
        </div>
      </AppShell>
    );
  }

  const artist = artists.find(
    (item) => item.id === album.artistId,
  );

  const albumTracks = tracks.filter((track) =>
    album.trackIds.includes(track.id),
  );

  return (
    <AppShell>
      <header className="pt-6">
        <Link
          href="/explore"
          className="text-sm text-white/40"
        >
          ‹ Back
        </Link>
      </header>

      <section className="pt-6 text-center">
        <div
          className={`mx-auto aspect-square w-full max-w-sm rounded-[2.5rem] bg-gradient-to-br ${album.color} shadow-2xl`}
        />

        <p className="mt-7 text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
          Album
        </p>

        <h1 className="mt-2 text-3xl font-black">
          {album.title}
        </h1>

        {artist && (
          <Link
            href={`/artist/${artist.id}`}
            className="mt-2 inline-block font-semibold text-white/60"
          >
            {artist.name}
          </Link>
        )}

        <p className="mt-1 text-xs text-white/30">
          {album.year} • {albumTracks.length} tracks
        </p>

        {albumTracks[0] && (
          <button
            onClick={() => playTrack(albumTracks[0])}
            className="mt-6 rounded-full bg-white px-8 py-3 font-black text-black"
          >
            ▶ Play album
          </button>
        )}
      </section>

      <section className="mt-8 space-y-2">
        {albumTracks.map((track, index) => (
          <button
            key={track.id}
            onClick={() => playTrack(track)}
            className="flex w-full items-center gap-4 rounded-2xl p-4 text-left hover:bg-white/5"
          >
            <span className="text-white/30">
              {index + 1}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {track.title}
              </p>
              <p className="text-sm text-white/40">
                {track.artist}
              </p>
            </div>

            <span className="text-white/40">
              •••
            </span>
          </button>
        ))}
      </section>
    </AppShell>
  );
}
