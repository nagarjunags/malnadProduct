import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Playfair_Display, Lato } from "next/font/google"
import "styles/globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
})

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={`${playfair.variable} ${lato.variable}`}>
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
