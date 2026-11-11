import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  }).catch(() => ({ collections: [] }))
  const productCategories = await listCategories().catch(() => [])

  return (
    <footer className="border-t border-mphal-sand/70 bg-[#F7F3EB] text-mphal-brown">
      {/* Main Footer Links */}
      <div className="content-container flex flex-col w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-16">
          {/* Brand & Summary */}
          <div className="md:col-span-5 flex flex-col gap-y-4">
            <LocalizedClientLink
              href="/"
              className="group flex flex-col items-start"
            >
              <span className="font-display text-3xl font-bold tracking-tight text-mphal-forest group-hover:text-mphal-terracotta transition-colors">
                mphal
              </span>
              <span className="text-xs tracking-[0.25em] uppercase font-sans font-semibold text-mphal-caramel">
                Homemade Products
              </span>
            </LocalizedClientLink>

            <p className="font-sans text-sm leading-relaxed max-w-sm text-mphal-mocha">
              Explore our store catalog of homemade products, available across regions.
            </p>
          </div>

          {/* Dynamic Categories */}
          <div className="md:col-span-3 flex flex-col gap-y-3">
            <span className="font-sans text-xs font-bold tracking-widest uppercase text-mphal-forest">
              Categories
            </span>
            <ul className="flex flex-col gap-2.5 text-sm text-mphal-mocha">
              {productCategories && productCategories.length > 0 ? (
                productCategories.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      href={`/categories/${c.handle}`}
                      className="hover:text-mphal-terracotta transition-colors"
                    >
                      {c.name}
                    </LocalizedClientLink>
                  </li>
                ))
              ) : (
                <li>
                  <LocalizedClientLink
                    href="/store"
                    className="hover:text-mphal-terracotta transition-colors"
                  >
                    All Products
                  </LocalizedClientLink>
                </li>
              )}
              <li>
                <LocalizedClientLink
                  href="/store"
                  className="hover:text-mphal-terracotta transition-colors font-medium text-mphal-forest"
                >
                  Browse Store &rarr;
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Collections / Backend links */}
          <div className="md:col-span-2 flex flex-col gap-y-3">
            <span className="font-sans text-xs font-bold tracking-widest uppercase text-mphal-forest">
              Collections
            </span>
            <ul className="flex flex-col gap-2.5 text-sm text-mphal-mocha">
              {collections && collections.length > 0 ? (
                collections.slice(0, 5).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      className="hover:text-mphal-terracotta transition-colors"
                      href={`/collections/${c.handle}`}
                    >
                      {c.title}
                    </LocalizedClientLink>
                  </li>
                ))
              ) : (
                <li>
                  <LocalizedClientLink
                    href="/store"
                    className="hover:text-mphal-terracotta transition-colors"
                  >
                    View Catalog
                  </LocalizedClientLink>
                </li>
              )}
            </ul>
          </div>

          {/* Account & Navigation */}
          <div className="md:col-span-2 flex flex-col gap-y-3">
            <span className="font-sans text-xs font-bold tracking-widest uppercase text-mphal-forest">
              Account
            </span>
            <ul className="flex flex-col gap-2.5 text-sm text-mphal-mocha">
              <li>
                <LocalizedClientLink
                  href="/account"
                  className="hover:text-mphal-terracotta transition-colors"
                >
                  My Account
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/cart"
                  className="hover:text-mphal-terracotta transition-colors"
                >
                  Shopping Cart
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/store"
                  className="hover:text-mphal-terracotta transition-colors"
                >
                  Store Catalog
                </LocalizedClientLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-mphal-sand/60 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-mphal-mocha">
          <Text className="txt-compact-small font-sans">
            &copy; {new Date().getFullYear()} mphal. All rights reserved.
          </Text>
          <Text className="txt-compact-small font-sans font-medium text-mphal-forest">
            Homemade Products
          </Text>
        </div>
      </div>
    </footer>
  )
}
