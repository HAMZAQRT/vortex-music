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

export default function RegisterForm() {
  const router =
    useRouter();

  const [name, setName] =
    useState("");

  const [
    username,
    setUsername,
  ] =
    useState("");

  const [email, setEmail] =
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

  const [error, setError] =
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
      const response =
        await fetch(
          "/api/account/register",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name,
              username,
              email,
              password,
            }),
          },
        );

      const payload =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        setError(
          payload.error ||
            "Unable to create account.",
        );

        setLoading(false);
        return;
      }

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
        router.replace(
          "/login",
        );
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError(
        "Account creation failed.",
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
        value={name}
        onChange={(
          event,
        ) =>
          setName(
            event.target.value,
          )
        }
        minLength={2}
        maxLength={60}
        placeholder="Display name"
        autoComplete="name"
        required
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none placeholder:text-white/20"
      />

      <input
        value={username}
        onChange={(
          event,
        ) =>
          setUsername(
            event.target.value
              .toLowerCase()
              .replace(
                /[^a-z0-9_]/g,
                "",
              )
              .slice(
                0,
                24,
              ),
          )
        }
        minLength={3}
        maxLength={24}
        placeholder="username"
        autoComplete="username"
        required
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none placeholder:text-white/20"
      />

      <input
        type="email"
        value={email}
        onChange={(
          event,
        ) =>
          setEmail(
            event.target.value,
          )
        }
        placeholder="Email"
        autoComplete="email"
        required
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none placeholder:text-white/20"
      />

      <input
        type="password"
        value={password}
        onChange={(
          event,
        ) =>
          setPassword(
            event.target.value,
          )
        }
        minLength={10}
        placeholder="Password · 10+ characters"
        autoComplete="new-password"
        required
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none placeholder:text-white/20"
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
        className="w-full rounded-2xl bg-white py-4 text-sm font-black text-black disabled:opacity-40"
      >
        {loading
          ? "Creating Vortex..."
          : "Create Vortex account"}
      </button>

      <p className="pt-2 text-center text-xs text-white/30">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-black text-violet-300"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
