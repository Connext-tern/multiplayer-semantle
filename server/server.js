const dailyWords = require("./dailyWords")
const axios = require("axios")

const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const similarity = require("./similarity")

const app = express()
app.use(cors())

const server = http.createServer(app)
function getDailyWord() {
  const start = new Date(2026, 0, 1)

  const today = new Date()

  const diffTime = today - start

  const dayNumber = Math.floor(
    diffTime / (1000 * 60 * 60 * 24)
  )

  return dailyWords[
    dayNumber % dailyWords.length
  ]
}
const io = new Server(server, {
  cors: {
    origin: "*"
  }
})

const PORT = 4000

const WORDS = [
  "사과",
  "바나나",
  "컴퓨터",
  "강아지",
  "고양이",
  "학교",
  "자동차",
  "바다"
]

const rooms = {}

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

io.on("connection", (socket) => {
  console.log("connected", socket.id)

  socket.on("join_room", ({ roomId, username }) => {
    socket.join(roomId)

    if (!rooms[roomId]) {
      rooms[roomId] = {
        secretWord: getDailyWord(),
        players: {},
        guesses: []
      }
    }

    rooms[roomId].players[socket.id] = {
      username,
      bestScore: 0
    }

    io.to(roomId).emit("room_state", rooms[roomId])
  })

socket.on("guess", async ({ roomId, word }) => {
    const room = rooms[roomId]
    const normalized = word.trim().toLowerCase()

const alreadyGuessed = room.guesses.some(
  (g) => g.word.toLowerCase() === normalized
)

if (alreadyGuessed) {
  socket.emit("duplicate_guess", {
    word
  })

  return
}
    if (!room) return

const response = await axios.post(
  "http://127.0.0.1:5000/similarity",
  {
    guess: word,
    target: room.secretWord
  }
)

const score = response.data.score
let rank = ""
let heat = ""

if (score > 90) {
  rank = "Top 1%"
  heat = "🔥 Burning"
}
else if (score > 80) {
  rank = "Top 5%"
  heat = "🔥 Very Hot"
}
else if (score > 70) {
  rank = "Top 10%"
  heat = "🌡️ Hot"
}
else if (score > 55) {
  rank = "Top 25%"
  heat = "☀️ Warm"
}
else if (score > 40) {
  rank = "Top 50%"
  heat = "🌤️ Mild"
}
else {
  rank = "Cold"
  heat = "🧊 Cold"
}const guessData = {
  user: room.players[socket.id]?.username || "Unknown",
  word,
  score: Math.round(score),
  rank,
  heat
}

    room.guesses.unshift(guessData)

    if (score > room.players[socket.id].bestScore) {
      room.players[socket.id].bestScore = score
    }

    io.to(roomId).emit("new_guess", {
      guess: guessData,
      players: room.players
    })

    if (score === 100) {
      io.to(roomId).emit("game_won", {
        winner: room.players[socket.id].username,
        word: room.secretWord
      })

      room.secretWord = randomWord()
      room.guesses = []

      io.to(roomId).emit("new_round")
    }
  })

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      delete rooms[roomId]?.players[socket.id]

      io.to(roomId).emit("room_state", rooms[roomId])
    }
  })
})

server.listen(PORT, () => {
  console.log(`server running on ${PORT}`)
})