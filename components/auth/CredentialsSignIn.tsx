"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  signIn,
} from "next-auth/react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

export default function CredentialsSignIn() {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result =
        await signIn(
          "credentials",
          {
            email:
              email
                .trim()
                .toLowerCase(),
            password,
            redirect:
              false,
          },
        );

      if (
        !result ||
        result.error
      ) {
        setError(
          "Invalid email or password.",
        );

        setLoading(false);
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError(
        "Sign in failed. Please try again.",
      );

      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3"
    >
      <input
        type="email"
        autoComplete="email"
        value={email}
        onChange={(
          event,
        ) =>
          setEmail(
            event.target.value,
          )
        }
        placeholder="Email"
        required
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none placeholder:text-white/20 focus:border-violet-500/60"
      />

      <input
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(
          event,
        ) =>
          setPassword(
            event.target.value,
          )
        }
        placeholder="Password"
        required
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none placeholder:text-white/20 focus:border-violet-500/60"
      />

      {error && (
        <p
          aria-live="polite"
          className="text-sm text-red-400"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-violet-600 py-4 text-sm font-black disabled:opacity-40"
      >
        {loading
          ? "Signing in..."
          : "Sign in"}
      </button>

      <div className="flex items-center justify-between gap-4 pt-2 text-xs">
        <Link
          href="/register"
          className="font-black text-violet-300"
        >
          Create account
        </Link>

        <span className="text-white/25">
          Password recovery next
        </span>
      </div>
    </form>
  );
}
