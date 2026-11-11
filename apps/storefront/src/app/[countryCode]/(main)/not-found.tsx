import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "404 — Page Not Found | mphal",
  description: "The requested page was not found.",
}

export default function NotFound() {
  return (
    <div className="bg-[#FAF7F2] min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-mphal-sand/70 rounded-large p-8 sm:p-10 shadow-xs flex flex-col items-center">
        <span className="font-display text-4xl font-bold text-mphal-terracotta mb-2">
          404
        </span>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-mphal-forest">
          Page Not Found
        </h1>

        <p className="font-sans text-xs sm:text-sm text-mphal-mocha mt-2 mb-6 leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <LocalizedClientLink
            href="/"
            className="w-full py-2.5 px-4 rounded-rounded font-sans text-xs uppercase tracking-wider font-bold bg-mphal-forest hover:bg-mphal-brown text-mphal-cream transition-colors text-center shadow-xs"
          >
            Return Home
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/store"
            className="w-full py-2.5 px-4 rounded-rounded font-sans text-xs uppercase tracking-wider font-semibold border border-mphal-sand bg-white hover:bg-[#FAF5EE] text-mphal-forest transition-colors text-center"
          >
            Browse Products
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
