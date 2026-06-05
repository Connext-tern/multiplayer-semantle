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
const [newRoundMessage, setNewRoundMessage] = useState("")
const [errorMessage, setErrorMessage] = useState("")

  const getHeatColor = (score) => {
    if (score >= 90) return "from-red-600 to-red-700"
    if (score >= 80) return "from-orange-500 to-orange-700"
    if (score >= 70) return "from-yellow-500 to-yellow-700"
    if (score >= 55) return "from-green-500 to-green-700"
    if (score >= 40) return "from-cyan-500 to-cyan-700"

    return "from-slate-700 to-slate-800"
  }

  const getMedal = (idx) => {
    if (idx === 0) return "🥇"
    if (idx === 1) return "🥈"
    if (idx === 2) return "🥉"
    return `#${idx + 1}`
  }

  useEffect(() => {
    socket.on("duplicate_guess", ({ word }) => {
      setErrorMessage(`"${word}" was already guessed`)

      setTimeout(() => {
        setErrorMessage("")
      }, 2500)
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
      setWinner(`🎉 ${winner} guessed "${word}"!`)
    })

    socket.on("new_round", ({ message }) => {
  setGuesses([])
  setWinner(null)

  setNewRoundMessage(
    message || "🆕 New word loaded! Start guessing!"
  )

  setTimeout(() => {
    setNewRoundMessage("")
  }, 3000)
})

    return () => {
      socket.off()
    }
  }, [])

  const joinRoom = () => {
    if (!username.trim()) return

    socket.emit("join_room", {
      roomId,
      username
    })

    setJoined(true)
  }

  const sendGuess = () => {
    if (!guess.trim()) return

    socket.emit("guess", {
      roomId,
      word: guess
    })

    setGuess("")
  }

  const sortedGuesses = [...guesses].sort(
    (a, b) => b.score - a.score
  )

  const topGuesses = [...sortedGuesses].slice(0, 5)

  if (!joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
        <div className="w-[420px] rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">

          <h1 className="text-4xl font-black text-center mb-2">
            Multiplayer Semantle
          </h1>

          <p className="text-center text-slate-300 mb-8">
            Guess words. Beat your friends.
          </p>

          <input
            className="w-full p-4 rounded-xl bg-black/30 border border-white/10 mb-4 outline-none focus:border-blue-500"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") joinRoom()
            }}
          />

          <button
            className="w-full p-4 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all font-bold"
            onClick={joinRoom}
          >
            Join Game
          </button>

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">

      <div className="max-w-7xl mx-auto p-6">

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 shadow-2xl">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-5xl font-black tracking-tight">
                Multiplayer Semantle
              </h1>

              <div className="text-slate-300 mt-2">
                Room <span className="font-bold">{roomId}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold">
                👥 {Object.keys(players).length}
              </div>

              <div className="text-slate-300">
                Players Online
              </div>
            </div>

          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-600 rounded-2xl p-4 mb-4 shadow-lg">
            {errorMessage}
          </div>
        )}

        {winner && (
          <div className="bg-green-600 rounded-2xl p-5 mb-4 text-center text-2xl font-bold animate-pulse shadow-lg">
            {winner}
          </div>
        )}

        {newRoundMessage && (
  <div className="bg-blue-600 rounded-2xl p-5 mb-4 text-center text-2xl font-bold shadow-lg">
    {newRoundMessage}
  </div>
)}

        <div className="grid lg:grid-cols-4 gap-6">

          <div className="lg:col-span-3">

            <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 shadow-2xl mb-6">

              {sortedGuesses.length > 0 && (
                <div className="mb-6 rounded-2xl bg-black/20 p-5">

                  <div className="text-sm text-slate-400 mb-2">
                    BEST GUESS SO FAR
                  </div>

                  <div className="text-3xl font-black">
                    {sortedGuesses[0].word}
                  </div>

                  <div className="text-xl text-cyan-300">
                    Score {sortedGuesses[0].score}
                  </div>

                </div>
              )}

              <div className="flex gap-3">

                <input
                  className="flex-1 p-4 rounded-xl bg-black/30 border border-white/10 outline-none focus:border-blue-500"
                  placeholder="Type your guess..."
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendGuess()
                  }}
                />

                <button
                  className="px-8 rounded-xl bg-blue-600 hover:bg-blue-500 hover:scale-105 transition-all font-bold"
                  onClick={sendGuess}
                >
                  Guess
                </button>

              </div>

            </div>

            <div className="space-y-3">

              {sortedGuesses.map((g, idx) => (
                <div
                  key={idx}
                  className={`bg-gradient-to-r ${getHeatColor(
                    g.score
                  )} rounded-2xl p-4 shadow-lg hover:scale-[1.01] transition-all duration-200`}
                >

                  <div className="flex justify-between items-center">

                    <div>
                      <div className="font-bold text-lg">
                        {g.user}
                      </div>

                      <div className="text-white/90">
                        {g.word}
                      </div>
                    </div>

                    <div className="text-right">

                      <div className="w-40 mb-2">

                        <div className="h-3 bg-black/30 rounded-full overflow-hidden">

                          <div
                            className="h-3 bg-white rounded-full transition-all duration-700"
                            style={{
                              width: `${g.score}%`
                            }}
                          />

                        </div>

                      </div>

                      <div className="font-black text-xl">
                        {g.score}
                      </div>

                      <div className="text-sm">
                        {g.heat}
                      </div>

                      <div className="text-xs opacity-80">
                        {g.rank}
                      </div>

                    </div>

                  </div>

                </div>
              ))}

            </div>

          </div>

          <div className="space-y-6">

            <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 shadow-2xl">

              <h2 className="text-2xl font-black mb-4">
                🏆 Leaderboard
              </h2>

              <div className="space-y-3">

                {Object.values(players)
                  .sort((a, b) => b.bestScore - a.bestScore)
                  .map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-black/20 p-3 rounded-xl hover:bg-black/30 transition-all"
                    >

                      <div className="flex items-center gap-3">

                        <div className="text-xl">
                          {getMedal(idx)}
                        </div>

                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                          {p.username[0]?.toUpperCase()}
                        </div>

                        <div>
                          {p.username}
                        </div>

                      </div>

                      <div className="font-black">
                        {Math.round(p.bestScore)}
                      </div>

                    </div>
                  ))}

              </div>

            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 shadow-2xl">

              <h2 className="text-2xl font-black mb-4">
                🔥 Closest Guesses
              </h2>

              <div className="space-y-2">

                {topGuesses.map((g, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between bg-black/20 p-3 rounded-xl"
                  >
                    <span>
                      #{idx + 1} {g.word}
                    </span>

                    <span className="font-bold">
                      {g.score}
                    </span>
                  </div>
                ))}

                {topGuesses.length === 0 && (
                  <div className="text-slate-400">
                    No guesses yet
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}