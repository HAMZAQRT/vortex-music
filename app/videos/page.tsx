import Link from "next/link";

export default function VideosPage() {
  return (
    <>
      <header className="py-6">
        <p className="text-xs font-black tracking-[0.35em] text-fuchsia-400">
          VORTEX VIDEO
        </p>

        <h1 className="mt-1 text-3xl font-black">
          Visual Sessions
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
          A dedicated home for licensed music videos, visualizers and live sessions.
        </p>
      </header>

      <section className="relative overflow-hidden rounded-[2rem] border border-fuchsia-500/15 bg-gradient-to-br from-fuchsia-500/10 via-purple-500/5 to-cyan-500/5 p-6">

        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-fuchsia-500/15 blur-3xl" />

        <div className="relative">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-fuchsia-300">
            Media-ready
          </span>

          <h2 className="mt-6 max-w-md text-3xl font-black">
            Vortex Video is ready for real media.
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-6 text-white/40">
            No unlicensed or fake videos are published. Add licensed MP4 or WebM media to activate the catalog.
          </p>

          <Link
            href="/explore"
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-black text-black"
          >
            Back to Explore
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          [
            "Music Videos",
            "Official visuals and licensed releases.",
            "from-fuchsia-500/15 to-purple-500/5",
          ],
          [
            "Live Sessions",
            "Recorded rooms and performances.",
            "from-red-500/15 to-orange-500/5",
          ],
          [
            "Visualizers",
            "Motion experiences built around Vortex audio.",
            "from-cyan-500/15 to-blue-500/5",
          ],
        ].map(
          ([
            title,
            description,
            color,
          ]) => (
            <article
              key={
                title
              }
              className={`rounded-3xl border border-white/5 bg-gradient-to-br ${color} p-5`}
            >
              <div className="grid aspect-video place-items-center rounded-2xl bg-black/20 text-3xl text-white/20">
                ▶
              </div>

              <h2 className="mt-4 font-black">
                {title}
              </h2>

              <p className="mt-2 text-xs leading-5 text-white/35">
                {
                  description
                }
              </p>
            </article>
          ),
        )}
      </section>
    </>
  );
}
