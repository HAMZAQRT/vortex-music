import PeopleSearch from "../../components/social/PeopleSearch";

export default function PeoplePage() {
  return (
    <>
      <header className="py-6">
        <p className="text-xs font-black tracking-[0.35em] text-cyan-400">
          VORTEX SOCIAL
        </p>

        <h1 className="mt-1 text-3xl font-black">
          Find People
        </h1>

        <p className="mt-2 text-sm text-white/35">
          Discover listeners, creators and artists across Vortex.
        </p>
      </header>

      <PeopleSearch />
    </>
  );
}
