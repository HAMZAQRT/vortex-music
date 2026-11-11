import LiveHostRoom from "../../../../components/live/LiveHostRoom";

export const instant = false;

export default async function LiveRoomPage({
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
    <LiveHostRoom
      id={id}
    />
  );
}
