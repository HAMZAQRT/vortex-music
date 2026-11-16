(() => {
  const apiBase =
    window.VORTEX_CONFIG
      ?.apiBase ??
    "";

  function token() {
    return window.VortexAuth
      ?.getToken?.() ??
      null;
  }

  function authHeaders() {
    const value =
      token();

    return value
      ? {
          Authorization:
            `Bearer ${value}`
        }
      : {};
  }

  async function creatorCatalog() {
    const response =
      await fetch(
        `${apiBase}/api/mobile/creator/catalog`,
        {
          headers: {
            Accept:
              "application/json",
            ...authHeaders()
          }
        }
      );

    const payload =
      await response.json();

    if (!response.ok) {
      throw new Error(
        payload.error ||
        "Creator catalog unavailable"
      );
    }

    return payload;
  }

  async function signature(
    kind
  ) {
    const response =
      await fetch(
        `${apiBase}/api/mobile/media/sign`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            ...authHeaders()
          },

          body:
            JSON.stringify({
              kind
            })
        }
      );

    const payload =
      await response.json();

    if (!response.ok) {
      throw new Error(
        payload.error ||
        "Unable to authorize upload"
      );
    }

    return payload;
  }

  function xhrUpload(
    file,
    resourceType,
    kind,
    onProgress
  ) {
    return new Promise(
      async (
        resolve,
        reject
      ) => {
        try {
          const signed =
            await signature(
              kind
            );

          const timestamp =
            signed.timestamp;

          const folder =
            signed.folder;

          const form =
            new FormData();

          form.append(
            "file",
            file
          );

          form.append(
            "api_key",
            signed.apiKey
          );

          form.append(
            "timestamp",
            String(
              timestamp
            )
          );

          form.append(
            "folder",
            folder
          );

          form.append(
            "signature",
            signed.signature
          );

          const endpoint =
            `https://api.cloudinary.com/v1_1/${encodeURIComponent(
              signed.cloudName
            )}/${resourceType}/upload`;

          const xhr =
            new XMLHttpRequest();

          xhr.open(
            "POST",
            endpoint
          );

          xhr.upload.onprogress =
            (event) => {
              if (
                event.lengthComputable &&
                onProgress
              ) {
                onProgress(
                  Math.round(
                    (
                      event.loaded /
                      event.total
                    ) *
                      100
                  )
                );
              }
            };

          xhr.onerror =
            () =>
              reject(
                new Error(
                  "Media upload failed"
                )
              );

          xhr.onload =
            () => {
              let payload = {};

              try {
                payload =
                  JSON.parse(
                    xhr.responseText
                  );
              } catch {
                payload = {};
              }

              if (
                xhr.status < 200 ||
                xhr.status >= 300
              ) {
                reject(
                  new Error(
                    payload.error
                      ?.message ||
                    "Cloudinary rejected upload"
                  )
                );

                return;
              }

              resolve(
                payload
              );
            };

          xhr.send(
            form
          );
        } catch (error) {
          reject(error);
        }
      }
    );
  }

  async function createTrack(
    data
  ) {
    const response =
      await fetch(
        `${apiBase}/api/mobile/creator/tracks`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            ...authHeaders()
          },

          body:
            JSON.stringify(
              data
            )
        }
      );

    const payload =
      await response.json();

    if (!response.ok) {
      throw new Error(
        payload.error ||
        "Unable to create track"
      );
    }

    return payload.track;
  }

  function audioDuration(
    file
  ) {
    return new Promise(
      (resolve, reject) => {
        const audio =
          document.createElement(
            "audio"
          );

        const url =
          URL.createObjectURL(
            file
          );

        const cleanup =
          () => {
            URL.revokeObjectURL(
              url
            );
          };

        audio.preload =
          "metadata";

        audio.onloadedmetadata =
          () => {
            const duration =
              Number(
                audio.duration
              );

            cleanup();

            if (
              Number.isFinite(
                duration
              ) &&
              duration > 0
            ) {
              resolve(
                duration
              );
            } else {
              reject(
                new Error(
                  "Unable to read audio duration"
                )
              );
            }
          };

        audio.onerror =
          () => {
            cleanup();

            reject(
              new Error(
                "Invalid audio file"
              )
            );
          };

        audio.src = url;
      }
    );
  }

  window.VortexCreator = {
    creatorCatalog,
    uploadImage(
      file,
      progress
    ) {
      return xhrUpload(
        file,
        "image",
        "cover",
        progress
      );
    },

    uploadAudio(
      file,
      progress
    ) {
      /*
       * Cloudinary manages audio together
       * with video/audio media assets.
       */
      return xhrUpload(
        file,
        "video",
        "audio",
        progress
      );
    },

    createTrack,
    audioDuration
  };
})();
