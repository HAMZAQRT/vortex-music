type MeUser = {
  id?: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
};

export async function vxUser(
  request: Request,
): Promise<{ id: string; name: string } | null> {
  const header = request.headers.get("authorization");

  if (!header) {
    return null;
  }

  const origin =
    process.env.AUTH_URL || new URL(request.url).origin;

  try {
    const response = await fetch(`${origin}/api/mobile/me`, {
      headers: {
        authorization: header,
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { user?: MeUser };
    const user = data.user;

    if (!user) {
      return null;
    }

    const id = user.id || user.username || user.email;

    if (!id) {
      return null;
    }

    return {
      id,
      name: user.name || user.username || "Listener",
    };
  } catch {
    return null;
  }
}
