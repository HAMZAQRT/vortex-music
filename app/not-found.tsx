import Link from "next/link";

export default function NotFound() {
  return (
    <section className="grid min-h-[60vh] place-items-center py-16">
      <div className="max-w-md text-center">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-violet-400">
          VORTEX 404
        </p>

        <h1 className="mt-3 text-4xl font-black">
          Lost in the Vortex
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/40">
          This page or resource could not be found.
        </p>

        <div className="mt-7 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-white px-6 py-3 text-sm font-black text-black"
          >
            Home
          </Link>

          <Link
            href="/search"
            className="rounded-full border border-white/10 px-6 py-3 text-sm font-black"
          >
            Explore
          </Link>
        </div>
      </div>
    </section>
  );
}
