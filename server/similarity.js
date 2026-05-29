function similarity(a, b) {
  a = a.toLowerCase()
  b = b.toLowerCase()

  if (a === b) return 100

  let matches = 0

  for (let char of a) {
    if (b.includes(char)) matches++
  }

  return Math.min(99, Math.floor((matches / Math.max(a.length, b.length)) * 100))
}

module.exports = similarity