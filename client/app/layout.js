import "./globals.css"

export const metadata = {
  title: "Multiplayer Semantle",
  description: "Multiplayer Semantle Game",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}