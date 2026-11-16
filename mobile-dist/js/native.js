(() => {
  const TOKEN_KEY =
    "vortex.mobileToken";

  const USER_KEY =
    "vortex.mobileUser";

  function preferences() {
    return window.Capacitor
      ?.Plugins
      ?.Preferences ??
      null;
  }

  function splash() {
    return window.Capacitor
      ?.Plugins
      ?.SplashScreen ??
      null;
  }

  async function getValue(
    key
  ) {
    const plugin =
      preferences();

    if (plugin) {
      const result =
        await plugin.get({
          key
        });

      return (
        result.value ??
        null
      );
    }

    return (
      localStorage.getItem(
        key
      )
    );
  }

  async function setValue(
    key,
    value
  ) {
    const plugin =
      preferences();

    if (plugin) {
      await plugin.set({
        key,
        value
      });

      return;
    }

    localStorage.setItem(
      key,
      value
    );
  }

  async function removeValue(
    key
  ) {
    const plugin =
      preferences();

    if (plugin) {
      await plugin.remove({
        key
      });

      return;
    }

    localStorage.removeItem(
      key
    );
  }

  async function loadSession() {
    const [
      token,
      userJson
    ] =
      await Promise.all([
        getValue(
          TOKEN_KEY
        ),

        getValue(
          USER_KEY
        )
      ]);

    let user =
      null;

    if (userJson) {
      try {
        user =
          JSON.parse(
            userJson
          );
      } catch {
        user = null;
      }
    }

    return {
      token,
      user
    };
  }

  async function saveSession(
    token,
    user
  ) {
    await Promise.all([
      setValue(
        TOKEN_KEY,
        token
      ),

      setValue(
        USER_KEY,
        JSON.stringify(
          user
        )
      )
    ]);
  }

  async function clearSession() {
    await Promise.all([
      removeValue(
        TOKEN_KEY
      ),

      removeValue(
        USER_KEY
      )
    ]);
  }

  async function hideSplash() {
    const plugin =
      splash();

    if (!plugin) {
      return;
    }

    try {
      await plugin.hide();
    } catch (error) {
      console.error(
        "Vortex splash hide failed",
        error
      );
    }
  }

  window.VortexNative = {
    loadSession,
    saveSession,
    clearSession,
    hideSplash
  };
})();
