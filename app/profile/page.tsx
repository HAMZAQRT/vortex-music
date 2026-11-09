import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#070709] px-5 pb-12 text-white">
      <div className="mx-auto max-w-xl">

        <header className="flex items-center justify-between py-6">
          <Link href="/" className="text-white/50">
            ‹ Back
          </Link>

          <button className="text-white/50">
            Settings
          </button>
        </header>

        <section className="text-center">
          <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-violet-500 via-purple-600 to-blue-600 text-4xl font-black">
            V
          </div>

          <h1 className="mt-5 text-3xl font-black">
            Vortex Listener
          </h1>

          <p className="mt-2 text-sm text-white/40">
            @vortex
          </p>

          <div className="mt-6 flex justify-center gap-10">
            <div>
              <p className="text-xl font-black">18</p>
              <p className="text-xs text-white/40">Following</p>
            </div>

            <div>
              <p className="text-xl font-black">0</p>
              <p className="text-xs text-white/40">Followers</p>
            </div>

            <div>
              <p className="text-xl font-black">8</p>
              <p className="text-xs text-white/40">Playlists</p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Recently played</h2>

          <div className="mt-4 rounded-3xl border border-white/5 bg-white/[0.03] p-5">
            <p className="font-bold">Midnight Echo</p>
            <p className="mt-1 text-sm text-white/40">
              Vortex Originals
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
