"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  CldUploadWidget,
} from "next-cloudinary";

type UploadInfo = {
  secure_url?: string;
};

export default function AvatarUpload({
  name,
  username,
  bio,
}: {
  name: string;
  username: string;
  bio: string;
}) {
  const router =
    useRouter();

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  async function save(
    image: string,
  ) {
    setSaving(true);
    setError("");

    try {
      const response =
        await fetch(
          "/api/account/profile",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name,
              username,
              bio,
              image,
            }),
          },
        );

      const payload =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to save photo",
        );
      }

      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Photo upload failed",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4">

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
            "vortex/avatars",

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
            typeof result.info !==
              "object" ||
            !result.info
          ) {
            return;
          }

          const info =
            result.info as
              UploadInfo;

          if (
            info.secure_url
          ) {
            void save(
              info.secure_url,
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
            disabled={saving}
            className="rounded-full border border-violet-500/20 bg-violet-500/10 px-5 py-3 text-xs font-black text-violet-300 disabled:opacity-40"
          >
            {saving
              ? "Saving..."
              : "Upload Photo"}
          </button>
        )}
      </CldUploadWidget>

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}

    </div>
  );
}
