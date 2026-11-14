"use client";

import {
  useEffect,
  useState,
} from "react";

import MediaUploader from "./MediaUploader";

export default function CreatorStudio({
  role,
}: {
  role: string;
}) {
  const [
    configured,
    setConfigured,
  ] =
    useState<
      boolean | null
    >(null);

  useEffect(() => {
    let active = true;

    void fetch(
      "/api/media/health",
      {
        cache: "no-store",
      },
    )
      .then(
        (response) =>
          response.json(),
      )
      .then(
        (
          payload: {
            configured?: boolean;
          },
        ) => {
          if (active) {
            setConfigured(
              Boolean(
                payload.configured,
              ),
            );
          }
        },
      )
      .catch(() => {
        if (active) {
          setConfigured(
            false,
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <header className="py-6">

        <p className="text-xs font-black tracking-[0.35em] text-orange-400">
          VORTEX CREATOR
        </p>

        <h1 className="mt-1 text-3xl font-black">
          Creator Studio
        </h1>

        <p className="mt-2 text-sm text-white/35">
          Upload and prepare music for Vortex.
        </p>

      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">

        <Metric
          label="Role"
          value={role}
        />

        <Metric
          label="Storage"
          value={
            configured ===
            null
              ? "CHECKING"
              : configured
                ? "READY"
                : "OFFLINE"
          }
        />

        <Metric
          label="Upload"
          value={
            configured
              ? "SIGNED"
              : "-"
          }
        />

      </section>

      {configured ===
        false && (
        <div className="mt-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm text-amber-300">
          Cloudinary is not configured for this deployment.
        </div>
      )}

      {configured && (
        <MediaUploader />
      )}

    </>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">

      <p className="text-[10px] font-black uppercase tracking-widest text-white/25">
        {label}
      </p>

      <p className="mt-2 font-mono text-sm font-black">
        {value}
      </p>

    </div>
  );
}
