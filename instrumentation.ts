export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log(
      "[VORTEX:SERVER] Node.js instrumentation initialized",
    );
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    console.log(
      "[VORTEX:SERVER] Edge instrumentation initialized",
    );
  }
}
