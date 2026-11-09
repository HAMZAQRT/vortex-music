import AlbumClientPage from "./ClientPage";

export const instant = false;

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AlbumClientPage id={id} />;
}
