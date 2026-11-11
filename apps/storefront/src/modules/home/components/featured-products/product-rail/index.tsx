import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts || pricedProducts.length === 0) {
    return null
  }

  return (
    <div className="content-container py-10 small:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-mphal-sand/60 gap-4">
        <div>
          <span className="text-xs font-sans font-bold uppercase tracking-widest text-mphal-caramel">
            Featured Collection
          </span>
          <Text className="font-display text-2xl sm:text-3xl font-bold text-mphal-forest mt-1">
            {collection.title}
          </Text>
        </div>
        <LocalizedClientLink
          href={`/collections/${collection.handle}`}
          className="text-xs font-sans font-semibold tracking-wider uppercase text-mphal-terracotta hover:text-mphal-brown transition-colors inline-flex items-center gap-1.5"
        >
          <span>View Collection</span>
          <span>&rarr;</span>
        </LocalizedClientLink>
      </div>

      <ul className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-6">
        {pricedProducts.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}
