import PublicPlaylistClient from "./PublicPlaylistClient";

export const instant = false;

export default async function PublicPlaylistPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const {
    id,
  } = await params;

  return (
    <PublicPlaylistClient
      id={id}
    />
  );
}
