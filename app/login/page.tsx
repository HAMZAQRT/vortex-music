import {
  connection,
} from "next/server";

import {
  redirect,
} from "next/navigation";

import {
  auth,
} from "../../auth";

import CredentialsSignIn from "../../components/auth/CredentialsSignIn";

export const instant = false;

export default async function LoginPage() {
  await connection();

  const session =
    await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070709] px-5 py-10 text-white">

      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[85vh] max-w-md flex-col justify-center">

        <p className="text-xs font-black tracking-[0.35em] text-violet-400">
          VORTEX
        </p>

        <h1 className="mt-3 text-4xl font-black leading-tight">
          Enter your
          <br />
          sound universe.
        </h1>

        <p className="mt-4 max-w-sm text-sm leading-6 text-white/40">
          Sign in with your Vortex account to continue.
        </p>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl">
          <CredentialsSignIn />
        </div>

        <p className="mt-6 text-center text-xs text-white/20">
          Vortex Identity
        </p>

      </div>
    </main>
  );
}
