import Link from "next/link";
import {
  redirect,
} from "next/navigation";

import {
  auth,
} from "../../auth";

import GitHubSignIn from "../../components/auth/GitHubSignIn";

export default async function LoginPage() {
  const session =
    await auth();

  if (session?.user) {
    redirect(
      "/account",
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070709] px-5 py-10 text-white">

      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[85vh] max-w-md flex-col justify-center">

        <Link
          href="/"
          className="mb-10 text-sm font-bold text-white/35"
        >
          ‹ Back to Vortex
        </Link>

        <div className="mb-8">

          <p className="text-xs font-black tracking-[0.35em] text-violet-400">
            VORTEX IDENTITY
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight">
            Your music.
            <br />
            Your Vortex.
          </h1>

          <p className="mt-4 max-w-sm text-sm leading-6 text-white/40">
            Sign in to sync your identity across the Vortex platform.
          </p>

        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl">

          <GitHubSignIn />

          <div className="my-5 flex items-center gap-3">

            <div className="h-px flex-1 bg-white/5" />

            <span className="text-[10px] font-bold uppercase tracking-wider text-white/20">
              Secure authentication
            </span>

            <div className="h-px flex-1 bg-white/5" />

          </div>

          <div className="grid grid-cols-3 gap-2 text-center">

            <IdentityFeature
              value="AUTH"
              label="Identity"
            />

            <IdentityFeature
              value="JWT"
              label="Session"
            />

            <IdentityFeature
              value="OAUTH"
              label="Provider"
            />

          </div>

        </div>

        <p className="mt-6 text-center text-xs leading-5 text-white/25">
          Authentication is handled through Auth.js.
        </p>

      </div>

    </main>
  );
}

function IdentityFeature({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-black/20 p-3">

      <p className="font-mono text-xs font-black text-violet-300">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-white/25">
        {label}
      </p>

    </div>
  );
}
