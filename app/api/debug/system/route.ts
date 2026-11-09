export async function GET() {
  const memory = process.memoryUsage();

  return Response.json({
    ok: true,

    service: {
      name: "vortex-web",
      framework: "nextjs",
    },

    runtime: {
      node: process.version,
      platform: process.platform,
      architecture: process.arch,
      environment:
        process.env.NODE_ENV ||
        "unknown",
      uptimeSeconds:
        Math.round(
          process.uptime(),
        ),
    },

    memory: {
      rss: memory.rss,
      heapTotal:
        memory.heapTotal,
      heapUsed:
        memory.heapUsed,
      external:
        memory.external,
      arrayBuffers:
        memory.arrayBuffers,
    },

    timestamp:
      new Date().toISOString(),
  });
}
