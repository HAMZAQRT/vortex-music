"use client";

import {
  useState,
} from "react";

import {
  CldUploadWidget,
} from "next-cloudinary";

type MediaInfo = {
  secure_url?: string;
  duration?: number;
};

export default function MediaUploader() {
  const [
    coverUrl,
    setCoverUrl,
  ] =
    useState("");

  const [
    audioUrl,
    setAudioUrl,
  ] =
    useState("");

  const [
    duration,
    setDuration,
  ] =
    useState(0);

  return (
    <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">

      <p className="text-xs font-black uppercase tracking-widest text-violet-400">
        New Release
      </p>

      <h2 className="mt-2 text-2xl font-black">
        Upload Media
      </h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">

        <CldUploadWidget
          signatureEndpoint="/api/media/sign"
          options={{
            multiple: false,
            maxFiles: 1,
            sources: [
              "local",
              "camera",
            ],
            resourceType:
              "image",
            folder:
              "vortex/covers",
            clientAllowedFormats: [
              "jpg",
              "jpeg",
              "png",
              "webp",
            ],
          }}
          onSuccess={(
            result,
          ) => {
            if (
              typeof result.info ===
                "object" &&
              result.info
            ) {
              const info =
                result.info as MediaInfo;

              setCoverUrl(
                info.secure_url ??
                  "",
              );
            }
          }}
        >
          {({
            open,
          }) => (
            <button
              type="button"
              onClick={() =>
                open()
              }
              className="rounded-3xl border border-white/10 bg-black/20 p-5 text-left"
            >
              <p className="text-xs font-black text-pink-400">
                COVER
              </p>

              <p className="mt-2 font-bold">
                {coverUrl
                  ? "Ready ✓"
                  : "Choose Image"}
              </p>
            </button>
          )}
        </CldUploadWidget>

        <CldUploadWidget
          signatureEndpoint="/api/media/sign"
          options={{
            multiple: false,
            maxFiles: 1,
            sources: [
              "local",
            ],
            resourceType:
              "video",
            folder:
              "vortex/audio",
            clientAllowedFormats: [
              "mp3",
              "m4a",
              "wav",
              "ogg",
            ],
          }}
          onSuccess={(
            result,
          ) => {
            if (
              typeof result.info ===
                "object" &&
              result.info
            ) {
              const info =
                result.info as MediaInfo;

              setAudioUrl(
                info.secure_url ??
                  "",
              );

              setDuration(
                Number(
                  info.duration ??
                    0,
                ),
              );
            }
          }}
        >
          {({
            open,
          }) => (
            <button
              type="button"
              onClick={() =>
                open()
              }
              className="rounded-3xl border border-white/10 bg-black/20 p-5 text-left"
            >
              <p className="text-xs font-black text-cyan-400">
                AUDIO
              </p>

              <p className="mt-2 font-bold">
                {audioUrl
                  ? "Ready ✓"
                  : "Choose Audio"}
              </p>
            </button>
          )}
        </CldUploadWidget>

      </div>

      {audioUrl && (
        <audio
          controls
          preload="metadata"
          src={audioUrl}
          className="mt-5 w-full"
        />
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">

        <div className="rounded-2xl bg-black/30 p-3">
          <p className="text-[10px] uppercase text-white/25">
            Cover
          </p>

          <p className="mt-1 truncate font-mono text-xs">
            {coverUrl
              ? "UPLOADED"
              : "EMPTY"}
          </p>
        </div>

        <div className="rounded-2xl bg-black/30 p-3">
          <p className="text-[10px] uppercase text-white/25">
            Duration
          </p>

          <p className="mt-1 font-mono text-xs">
            {duration > 0
              ? `${Math.round(
                  duration,
                )}s`
              : "-"}
          </p>
        </div>

      </div>

    </section>
  );
}
