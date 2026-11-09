import PlaylistClientPage from "./ClientPage";

export const instant = false;

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PlaylistClientPage id={id} />;
}
