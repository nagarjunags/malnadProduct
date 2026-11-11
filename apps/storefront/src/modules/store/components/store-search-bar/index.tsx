"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition, useState, useEffect } from "react"

const StoreSearchBar = ({ initialQuery = "" }: { initialQuery?: string }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "")
  }, [searchParams])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm.trim()) {
      params.set("q", searchTerm.trim())
    } else {
      params.delete("q")
    }
    params.delete("page")

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleClear = () => {
    setSearchTerm("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    params.delete("page")
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-white border border-mphal-sand/80 rounded-full py-2.5 pl-10 pr-24 text-xs font-sans text-mphal-forest placeholder:text-mphal-mocha/60 focus:outline-none focus:border-mphal-terracotta focus:ring-1 focus:ring-mphal-terracotta transition-all shadow-2xs"
        />
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3.5 text-mphal-mocha/60 pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <div className="absolute right-1.5 flex items-center gap-1">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="text-mphal-mocha/60 hover:text-mphal-forest p-1 text-xs"
              title="Clear search"
            >
              &times;
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="px-3 py-1 rounded-full text-[11px] font-sans font-bold uppercase tracking-wider bg-mphal-forest hover:bg-mphal-brown text-mphal-cream transition-colors"
          >
            {isPending ? "..." : "Search"}
          </button>
        </div>
      </div>
    </form>
  )
}

export default StoreSearchBar
