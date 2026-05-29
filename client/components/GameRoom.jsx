"use client"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"

const socket = io("http://localhost:4000")

export default function GameRoom({ roomId }) {
  const [username, setUsername] = useState("")
  const [joined, setJoined] = useState(false)
  const [guess, setGuess] = useState("")
  const [guesses, setGuesses] = useState([])
  const [players, setPlayers] = useState({})
  const [winner, setWinner] = useState(null)
const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    socket.on("duplicate_guess", ({ word }) => {
  setErrorMessage(`"${word}" was already guessed`)

  setTimeout(() => {
    setErrorMessage("")
  }, 2000)
})
    socket.on("room_state", (room) => {
      setPlayers(room.players)
      setGuesses(room.guesses)
    })

    socket.on("new_guess", ({ guess, players }) => {
      setGuesses((prev) => [guess, ...prev])
      setPlayers(players)
    })

    socket.on("game_won", ({ winner, word }) => {
      setWinner(`${winner} guessed ${word}!`)
    })

    socket.on("new_round", () => {
      setGuesses([])
    })

    return () => {
      socket.off()
    }
  }, [])

  const joinRoom = () => {
    if (!username) return

    socket.emit("join_room", {
      roomId,
      username
    })

    setJoined(true)
  }

  const sendGuess = () => {
    if (!guess) return

    socket.emit("guess", {
      roomId,
      word: guess
    })

    setGuess("")
  }

  if (!joined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-2xl w-[400px]">
          <h1 className="text-3xl font-bold mb-6">
            Multiplayer Semantle
          </h1>

          <input
            className="w-full p-3 rounded bg-slate-700 mb-4"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <button
            className="w-full bg-blue-600 p-3 rounded"
            onClick={joinRoom}
          >
            Join Game
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">

        <div className="col-span-2 bg-slate-800 rounded-2xl p-6">
          <h1 className="text-4xl font-bold mb-4">
            Multiplayer Semantle
          </h1>
{errorMessage && (
  <div className="bg-red-700 p-3 rounded mb-4">
    {errorMessage}
  </div>
)}
          {winner && (
            <div className="bg-green-700 p-3 rounded mb-4">
              {winner}
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <input
              className="flex-1 p-3 rounded bg-slate-700"
              placeholder="Enter a guess"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendGuess()
              }}
            />

            <button
              className="bg-blue-600 px-6 rounded"
              onClick={sendGuess}
            >
              Guess
            </button>
          </div>

          <div className="space-y-2">{[...guesses]
  .sort((a, b) => b.score - a.score)
  .map((g, idx) => (
              <div
                key={idx}
                className="flex justify-between bg-slate-700 p-3 rounded"
              >
                <div>
                  <span className="font-bold">
                    {g.user}
                  </span>

                  <span className="ml-2">
                    {g.word}
                  </span>
                </div>

                <div className="text-right">
  <div className="font-bold">
    {g.score}
  </div>

  <div className="text-sm">
    {g.heat}
  </div>

  <div className="text-xs opacity-70">
    {g.rank}
  </div>
</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            Leaderboard
          </h2>

          <div className="space-y-2">
            {Object.values(players)
              .sort((a, b) => b.bestScore - a.bestScore)
              .map((p, idx) => (
                <div
                  key={idx}
                  className="flex justify-between bg-slate-700 p-3 rounded"
                >
                  <span>{p.username}</span>
                  <span>{p.bestScore}</span>
                </div>
              ))}
          </div>
        </div>

      </div>
    </div>
  )
}