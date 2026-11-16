(() => {
  const CACHE_KEY =
    "vortex.catalogCache.v4";

  const apiBase =
    window.VORTEX_CONFIG
      ?.apiBase ??
    "";

  let remoteTracks =
    [];

  function absoluteUrl(
    value
  ) {
    if (!value) {
      return null;
    }

    try {
      return new URL(
        value,
        apiBase
      ).href;
    } catch {
      return null;
    }
  }

  function normalizeTrack(
    track
  ) {
    const streamUrl =
      typeof track.audioUrl ===
        "string"
        ? track.audioUrl.trim()
        : "";

    /*
     * Mobile catalog rule:
     * no published entry without real HTTPS media.
     */
    if (
      !streamUrl.startsWith(
        "https://"
      )
    ) {
      return null;
    }

    let coverUrl =
      null;

    if (
      typeof track.cover ===
        "string" &&
      track.cover.trim()
    ) {
      try {
        coverUrl =
          new URL(
            track.cover,
            apiBase
          ).href;
      } catch {
        coverUrl =
          null;
      }
    }

    return {
      id:
        `remote:${track.id}`,

      remoteId:
        track.id,

      title:
        track.title,

      artist:
        track.artist?.name ??
        "Vortex Artist",

      artistId:
        track.artist?.id ??
        null,

      album:
        track.album?.title ??
        null,

      albumId:
        track.album?.id ??
        null,

      coverUrl,
      cover:
        coverUrl,

      streamUrl,

      remoteUrl:
        streamUrl,

      src:
        streamUrl,

      duration:
        Number(
          track.duration ??
          0
        ),

      source:
        "remote",

      playable:
        true,

      downloadable:
        true
    };
  }

  function getCached() {
    try {
      const value =
        localStorage.getItem(
          CACHE_KEY
        );

      if (!value) {
        return [];
      }

      const parsed =
        JSON.parse(
          value
        );

      return Array.isArray(
        parsed
      )
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  function setCached(
    tracks
  ) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify(
          tracks
        )
      );
    } catch {
      // Cache failure must not break Vortex.
    }
  }

  async function fetchCatalog() {
    const response =
      await fetch(
        `${apiBase}/api/mobile/catalog`,
        {
          headers: {
            Accept:
              "application/json"
          }
        }
      );

    if (!response.ok) {
      throw new Error(
        "Catalog unavailable"
      );
    }

    const payload =
      await response.json();

    remoteTracks =
      (
        payload.tracks ||
        []
      )
        .map(
          normalizeTrack
        )
        .filter(
          Boolean
        );

    setCached(
      remoteTracks
    );

    return {
      tracks:
        remoteTracks,

      artists:
        payload.artists ||
        [],

      albums:
        payload.albums ||
        []
    };
  }

  function cachedTracks() {
    remoteTracks =
      getCached();

    return remoteTracks;
  }

  async function search(
    query
  ) {
    const clean =
      query.trim();

    if (
      clean.length < 2
    ) {
      return {
        tracks: [],
        artists: []
      };
    }

    const response =
      await fetch(
        `${apiBase}/api/mobile/search?q=${encodeURIComponent(
          clean
        )}`
      );

    if (!response.ok) {
      throw new Error(
        "Search unavailable"
      );
    }

    const payload =
      await response.json();

    return {
      tracks:
        (
          payload.tracks ||
          []
        )
          .map(
            normalizeTrack
          )
          .filter(
            (track) =>
              Boolean(
                track.remoteUrl
              )
          ),

      artists:
        payload.artists ||
        []
    };
  }

  window.VortexCatalog = {
    fetchCatalog,
    cachedTracks,
    search
  };
})();
