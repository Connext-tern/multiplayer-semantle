import GameRoom from "../../components/GameRoom"

export default async function Page({ params }) {
  const { roomId } = await params

  return <GameRoom roomId={roomId} />
}