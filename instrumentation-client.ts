try {
  performance.mark("vortex-client-init");

  window.addEventListener(
    "error",
    (event) => {
      console.error(
        "[VORTEX:CLIENT_ERROR]",
        event.error || event.message,
      );
    },
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      console.error(
        "[VORTEX:UNHANDLED_REJECTION]",
        event.reason,
      );
    },
  );
} catch (error) {
  console.error(
    "[VORTEX:INSTRUMENTATION_ERROR]",
    error,
  );
}

export function onRouterTransitionStart(
  url: string,
  navigationType:
    | "push"
    | "replace"
    | "traverse",
) {
  console.debug(
    "[VORTEX:NAVIGATION]",
    navigationType,
    url,
  );
}
