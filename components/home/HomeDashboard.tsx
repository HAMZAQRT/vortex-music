"use client";

import Link from "next/link";

import {
  tracks,
} from "../../data/tracks";

import {
  albums,
  artists,
  playlists,
} from "../../data/catalog";

import {
  usePlayer,
} from "../../context/PlayerContext";

import {
  useLibrary,
} from "../../context/LibraryContext";

function formatTime(
  seconds: number,
) {
  if (!seconds) {
    return "--:--";
  }

  const value =
    Math.max(
      0,
      Math.round(seconds),
    );

  const minutes =
    Math.floor(value / 60);

  const remaining =
    value % 60;

  return `${minutes}:${remaining
    .toString()
    .padStart(2, "0")}`;
}

export default function HomeDashboard() {
  const {
    currentTrack,
    isPlaying,
    playTrack,
  } = usePlayer();

  const {
    historyTrackIds,
  } = useLibrary();

  const recentTracks =
    historyTrackIds
      .map((id) =>
        tracks.find(
          (track) =>
            track.id === id,
        ),
      )
      .filter(
        (
          track,
        ): track is
          (typeof tracks)[number] =>
          Boolean(track),
      )
      .slice(0, 4);

  return (
    <>
      <header className="flex items-center justify-between py-6">
        <div>
          <p className="text-xs font-black tracking-[0.35em] text-violet-400">
            VORTEX
          </p>

          <h1 className="mt-1 text-2xl font-black">
            Your sound universe
          </h1>
        </div>

        <Link
          href="/profile"
          aria-label="Profile"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/10 font-black"
        >
          V
        </Link>
      </header>

      <section className="relative overflow-hidden rounded-[2rem] border border-violet-500/20 bg-gradient-to-br from-violet-700 via-purple-950 to-[#070709] p-6 shadow-2xl shadow-violet-950/30">

        <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="relative z-10">
          <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
            Vortex Audio
          </span>

          <h2 className="mt-7 max-w-md text-4xl font-black leading-tight">
            Music that actually plays.
          </h2>

          <p className="mt-3 max-w-md text-sm leading-6 text-white/60">
            Licensed audio, persistent library, playlists and synchronized Live Rooms.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                playTrack(
                  tracks[0],
                )
              }
              className="rounded-full bg-white px-6 py-3 text-sm font-black text-black"
            >
              ▶ Play Vortex
            </button>

            <Link
              href="/search"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold"
            >
              Explore
            </Link>

            <Link
              href="/live"
              className="rounded-full border border-red-500/20 bg-red-500/5 px-5 py-3 text-sm font-bold text-red-300"
            >
              ● Live
            </Link>
          </div>
        </div>
      </section>

      {recentTracks.length > 0 && (
        <section className="mt-9">
          <SectionHeading
            eyebrow="Continue"
            title="Recently played"
            href="/library"
          />

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {recentTracks.map(
              (track) => (
                <TrackCard
                  key={
                    track.id
                  }
                  track={
                    track
                  }
                  active={
                    currentTrack.id ===
                    track.id
                  }
                  playing={
                    currentTrack.id ===
                      track.id &&
                    isPlaying
                  }
                  onPlay={() =>
                    playTrack(
                      track,
                    )
                  }
                />
              ),
            )}
          </div>
        </section>
      )}

      <section className="mt-10">
        <SectionHeading
          eyebrow="Discover"
          title="Vortex tracks"
          href="/search"
        />

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tracks.map(
            (track) => (
              <TrackCard
                key={
                  track.id
                }
                track={
                  track
                }
                active={
                  currentTrack.id ===
                  track.id
                }
                playing={
                  currentTrack.id ===
                    track.id &&
                  isPlaying
                }
                onPlay={() =>
                  playTrack(
                    track,
                  )
                }
              />
            ),
          )}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading
          eyebrow="Artists"
          title="Meet the sound"
          href="/search"
        />

        <div className="mt-4 grid grid-cols-3 gap-3">
          {artists.slice(
            0,
            3,
          ).map(
            (artist) => (
              <Link
                key={
                  artist.id
                }
                href={`/artist/${artist.id}`}
                className="min-w-0"
              >
                <div
                  className={`aspect-square rounded-full bg-gradient-to-br ${artist.color} ring-1 ring-white/10`}
                />

                <p className="mt-3 truncate text-center text-sm font-bold">
                  {artist.name}
                </p>
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading
          eyebrow="Albums"
          title="Collections"
          href="/search"
        />

        <div className="mt-4 grid grid-cols-3 gap-3">
          {albums.map(
            (album) => (
              <Link
                key={
                  album.id
                }
                href={`/album/${album.id}`}
                className="min-w-0"
              >
                <div
                  className={`aspect-square rounded-2xl bg-gradient-to-br ${album.color}`}
                />

                <p className="mt-2 truncate text-sm font-bold">
                  {album.title}
                </p>

                <p className="text-xs text-white/30">
                  {album.year}
                </p>
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading
          eyebrow="Your Vortex"
          title="Featured mixes"
          href="/library"
        />

        <div className="mt-4 space-y-3">
          {playlists.map(
            (playlist) => (
              <article
                key={
                  playlist.id
                }
                className="flex items-center gap-4 rounded-3xl border border-white/5 bg-white/[0.025] p-3"
              >
                <div
                  className={`h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br ${playlist.color}`}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-black">
                    {playlist.title}
                  </p>

                  <p className="mt-1 truncate text-xs text-white/35">
                    {playlist.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const first =
                      tracks.find(
                        (track) =>
                          track.id ===
                          playlist
                            .trackIds[0],
                      );

                    if (first) {
                      playTrack(
                        first,
                      );
                    }
                  }}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-black"
                  aria-label={`Play ${playlist.title}`}
                >
                  ▶
                </button>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-2">
        <Link
          href="/live"
          className="rounded-3xl border border-red-500/15 bg-gradient-to-br from-red-500/10 to-purple-500/5 p-5"
        >
          <p className="text-xs font-black uppercase tracking-widest text-red-400">
            ● Vortex Live
          </p>

          <h2 className="mt-3 text-2xl font-black">
            Listen together
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/40">
            Create rooms, host music and synchronize playback.
          </p>
        </Link>

        <Link
          href="/debug"
          className="rounded-3xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 p-5"
        >
          <p className="text-xs font-black uppercase tracking-widest text-emerald-400">
            Diagnostics
          </p>

          <h2 className="mt-3 text-2xl font-black">
            Vortex Debug
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/40">
            Inspect media, performance, auth, network and runtime events.
          </p>
        </Link>
      </section>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-violet-400">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-black">
          {title}
        </h2>
      </div>

      <Link
        href={href}
        className="text-xs font-bold text-white/35"
      >
        See all
      </Link>
    </div>
  );
}

function TrackCard({
  track,
  active,
  playing,
  onPlay,
}: {
  track:
    (typeof tracks)[number];
  active: boolean;
  playing: boolean;
  onPlay: () => void;
}) {
  return (
    <article className="min-w-0">
      <button
        type="button"
        onClick={
          onPlay
        }
        className={`relative block aspect-square w-full overflow-hidden rounded-3xl bg-gradient-to-br ${track.color} p-4 text-left ring-1 ${
          active
            ? "ring-violet-400/50"
            : "ring-white/5"
        }`}
        aria-label={`Play ${track.title}`}
      >
        <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-sm backdrop-blur">
          {playing
            ? "Ⅱ"
            : "▶"}
        </span>

        <span className="absolute bottom-3 left-3 text-3xl font-black text-white/15">
          V
        </span>
      </button>

      <p className="mt-2 truncate text-sm font-bold">
        {track.title}
      </p>

      <p className="truncate text-xs text-white/35">
        {track.artist}
      </p>

      <p className="mt-1 font-mono text-[10px] text-white/20">
        {formatTime(
          track.duration,
        )}
      </p>
    </article>
  );
}
