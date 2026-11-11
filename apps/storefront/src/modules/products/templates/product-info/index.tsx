import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info" className="space-y-4">
      {/* Category or collection breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-sans">
        <LocalizedClientLink
          href="/store"
          className="text-mphal-mocha/70 hover:text-mphal-terracotta transition-colors"
        >
          Store
        </LocalizedClientLink>
        {product.collection && (
          <>
            <span className="text-mphal-sand">&bull;</span>
            <LocalizedClientLink
              href={`/collections/${product.collection.handle}`}
              className="text-mphal-caramel font-semibold uppercase tracking-wider hover:text-mphal-forest transition-colors"
            >
              {product.collection.title}
            </LocalizedClientLink>
          </>
        )}
      </div>

      {/* Product Title */}
      <Heading
        level="h1"
        className="font-display text-2xl sm:text-3xl font-bold text-mphal-forest leading-snug"
        data-testid="product-title"
      >
        {product.title}
      </Heading>

      {/* Description from backend */}
      {product.description && (
        <Text
          className="font-sans text-sm text-mphal-mocha leading-relaxed whitespace-pre-line pt-2"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      )}
    </div>
  )
}

export default ProductInfo
