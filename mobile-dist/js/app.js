let tracks = [
      {
        id: "alls-fair-in-love",
        title: "Alls Fair In Love",
        artist: "FreePD",
        src: "./audio/alls-fair-in-love.mp3",
        source: "bundled"
      },
      {
        id: "attic-secrets",
        title: "Attic Secrets",
        artist: "FreePD",
        src: "./audio/attic-secrets.mp3",
        source: "bundled"
      },
      {
        id: "barnville",
        title: "Barnville",
        artist: "FreePD",
        src: "./audio/barnville.mp3",
        source: "bundled"
      },
      {
        id: "baltic-levity",
        title: "Baltic Levity",
        artist: "FreePD",
        src: "./audio/baltic-levity.mp3",
        source: "bundled"
      }
    ];

    let playing = false;
    let currentTrack = tracks[0];

    const SAVED_KEY =
      "vortex.savedTracks";

    let savedIds = [];

    try {
      savedIds =
        JSON.parse(
          localStorage.getItem(
            SAVED_KEY
          ) || "[]"
        );
    } catch {
      savedIds = [];
    }

    const saved =
      new Set(
        Array.isArray(
          savedIds
        )
          ? savedIds
          : []
      );
    const views =
      [...document.querySelectorAll(
        ".view"
      )];

    const navButtons =
      [...document.querySelectorAll(
        ".nav button"
      )];

    function openRoute(route) {
      const authRoute =
        route === "login" ||
        route === "register";

      document.querySelector(
        ".nav"
      ).style.display =
        authRoute
          ? "none"
          : "grid";

      if (authRoute) {
        document.getElementById(
          "miniPlayer"
        ).classList.remove(
          "show"
        );
      }

      views.forEach((view) => {
        view.classList.toggle(
          "active",
          view.id === route
        );
      });

      navButtons.forEach(
        (button) => {
          button.classList.toggle(
            "active",
            button.dataset.route ===
              route
          );
        }
      );

      window.scrollTo({
        top: 0,
        behavior: "instant"
      });
    }

    document
      .querySelectorAll(
        "[data-route]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            openRoute(
              button.dataset.route
            );
          }
        );
      });

    function persistSaved() {
      localStorage.setItem(
        SAVED_KEY,
        JSON.stringify(
          [...saved]
        )
      );
    }

    function renderTracks(
      targetId,
      source
    ) {
      const target =
        document.getElementById(
          targetId
        );

      target.innerHTML = "";

      source.forEach(
        (track, index) => {
          const row =
            document.createElement(
              "div"
            );

          row.className = "track";

          row.innerHTML = `
            <button
              type="button"
              class="track-main"
              aria-label="Play ${track.title}"
              style="
                all:unset;
                display:contents;
                cursor:pointer;
              "
            >
              <div
                class="cover"
                ${
                  track.cover
                    ? `style="
                        background-image:url('${track.cover}');
                        background-size:cover;
                        background-position:center;
                      "`
                    : ""
                }
              >
                ${
                  track.cover
                    ? ""
                    : index + 1
                }
              </div>

              <div>
                <div class="track-name">
                  ${track.title}
                </div>

                <div class="track-artist">
                  ${track.artist}
                </div>
              </div>
            </button>

            <button
              type="button"
              class="more save-track ${
                saved.has(track.id)
                  ? "saved"
                  : ""
              }"
              aria-label="Save ${track.title}"
            >
              ${
                saved.has(
                  track.id
                )
                  ? "♥"
                  : "♡"
              }
            </button>

            ${
              track.remoteId &&
              track.downloadable !== false
                ? `
                  <button
                    type="button"
                    class="download-track ${
                      track.downloaded
                        ? "done"
                        : ""
                    }"
                    aria-label="${
                      track.downloaded
                        ? `Remove offline ${track.title}`
                        : `Download ${track.title}`
                    }"
                  >
                    ${
                      track.downloaded
                        ? "✓"
                        : "↓"
                    }
                  </button>
                `
                : ""
            }
          `;

          row
            .querySelector(
              ".track-main"
            )
            .addEventListener(
              "click",
              () => {
                void playTrack(
                  track
                );
              }
            );

          row
            .querySelector(
              ".save-track"
            )
            .addEventListener(
              "click",
              () => {
                if (
                  saved.has(
                    track.id
                  )
                ) {
                  saved.delete(
                    track.id
                  );
                } else {
                  saved.add(
                    track.id
                  );
                }

                persistSaved();
                refreshLibrary();

                renderTracks(
                  "trackList",
                  tracks
                );

                renderTracks(
                  "exploreTracks",
                  getExploreResults()
                );
              }
            );

          const downloadButton =
            row.querySelector(
              ".download-track"
            );

          if (downloadButton) {
            downloadButton
              .addEventListener(
                "click",
                () => {
                  void toggleOfflineTrack(
                    track,
                    downloadButton
                  );
                }
              );
          }

          target.appendChild(
            row
          );
        }
      );
    }

    function getExploreResults() {
      const input =
        document.getElementById(
          "exploreSearch"
        );

      const query =
        input.value
          .trim()
          .toLowerCase();

      if (!query) {
        return tracks;
      }

      return tracks.filter(
        (track) =>
          track.title
            .toLowerCase()
            .includes(query) ||
          track.artist
            .toLowerCase()
            .includes(query)
      );
    }

    function refreshLibrary() {
      const container =
        document.getElementById(
          "libraryContent"
        );

      const likedTracks =
        tracks.filter(
          (track) =>
            saved.has(
              track.id
            )
        );

      if (
        likedTracks.length ===
        0
      ) {
        container.className =
          "empty";

        container.innerHTML =
          "Nothing saved yet.";

        return;
      }

      container.className =
        "track-list";

      container.innerHTML =
        "";

      likedTracks.forEach(
        (track, index) => {
          const row =
            document.createElement(
              "button"
            );

          row.type = "button";
          row.className = "track";

          row.innerHTML = `
            <div class="cover">
              ${index + 1}
            </div>

            <div>
              <div class="track-name">
                ${track.title}
              </div>

              <div class="track-artist">
                ${track.artist}
              </div>
            </div>

            <div class="more">
              ▶
            </div>
          `;

          row.addEventListener(
            "click",
            () => {
              void playTrack(
                track
              );
            }
          );

          container.appendChild(
            row
          );
        }
      );
    }

    const audio =
      document.getElementById(
        "audio"
      );

    async function playTrack(track) {
      currentTrack = track;

      if (
        audio.getAttribute("src") !==
        track.src
      ) {
        audio.src = track.src;
        audio.load();
      }

      document.getElementById(
        "miniPlayer"
      ).classList.add("show");

      document.getElementById(
        "miniTitle"
      ).textContent =
        track.title;

      document.getElementById(
        "miniArtist"
      ).textContent =
        track.artist;

      try {
        await audio.play();
      } catch (error) {
        console.error(
          "Vortex audio playback failed",
          error
        );
      }
    }

    document.getElementById(
      "heroPlay"
    ).addEventListener(
      "click",
      () => playTrack(
        tracks[0]
      )
    );

    function getCurrentIndex() {
      const index =
        tracks.findIndex(
          (track) =>
            track.id ===
            currentTrack.id
        );

      return index >= 0
        ? index
        : 0;
    }

    function playNext() {
      const index =
        getCurrentIndex();

      const next =
        tracks[
          (index + 1) %
          tracks.length
        ];

      void playTrack(next);
    }

    function playPrevious() {
      const index =
        getCurrentIndex();

      if (
        audio.currentTime > 3
      ) {
        audio.currentTime = 0;
        return;
      }

      const previous =
        tracks[
          (
            index -
            1 +
            tracks.length
          ) %
          tracks.length
        ];

      void playTrack(
        previous
      );
    }

    document.getElementById(
      "nextButton"
    ).addEventListener(
      "click",
      playNext
    );

    document.getElementById(
      "previousButton"
    ).addEventListener(
      "click",
      playPrevious
    );

    document.getElementById(
      "pauseButton"
    ).addEventListener(
      "click",
      async () => {
        if (!audio.src) {
          await playTrack(
            currentTrack
          );
          return;
        }

        if (audio.paused) {
          try {
            await audio.play();
          } catch (error) {
            console.error(
              "Vortex resume failed",
              error
            );
          }
        } else {
          audio.pause();
        }
      }
    );

    audio.addEventListener(
      "play",
      () => {
        playing = true;

        document.getElementById(
          "pauseButton"
        ).textContent = "Ⅱ";
      }
    );

    audio.addEventListener(
      "pause",
      () => {
        playing = false;

        document.getElementById(
          "pauseButton"
        ).textContent = "▶";
      }
    );

    audio.addEventListener(
      "timeupdate",
      () => {
        const duration =
          audio.duration;

        const percent =
          Number.isFinite(
            duration
          ) &&
          duration > 0
            ? Math.min(
                100,
                Math.max(
                  0,
                  (
                    audio.currentTime /
                    duration
                  ) * 100
                )
              )
            : 0;

        document.getElementById(
          "miniProgress"
        ).style.width =
          `${percent}%`;
      }
    );

    audio.addEventListener(
      "ended",
      playNext
    );

    function connectSearch(
      inputId
    ) {
      const input =
        document.getElementById(
          inputId
        );

      input.addEventListener(
        "input",
        () => {
          const q =
            input.value
              .trim()
              .toLowerCase();

          const results =
            tracks.filter(
              (track) =>
                track.title
                  .toLowerCase()
                  .includes(q) ||
                track.artist
                  .toLowerCase()
                  .includes(q)
            );

          if (
            inputId ===
            "homeSearch" &&
            q
          ) {
            openRoute(
              "explore"
            );

            document.getElementById(
              "exploreSearch"
            ).value =
              input.value;

            renderTracks(
              "exploreTracks",
              results
            );
          } else if (
            inputId ===
            "exploreSearch"
          ) {
            renderTracks(
              "exploreTracks",
              q
                ? results
                : tracks
            );
          }
        }
      );
    }

    refreshLibrary();

    renderTracks(
      "trackList",
      tracks
    );

    renderTracks(
      "exploreTracks",
      tracks
    );

    connectSearch(
      "homeSearch"
    );

    connectSearch(
      "exploreSearch"
    );

/*
 * Vortex Mobile Identity
 */

const loginForm =
  document.getElementById(
    "loginForm"
  );

const registerForm =
  document.getElementById(
    "registerForm"
  );

const showRegister =
  document.getElementById(
    "showRegister"
  );

const showLogin =
  document.getElementById(
    "showLogin"
  );

function setAuthError(
  id,
  message
) {
  const element =
    document.getElementById(
      id
    );

  if (!element) {
    return;
  }

  element.textContent =
    message || "";

  element.style.display =
    message
      ? "block"
      : "none";
}

function renderMobileUser(
  user
) {
  if (!user) {
    return;
  }

  const name =
    user.name ||
    "Vortex User";

  const username =
    user.username
      ? `@${user.username}`
      : "@vortex";

  const nameElement =
    document.querySelector(
      ".profile-name"
    );

  const usernameElement =
    document.querySelector(
      ".profile-user"
    );

  const avatar =
    document.querySelector(
      ".profile-avatar"
    );

  if (nameElement) {
    nameElement.textContent =
      name;
  }

  if (usernameElement) {
    usernameElement.textContent =
      username;
  }

  if (avatar) {
    avatar.textContent =
      name
        .slice(0, 1)
        .toUpperCase();
  }

  const creatorEntry =
    document.getElementById(
      "creatorProfileEntry"
    );

  if (creatorEntry) {
    creatorEntry.hidden = true;
  }

  const stats =
    user.stats ||
    {};

  const followersElement =
    document.getElementById(
      "profileFollowers"
    );

  const followingElement =
    document.getElementById(
      "profileFollowing"
    );

  const playlistsElement =
    document.getElementById(
      "profilePlaylists"
    );

  if (followersElement) {
    followersElement.textContent =
      String(
        stats.followers ??
        0
      );
  }

  if (followingElement) {
    followingElement.textContent =
      String(
        stats.following ??
        0
      );
  }

  if (playlistsElement) {
    playlistsElement.textContent =
      String(
        stats.playlists ??
        0
      );
  }

}

if (showRegister) {
  showRegister.addEventListener(
    "click",
    () => {
      openRoute(
        "register"
      );
    }
  );
}

if (showLogin) {
  showLogin.addEventListener(
    "click",
    () => {
      openRoute(
        "login"
      );
    }
  );
}

if (loginForm) {
  loginForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      setAuthError(
        "loginError",
        ""
      );

      const button =
        document.getElementById(
          "loginSubmit"
        );

      button.disabled =
        true;

      button.textContent =
        "Signing in...";

      try {
        const email =
          document.getElementById(
            "loginEmail"
          ).value
            .trim()
            .toLowerCase();

        const password =
          document.getElementById(
            "loginPassword"
          ).value;

        const user =
          await window
            .VortexAuth
            .login(
              email,
              password
            );

        renderMobileUser(
          user
        );

        openRoute(
          "home"
        );
      } catch (error) {
        setAuthError(
          "loginError",
          error instanceof Error
            ? error.message
            : "Sign in failed"
        );
      } finally {
        button.disabled =
          false;

        button.textContent =
          "Sign in";
      }
    }
  );
}

if (registerForm) {
  registerForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      setAuthError(
        "registerError",
        ""
      );

      const button =
        document.getElementById(
          "registerSubmit"
        );

      button.disabled =
        true;

      button.textContent =
        "Creating...";

      try {
        const user =
          await window
            .VortexAuth
            .register({
              name:
                document.getElementById(
                  "registerName"
                ).value.trim(),

              username:
                document.getElementById(
                  "registerUsername"
                ).value
                  .trim()
                  .toLowerCase(),

              email:
                document.getElementById(
                  "registerEmail"
                ).value
                  .trim()
                  .toLowerCase(),

              password:
                document.getElementById(
                  "registerPassword"
                ).value
            });

        renderMobileUser(
          user
        );

        openRoute(
          "home"
        );
      } catch (error) {
        setAuthError(
          "registerError",
          error instanceof Error
            ? error.message
            : "Registration failed"
        );
      } finally {
        button.disabled =
          false;

        button.textContent =
          "Create account";
      }
    }
  );
}

async function bootVortexIdentity() {
  try {
    if (
      !window.VortexNative ||
      !window.VortexAuth
    ) {
      throw new Error(
        "Vortex mobile runtime is unavailable"
      );
    }

    /*
     * Read Android native session BEFORE
     * showing Login or Home.
     */
    const session =
      await window.VortexAuth
        .hydrate();

    if (
      session.token &&
      session.user
    ) {
      renderMobileUser(
        session.user
      );

      openRoute(
        "home"
      );

      await window
        .VortexNative
        .hideSplash();

      /*
       * Do not wait for Render.
       * Refresh the account in background.
       */
      void window.VortexAuth
        .refreshMe()
        .then(
          (freshUser) => {
            if (freshUser) {
              renderMobileUser(
                freshUser
              );
            }
          }
        )
        .catch(
          (error) => {
            console.warn(
              "Background profile refresh failed",
              error
            );
          }
        );

      return;
    }

    /*
     * No saved account.
     * Only now is Login allowed to appear.
     */
    openRoute(
      "login"
    );

    await window
      .VortexNative
      .hideSplash();

  } catch (error) {
    console.error(
      "Vortex startup failed",
      error
    );

    openRoute(
      "login"
    );

    try {
      await window
        .VortexNative
        ?.hideSplash?.();
    } catch {
      // Nothing else to do.
    }
  }
}

void bootVortexIdentity();

const mobileLogout =
  document.getElementById(
    "mobileLogout"
  );

if (mobileLogout) {
  mobileLogout.addEventListener(
    "click",
    async () => {
      mobileLogout.disabled =
        true;

      try {
        await window
          .VortexAuth
          .logout();
      } finally {
        openRoute(
          "login"
        );

        mobileLogout.disabled =
          false;
      }
    }
  );
}

async function bootVortexCatalog() {
  const starterTracks =
    tracks.filter(
      (track) =>
        track.source ===
        "bundled"
    );

  const cached =
    window.VortexCatalog
      ?.cachedTracks?.() ??
    [];

  if (cached.length) {
    tracks = [
      ...starterTracks,
      ...cached
    ];

    refreshVortexCatalogUI();
  }

  try {
    const catalog =
      await window
        .VortexCatalog
        .fetchCatalog();

    tracks = [
      ...starterTracks,
      ...catalog.tracks
    ];

    refreshVortexCatalogUI();

  } catch (error) {
    console.warn(
      "Remote catalog unavailable",
      error
    );
  }
}

function refreshVortexCatalogUI() {
  renderTracks(
    "trackList",
    tracks
  );

  renderTracks(
    "exploreTracks",
    getExploreResults()
  );

  refreshLibrary();
}

void bootVortexCatalog();

let vortexDownloads = {};

async function hydrateDownloads() {
  try {
    vortexDownloads =
      await window
        .VortexNative
        .loadDownloads();
  } catch (error) {
    console.warn(
      "Unable to load downloads",
      error
    );

    vortexDownloads = {};
  }

  applyDownloadedTracks();
}

function applyDownloadedTracks() {
  tracks =
    tracks.map(
      (track) => {
        if (!track.remoteId) {
          return track;
        }

        const item =
          vortexDownloads[
            track.remoteId
          ];

        if (!item) {
          return {
            ...track,
            downloaded:
              false
          };
        }

        return {
          ...track,
          src:
            window.VortexNative
              .webFileSrc(
                item.uri
              ),
          downloaded:
            true
        };
      }
    );

  refreshVortexCatalogUI();
  refreshOfflineStatus();
}

void hydrateDownloads();

async function updateNetworkState() {
  try {
    const status =
      await window
        .VortexNative
        .networkStatus();

    document.body.dataset.network =
      status.connected
        ? "online"
        : "offline";

    const badge =
      document.getElementById(
        "networkBadge"
      );

    if (badge) {
      badge.textContent =
        status.connected
          ? `ONLINE · ${status.connectionType.toUpperCase()}`
          : "OFFLINE";

      badge.style.color =
        status.connected
          ? "#4ade80"
          : "#f59e0b";
    }
  } catch {
    document.body.dataset.network =
      "unknown";
  }
}

void updateNetworkState();

async function toggleOfflineTrack(
  track,
  button
) {
  if (
    !track.remoteId ||
    !track.remoteUrl
  ) {
    return;
  }

  if (track.downloaded) {
    const remove =
      window.confirm(
        `Remove "${track.title}" from offline downloads?`
      );

    if (!remove) {
      return;
    }

    button.disabled = true;
    button.textContent = "…";

    try {
      vortexDownloads =
        await window
          .VortexNative
          .deleteDownload(
            track.remoteId
          );

      tracks =
        tracks.map(
          (item) =>
            item.remoteId ===
            track.remoteId
              ? {
                  ...item,
                  src:
                    item.remoteUrl,
                  downloaded:
                    false
                }
              : item
        );

      refreshVortexCatalogUI();

    } catch (error) {
      console.error(
        "Delete offline track failed",
        error
      );

      button.textContent = "!";
    } finally {
      button.disabled = false;
    }

    return;
  }

  button.disabled = true;
  button.textContent = "0%";

  try {
    const downloaded =
      await window
        .VortexNative
        .downloadTrack(
          track,
          (percent) => {
            button.textContent =
              `${percent}%`;
          }
        );

    vortexDownloads[
      track.remoteId
    ] = downloaded;

    const playableUrl =
      window.VortexNative
        .webFileSrc(
          downloaded.uri
        );

    tracks =
      tracks.map(
        (item) =>
          item.remoteId ===
          track.remoteId
            ? {
                ...item,
                src:
                  playableUrl,
                downloaded:
                  true
              }
            : item
      );

    refreshVortexCatalogUI();

  } catch (error) {
    console.error(
      "Vortex download failed",
      error
    );

    button.textContent = "!";

    window.setTimeout(
      () => {
        button.textContent = "↓";
      },
      1200
    );
  } finally {
    button.disabled = false;
  }
}

function refreshOfflineStatus() {
  const element =
    document.getElementById(
      "offlineStatus"
    );

  if (!element) {
    return;
  }

  const remoteCount =
    Object.keys(
      vortexDownloads
    ).length;

  element.textContent =
    remoteCount > 0
      ? `Offline · 4 starter + ${remoteCount} downloaded`
      : "Offline · 4 starter tracks ready";

  const profileCount =
    document.getElementById(
      "profileOfflineCount"
    );

  if (profileCount) {
    profileCount.textContent =
      remoteCount > 0
        ? `4 starter + ${remoteCount} downloaded`
        : "4 starter tracks";
  }
}

/*
 * Vortex Creator Studio
 */

const creatorForm =
  document.getElementById(
    "creatorForm"
  );

const creatorAudio =
  document.getElementById(
    "creatorAudio"
  );

const creatorCover =
  document.getElementById(
    "creatorCover"
  );

let creatorCatalogLoaded =
  false;

function creatorStatus(
  message,
  error = false
) {
  const element =
    document.getElementById(
      "creatorStatus"
    );

  if (!element) {
    return;
  }

  element.textContent =
    message;

  element.style.color =
    error
      ? "#fb7185"
      : "rgba(255,255,255,.55)";
}

function creatorProgress(
  percent
) {
  const shell =
    document.getElementById(
      "creatorProgress"
    );

  const bar =
    document.getElementById(
      "creatorProgressBar"
    );

  if (!shell || !bar) {
    return;
  }

  shell.hidden = false;

  bar.style.width =
    `${Math.max(
      0,
      Math.min(
        100,
        percent
      )
    )}%`;
}

async function loadCreatorCatalog() {
  if (
    creatorCatalogLoaded
  ) {
    return;
  }

  const payload =
    await window
      .VortexCreator
      .creatorCatalog();

  const artistSelect =
    document.getElementById(
      "creatorArtist"
    );

  const albumSelect =
    document.getElementById(
      "creatorAlbum"
    );

  artistSelect.innerHTML =
    '<option value="">Select artist</option>';

  for (
    const artist of
    payload.artists || []
  ) {
    const option =
      document.createElement(
        "option"
      );

    option.value =
      artist.id;

    option.textContent =
      artist.name;

    artistSelect.appendChild(
      option
    );
  }

  albumSelect.innerHTML =
    '<option value="">No album</option>';

  for (
    const album of
    payload.albums || []
  ) {
    const option =
      document.createElement(
        "option"
      );

    option.value =
      album.id;

    option.dataset.artistId =
      album.artistId;

    option.textContent =
      album.title;

    albumSelect.appendChild(
      option
    );
  }

  creatorCatalogLoaded =
    true;
}

if (creatorAudio) {
  creatorAudio.addEventListener(
    "change",
    () => {
      const file =
        creatorAudio.files?.[0];

      document.getElementById(
        "creatorAudioName"
      ).textContent =
        file?.name ||
        "MP3, M4A, WAV, OGG";
    }
  );
}

if (creatorCover) {
  creatorCover.addEventListener(
    "change",
    () => {
      const file =
        creatorCover.files?.[0];

      document.getElementById(
        "creatorCoverName"
      ).textContent =
        file?.name ||
        "JPG, PNG, WEBP";
    }
  );
}

const creatorEntry =
  document.getElementById(
    "creatorProfileEntry"
  );

if (creatorEntry) {
  creatorEntry.addEventListener(
    "click",
    () => {
      void loadCreatorCatalog()
        .catch(
          (error) => {
            creatorStatus(
              error instanceof Error
                ? error.message
                : "Creator unavailable",
              true
            );
          }
        );
    }
  );
}

if (creatorForm) {
  creatorForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const submit =
        document.getElementById(
          "creatorSubmit"
        );

      const audioFile =
        creatorAudio
          ?.files?.[0];

      const coverFile =
        creatorCover
          ?.files?.[0];

      const title =
        document.getElementById(
          "creatorTitle"
        ).value.trim();

      const artistId =
        document.getElementById(
          "creatorArtist"
        ).value;

      const albumId =
        document.getElementById(
          "creatorAlbum"
        ).value;

      const published =
        document.getElementById(
          "creatorPublished"
        ).checked;

      if (
        !title ||
        !artistId ||
        !audioFile
      ) {
        creatorStatus(
          "Title, artist and audio are required.",
          true
        );

        return;
      }

      const allowedAudio =
        [
          "audio/mpeg",
          "audio/mp4",
          "audio/x-m4a",
          "audio/wav",
          "audio/x-wav",
          "audio/ogg"
        ];

      if (
        audioFile.type &&
        !allowedAudio.includes(
          audioFile.type
        )
      ) {
        creatorStatus(
          "Unsupported audio format.",
          true
        );

        return;
      }

      if (
        audioFile.size >
        100 * 1024 * 1024
      ) {
        creatorStatus(
          "Audio file is too large.",
          true
        );

        return;
      }

      if (
        coverFile &&
        coverFile.size >
          12 * 1024 * 1024
      ) {
        creatorStatus(
          "Cover image is too large.",
          true
        );

        return;
      }

      submit.disabled = true;
      submit.textContent =
        "Preparing...";

      creatorProgress(0);

      try {
        creatorStatus(
          "Reading audio..."
        );

        const duration =
          await window
            .VortexCreator
            .audioDuration(
              audioFile
            );

        creatorStatus(
          "Uploading audio..."
        );

        const audioAsset =
          await window
            .VortexCreator
            .uploadAudio(
              audioFile,
              (percent) => {
                creatorProgress(
                  Math.round(
                    percent *
                    (
                      coverFile
                        ? .7
                        : 1
                    )
                  )
                );
              }
            );

        let coverUrl = "";

        if (coverFile) {
          creatorStatus(
            "Uploading cover..."
          );

          const coverAsset =
            await window
              .VortexCreator
              .uploadImage(
                coverFile,
                (percent) => {
                  creatorProgress(
                    70 +
                      Math.round(
                        percent *
                        .3
                      )
                  );
                }
              );

          coverUrl =
            coverAsset.secure_url ||
            "";
        }

        creatorStatus(
          "Creating release..."
        );

        creatorProgress(
          coverFile
            ? 100
            : 95
        );

        const track =
          await window
            .VortexCreator
            .createTrack({
              title,
              audioUrl:
                audioAsset.secure_url,
              cover:
                coverUrl,
              duration,
              artistId,
              albumId:
                albumId ||
                null,
              published
            });

        creatorProgress(100);

        creatorStatus(
          published
            ? `"${track.title}" published.`
            : `"${track.title}" saved as draft.`
        );

        creatorForm.reset();

        document.getElementById(
          "creatorAudioName"
        ).textContent =
          "MP3, M4A, WAV, OGG";

        document.getElementById(
          "creatorCoverName"
        ).textContent =
          "JPG, PNG, WEBP";

        creatorCatalogLoaded =
          false;

        if (published) {
          await bootVortexCatalog();
        }

      } catch (error) {
        console.error(
          "Creator release failed",
          error
        );

        creatorStatus(
          error instanceof Error
            ? error.message
            : "Release upload failed",
          true
        );
      } finally {
        submit.disabled = false;
        submit.textContent =
          "Upload release";
      }
    }
  );
}

const creatorArtist =
  document.getElementById(
    "creatorArtist"
  );

if (creatorArtist) {
  creatorArtist.addEventListener(
    "change",
    () => {
      const selected =
        creatorArtist.value;

      const albumSelect =
        document.getElementById(
          "creatorAlbum"
        );

      albumSelect.value = "";

      for (
        const option of
        albumSelect.options
      ) {
        if (!option.value) {
          option.hidden = false;
          continue;
        }

        option.hidden =
          Boolean(selected) &&
          option.dataset.artistId !==
            selected;
      }
    }
  );
}
