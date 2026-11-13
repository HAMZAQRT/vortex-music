import {
  connection,
} from "next/server";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  auth,
} from "../../auth";

import RegisterForm from "../../components/auth/RegisterForm";

export const instant = false;

export default async function RegisterPage() {
  await connection();

  const session =
    await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#070709] px-5 py-10 text-white">

      <div className="mx-auto flex min-h-[85vh] max-w-md flex-col justify-center">

        <Link
          href="/login"
          className="mb-10 text-sm font-bold text-white/35"
        >
          ‹ Sign in
        </Link>

        <p className="text-xs font-black tracking-[0.35em] text-violet-400">
          VORTEX IDENTITY
        </p>

        <h1 className="mt-3 text-4xl font-black">
          Create your identity.
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/40">
          Your music, playlists, profile and Live presence start here.
        </p>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <RegisterForm />
        </div>

      </div>
    </main>
  );
}
