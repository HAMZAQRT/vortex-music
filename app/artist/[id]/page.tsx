import ArtistClientPage from "./ClientPage";

export const instant = false;

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ArtistClientPage id={id} />;
}
