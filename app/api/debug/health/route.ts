export async function GET() {
  return Response.json({
    ok: true,
    service: "vortex-web",
    timestamp: new Date().toISOString(),
  });
}
