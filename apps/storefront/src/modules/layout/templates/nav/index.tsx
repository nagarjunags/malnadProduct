import { Suspense } from "react"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale, categoriesData] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    listCategories().catch(() => []),
  ])

  const categories = (categoriesData || []).slice(0, 5)

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header className="relative bg-[#FAF7F2] border-b border-mphal-sand/70 shadow-sm transition-all duration-200">
        <nav className="content-container flex items-center justify-between w-full h-20 text-small-regular">
          {/* Left section: Mobile menu + Desktop dynamic links */}
          <div className="flex-1 basis-0 h-full flex items-center gap-6">
            <SideMenu
              regions={regions}
              locales={locales}
              currentLocale={currentLocale}
              categories={categories}
            />
            <div className="hidden medium:flex items-center gap-5 text-sm font-sans font-medium text-mphal-brown">
              <LocalizedClientLink
                href="/store"
                className="hover:text-mphal-terracotta transition-colors py-1 border-b-2 border-transparent hover:border-mphal-terracotta"
              >
                All Products
              </LocalizedClientLink>
              {categories.map((cat) => (
                <LocalizedClientLink
                  key={cat.id}
                  href={`/categories/${cat.handle}`}
                  className="hover:text-mphal-terracotta transition-colors py-1 border-b-2 border-transparent hover:border-mphal-terracotta"
                >
                  {cat.name}
                </LocalizedClientLink>
              ))}
            </div>
          </div>

          {/* Center: Brand identity */}
          <div className="flex flex-col items-center justify-center text-center">
            <LocalizedClientLink
              href="/"
              className="flex flex-col items-center group"
              data-testid="nav-store-link"
            >
              <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-mphal-forest group-hover:text-mphal-terracotta transition-colors">
                mphal
              </span>
              <span className="text-[10px] tracking-[0.25em] uppercase font-sans font-semibold text-mphal-caramel">
                Homemade Products
              </span>
            </LocalizedClientLink>
          </div>

          {/* Right section: Search, Account, Cart */}
          <div className="flex items-center gap-x-5 h-full flex-1 basis-0 justify-end">
            <LocalizedClientLink
              href="/store"
              className="text-mphal-brown hover:text-mphal-forest transition-colors flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider font-medium"
              title="Browse catalog"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-mphal-brown"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="hidden small:inline">Search</span>
            </LocalizedClientLink>

            <LocalizedClientLink
              className="hidden small:flex items-center gap-1.5 hover:text-mphal-forest font-sans text-xs uppercase tracking-wider font-medium text-mphal-brown transition-colors"
              href="/account"
              data-testid="nav-account-link"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Account</span>
            </LocalizedClientLink>

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-mphal-forest font-sans text-sm text-mphal-brown flex items-center gap-2 transition-colors px-3 py-1.5 rounded-full border border-mphal-sand bg-white/60"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <span>Cart (0)</span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
