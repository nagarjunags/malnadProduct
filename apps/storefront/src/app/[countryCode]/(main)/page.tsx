import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "mphal — Homemade Products",
  description: "Discover homemade products available across regions.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const [region, categoriesData, collectionsData, productsData] =
    await Promise.all([
      getRegion(countryCode).catch(() => null),
      listCategories().catch(() => []),
      listCollections({
        fields: "id, handle, title",
      }).catch(() => ({ collections: [] })),
      listProducts({
        countryCode,
        queryParams: { limit: 8 },
      }).catch(() => ({ response: { products: [], count: 0 } })),
    ])

  const categories = categoriesData || []
  const collections = collectionsData?.collections || []
  const fallbackProducts = productsData?.response?.products || []

  return (
    <div className="bg-[#FAF7F2]">
      {/* 1. Hero banner */}
      <Hero />

      {/* 2. Dynamic Categories from Backend (if categories exist in Medusa) */}
      {categories.length > 0 && (
        <section className="py-14 sm:py-20 bg-[#F5EFE6]/60 border-b border-mphal-sand/60">
          <div className="content-container">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-sans font-bold uppercase tracking-widest text-mphal-terracotta">
                  Browse by Category
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-mphal-forest mt-1">
                  Product Categories
                </h2>
              </div>
              <LocalizedClientLink
                href="/store"
                className="text-xs font-sans font-bold uppercase tracking-wider text-mphal-forest hover:text-mphal-terracotta transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>View All Products</span>
                <span>&rarr;</span>
              </LocalizedClientLink>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <LocalizedClientLink
                  key={cat.id}
                  href={`/categories/${cat.handle}`}
                  className="group block"
                >
                  <div className="h-full bg-white border border-mphal-sand/70 rounded-large p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:border-mphal-terracotta/50">
                    <div>
                      <h3 className="font-display text-lg font-bold text-mphal-forest group-hover:text-mphal-terracotta transition-colors">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="font-sans text-xs text-mphal-mocha mt-2 line-clamp-2 leading-relaxed">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-6 pt-4 border-t border-mphal-sand/40 flex items-center justify-between text-xs font-sans font-semibold text-mphal-forest group-hover:text-mphal-terracotta transition-colors">
                      <span>Explore</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                </LocalizedClientLink>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Live Featured Products from Medusa Backend (Collections or direct products fallback) */}
      {region && collections && collections.length > 0 ? (
        <section className="py-8 bg-[#FAF7F2]">
          <ul className="flex flex-col gap-y-4">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        </section>
      ) : region && fallbackProducts && fallbackProducts.length > 0 ? (
        <section className="py-14 sm:py-20 bg-[#FAF7F2]">
          <div className="content-container">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-sans font-bold uppercase tracking-widest text-mphal-terracotta">
                  Curated Catalog
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-mphal-forest mt-1">
                  Featured Products
                </h2>
              </div>
              <LocalizedClientLink
                href="/store"
                className="text-xs font-sans font-bold uppercase tracking-wider text-mphal-forest hover:text-mphal-terracotta transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Browse All Products</span>
                <span>&rarr;</span>
              </LocalizedClientLink>
            </div>

            <ul
              className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-2 medium:grid-cols-3 large:grid-cols-4 gap-6"
              data-testid="products-list"
            >
              {fallbackProducts.map((p) => (
                <li key={p.id}>
                  <ProductPreview product={p} region={region} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  )
}
