"use client";

export const instant = false;

import Link from "next/link";
import { useParams } from "next/navigation";

import AppShell from "../../../components/AppShell";
import { playlists } from "../../../data/catalog";
import { tracks } from "../../../data/tracks";
import { usePlayer } from "../../../context/PlayerContext";

export default function PlaylistPage() {
  const params = useParams<{ id: string }>();
  const { playTrack } = usePlayer();

  const playlist = playlists.find(
    (item) => item.id === params.id,
  );

  if (!playlist) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <h1 className="text-2xl font-black">
            Playlist not found
          </h1>
        </div>
      </AppShell>
    );
  }

  const playlistTracks = playlist.trackIds
    .map((id) => tracks.find((track) => track.id === id))
    .filter((track) => track !== undefined);

  return (
    <AppShell>
      <header className="pt-6">
        <Link
          href="/library"
          className="text-sm text-white/40"
        >
          ‹ Library
        </Link>
      </header>

      <section className="pt-6">
        <div
          className={`aspect-square w-full max-w-sm rounded-[2.5rem] bg-gradient-to-br ${playlist.color}`}
        />

        <p className="mt-7 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
          Vortex Playlist
        </p>

        <h1 className="mt-2 text-3xl font-black">
          {playlist.title}
        </h1>

        <p className="mt-3 max-w-lg text-sm leading-6 text-white/45">
          {playlist.description}
        </p>

        {playlistTracks[0] && (
          <button
            onClick={() => playTrack(playlistTracks[0])}
            className="mt-6 rounded-full bg-white px-8 py-3 font-black text-black"
          >
            ▶ Play
          </button>
        )}
      </section>

      <section className="mt-8 space-y-2">
        {playlistTracks.map((track, index) => (
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

              <p className="truncate text-sm text-white/40">
                {track.artist}
              </p>
            </div>

            <span>▶</span>
          </button>
        ))}
      </section>
    </AppShell>
  );
}
