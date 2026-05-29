"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [room, setRoom] = useState("")
  const router = useRouter()

  const joinRoom = () => {
    if (!room) return

    router.push(`/${room}`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-2xl w-[400px]">

        <h1 className="text-3xl font-bold mb-6">
          Multiplayer Semantle
        </h1>

        <input
          className="w-full p-3 rounded bg-slate-700 mb-4"
          placeholder="Enter Room Code"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") joinRoom()
          }}
        />

        <button
          className="w-full bg-blue-600 p-3 rounded"
          onClick={joinRoom}
        >
          Join Room
        </button>

      </div>
    </div>
  )
}