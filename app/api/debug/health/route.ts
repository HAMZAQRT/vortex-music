export async function GET() {
  return Response.json({
    ok: true,
    service: "vortex-web",
    runtime: "nextjs",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(
  request: Request,
) {
  let body: unknown = null;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  return Response.json({
    ok: true,
    service: "vortex-web",
    method: "POST",
    received: body,
    timestamp: new Date().toISOString(),
  });
}
