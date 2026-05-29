import GameRoom from "../../components/GameRoom"

export default function Page({ params }) {
  return <GameRoom roomId={params.roomId} />
}